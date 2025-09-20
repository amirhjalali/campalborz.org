import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { EventStatus, RSVPStatus, EventType, Prisma } from '@prisma/client';
import { addHours, addDays, isBefore, isAfter } from 'date-fns';
import { emailService } from './email';
import { notificationService } from './notifications';

interface EventFilters {
  type?: EventType;
  category?: string;
  status?: EventStatus;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  isPublic?: boolean;
  hasSpace?: boolean; // Events with available spots
  priceRange?: {
    min?: number;
    max?: number;
  };
}

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  popularCategories: Array<{
    category: string;
    count: number;
  }>;
}

interface RSVPAnalytics {
  confirmed: number;
  pending: number;
  declined: number;
  waitlist: number;
  cancelled: number;
  showUpRate: number; // Percentage of confirmed who actually attended
  lastMinuteCancellations: number;
}

class EventsService {
  // Event Management
  async createEvent(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      content?: any; // Rich content for event details
      type: EventType;
      category?: string;
      startDate: Date;
      endDate?: Date;
      location?: string;
      address?: string;
      virtualUrl?: string;
      maxAttendees?: number;
      price?: number; // in cents
      currency?: string;
      isPublic?: boolean;
      requiresApproval?: boolean;
      allowGuestRSVPs?: boolean;
      tags?: string[];
      customFields?: Record<string, any>;
      notifications?: {
        sendReminders?: boolean;
        reminderTimes?: number[]; // Hours before event
        sendWaitlistNotifications?: boolean;
      };
      ticketTypes?: Array<{
        name: string;
        description?: string;
        price: number;
        quantity: number;
        maxPerPerson?: number;
        saleStartDate?: Date;
        saleEndDate?: Date;
      }>;
    }
  ) {
    try {
      // Validate event dates
      if (data.endDate && isBefore(data.endDate, data.startDate)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date'
        });
      }

      // Create event with ticket types if provided
      const event = await prisma.$transaction(async (tx) => {
        const newEvent = await tx.event.create({
          data: {
            title: data.title,
            description: data.description,
            content: data.content,
            type: data.type,
            category: data.category,
            startDate: data.startDate,
            endDate: data.endDate,
            location: data.location,
            address: data.address,
            maxAttendees: data.maxAttendees,
            price: data.price,
            isPublic: data.isPublic ?? true,
            status: EventStatus.DRAFT,
            metadata: {
              virtualUrl: data.virtualUrl,
              currency: data.currency || 'USD',
              requiresApproval: data.requiresApproval || false,
              allowGuestRSVPs: data.allowGuestRSVPs || true,
              tags: data.tags || [],
              customFields: data.customFields || {},
              notifications: data.notifications || {
                sendReminders: true,
                reminderTimes: [24, 2], // 24 hours and 2 hours before
                sendWaitlistNotifications: true
              }
            },
            tenantId,
            createdBy: userId
          }
        });

        // Create ticket types if provided
        if (data.ticketTypes?.length) {
          await tx.eventTicketType.createMany({
            data: data.ticketTypes.map(ticket => ({
              eventId: newEvent.id,
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              quantity: ticket.quantity,
              maxPerPerson: ticket.maxPerPerson || 1,
              saleStartDate: ticket.saleStartDate,
              saleEndDate: ticket.saleEndDate,
              tenantId
            }))
          });
        }

        return newEvent;
      });

      logger.info('Event created', {
        eventId: event.id,
        tenantId,
        userId,
        title: data.title,
        type: data.type
      });

      return await this.getEventById(event.id, tenantId, userId);
    } catch (error) {
      logger.error('Failed to create event', { error, tenantId, userId });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create event'
      });
    }
  }

  async updateEvent(
    eventId: string,
    tenantId: string,
    userId: string,
    data: Partial<{
      title: string;
      description: string;
      content: any;
      type: EventType;
      category: string;
      startDate: Date;
      endDate: Date;
      location: string;
      address: string;
      maxAttendees: number;
      price: number;
      isPublic: boolean;
      status: EventStatus;
      metadata: any;
    }>
  ) {
    try {
      const existingEvent = await prisma.event.findFirst({
        where: { id: eventId, tenantId },
        include: { rsvps: true }
      });

      if (!existingEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found'
        });
      }

      // Check if user has permission to edit
      if (existingEvent.createdBy !== userId) {
        // Check if user has admin permissions
        const user = await prisma.user.findFirst({
          where: { id: userId, tenantId }
        });

        if (!user || !['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to edit this event'
          });
        }
      }

      // Validate date changes
      if (data.startDate && data.endDate && isBefore(data.endDate, data.startDate)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date'
        });
      }

      // Check if capacity is being reduced below current attendees
      if (data.maxAttendees !== undefined) {
        const confirmedAttendees = existingEvent.rsvps.filter(
          rsvp => rsvp.status === RSVPStatus.CONFIRMED
        ).length;

        if (data.maxAttendees < confirmedAttendees) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot reduce capacity below current confirmed attendees (${confirmedAttendees})`
          });
        }
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data,
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          rsvps: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          },
          payments: true,
          ticketTypes: true,
          _count: {
            select: { rsvps: true }
          }
        }
      });

      // Send notifications for significant changes
      if (data.startDate || data.endDate || data.location) {
        await this.notifyEventUpdate(eventId, tenantId, {
          type: 'event_updated',
          changes: Object.keys(data)
        });
      }

      logger.info('Event updated', {
        eventId,
        tenantId,
        userId,
        changes: Object.keys(data)
      });

      return updatedEvent;
    } catch (error) {
      logger.error('Failed to update event', { error, eventId, tenantId });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update event'
      });
    }
  }

  async getEventById(eventId: string, tenantId: string, userId?: string) {
    try {
      const event = await prisma.event.findFirst({
        where: { id: eventId, tenantId },
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          rsvps: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          payments: {
            where: { status: 'SUCCEEDED' }
          },
          ticketTypes: {
            include: {
              tickets: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          },
          _count: {
            select: { 
              rsvps: { where: { status: RSVPStatus.CONFIRMED } },
              payments: { where: { status: 'SUCCEEDED' } }
            }
          }
        }
      });

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found'
        });
      }

      // Calculate availability
      const confirmedAttendees = event.rsvps.filter(
        rsvp => rsvp.status === RSVPStatus.CONFIRMED
      ).length;

      const availability = event.maxAttendees ? {
        total: event.maxAttendees,
        taken: confirmedAttendees,
        available: event.maxAttendees - confirmedAttendees,
        waitlist: event.rsvps.filter(rsvp => rsvp.status === RSVPStatus.WAITLIST).length
      } : null;

      // Get user's RSVP status if userId provided
      let userRSVP = null;
      if (userId) {
        userRSVP = event.rsvps.find(rsvp => rsvp.userId === userId);
      }

      return {
        ...event,
        availability,
        userRSVP,
        analytics: await this.getEventAnalytics(eventId)
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      logger.error('Failed to get event', { error, eventId, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get event'
      });
    }
  }

  async searchEvents(
    tenantId: string,
    userId?: string,
    query?: string,
    filters: EventFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const where: Prisma.EventWhereInput = {
        tenantId,
        ...query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        ...filters.type && { type: filters.type },
        ...filters.category && { category: filters.category },
        ...filters.status && { status: filters.status },
        ...filters.isPublic !== undefined && { isPublic: filters.isPublic },
        ...filters.location && { 
          OR: [
            { location: { contains: filters.location, mode: 'insensitive' } },
            { address: { contains: filters.location, mode: 'insensitive' } }
          ]
        },
        ...filters.dateFrom && filters.dateTo && {
          startDate: {
            gte: filters.dateFrom,
            lte: filters.dateTo
          }
        },
        ...filters.priceRange && {
          price: {
            ...filters.priceRange.min !== undefined && { gte: filters.priceRange.min },
            ...filters.priceRange.max !== undefined && { lte: filters.priceRange.max }
          }
        }
      };

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            creator: {
              select: { id: true, name: true, avatar: true }
            },
            _count: {
              select: { 
                rsvps: { where: { status: RSVPStatus.CONFIRMED } }
              }
            }
          },
          orderBy: { startDate: 'asc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.event.count({ where })
      ]);

      // Add availability info and user RSVP status
      const eventsWithDetails = await Promise.all(
        events.map(async (event) => {
          const confirmedCount = event._count.rsvps;
          const availability = event.maxAttendees ? {
            total: event.maxAttendees,
            taken: confirmedCount,
            available: event.maxAttendees - confirmedCount
          } : null;

          let userRSVP = null;
          if (userId) {
            userRSVP = await prisma.eventRSVP.findFirst({
              where: { eventId: event.id, userId }
            });
          }

          return {
            ...event,
            availability,
            userRSVP: userRSVP ? { status: userRSVP.status } : null
          };
        })
      );

      return {
        events: eventsWithDetails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to search events', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search events'
      });
    }
  }

  // RSVP Management
  async createRSVP(
    eventId: string,
    tenantId: string,
    userId: string,
    data: {
      response?: string;
      attendees?: number;
      dietaryRestrictions?: string[];
      accessibilityNeeds?: string;
      emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
      };
      customResponses?: Record<string, any>;
    }
  ) {
    try {
      const event = await prisma.event.findFirst({
        where: { id: eventId, tenantId },
        include: {
          rsvps: true,
          ticketTypes: true
        }
      });

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found'
        });
      }

      // Check if event is published
      if (event.status !== EventStatus.PUBLISHED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot RSVP to unpublished event'
        });
      }

      // Check if RSVP period is open
      const now = new Date();
      if (isBefore(event.startDate, now)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot RSVP to past events'
        });
      }

      // Check for existing RSVP
      const existingRSVP = await prisma.eventRSVP.findFirst({
        where: { eventId, userId }
      });

      if (existingRSVP) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already RSVPed to this event'
        });
      }

      // Determine RSVP status based on capacity
      const confirmedCount = event.rsvps.filter(
        rsvp => rsvp.status === RSVPStatus.CONFIRMED
      ).length;

      const attendeeCount = data.attendees || 1;
      let rsvpStatus = RSVPStatus.CONFIRMED;

      if (event.maxAttendees && confirmedCount + attendeeCount > event.maxAttendees) {
        rsvpStatus = RSVPStatus.WAITLIST;
      }

      // Check if event requires approval
      const eventMetadata = event.metadata as any;
      if (eventMetadata?.requiresApproval) {
        rsvpStatus = RSVPStatus.PENDING;
      }

      const rsvp = await prisma.eventRSVP.create({
        data: {
          eventId,
          userId,
          tenantId,
          status: rsvpStatus,
          response: data.response,
          attendees: attendeeCount,
          metadata: {
            dietaryRestrictions: data.dietaryRestrictions || [],
            accessibilityNeeds: data.accessibilityNeeds,
            emergencyContact: data.emergencyContact,
            customResponses: data.customResponses || {}
          }
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          event: {
            select: { id: true, title: true, startDate: true }
          }
        }
      });

      // Send confirmation email
      await this.sendRSVPConfirmation(rsvp);

      // Notify waitlisted users if someone cancelled and space opened up
      if (rsvpStatus === RSVPStatus.CONFIRMED) {
        await this.processWaitlist(eventId, tenantId);
      }

      logger.info('RSVP created', {
        rsvpId: rsvp.id,
        eventId,
        userId,
        status: rsvpStatus,
        attendees: attendeeCount
      });

      return rsvp;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      logger.error('Failed to create RSVP', { error, eventId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create RSVP'
      });
    }
  }

  async updateRSVP(
    rsvpId: string,
    tenantId: string,
    userId: string,
    data: {
      status?: RSVPStatus;
      response?: string;
      attendees?: number;
      metadata?: any;
    }
  ) {
    try {
      const existingRSVP = await prisma.eventRSVP.findFirst({
        where: { id: rsvpId, tenantId },
        include: { event: true }
      });

      if (!existingRSVP) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'RSVP not found'
        });
      }

      // Check permissions
      if (existingRSVP.userId !== userId) {
        const user = await prisma.user.findFirst({
          where: { id: userId, tenantId }
        });

        if (!user || !['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to update this RSVP'
          });
        }
      }

      const updatedRSVP = await prisma.eventRSVP.update({
        where: { id: rsvpId },
        data,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          event: {
            select: { id: true, title: true, startDate: true }
          }
        }
      });

      // Process waitlist if someone cancelled
      if (data.status === RSVPStatus.CANCELLED || data.status === RSVPStatus.DECLINED) {
        await this.processWaitlist(existingRSVP.eventId, tenantId);
      }

      logger.info('RSVP updated', {
        rsvpId,
        userId,
        changes: Object.keys(data)
      });

      return updatedRSVP;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      logger.error('Failed to update RSVP', { error, rsvpId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update RSVP'
      });
    }
  }

  // Analytics and Reporting
  async getEventStats(tenantId: string, dateRange?: { from: Date; to: Date }): Promise<EventStats> {
    try {
      const where: Prisma.EventWhereInput = {
        tenantId,
        ...dateRange && {
          startDate: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        }
      };

      const [
        totalEvents,
        upcomingEvents,
        pastEvents,
        categoryStats,
        attendeeStats
      ] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.count({
          where: { ...where, startDate: { gte: new Date() } }
        }),
        prisma.event.count({
          where: { ...where, startDate: { lt: new Date() } }
        }),
        prisma.event.groupBy({
          by: ['category'],
          where,
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
          take: 10
        }),
        prisma.eventRSVP.aggregate({
          where: {
            event: where,
            status: RSVPStatus.CONFIRMED
          },
          _sum: { attendees: true },
          _count: { id: true }
        })
      ]);

      const totalAttendees = attendeeStats._sum.attendees || 0;
      const averageAttendance = totalEvents > 0 ? totalAttendees / totalEvents : 0;

      return {
        totalEvents,
        upcomingEvents,
        pastEvents,
        totalAttendees,
        averageAttendance,
        popularCategories: categoryStats.map(stat => ({
          category: stat.category || 'Uncategorized',
          count: stat._count.category
        }))
      };
    } catch (error) {
      logger.error('Failed to get event stats', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get event stats'
      });
    }
  }

  async getEventAnalytics(eventId: string): Promise<RSVPAnalytics> {
    try {
      const rsvps = await prisma.eventRSVP.findMany({
        where: { eventId },
        include: { event: true }
      });

      const confirmed = rsvps.filter(r => r.status === RSVPStatus.CONFIRMED).length;
      const pending = rsvps.filter(r => r.status === RSVPStatus.PENDING).length;
      const declined = rsvps.filter(r => r.status === RSVPStatus.DECLINED).length;
      const waitlist = rsvps.filter(r => r.status === RSVPStatus.WAITLIST).length;
      const cancelled = rsvps.filter(r => r.status === RSVPStatus.CANCELLED).length;

      // Calculate last minute cancellations (within 24 hours of event)
      const event = rsvps[0]?.event;
      const cutoffTime = event ? addHours(event.startDate, -24) : new Date();
      const lastMinuteCancellations = rsvps.filter(
        r => r.status === RSVPStatus.CANCELLED && 
        r.updatedAt && isAfter(r.updatedAt, cutoffTime)
      ).length;

      // Show up rate calculation would require attendance tracking
      // For now, we'll use a placeholder
      const showUpRate = 85; // This would be calculated from actual attendance data

      return {
        confirmed,
        pending,
        declined,
        waitlist,
        cancelled,
        showUpRate,
        lastMinuteCancellations
      };
    } catch (error) {
      logger.error('Failed to get event analytics', { error, eventId });
      return {
        confirmed: 0,
        pending: 0,
        declined: 0,
        waitlist: 0,
        cancelled: 0,
        showUpRate: 0,
        lastMinuteCancellations: 0
      };
    }
  }

  // Private helper methods
  private async processWaitlist(eventId: string, tenantId: string) {
    try {
      const event = await prisma.event.findFirst({
        where: { id: eventId, tenantId },
        include: {
          rsvps: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!event || !event.maxAttendees) return;

      const confirmedCount = event.rsvps.filter(
        rsvp => rsvp.status === RSVPStatus.CONFIRMED
      ).length;

      const availableSpots = event.maxAttendees - confirmedCount;

      if (availableSpots > 0) {
        const waitlistRSVPs = event.rsvps
          .filter(rsvp => rsvp.status === RSVPStatus.WAITLIST)
          .slice(0, availableSpots);

        for (const rsvp of waitlistRSVPs) {
          await prisma.eventRSVP.update({
            where: { id: rsvp.id },
            data: { status: RSVPStatus.CONFIRMED }
          });

          // Send notification about promotion from waitlist
          await notificationService.create({
            tenantId,
            recipientId: rsvp.userId,
            type: 'EVENT_RSVP',
            title: 'You\'re off the waitlist!',
            message: `Great news! A spot opened up for "${event.title}" and you're now confirmed to attend.`,
            data: { eventId, rsvpId: rsvp.id }
          });
        }
      }
    } catch (error) {
      logger.error('Failed to process waitlist', { error, eventId });
    }
  }

  private async sendRSVPConfirmation(rsvp: any) {
    try {
      const user = rsvp.user;
      const event = rsvp.event;

      let subject: string;
      let template: string;

      switch (rsvp.status) {
        case RSVPStatus.CONFIRMED:
          subject = `RSVP Confirmed: ${event.title}`;
          template = 'rsvp-confirmed';
          break;
        case RSVPStatus.WAITLIST:
          subject = `Waitlisted: ${event.title}`;
          template = 'rsvp-waitlisted';
          break;
        case RSVPStatus.PENDING:
          subject = `RSVP Pending Approval: ${event.title}`;
          template = 'rsvp-pending';
          break;
        default:
          return;
      }

      await emailService.sendEmail({
        to: user.email,
        subject,
        template,
        data: {
          userName: user.name,
          eventTitle: event.title,
          eventDate: event.startDate,
          rsvpStatus: rsvp.status
        }
      });
    } catch (error) {
      logger.error('Failed to send RSVP confirmation', { error, rsvpId: rsvp.id });
    }
  }

  private async notifyEventUpdate(eventId: string, tenantId: string, update: any) {
    try {
      const rsvps = await prisma.eventRSVP.findMany({
        where: { 
          eventId, 
          status: { in: [RSVPStatus.CONFIRMED, RSVPStatus.PENDING] }
        },
        include: {
          user: true,
          event: true
        }
      });

      for (const rsvp of rsvps) {
        await notificationService.create({
          tenantId,
          recipientId: rsvp.userId,
          type: 'EVENT_UPDATED',
          title: 'Event Updated',
          message: `"${rsvp.event.title}" has been updated. Please check the latest details.`,
          data: { eventId, changes: update.changes }
        });
      }
    } catch (error) {
      logger.error('Failed to notify event update', { error, eventId });
    }
  }
}

export const eventsService = new EventsService();