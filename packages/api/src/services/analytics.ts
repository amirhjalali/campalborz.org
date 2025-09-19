// Analytics service for tracking user behavior and generating insights
import { PrismaClient } from "@prisma/client";

export interface AnalyticsEvent {
  tenantId: string;
  userId?: string;
  sessionId: string;
  event: string;
  category: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  page?: string;
}

export interface AnalyticsQuery {
  tenantId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  events?: string[];
  categories?: string[];
  userIds?: string[];
  groupBy?: "hour" | "day" | "week" | "month";
  metrics?: string[];
}

export interface AnalyticsMetrics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  traffic: {
    pageViews: number;
    uniquePageViews: number;
    topPages: Array<{ page: string; views: number; uniqueViews: number }>;
    referrers: Array<{ source: string; visits: number; percentage: number }>;
    devices: Array<{ type: string; count: number; percentage: number }>;
    browsers: Array<{ name: string; count: number; percentage: number }>;
  };
  engagement: {
    eventsCount: number;
    topEvents: Array<{ event: string; count: number; uniqueUsers: number }>;
    userJourney: Array<{ step: string; users: number; dropoff: number }>;
    timeOnSite: number;
    pagesPerSession: number;
  };
  conversion: {
    goals: Array<{
      name: string;
      completions: number;
      conversionRate: number;
      value: number;
    }>;
    funnels: Array<{
      name: string;
      steps: Array<{ name: string; users: number; percentage: number }>;
    }>;
  };
  realtime: {
    currentUsers: number;
    currentSessions: number;
    topPages: Array<{ page: string; users: number }>;
    recentEvents: Array<{ event: string; timestamp: Date; userId?: string }>;
  };
}

export interface AnalyticsReport {
  dateRange: { start: Date; end: Date };
  metrics: AnalyticsMetrics;
  trends: {
    users: Array<{ date: string; value: number }>;
    sessions: Array<{ date: string; value: number }>;
    pageViews: Array<{ date: string; value: number }>;
    events: Array<{ date: string; value: number }>;
  };
  insights: Array<{
    type: "positive" | "negative" | "neutral";
    title: string;
    description: string;
    value?: number;
    change?: number;
  }>;
}

class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  // Track an analytics event
  async track(event: AnalyticsEvent): Promise<boolean> {
    try {
      // In production, you might want to batch these or send to a dedicated analytics service
      await this.prisma.$executeRaw`
        INSERT INTO analytics_events (
          tenant_id, user_id, session_id, event, category, 
          properties, timestamp, user_agent, ip_address, referrer, page
        ) VALUES (
          ${event.tenantId}, ${event.userId}, ${event.sessionId}, 
          ${event.event}, ${event.category}, ${JSON.stringify(event.properties || {})},
          ${event.timestamp || new Date()}, ${event.userAgent}, 
          ${event.ipAddress}, ${event.referrer}, ${event.page}
        )
      `;

      return true;
    } catch (error) {
      console.error("Failed to track analytics event:", error);
      return false;
    }
  }

  // Get comprehensive analytics report
  async getReport(query: AnalyticsQuery): Promise<AnalyticsReport> {
    const { tenantId, dateRange } = query;

    // Calculate previous period for comparison
    const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
    const previousStart = new Date(dateRange.start.getTime() - periodDuration);
    const previousEnd = new Date(dateRange.end.getTime() - periodDuration);

    // Get current period metrics
    const currentMetrics = await this.calculateMetrics(tenantId, dateRange);
    const previousMetrics = await this.calculateMetrics(tenantId, { start: previousStart, end: previousEnd });

    // Get trends data
    const trends = await this.getTrends(tenantId, dateRange, query.groupBy || "day");

    // Generate insights
    const insights = this.generateInsights(currentMetrics, previousMetrics);

    return {
      dateRange,
      metrics: currentMetrics,
      trends,
      insights,
    };
  }

  // Calculate metrics for a specific time period
  private async calculateMetrics(tenantId: string, dateRange: { start: Date; end: Date }): Promise<AnalyticsMetrics> {
    try {
      // Overview metrics
      const totalUsers = await this.prisma.user.count({
        where: { tenantId, createdAt: { gte: dateRange.start, lte: dateRange.end } },
      });

      const activeUsers = await this.prisma.user.count({
        where: { 
          tenantId, 
          lastLoginAt: { gte: dateRange.start, lte: dateRange.end } 
        },
      });

      // Mock analytics data - in production, these would come from your analytics events table
      const overview = {
        totalUsers,
        activeUsers,
        newUsers: totalUsers,
        returningUsers: Math.max(0, activeUsers - totalUsers),
        totalSessions: Math.floor(activeUsers * 1.5),
        averageSessionDuration: 245, // seconds
        bounceRate: 0.35,
        conversionRate: 0.12,
      };

      // Traffic metrics
      const traffic = {
        pageViews: Math.floor(activeUsers * 8.5),
        uniquePageViews: Math.floor(activeUsers * 6.2),
        topPages: [
          { page: "/", views: Math.floor(activeUsers * 2.1), uniqueViews: Math.floor(activeUsers * 1.8) },
          { page: "/events", views: Math.floor(activeUsers * 1.4), uniqueViews: Math.floor(activeUsers * 1.2) },
          { page: "/about", views: Math.floor(activeUsers * 0.9), uniqueViews: Math.floor(activeUsers * 0.8) },
          { page: "/gallery", views: Math.floor(activeUsers * 0.7), uniqueViews: Math.floor(activeUsers * 0.6) },
          { page: "/contact", views: Math.floor(activeUsers * 0.5), uniqueViews: Math.floor(activeUsers * 0.4) },
        ],
        referrers: [
          { source: "Direct", visits: Math.floor(activeUsers * 0.4), percentage: 40 },
          { source: "Google", visits: Math.floor(activeUsers * 0.3), percentage: 30 },
          { source: "Social Media", visits: Math.floor(activeUsers * 0.2), percentage: 20 },
          { source: "Email", visits: Math.floor(activeUsers * 0.1), percentage: 10 },
        ],
        devices: [
          { type: "Desktop", count: Math.floor(activeUsers * 0.6), percentage: 60 },
          { type: "Mobile", count: Math.floor(activeUsers * 0.35), percentage: 35 },
          { type: "Tablet", count: Math.floor(activeUsers * 0.05), percentage: 5 },
        ],
        browsers: [
          { name: "Chrome", count: Math.floor(activeUsers * 0.65), percentage: 65 },
          { name: "Safari", count: Math.floor(activeUsers * 0.2), percentage: 20 },
          { name: "Firefox", count: Math.floor(activeUsers * 0.1), percentage: 10 },
          { name: "Edge", count: Math.floor(activeUsers * 0.05), percentage: 5 },
        ],
      };

      // Engagement metrics
      const engagement = {
        eventsCount: Math.floor(activeUsers * 15),
        topEvents: [
          { event: "page_view", count: Math.floor(activeUsers * 8), uniqueUsers: Math.floor(activeUsers * 0.9) },
          { event: "button_click", count: Math.floor(activeUsers * 4), uniqueUsers: Math.floor(activeUsers * 0.7) },
          { event: "form_submit", count: Math.floor(activeUsers * 2), uniqueUsers: Math.floor(activeUsers * 0.4) },
          { event: "download", count: Math.floor(activeUsers * 1), uniqueUsers: Math.floor(activeUsers * 0.3) },
        ],
        userJourney: [
          { step: "Landing", users: activeUsers, dropoff: 0 },
          { step: "Browse", users: Math.floor(activeUsers * 0.8), dropoff: 20 },
          { step: "Engage", users: Math.floor(activeUsers * 0.5), dropoff: 37.5 },
          { step: "Convert", users: Math.floor(activeUsers * 0.12), dropoff: 76 },
        ],
        timeOnSite: 425, // seconds
        pagesPerSession: 3.2,
      };

      // Conversion metrics
      const conversion = {
        goals: [
          { name: "Membership Application", completions: Math.floor(activeUsers * 0.08), conversionRate: 8, value: 0 },
          { name: "Event RSVP", completions: Math.floor(activeUsers * 0.25), conversionRate: 25, value: 0 },
          { name: "Newsletter Signup", completions: Math.floor(activeUsers * 0.35), conversionRate: 35, value: 0 },
          { name: "Donation", completions: Math.floor(activeUsers * 0.05), conversionRate: 5, value: 1500 },
        ],
        funnels: [
          {
            name: "Member Signup Funnel",
            steps: [
              { name: "Visit Site", users: activeUsers, percentage: 100 },
              { name: "View Membership", users: Math.floor(activeUsers * 0.4), percentage: 40 },
              { name: "Start Application", users: Math.floor(activeUsers * 0.15), percentage: 15 },
              { name: "Complete Application", users: Math.floor(activeUsers * 0.08), percentage: 8 },
            ],
          },
        ],
      };

      // Realtime metrics (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const realtimeUsers = await this.prisma.user.count({
        where: { 
          tenantId, 
          lastLoginAt: { gte: thirtyMinutesAgo } 
        },
      });

      const realtime = {
        currentUsers: realtimeUsers,
        currentSessions: Math.floor(realtimeUsers * 1.2),
        topPages: [
          { page: "/", users: Math.floor(realtimeUsers * 0.4) },
          { page: "/events", users: Math.floor(realtimeUsers * 0.3) },
          { page: "/gallery", users: Math.floor(realtimeUsers * 0.2) },
          { page: "/about", users: Math.floor(realtimeUsers * 0.1) },
        ],
        recentEvents: [
          { event: "page_view", timestamp: new Date(Date.now() - 2 * 60 * 1000) },
          { event: "button_click", timestamp: new Date(Date.now() - 5 * 60 * 1000) },
          { event: "form_submit", timestamp: new Date(Date.now() - 8 * 60 * 1000) },
        ],
      };

      return {
        overview,
        traffic,
        engagement,
        conversion,
        realtime,
      };
    } catch (error) {
      console.error("Error calculating metrics:", error);
      // Return empty metrics on error
      return this.getEmptyMetrics();
    }
  }

  // Get trend data over time
  private async getTrends(tenantId: string, dateRange: { start: Date; end: Date }, groupBy: string) {
    const trends = {
      users: [] as Array<{ date: string; value: number }>,
      sessions: [] as Array<{ date: string; value: number }>,
      pageViews: [] as Array<{ date: string; value: number }>,
      events: [] as Array<{ date: string; value: number }>,
    };

    // Generate mock trend data
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Add some variance to make the data look realistic
      const variance = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier
      
      trends.users.push({ date: dateStr, value: Math.floor(10 * variance) });
      trends.sessions.push({ date: dateStr, value: Math.floor(15 * variance) });
      trends.pageViews.push({ date: dateStr, value: Math.floor(85 * variance) });
      trends.events.push({ date: dateStr, value: Math.floor(150 * variance) });
    }

    return trends;
  }

  // Generate insights from metrics comparison
  private generateInsights(current: AnalyticsMetrics, previous: AnalyticsMetrics) {
    const insights = [];

    // User growth insight
    const userGrowth = ((current.overview.activeUsers - previous.overview.activeUsers) / previous.overview.activeUsers) * 100;
    if (userGrowth > 10) {
      insights.push({
        type: "positive" as const,
        title: "Strong User Growth",
        description: `Active users increased by ${userGrowth.toFixed(1)}% compared to the previous period`,
        value: current.overview.activeUsers,
        change: userGrowth,
      });
    } else if (userGrowth < -5) {
      insights.push({
        type: "negative" as const,
        title: "User Decline",
        description: `Active users decreased by ${Math.abs(userGrowth).toFixed(1)}% compared to the previous period`,
        value: current.overview.activeUsers,
        change: userGrowth,
      });
    }

    // Engagement insight
    if (current.engagement.timeOnSite > 300) {
      insights.push({
        type: "positive" as const,
        title: "High Engagement",
        description: `Users are spending an average of ${Math.floor(current.engagement.timeOnSite / 60)} minutes on your site`,
        value: current.engagement.timeOnSite,
      });
    }

    // Conversion insight
    if (current.overview.conversionRate > 0.1) {
      insights.push({
        type: "positive" as const,
        title: "Good Conversion Rate",
        description: `Your conversion rate of ${(current.overview.conversionRate * 100).toFixed(1)}% is above average`,
        value: current.overview.conversionRate,
      });
    }

    // Top performing page
    const topPage = current.traffic.topPages[0];
    if (topPage && topPage.views > current.traffic.pageViews * 0.2) {
      insights.push({
        type: "neutral" as const,
        title: "Top Performing Page",
        description: `${topPage.page} accounts for ${((topPage.views / current.traffic.pageViews) * 100).toFixed(1)}% of all page views`,
        value: topPage.views,
      });
    }

    return insights;
  }

  // Get user behavior analytics
  async getUserBehavior(tenantId: string, userId: string, dateRange: { start: Date; end: Date }) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          lastLoginAt: true,
          metadata: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Mock user behavior data
      return {
        user,
        summary: {
          totalSessions: 12,
          totalPageViews: 45,
          averageSessionDuration: 340,
          lastActive: user.lastLoginAt,
          firstVisit: user.createdAt,
        },
        activity: [
          { date: "2024-01-15", sessions: 2, pageViews: 8, duration: 420 },
          { date: "2024-01-14", sessions: 1, pageViews: 3, duration: 180 },
          { date: "2024-01-13", sessions: 3, pageViews: 12, duration: 650 },
        ],
        topPages: [
          { page: "/", views: 12, timeSpent: 120 },
          { page: "/events", views: 8, timeSpent: 240 },
          { page: "/gallery", views: 6, timeSpent: 180 },
        ],
        devices: [
          { type: "Desktop", sessions: 8, lastUsed: new Date() },
          { type: "Mobile", sessions: 4, lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        ],
        goals: [
          { name: "Event RSVP", completed: true, date: new Date(Date.now() - 48 * 60 * 60 * 1000) },
          { name: "Newsletter Signup", completed: true, date: user.createdAt },
        ],
      };
    } catch (error) {
      console.error("Error getting user behavior:", error);
      throw error;
    }
  }

  // Track custom goal completion
  async trackGoal(tenantId: string, userId: string, goalName: string, value?: number) {
    try {
      return await this.track({
        tenantId,
        userId,
        sessionId: `session_${Date.now()}`,
        event: "goal_completed",
        category: "conversion",
        properties: {
          goalName,
          value: value || 0,
        },
      });
    } catch (error) {
      console.error("Error tracking goal:", error);
      return false;
    }
  }

  // Get empty metrics structure
  private getEmptyMetrics(): AnalyticsMetrics {
    return {
      overview: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        returningUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0,
      },
      traffic: {
        pageViews: 0,
        uniquePageViews: 0,
        topPages: [],
        referrers: [],
        devices: [],
        browsers: [],
      },
      engagement: {
        eventsCount: 0,
        topEvents: [],
        userJourney: [],
        timeOnSite: 0,
        pagesPerSession: 0,
      },
      conversion: {
        goals: [],
        funnels: [],
      },
      realtime: {
        currentUsers: 0,
        currentSessions: 0,
        topPages: [],
        recentEvents: [],
      },
    };
  }
}

export const createAnalyticsService = (prisma: PrismaClient) => {
  return new AnalyticsService(prisma);
};