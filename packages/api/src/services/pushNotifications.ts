import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  clickAction?: string;
  badge?: number;
  sound?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  category?: string;
  tags?: string[];
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface DeviceRegistration {
  deviceToken: string;
  platform: 'IOS' | 'ANDROID' | 'WEB' | 'DESKTOP';
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
}

export interface NotificationTemplate {
  name: string;
  description?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  clickAction?: string;
  sound?: string;
  category?: string;
  variables?: string[];
}

export interface CampaignData {
  name: string;
  description?: string;
  templateId: string;
  targetAudience: Record<string, any>;
  scheduledFor?: Date;
}

export interface TargetingCriteria {
  userIds?: string[];
  membershipTypes?: string[];
  eventAttendees?: string[];
  platforms?: string[];
  tags?: string[];
  excludeUserIds?: string[];
  maxDevices?: number;
}

export class PushNotificationService {

  // Device Management
  async registerDevice(tenantId: string, userId: string, deviceData: DeviceRegistration) {
    const device = await prisma.pushDevice.upsert({
      where: { deviceToken: deviceData.deviceToken },
      update: {
        userId,
        tenantId,
        platform: deviceData.platform,
        deviceName: deviceData.deviceName,
        appVersion: deviceData.appVersion,
        osVersion: deviceData.osVersion,
        isActive: true,
        lastUsed: new Date()
      },
      create: {
        userId,
        tenantId,
        ...deviceData,
        isActive: true
      }
    });

    return device;
  }

  async unregisterDevice(deviceToken: string) {
    await prisma.pushDevice.update({
      where: { deviceToken },
      data: { isActive: false }
    });
  }

  async getUserDevices(tenantId: string, userId: string) {
    return await prisma.pushDevice.findMany({
      where: {
        tenantId,
        userId,
        isActive: true
      },
      orderBy: { lastUsed: 'desc' }
    });
  }

  async updateDeviceLastUsed(deviceToken: string) {
    await prisma.pushDevice.update({
      where: { deviceToken },
      data: { lastUsed: new Date() }
    });
  }

  // Notification Creation and Sending
  async createNotification(tenantId: string, data: PushNotificationData, createdBy?: string) {
    const notification = await prisma.pushNotification.create({
      data: {
        tenantId,
        ...data,
        createdBy
      }
    });

    return notification;
  }

  async sendNotification(tenantId: string, notificationId: string, targetCriteria: TargetingCriteria) {
    const notification = await prisma.pushNotification.findFirst({
      where: { id: notificationId, tenantId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Get target devices
    const targetDevices = await this.getTargetDevices(tenantId, targetCriteria);

    if (targetDevices.length === 0) {
      throw new Error('No target devices found');
    }

    // Check user preferences and filter devices
    const filteredDevices = await this.filterDevicesByPreferences(targetDevices, notification);

    // Create delivery records
    const deliveries = await this.createDeliveryRecords(notificationId, filteredDevices);

    // Send to push notification providers
    await this.sendToPushProviders(notification, filteredDevices);

    return {
      notificationId,
      totalTargets: filteredDevices.length,
      deliveries: deliveries.length
    };
  }

  async sendImmediateNotification(
    tenantId: string,
    data: PushNotificationData,
    targetCriteria: TargetingCriteria,
    createdBy?: string
  ) {
    const notification = await this.createNotification(tenantId, data, createdBy);
    return await this.sendNotification(tenantId, notification.id, targetCriteria);
  }

  private async getTargetDevices(tenantId: string, criteria: TargetingCriteria) {
    const where: any = {
      tenantId,
      isActive: true
    };

    if (criteria.userIds && criteria.userIds.length > 0) {
      where.userId = { in: criteria.userIds };
    }

    if (criteria.excludeUserIds && criteria.excludeUserIds.length > 0) {
      where.userId = { ...where.userId, notIn: criteria.excludeUserIds };
    }

    if (criteria.platforms && criteria.platforms.length > 0) {
      where.platform = { in: criteria.platforms };
    }

    // Additional filtering for membership types, event attendees, etc.
    if (criteria.membershipTypes && criteria.membershipTypes.length > 0) {
      const memberUsers = await prisma.memberProfile.findMany({
        where: {
          tenantId,
          membershipType: { in: criteria.membershipTypes }
        },
        select: { userId: true }
      });
      
      const userIds = memberUsers.map(m => m.userId);
      where.userId = where.userId ? { ...where.userId, in: userIds } : { in: userIds };
    }

    if (criteria.eventAttendees && criteria.eventAttendees.length > 0) {
      const attendees = await prisma.eventAttendee.findMany({
        where: {
          eventId: { in: criteria.eventAttendees },
          status: 'ATTENDING'
        },
        select: { userId: true }
      });
      
      const userIds = attendees.map(a => a.userId);
      where.userId = where.userId ? { ...where.userId, in: userIds } : { in: userIds };
    }

    const devices = await prisma.pushDevice.findMany({
      where,
      include: {
        user: true
      },
      orderBy: { lastUsed: 'desc' },
      take: criteria.maxDevices
    });

    return devices;
  }

  private async filterDevicesByPreferences(devices: any[], notification: any) {
    const filteredDevices = [];

    for (const device of devices) {
      // Check notification preferences
      const preferences = await prisma.notificationPreference.findFirst({
        where: {
          userId: device.userId,
          tenantId: device.tenantId,
          category: notification.category || 'general'
        }
      });

      if (preferences && !preferences.isEnabled) {
        continue;
      }

      // Check quiet hours
      if (preferences?.quietHours && this.isInQuietHours(preferences.quietHours)) {
        continue;
      }

      // Check frequency limits
      if (preferences?.frequency !== 'IMMEDIATE') {
        const shouldSkip = await this.shouldSkipDueToFrequency(
          device.userId,
          notification.category || 'general',
          preferences.frequency
        );
        if (shouldSkip) continue;
      }

      filteredDevices.push(device);
    }

    return filteredDevices;
  }

  private isInQuietHours(quietHours: any): boolean {
    if (!quietHours?.start || !quietHours?.end) return false;

    const now = new Date();
    const timezone = quietHours.timezone || 'UTC';
    
    // Simple quiet hours check (in production, use proper timezone library)
    const currentHour = now.getUTCHours();
    const startHour = parseInt(quietHours.start.split(':')[0]);
    const endHour = parseInt(quietHours.end.split(':')[0]);

    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  private async shouldSkipDueToFrequency(userId: string, category: string, frequency: string): boolean {
    const now = new Date();
    let checkTime = new Date();

    switch (frequency) {
      case 'HOURLY':
        checkTime.setHours(checkTime.getHours() - 1);
        break;
      case 'DAILY':
        checkTime.setDate(checkTime.getDate() - 1);
        break;
      case 'WEEKLY':
        checkTime.setDate(checkTime.getDate() - 7);
        break;
      case 'NEVER':
        return true;
      default:
        return false;
    }

    const recentDelivery = await prisma.notificationDelivery.findFirst({
      where: {
        device: {
          userId
        },
        notification: {
          category
        },
        sentAt: {
          gte: checkTime
        }
      }
    });

    return !!recentDelivery;
  }

  private async createDeliveryRecords(notificationId: string, devices: any[]) {
    const deliveryData = devices.map(device => ({
      notificationId,
      deviceId: device.id,
      status: 'PENDING' as const
    }));

    const deliveries = await prisma.notificationDelivery.createMany({
      data: deliveryData
    });

    return deliveries;
  }

  private async sendToPushProviders(notification: any, devices: any[]) {
    // Group devices by platform
    const devicesByPlatform = devices.reduce((acc, device) => {
      if (!acc[device.platform]) acc[device.platform] = [];
      acc[device.platform].push(device);
      return acc;
    }, {});

    // Send to each platform
    const promises = Object.entries(devicesByPlatform).map(([platform, platformDevices]: [string, any[]]) => {
      switch (platform) {
        case 'IOS':
          return this.sendToAPNS(notification, platformDevices);
        case 'ANDROID':
          return this.sendToFCM(notification, platformDevices);
        case 'WEB':
          return this.sendToWebPush(notification, platformDevices);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  private async sendToAPNS(notification: any, devices: any[]) {
    // Implementation for Apple Push Notification Service
    // This would integrate with the apn2 library or similar
    
    for (const device of devices) {
      try {
        // Simulated APNS sending
        await this.updateDeliveryStatus(notification.id, device.id, 'SENT');
        
        // In production, implement actual APNS logic here
        console.log(`Sending APNS notification to device ${device.deviceToken}`);
        
      } catch (error) {
        await this.updateDeliveryStatus(notification.id, device.id, 'FAILED', error.message);
      }
    }
  }

  private async sendToFCM(notification: any, devices: any[]) {
    // Implementation for Firebase Cloud Messaging
    // This would integrate with the firebase-admin library
    
    for (const device of devices) {
      try {
        // Simulated FCM sending
        await this.updateDeliveryStatus(notification.id, device.id, 'SENT');
        
        // In production, implement actual FCM logic here
        console.log(`Sending FCM notification to device ${device.deviceToken}`);
        
      } catch (error) {
        await this.updateDeliveryStatus(notification.id, device.id, 'FAILED', error.message);
      }
    }
  }

  private async sendToWebPush(notification: any, devices: any[]) {
    // Implementation for Web Push Protocol
    // This would integrate with the web-push library
    
    for (const device of devices) {
      try {
        // Simulated Web Push sending
        await this.updateDeliveryStatus(notification.id, device.id, 'SENT');
        
        // In production, implement actual Web Push logic here
        console.log(`Sending Web Push notification to device ${device.deviceToken}`);
        
      } catch (error) {
        await this.updateDeliveryStatus(notification.id, device.id, 'FAILED', error.message);
      }
    }
  }

  private async updateDeliveryStatus(notificationId: string, deviceId: string, status: string, error?: string) {
    const updateData: any = { status };
    
    if (status === 'SENT') updateData.sentAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'FAILED') {
      updateData.failedAt = new Date();
      updateData.error = error;
    }
    if (status === 'CLICKED') updateData.clickedAt = new Date();

    await prisma.notificationDelivery.updateMany({
      where: { notificationId, deviceId },
      data: updateData
    });
  }

  // Template Management
  async createTemplate(tenantId: string, userId: string, data: NotificationTemplate) {
    return await prisma.notificationTemplate.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getTemplates(tenantId: string, isActive = true) {
    return await prisma.notificationTemplate.findMany({
      where: {
        tenantId,
        isActive
      },
      include: {
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTemplate(tenantId: string, templateId: string, data: Partial<NotificationTemplate>) {
    return await prisma.notificationTemplate.update({
      where: { id: templateId },
      data
    });
  }

  async deleteTemplate(tenantId: string, templateId: string) {
    await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: { isActive: false }
    });
  }

  async renderTemplate(templateId: string, variables: Record<string, any>) {
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Simple variable substitution
    let title = template.title;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return {
      title,
      body,
      data: template.data,
      imageUrl: template.imageUrl,
      clickAction: template.clickAction,
      sound: template.sound,
      category: template.category
    };
  }

  // Campaign Management
  async createCampaign(tenantId: string, userId: string, data: CampaignData) {
    const campaign = await prisma.notificationCampaign.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId
      },
      include: {
        template: true
      }
    });

    return campaign;
  }

  async getCampaigns(tenantId: string) {
    return await prisma.notificationCampaign.findMany({
      where: { tenantId },
      include: {
        template: true,
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async executeCampaign(tenantId: string, campaignId: string) {
    const campaign = await prisma.notificationCampaign.findFirst({
      where: { id: campaignId, tenantId },
      include: { template: true }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw new Error('Campaign cannot be executed in current status');
    }

    // Update campaign status
    await prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' }
    });

    try {
      // Create notification from template
      const notificationData = {
        title: campaign.template.title,
        body: campaign.template.body,
        data: campaign.template.data as Record<string, any>,
        imageUrl: campaign.template.imageUrl,
        clickAction: campaign.template.clickAction,
        sound: campaign.template.sound,
        category: campaign.template.category
      };

      const notification = await this.createNotification(tenantId, notificationData, campaign.createdBy);

      // Send notification with campaign targeting
      const result = await this.sendNotification(tenantId, notification.id, campaign.targetAudience as TargetingCriteria);

      // Update campaign with results
      await prisma.notificationCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'SENT',
          totalTargets: result.totalTargets,
          sentCount: result.deliveries
        }
      });

      return result;
    } catch (error) {
      await prisma.notificationCampaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED' }
      });
      throw error;
    }
  }

  // User Preferences
  async updateNotificationPreferences(
    tenantId: string,
    userId: string,
    category: string,
    preferences: {
      isEnabled?: boolean;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      frequency?: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
      quietHours?: any;
    }
  ) {
    return await prisma.notificationPreference.upsert({
      where: {
        userId_tenantId_category: {
          userId,
          tenantId,
          category
        }
      },
      update: preferences,
      create: {
        userId,
        tenantId,
        category,
        ...preferences
      }
    });
  }

  async getUserPreferences(tenantId: string, userId: string) {
    return await prisma.notificationPreference.findMany({
      where: { tenantId, userId }
    });
  }

  // Analytics and Reporting
  async getNotificationAnalytics(tenantId: string, period: 'day' | 'week' | 'month' = 'week') {
    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const [notifications, deliveries, analytics] = await Promise.all([
      // Total notifications sent
      prisma.pushNotification.count({
        where: {
          tenantId,
          createdAt: { gte: startDate }
        }
      }),

      // Delivery statistics
      prisma.notificationDelivery.groupBy({
        by: ['status'],
        where: {
          notification: { tenantId },
          createdAt: { gte: startDate }
        },
        _count: true
      }),

      // Daily analytics
      prisma.notificationAnalytics.findMany({
        where: {
          tenantId,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      })
    ]);

    const deliveryStats = deliveries.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      period,
      totalNotifications: notifications,
      deliveryStats,
      analytics
    };
  }

  async updateAnalytics(tenantId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get delivery statistics for the day
    const deliveries = await prisma.notificationDelivery.findMany({
      where: {
        notification: { tenantId },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        notification: true,
        device: true
      }
    });

    // Group by category and platform
    const statsMap = new Map();

    deliveries.forEach(delivery => {
      const key = `${delivery.notification.category || 'general'}-${delivery.device.platform}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          category: delivery.notification.category || 'general',
          platform: delivery.device.platform,
          totalSent: 0,
          totalDelivered: 0,
          totalClicked: 0,
          totalFailed: 0
        });
      }

      const stats = statsMap.get(key);
      if (delivery.status === 'SENT' || delivery.status === 'DELIVERED') stats.totalSent++;
      if (delivery.status === 'DELIVERED') stats.totalDelivered++;
      if (delivery.status === 'CLICKED') stats.totalClicked++;
      if (delivery.status === 'FAILED') stats.totalFailed++;
    });

    // Update analytics records
    for (const stats of statsMap.values()) {
      const deliveryRate = stats.totalSent > 0 ? stats.totalDelivered / stats.totalSent : 0;
      const clickRate = stats.totalDelivered > 0 ? stats.totalClicked / stats.totalDelivered : 0;

      await prisma.notificationAnalytics.upsert({
        where: {
          tenantId_date_category_platform: {
            tenantId,
            date: startOfDay,
            category: stats.category,
            platform: stats.platform
          }
        },
        update: {
          ...stats,
          deliveryRate,
          clickRate
        },
        create: {
          tenantId,
          date: startOfDay,
          ...stats,
          deliveryRate,
          clickRate
        }
      });
    }
  }

  // Utility Methods
  async scheduleNotifications() {
    const scheduledNotifications = await prisma.pushNotification.findMany({
      where: {
        scheduledFor: {
          lte: new Date()
        },
        deliveries: {
          none: {}
        }
      }
    });

    for (const notification of scheduledNotifications) {
      // Default targeting for scheduled notifications
      const targetCriteria: TargetingCriteria = {
        // Add default targeting logic here
      };

      await this.sendNotification(notification.tenantId, notification.id, targetCriteria);
    }
  }

  async cleanupExpiredNotifications() {
    await prisma.pushNotification.updateMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        deliveries: {
          every: {
            status: 'PENDING'
          }
        }
      },
      data: {
        deliveries: {
          updateMany: {
            where: { status: 'PENDING' },
            data: { status: 'EXPIRED' }
          }
        }
      }
    });
  }

  async retryFailedDeliveries(maxRetries = 3) {
    const failedDeliveries = await prisma.notificationDelivery.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: maxRetries }
      },
      include: {
        notification: true,
        device: true
      }
    });

    for (const delivery of failedDeliveries) {
      try {
        await this.sendToPushProviders(delivery.notification, [delivery.device]);
        await prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: { retryCount: { increment: 1 } }
        });
      } catch (error) {
        console.error(`Retry failed for delivery ${delivery.id}:`, error);
      }
    }
  }
}