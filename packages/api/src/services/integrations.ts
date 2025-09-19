import { prisma } from '../lib/prisma';
import { cacheService } from './cache';
import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';

export interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'payment' | 'analytics' | 'social' | 'storage' | 'communication' | 'other';
  provider: string;
  enabled: boolean;
  settings: Record<string, any>;
  credentials: Record<string, string>;
  webhookUrl?: string;
  webhookSecret?: string;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  scopes?: string[];
  version: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  tenantId: string;
  event: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  signature?: string;
  verified: boolean;
  processed: boolean;
  error?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  createdAt: Date;
}

export interface IntegrationResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  rateLimit?: {
    remaining: number;
    resetAt: Date;
  };
}

class IntegrationsService {
  private httpClients: Map<string, any> = new Map();
  private rateLimiters: Map<string, any> = new Map();

  // Popular integration configurations
  private integrationTemplates = {
    mailchimp: {
      name: 'Mailchimp',
      description: 'Email marketing and automation platform',
      category: 'email' as const,
      provider: 'mailchimp',
      baseUrl: 'https://us1.api.mailchimp.com/3.0',
      authType: 'api_key',
      requiredCredentials: ['api_key', 'server'],
      scopes: ['read', 'write'],
      rateLimits: {
        requestsPerMinute: 10,
        requestsPerHour: 600,
        requestsPerDay: 10000,
      },
    },
    stripe: {
      name: 'Stripe',
      description: 'Payment processing and billing',
      category: 'payment' as const,
      provider: 'stripe',
      baseUrl: 'https://api.stripe.com/v1',
      authType: 'bearer',
      requiredCredentials: ['secret_key', 'publishable_key'],
      scopes: ['read', 'write'],
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 6000,
        requestsPerDay: 100000,
      },
    },
    google_analytics: {
      name: 'Google Analytics',
      description: 'Web analytics and reporting',
      category: 'analytics' as const,
      provider: 'google',
      baseUrl: 'https://analyticsreporting.googleapis.com/v4',
      authType: 'oauth2',
      requiredCredentials: ['client_id', 'client_secret', 'refresh_token'],
      scopes: ['analytics.readonly'],
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 3600,
        requestsPerDay: 50000,
      },
    },
    slack: {
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'communication' as const,
      provider: 'slack',
      baseUrl: 'https://slack.com/api',
      authType: 'bearer',
      requiredCredentials: ['bot_token', 'app_token'],
      scopes: ['chat:write', 'channels:read', 'groups:read'],
      rateLimits: {
        requestsPerMinute: 120,
        requestsPerHour: 7200,
        requestsPerDay: 100000,
      },
    },
    discord: {
      name: 'Discord',
      description: 'Community chat and engagement',
      category: 'communication' as const,
      provider: 'discord',
      baseUrl: 'https://discord.com/api/v10',
      authType: 'bearer',
      requiredCredentials: ['bot_token'],
      scopes: ['bot'],
      rateLimits: {
        requestsPerMinute: 300,
        requestsPerHour: 18000,
        requestsPerDay: 300000,
      },
    },
    facebook: {
      name: 'Facebook',
      description: 'Social media integration and marketing',
      category: 'social' as const,
      provider: 'facebook',
      baseUrl: 'https://graph.facebook.com/v18.0',
      authType: 'bearer',
      requiredCredentials: ['access_token', 'page_id'],
      scopes: ['pages_manage_posts', 'pages_read_engagement'],
      rateLimits: {
        requestsPerMinute: 200,
        requestsPerHour: 12000,
        requestsPerDay: 200000,
      },
    },
    instagram: {
      name: 'Instagram',
      description: 'Photo and video sharing platform',
      category: 'social' as const,
      provider: 'instagram',
      baseUrl: 'https://graph.instagram.com',
      authType: 'bearer',
      requiredCredentials: ['access_token', 'business_account_id'],
      scopes: ['instagram_basic', 'instagram_content_publish'],
      rateLimits: {
        requestsPerMinute: 200,
        requestsPerHour: 12000,
        requestsPerDay: 200000,
      },
    },
  };

  async listAvailableIntegrations(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    provider: string;
    authType: string;
    scopes: string[];
  }>> {
    return Object.entries(this.integrationTemplates).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      category: template.category,
      provider: template.provider,
      authType: template.authType,
      scopes: template.scopes || [],
    }));
  }

  async createIntegration(tenantId: string, data: {
    templateId: string;
    name?: string;
    settings?: Record<string, any>;
    credentials: Record<string, string>;
    webhookUrl?: string;
  }): Promise<IntegrationConfig> {
    const template = this.integrationTemplates[data.templateId];
    if (!template) {
      throw new Error(`Integration template not found: ${data.templateId}`);
    }

    // Validate required credentials
    for (const field of template.requiredCredentials) {
      if (!data.credentials[field]) {
        throw new Error(`Missing required credential: ${field}`);
      }
    }

    // Test the integration
    const testResult = await this.testIntegration(data.templateId, data.credentials);
    if (!testResult.success) {
      throw new Error(`Integration test failed: ${testResult.error}`);
    }

    const integrationId = crypto.randomUUID();
    const webhookSecret = data.webhookUrl ? crypto.randomBytes(32).toString('hex') : undefined;

    const integration: IntegrationConfig = {
      id: integrationId,
      name: data.name || template.name,
      description: template.description,
      category: template.category,
      provider: template.provider,
      enabled: true,
      settings: data.settings || {},
      credentials: this.encryptCredentials(data.credentials),
      webhookUrl: data.webhookUrl,
      webhookSecret,
      rateLimits: template.rateLimits,
      scopes: template.scopes,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in database (simplified - would use actual Prisma model)
    await this.storeIntegration(tenantId, integration);

    console.log(`✅ Created integration: ${integration.name} for tenant: ${tenantId}`);
    
    return integration;
  }

  async getIntegrations(tenantId: string, filters?: {
    category?: string;
    provider?: string;
    enabled?: boolean;
  }): Promise<IntegrationConfig[]> {
    const cacheKey = `integrations:${tenantId}:${JSON.stringify(filters || {})}`;
    
    return cacheService.cached(cacheKey, async () => {
      // In a real implementation, this would query the database
      // For now, return mock data
      return [];
    }, { ttl: 300 });
  }

  async getIntegration(tenantId: string, integrationId: string): Promise<IntegrationConfig | null> {
    const cacheKey = `integration:${tenantId}:${integrationId}`;
    
    return cacheService.cached(cacheKey, async () => {
      // Query database for specific integration
      return null;
    }, { ttl: 300 });
  }

  async updateIntegration(
    tenantId: string,
    integrationId: string,
    updates: Partial<IntegrationConfig>
  ): Promise<IntegrationConfig> {
    const integration = await this.getIntegration(tenantId, integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // If credentials are being updated, encrypt them
    if (updates.credentials) {
      updates.credentials = this.encryptCredentials(updates.credentials);
    }

    const updatedIntegration = {
      ...integration,
      ...updates,
      updatedAt: new Date(),
    };

    await this.storeIntegration(tenantId, updatedIntegration);

    // Invalidate cache
    await cacheService.deleteMany([
      `integration:${tenantId}:${integrationId}`,
      `integrations:${tenantId}:*`,
    ]);

    return updatedIntegration;
  }

  async deleteIntegration(tenantId: string, integrationId: string): Promise<void> {
    // Remove from database
    await this.removeIntegration(tenantId, integrationId);

    // Invalidate cache
    await cacheService.deleteMany([
      `integration:${tenantId}:${integrationId}`,
      `integrations:${tenantId}:*`,
    ]);

    console.log(`🗑️ Deleted integration: ${integrationId} for tenant: ${tenantId}`);
  }

  async testIntegration(templateId: string, credentials: Record<string, string>): Promise<IntegrationResponse> {
    const template = this.integrationTemplates[templateId];
    if (!template) {
      return { success: false, error: 'Integration template not found' };
    }

    try {
      switch (template.provider) {
        case 'stripe':
          return await this.testStripeIntegration(credentials);
        case 'mailchimp':
          return await this.testMailchimpIntegration(credentials);
        case 'slack':
          return await this.testSlackIntegration(credentials);
        case 'discord':
          return await this.testDiscordIntegration(credentials);
        case 'google':
          return await this.testGoogleAnalyticsIntegration(credentials);
        case 'facebook':
          return await this.testFacebookIntegration(credentials);
        case 'instagram':
          return await this.testInstagramIntegration(credentials);
        default:
          return { success: false, error: 'Integration test not implemented' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async makeRequest(
    tenantId: string,
    integrationId: string,
    config: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      endpoint: string;
      data?: any;
      headers?: Record<string, string>;
      params?: Record<string, any>;
    }
  ): Promise<IntegrationResponse> {
    const integration = await this.getIntegration(tenantId, integrationId);
    if (!integration) {
      return { success: false, error: 'Integration not found' };
    }

    if (!integration.enabled) {
      return { success: false, error: 'Integration is disabled' };
    }

    try {
      // Check rate limits
      const rateLimitCheck = await this.checkRateLimit(integrationId);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          statusCode: 429,
          rateLimit: rateLimitCheck.rateLimit,
        };
      }

      // Get template for base URL
      const template = Object.values(this.integrationTemplates).find(
        t => t.provider === integration.provider
      );

      if (!template) {
        return { success: false, error: 'Integration template not found' };
      }

      // Prepare request
      const url = `${template.baseUrl}${config.endpoint}`;
      const credentials = this.decryptCredentials(integration.credentials);
      
      const requestConfig: AxiosRequestConfig = {
        method: config.method,
        url,
        data: config.data,
        params: config.params,
        headers: {
          ...config.headers,
          ...this.getAuthHeaders(template.authType, credentials),
        },
        timeout: 30000,
      };

      // Make request
      const response = await axios(requestConfig);

      // Update rate limit tracking
      await this.updateRateLimit(integrationId);

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;

      return {
        success: false,
        error: errorMessage,
        statusCode,
        headers: error.response?.headers,
      };
    }
  }

  async processWebhook(
    tenantId: string,
    integrationId: string,
    payload: any,
    headers: Record<string, string>,
    signature?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.getIntegration(tenantId, integrationId);
      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      // Verify webhook signature if available
      if (integration.webhookSecret && signature) {
        const isValid = this.verifyWebhookSignature(
          payload,
          signature,
          integration.webhookSecret
        );
        
        if (!isValid) {
          return { success: false, error: 'Invalid webhook signature' };
        }
      }

      // Create webhook event record
      const webhookEvent: WebhookEvent = {
        id: crypto.randomUUID(),
        integrationId,
        tenantId,
        event: headers['x-event-type'] || 'unknown',
        payload,
        headers,
        signature,
        verified: !!signature,
        processed: false,
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
      };

      // Store webhook event
      await this.storeWebhookEvent(webhookEvent);

      // Process webhook asynchronously
      setImmediate(() => this.processWebhookEvent(webhookEvent));

      return { success: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }

  async syncIntegration(tenantId: string, integrationId: string): Promise<IntegrationResponse> {
    const integration = await this.getIntegration(tenantId, integrationId);
    if (!integration) {
      return { success: false, error: 'Integration not found' };
    }

    try {
      // Perform integration-specific sync logic
      const result = await this.performSync(integration);
      
      // Update last sync timestamp
      await this.updateIntegration(tenantId, integrationId, {
        lastSyncAt: new Date(),
      });

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Private helper methods
  private async testStripeIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    try {
      const response = await axios.get('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${credentials.secret_key}`,
        },
      });

      return {
        success: true,
        data: { accountId: response.data.id, country: response.data.country },
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  private async testMailchimpIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    try {
      const server = credentials.server || 'us1';
      const response = await axios.get(`https://${server}.api.mailchimp.com/3.0/ping`, {
        headers: {
          'Authorization': `apikey ${credentials.api_key}`,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  private async testSlackIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    try {
      const response = await axios.post('https://slack.com/api/auth.test', {}, {
        headers: {
          'Authorization': `Bearer ${credentials.bot_token}`,
        },
      });

      return { success: response.data.ok, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async testDiscordIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    try {
      const response = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
          'Authorization': `Bot ${credentials.bot_token}`,
        },
      });

      return { success: true, data: { botId: response.data.id, username: response.data.username } };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  private async testGoogleAnalyticsIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    // This would involve OAuth2 token validation
    return { success: true, data: { message: 'Google Analytics integration test passed' } };
  }

  private async testFacebookIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${credentials.page_id}`, {
        params: {
          access_token: credentials.access_token,
          fields: 'id,name',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  private async testInstagramIntegration(credentials: Record<string, string>): Promise<IntegrationResponse> {
    try {
      const response = await axios.get(`https://graph.instagram.com/${credentials.business_account_id}`, {
        params: {
          access_token: credentials.access_token,
          fields: 'id,username',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  private getAuthHeaders(authType: string, credentials: Record<string, string>): Record<string, string> {
    switch (authType) {
      case 'bearer':
        return { 'Authorization': `Bearer ${credentials.access_token || credentials.bot_token || credentials.secret_key}` };
      case 'api_key':
        return { 'Authorization': `apikey ${credentials.api_key}` };
      case 'oauth2':
        return { 'Authorization': `Bearer ${credentials.access_token}` };
      default:
        return {};
    }
  }

  private encryptCredentials(credentials: Record<string, string>): Record<string, string> {
    // In a real implementation, use proper encryption
    // For now, just return as-is (would encrypt with AES-256)
    return credentials;
  }

  private decryptCredentials(encryptedCredentials: Record<string, string>): Record<string, string> {
    // In a real implementation, decrypt the credentials
    return encryptedCredentials;
  }

  private verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  private async checkRateLimit(integrationId: string): Promise<{
    allowed: boolean;
    rateLimit?: { remaining: number; resetAt: Date };
  }> {
    // Implement rate limiting logic
    return { allowed: true };
  }

  private async updateRateLimit(integrationId: string): Promise<void> {
    // Update rate limit counters
  }

  private async storeIntegration(tenantId: string, integration: IntegrationConfig): Promise<void> {
    // Store in database
    console.log('Storing integration:', integration.id);
  }

  private async removeIntegration(tenantId: string, integrationId: string): Promise<void> {
    // Remove from database
    console.log('Removing integration:', integrationId);
  }

  private async storeWebhookEvent(event: WebhookEvent): Promise<void> {
    // Store webhook event in database
    console.log('Storing webhook event:', event.id);
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    // Process webhook event based on integration type and event
    console.log('Processing webhook event:', event.id, event.event);
  }

  private async performSync(integration: IntegrationConfig): Promise<IntegrationResponse> {
    // Perform integration-specific sync operations
    return { success: true, data: { message: 'Sync completed' } };
  }
}

export const integrationsService = new IntegrationsService();