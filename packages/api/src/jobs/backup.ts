import { CronJob } from 'cron';
import { backupService } from '../services/backup';
import { prisma } from '../lib/prisma';
import { emailService } from '../services/email';

interface BackupJobConfig {
  enabled: boolean;
  schedule: string;
  retentionDays: number;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  adminEmails: string[];
}

class BackupScheduler {
  private jobs: Map<string, CronJob> = new Map();
  private config: BackupJobConfig;

  constructor() {
    this.config = {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      notifyOnSuccess: process.env.BACKUP_NOTIFY_SUCCESS === 'true',
      notifyOnFailure: process.env.BACKUP_NOTIFY_FAILURE !== 'false', // Default to true
      adminEmails: (process.env.BACKUP_ADMIN_EMAILS || '').split(',').filter(Boolean),
    };

    if (this.config.enabled) {
      this.initializeJobs();
    }
  }

  private initializeJobs() {
    console.log('🕐 Initializing backup scheduler...');
    
    // Main backup job
    this.scheduleJob('main-backup', this.config.schedule, async () => {
      await this.runBackupJob();
    });

    // Cleanup job (runs weekly)
    this.scheduleJob('backup-cleanup', '0 3 * * 0', async () => {
      await this.runCleanupJob();
    });

    console.log(`✅ Backup scheduler initialized with schedule: ${this.config.schedule}`);
  }

  private scheduleJob(name: string, cronPattern: string, task: () => Promise<void>) {
    try {
      const job = new CronJob(
        cronPattern,
        async () => {
          console.log(`🔄 Starting scheduled job: ${name}`);
          const startTime = Date.now();
          
          try {
            await task();
            const duration = Date.now() - startTime;
            console.log(`✅ Completed scheduled job: ${name} (${duration}ms)`);
          } catch (error) {
            console.error(`❌ Failed scheduled job: ${name}`, error);
            await this.notifyJobFailure(name, error);
          }
        },
        null,
        true, // Start immediately
        'UTC'
      );

      this.jobs.set(name, job);
      console.log(`📅 Scheduled job: ${name} with pattern: ${cronPattern}`);
    } catch (error) {
      console.error(`Failed to schedule job: ${name}`, error);
    }
  }

  private async runBackupJob() {
    console.log('🚀 Starting scheduled backup job...');
    
    try {
      // Get all active tenants
      const tenants = await prisma.tenant.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
        },
      });

      console.log(`📊 Found ${tenants.length} active tenants to backup`);

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Create backups for each tenant
      for (const tenant of tenants) {
        try {
          console.log(`📦 Creating backup for tenant: ${tenant.name} (${tenant.id})`);
          
          // Create full backup for each tenant
          const backups = await backupService.createFullBackup(tenant.id);
          
          if (backups.every(backup => backup.status === 'completed')) {
            results.successful++;
            console.log(`✅ Backup completed for tenant: ${tenant.name}`);
          } else {
            results.failed++;
            results.errors.push(`Partial failure for tenant: ${tenant.name}`);
            console.log(`⚠️ Partial backup failure for tenant: ${tenant.name}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed backup for tenant ${tenant.name}: ${error.message}`);
          console.error(`❌ Backup failed for tenant: ${tenant.name}`, error);
        }
      }

      // Send notification
      if (this.config.notifyOnSuccess || (this.config.notifyOnFailure && results.failed > 0)) {
        await this.notifyBackupResults(results, tenants.length);
      }

      console.log(`🏁 Backup job completed: ${results.successful} successful, ${results.failed} failed`);
    } catch (error) {
      console.error('❌ Backup job failed:', error);
      await this.notifyJobFailure('backup', error);
      throw error;
    }
  }

  private async runCleanupJob() {
    console.log('🧹 Starting scheduled cleanup job...');
    
    try {
      const result = await backupService.cleanupExpiredBackups();
      
      console.log(`🧹 Cleanup completed: ${result.deleted} backups deleted`);
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ Cleanup had ${result.errors.length} errors:`, result.errors);
      }

      // Notify admins of cleanup results if there were errors
      if (result.errors.length > 0 && this.config.notifyOnFailure) {
        await this.notifyCleanupResults(result);
      }
    } catch (error) {
      console.error('❌ Cleanup job failed:', error);
      await this.notifyJobFailure('cleanup', error);
      throw error;
    }
  }

  private async notifyBackupResults(
    results: { successful: number; failed: number; errors: string[] },
    totalTenants: number
  ) {
    if (this.config.adminEmails.length === 0) {
      console.log('⚠️ No admin emails configured for backup notifications');
      return;
    }

    const isSuccess = results.failed === 0;
    const subject = isSuccess 
      ? `✅ Backup Job Completed Successfully (${results.successful}/${totalTenants} tenants)`
      : `❌ Backup Job Completed with Errors (${results.successful}/${totalTenants} tenants successful)`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isSuccess ? '#059669' : '#DC2626'};">
          ${isSuccess ? '✅' : '❌'} Automated Backup Report
        </h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Summary</h3>
          <ul>
            <li><strong>Total Tenants:</strong> ${totalTenants}</li>
            <li><strong>Successful Backups:</strong> ${results.successful}</li>
            <li><strong>Failed Backups:</strong> ${results.failed}</li>
            <li><strong>Success Rate:</strong> ${((results.successful / totalTenants) * 100).toFixed(1)}%</li>
            <li><strong>Job Completed:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>

        ${results.errors.length > 0 ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626;">
            <h3 style="color: #DC2626;">Errors</h3>
            <ul>
              ${results.errors.map(error => `<li style="color: #DC2626;">${error}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from the Camp Platform backup system.</p>
          <p>Generated at: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;

    try {
      for (const email of this.config.adminEmails) {
        await emailService.sendEmail({
          to: email,
          subject,
          html,
          template: 'backup-report',
          data: {
            isSuccess,
            results,
            totalTenants,
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      console.log(`📧 Backup notification sent to ${this.config.adminEmails.length} admin(s)`);
    } catch (error) {
      console.error('Failed to send backup notification:', error);
    }
  }

  private async notifyCleanupResults(result: { deleted: number; errors: string[] }) {
    if (this.config.adminEmails.length === 0) {
      return;
    }

    const subject = `🧹 Backup Cleanup Report - ${result.deleted} backups deleted`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🧹 Backup Cleanup Report</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Summary</h3>
          <ul>
            <li><strong>Backups Deleted:</strong> ${result.deleted}</li>
            <li><strong>Errors:</strong> ${result.errors.length}</li>
            <li><strong>Cleanup Completed:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>

        ${result.errors.length > 0 ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626;">
            <h3 style="color: #DC2626;">Cleanup Errors</h3>
            <ul>
              ${result.errors.map(error => `<li style="color: #DC2626;">${error}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from the Camp Platform backup system.</p>
        </div>
      </div>
    `;

    try {
      for (const email of this.config.adminEmails) {
        await emailService.sendEmail({
          to: email,
          subject,
          html,
          template: 'backup-cleanup-report',
          data: {
            result,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to send cleanup notification:', error);
    }
  }

  private async notifyJobFailure(jobName: string, error: any) {
    if (!this.config.notifyOnFailure || this.config.adminEmails.length === 0) {
      return;
    }

    const subject = `❌ Backup Job Failed: ${jobName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">❌ Backup Job Failure</h2>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626;">
          <h3>Job Details</h3>
          <ul>
            <li><strong>Job Name:</strong> ${jobName}</li>
            <li><strong>Failed At:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Error:</strong> ${error.message || 'Unknown error'}</li>
          </ul>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Error Details</h3>
          <pre style="background-color: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; overflow-x: auto;">
${error.stack || error.toString()}
          </pre>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>This is an automated error notification from the Camp Platform backup system.</p>
          <p>Please investigate and resolve the issue as soon as possible.</p>
        </div>
      </div>
    `;

    try {
      for (const email of this.config.adminEmails) {
        await emailService.sendEmail({
          to: email,
          subject,
          html,
          template: 'backup-error',
          data: {
            jobName,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString(),
            stack: error.stack || error.toString(),
          },
        });
      }
    } catch (notificationError) {
      console.error('Failed to send backup failure notification:', notificationError);
    }
  }

  public getJobStatus() {
    const jobs = Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: job.running,
      nextDate: job.nextDate()?.toISO(),
      lastDate: job.lastDate()?.toISO(),
    }));

    return {
      enabled: this.config.enabled,
      schedule: this.config.schedule,
      jobs,
      config: this.config,
    };
  }

  public stopAllJobs() {
    console.log('🛑 Stopping all backup jobs...');
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  public startJob(name: string) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`▶️ Started job: ${name}`);
    } else {
      console.error(`Job not found: ${name}`);
    }
  }

  public stopJob(name: string) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`⏸️ Stopped job: ${name}`);
    } else {
      console.error(`Job not found: ${name}`);
    }
  }

  // Manual backup trigger
  public async triggerBackup(tenantId?: string) {
    console.log(`🔄 Manually triggering backup${tenantId ? ` for tenant: ${tenantId}` : ' for all tenants'}`);
    
    if (tenantId) {
      return await backupService.createFullBackup(tenantId);
    } else {
      return await this.runBackupJob();
    }
  }

  // Manual cleanup trigger
  public async triggerCleanup() {
    console.log('🔄 Manually triggering backup cleanup');
    return await this.runCleanupJob();
  }
}

// Create and export singleton instance
export const backupScheduler = new BackupScheduler();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, stopping backup scheduler...');
  backupScheduler.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, stopping backup scheduler...');
  backupScheduler.stopAllJobs();
  process.exit(0);
});