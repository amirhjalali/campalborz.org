import { CronJob } from 'cron';
import { prisma } from '../lib/prisma';
import { integrationsService } from '../services/integrations';

interface WebhookRetryJob {
  id: string;
  tenantId: string;
  integrationId: string;
  event: string;
  payload: any;
  headers: Record<string, string>;
  signature?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date;
  error?: string;
}

class WebhookProcessor {
  private retryJobs: Map<string, WebhookRetryJob> = new Map();
  private processingJob?: CronJob;
  private cleanupJob?: CronJob;

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs() {
    console.log('🔄 Initializing webhook processor...');

    // Process failed webhooks every minute
    this.processingJob = new CronJob(
      '0 * * * * *', // Every minute
      async () => {
        await this.processFailedWebhooks();
      },
      null,
      true,
      'UTC'
    );

    // Cleanup old webhook events daily
    this.cleanupJob = new CronJob(
      '0 0 2 * * *', // Daily at 2 AM
      async () => {
        await this.cleanupOldWebhookEvents();
      },
      null,
      true,
      'UTC'
    );

    console.log('✅ Webhook processor initialized');
  }

  private async processFailedWebhooks() {
    try {
      // Get failed webhook events that are ready for retry
      const failedWebhooks = await this.getFailedWebhooksForRetry();
      
      if (failedWebhooks.length === 0) {
        return;
      }

      console.log(`🔄 Processing ${failedWebhooks.length} failed webhooks for retry...`);

      for (const webhook of failedWebhooks) {
        await this.retryWebhook(webhook);
      }
    } catch (error) {
      console.error('❌ Failed to process webhook retries:', error);
    }
  }

  private async retryWebhook(webhook: WebhookRetryJob) {
    try {
      console.log(`🔄 Retrying webhook: ${webhook.id} (attempt ${webhook.retryCount + 1}/${webhook.maxRetries})`);

      // Attempt to process the webhook again
      const result = await integrationsService.processWebhook(
        webhook.tenantId,
        webhook.integrationId,
        webhook.payload,
        webhook.headers,
        webhook.signature
      );

      if (result.success) {
        // Mark as processed
        await this.markWebhookAsProcessed(webhook.id);
        console.log(`✅ Webhook retry successful: ${webhook.id}`);
      } else {
        // Increment retry count and schedule next retry
        await this.scheduleNextRetry(webhook, result.error);
        console.log(`⚠️ Webhook retry failed: ${webhook.id} - ${result.error}`);
      }
    } catch (error) {
      // Increment retry count and schedule next retry
      await this.scheduleNextRetry(webhook, error.message);
      console.error(`❌ Webhook retry error: ${webhook.id}`, error);
    }
  }

  private async getFailedWebhooksForRetry(): Promise<WebhookRetryJob[]> {
    try {
      // In a real implementation, this would query the WebhookEvent table
      // For now, return mock data
      const webhookEvents = await prisma.webhookEvent.findMany({
        where: {
          processed: false,
          retryCount: {
            lt: 3, // maxRetries
          },
          nextRetryAt: {
            lte: new Date(),
          },
        },
        take: 50, // Process maximum 50 at a time
        orderBy: {
          nextRetryAt: 'asc',
        },
      });

      return webhookEvents.map(event => ({
        id: event.id,
        tenantId: event.tenantId,
        integrationId: event.integrationId,
        event: event.event,
        payload: event.payload,
        headers: event.headers as Record<string, string>,
        signature: event.signature || undefined,
        retryCount: event.retryCount,
        maxRetries: event.maxRetries,
        nextRetryAt: event.nextRetryAt || new Date(),
        error: event.error || undefined,
      }));
    } catch (error) {
      console.error('Failed to get failed webhooks:', error);
      return [];
    }
  }

  private async markWebhookAsProcessed(webhookId: string) {
    try {
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: {
          processed: true,
          error: null,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Failed to mark webhook as processed: ${webhookId}`, error);
    }
  }

  private async scheduleNextRetry(webhook: WebhookRetryJob, error?: string) {
    const nextRetryCount = webhook.retryCount + 1;
    
    if (nextRetryCount >= webhook.maxRetries) {
      // Max retries reached, mark as failed permanently
      await this.markWebhookAsFailed(webhook.id, error);
      return;
    }

    // Calculate next retry time with exponential backoff
    const backoffMinutes = Math.pow(2, nextRetryCount) * 5; // 5, 10, 20, 40 minutes
    const nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

    try {
      await prisma.webhookEvent.update({
        where: { id: webhook.id },
        data: {
          retryCount: nextRetryCount,
          nextRetryAt,
          error,
          updatedAt: new Date(),
        },
      });

      console.log(`📅 Scheduled webhook retry: ${webhook.id} at ${nextRetryAt.toISOString()}`);
    } catch (updateError) {
      console.error(`Failed to schedule webhook retry: ${webhook.id}`, updateError);
    }
  }

  private async markWebhookAsFailed(webhookId: string, error?: string) {
    try {
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: {
          processed: false, // Keep as unprocessed for manual intervention
          error: error || 'Max retries exceeded',
          nextRetryAt: null,
          updatedAt: new Date(),
        },
      });

      console.log(`❌ Webhook permanently failed: ${webhookId}`);
    } catch (updateError) {
      console.error(`Failed to mark webhook as failed: ${webhookId}`, updateError);
    }
  }

  private async cleanupOldWebhookEvents() {
    try {
      console.log('🧹 Starting webhook events cleanup...');

      // Delete processed webhook events older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const deletedProcessed = await prisma.webhookEvent.deleteMany({
        where: {
          processed: true,
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      // Delete failed webhook events older than 7 days (after max retries)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const deletedFailed = await prisma.webhookEvent.deleteMany({
        where: {
          processed: false,
          retryCount: {
            gte: 3, // maxRetries
          },
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });

      console.log(`🧹 Cleanup completed: ${deletedProcessed.count} processed events, ${deletedFailed.count} failed events deleted`);
    } catch (error) {
      console.error('❌ Webhook cleanup failed:', error);
    }
  }

  public async getWebhookStats(): Promise<{
    pending: number;
    processed: number;
    failed: number;
    totalToday: number;
    successRate: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [pending, processed, failed, totalToday] = await Promise.all([
        prisma.webhookEvent.count({
          where: {
            processed: false,
            retryCount: { lt: 3 },
          },
        }),
        prisma.webhookEvent.count({
          where: { processed: true },
        }),
        prisma.webhookEvent.count({
          where: {
            processed: false,
            retryCount: { gte: 3 },
          },
        }),
        prisma.webhookEvent.count({
          where: {
            createdAt: { gte: today },
          },
        }),
      ]);

      const total = pending + processed + failed;
      const successRate = total > 0 ? (processed / total) * 100 : 0;

      return {
        pending,
        processed,
        failed,
        totalToday,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      console.error('Failed to get webhook stats:', error);
      return {
        pending: 0,
        processed: 0,
        failed: 0,
        totalToday: 0,
        successRate: 0,
      };
    }
  }

  public async reprocessFailedWebhook(webhookId: string): Promise<boolean> {
    try {
      const webhook = await prisma.webhookEvent.findUnique({
        where: { id: webhookId },
      });

      if (!webhook) {
        console.error(`Webhook not found: ${webhookId}`);
        return false;
      }

      const webhookJob: WebhookRetryJob = {
        id: webhook.id,
        tenantId: webhook.tenantId,
        integrationId: webhook.integrationId,
        event: webhook.event,
        payload: webhook.payload,
        headers: webhook.headers as Record<string, string>,
        signature: webhook.signature || undefined,
        retryCount: webhook.retryCount,
        maxRetries: webhook.maxRetries,
        nextRetryAt: new Date(),
        error: webhook.error || undefined,
      };

      await this.retryWebhook(webhookJob);
      return true;
    } catch (error) {
      console.error(`Failed to reprocess webhook: ${webhookId}`, error);
      return false;
    }
  }

  public stopJobs() {
    console.log('🛑 Stopping webhook processor jobs...');
    
    if (this.processingJob) {
      this.processingJob.stop();
    }
    
    if (this.cleanupJob) {
      this.cleanupJob.stop();
    }

    console.log('⏹️ Webhook processor jobs stopped');
  }

  public getJobStatus() {
    return {
      processingJob: {
        running: this.processingJob?.running || false,
        nextDate: this.processingJob?.nextDate()?.toISO(),
      },
      cleanupJob: {
        running: this.cleanupJob?.running || false,
        nextDate: this.cleanupJob?.nextDate()?.toISO(),
      },
    };
  }
}

// Create and export singleton instance
export const webhookProcessor = new WebhookProcessor();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, stopping webhook processor...');
  webhookProcessor.stopJobs();
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, stopping webhook processor...');
  webhookProcessor.stopJobs();
});