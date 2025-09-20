import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { withCache, withTagInvalidation, CacheConfigs } from "../middleware/cache";
import { CacheKeys, CacheTags } from "../services/cache";
import { eventsService } from "../services/events";
import { EventType, EventStatus, RSVPStatus, TicketStatus, SessionLevel, AttendeeStatus, SponsorLevel, ReminderType } from "@prisma/client";

// Event schemas
const EventCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.any().optional(), // Rich content JSON
  type: z.enum(["GENERAL", "WORKSHOP", "SOCIAL", "ART_BUILD", "FUNDRAISER", "CULTURAL", "MEETING", "VOLUNTEER", "EDUCATIONAL", "ENTERTAINMENT"]).default("GENERAL"),
  category: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  price: z.number().int().nonnegative().optional(), // in cents
  isPublic: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "POSTPONED", "COMPLETED"]).default("DRAFT"),
  metadata: z.any().optional(),
  settings: z.any().optional(),
});

const EventUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.any().optional(),
  type: z.enum(["GENERAL", "WORKSHOP", "SOCIAL", "ART_BUILD", "FUNDRAISER", "CULTURAL", "MEETING", "VOLUNTEER", "EDUCATIONAL", "ENTERTAINMENT"]).optional(),
  category: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  price: z.number().int().nonnegative().optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "POSTPONED", "COMPLETED"]).optional(),
  metadata: z.any().optional(),
  settings: z.any().optional(),
});

const EventFilterSchema = z.object({
  type: z.enum(["GENERAL", "WORKSHOP", "SOCIAL", "ART_BUILD", "FUNDRAISER", "CULTURAL", "MEETING", "VOLUNTEER", "EDUCATIONAL", "ENTERTAINMENT"]).optional(),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "POSTPONED", "COMPLETED"]).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  search: z.string().optional(),
  upcoming: z.boolean().optional(),
  past: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const RSVPSchema = z.object({
  eventId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED", "WAITLIST"]).default("CONFIRMED"),
  response: z.string().optional(),
  attendees: z.number().int().positive().default(1),
});

const RSVPUpdateSchema = z.object({
  eventId: z.string(),
  userId: z.string().optional(), // Admin can update other users' RSVPs
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED", "WAITLIST", "CANCELLED"]),
  response: z.string().optional(),
  attendees: z.number().int().positive().optional(),
});

export const eventsRouter = router({
  // Create new event (admin/moderator only)
  create: protectedProcedure
    .input(EventCreateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator", "lead"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to create events",
        });
      }

      try {
        const event = await ctx.prisma.event.create({
          data: {
            ...input,
            tenantId: ctx.tenant.id,
            createdBy: ctx.user.id,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                rsvps: true,
              },
            },
          },
        });

        return event;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create event",
        });
      }
    }),

  // Update event (admin/moderator/creator only)
  update: protectedProcedure
    .input(EventUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const event = await ctx.prisma.event.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check permissions
      const canEdit = ["admin", "moderator", "lead"].includes(ctx.user.role) || 
                     event.createdBy === ctx.user.id;

      if (!canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to edit this event",
        });
      }

      const { id, ...updateData } = input;

      const updatedEvent = await ctx.prisma.event.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              rsvps: true,
            },
          },
        },
      });

      return updatedEvent;
    }),

  // Delete event (admin/creator only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const event = await ctx.prisma.event.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check permissions
      const canDelete = ["admin"].includes(ctx.user.role) || 
                       event.createdBy === ctx.user.id;

      if (!canDelete) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to delete this event",
        });
      }

      await ctx.prisma.event.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // List events with filtering
  list: publicProcedure
    .input(EventFilterSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const where: any = {
        tenantId: ctx.tenant.id,
      };

      // Only show published events to non-authenticated users
      if (!ctx.user || !["admin", "moderator", "lead"].includes(ctx.user.role)) {
        where.status = "PUBLISHED";
        where.isPublic = true;
      }

      // Apply filters
      if (input.type) {
        where.type = input.type;
      }
      if (input.category) {
        where.category = input.category;
      }
      if (input.status) {
        where.status = input.status;
      }
      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { location: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      // Date filters
      const now = new Date();
      if (input.upcoming) {
        where.startDate = { gte: now };
      }
      if (input.past) {
        where.startDate = { lt: now };
      }
      if (input.startDate) {
        where.startDate = { gte: input.startDate };
      }
      if (input.endDate) {
        where.startDate = { lte: input.endDate };
      }

      const [events, total] = await Promise.all([
        ctx.prisma.event.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { startDate: 'asc' },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                rsvps: {
                  where: {
                    status: { in: ["CONFIRMED", "PENDING"] },
                  },
                },
              },
            },
          },
        }),
        ctx.prisma.event.count({ where }),
      ]);

      return {
        events,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  // Get event by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const where: any = {
        id: input.id,
        tenantId: ctx.tenant.id,
      };

      // Only show published events to non-authenticated users
      if (!ctx.user || !["admin", "moderator", "lead"].includes(ctx.user.role)) {
        where.status = "PUBLISHED";
        where.isPublic = true;
      }

      const event = await ctx.prisma.event.findFirst({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          rsvps: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      return event;
    }),

  // RSVP to event
  rsvp: protectedProcedure
    .input(RSVPSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const event = await ctx.prisma.event.findFirst({
        where: {
          id: input.eventId,
          tenantId: ctx.tenant.id,
          status: "PUBLISHED",
        },
        include: {
          _count: {
            select: {
              rsvps: {
                where: {
                  status: { in: ["CONFIRMED", "PENDING"] },
                },
              },
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found or not available for RSVP",
        });
      }

      // Check if event is full
      if (event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
        // Auto-waitlist if full
        input.status = "WAITLIST";
      }

      // Check for existing RSVP
      const existingRSVP = await ctx.prisma.eventRSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.user.id,
          },
        },
      });

      if (existingRSVP) {
        // Update existing RSVP
        const updatedRSVP = await ctx.prisma.eventRSVP.update({
          where: {
            eventId_userId: {
              eventId: input.eventId,
              userId: ctx.user.id,
            },
          },
          data: {
            status: input.status,
            response: input.response,
            attendees: input.attendees,
          },
          include: {
            event: {
              select: {
                title: true,
              },
            },
          },
        });

        return updatedRSVP;
      } else {
        // Create new RSVP
        const rsvp = await ctx.prisma.eventRSVP.create({
          data: {
            eventId: input.eventId,
            userId: ctx.user.id,
            tenantId: ctx.tenant.id,
            status: input.status,
            response: input.response,
            attendees: input.attendees,
          },
          include: {
            event: {
              select: {
                title: true,
              },
            },
          },
        });

        return rsvp;
      }
    }),

  // Update RSVP (user can update own, admin can update any)
  updateRSVP: protectedProcedure
    .input(RSVPUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const targetUserId = input.userId || ctx.user.id;

      // Check permissions
      const canUpdate = ["admin", "moderator", "lead"].includes(ctx.user.role) || 
                       targetUserId === ctx.user.id;

      if (!canUpdate) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to update this RSVP",
        });
      }

      const rsvp = await ctx.prisma.eventRSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: targetUserId,
          },
        },
      });

      if (!rsvp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "RSVP not found",
        });
      }

      const updatedRSVP = await ctx.prisma.eventRSVP.update({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: targetUserId,
          },
        },
        data: {
          status: input.status,
          response: input.response,
          attendees: input.attendees,
        },
      });

      return updatedRSVP;
    }),

  // Get event statistics
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const now = new Date();

      const [
        totalEvents,
        publishedEvents,
        upcomingEvents,
        totalRSVPs,
        eventsByType,
        recentEvents,
      ] = await Promise.all([
        ctx.prisma.event.count({
          where: { tenantId: ctx.tenant.id },
        }),
        ctx.prisma.event.count({
          where: { 
            tenantId: ctx.tenant.id,
            status: "PUBLISHED",
          },
        }),
        ctx.prisma.event.count({
          where: { 
            tenantId: ctx.tenant.id,
            status: "PUBLISHED",
            startDate: { gte: now },
          },
        }),
        ctx.prisma.eventRSVP.count({
          where: { 
            tenantId: ctx.tenant.id,
            status: { in: ["CONFIRMED", "PENDING"] },
          },
        }),
        ctx.prisma.event.groupBy({
          by: ['type'],
          where: { tenantId: ctx.tenant.id },
          _count: { type: true },
        }),
        ctx.prisma.event.findMany({
          where: { 
            tenantId: ctx.tenant.id,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            startDate: true,
            status: true,
            _count: {
              select: {
                rsvps: true,
              },
            },
          },
        }),
      ]);

      return {
        totalEvents,
        publishedEvents,
        upcomingEvents,
        totalRSVPs,
        eventsByType: eventsByType.map(item => ({
          type: item.type,
          count: item._count.type,
        })),
        recentEvents,
      };
    }),

  // Get user's RSVPs
  myRSVPs: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const rsvps = await ctx.prisma.eventRSVP.findMany({
        where: {
          tenantId: ctx.tenant.id,
          userId: ctx.user.id,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              location: true,
              type: true,
              status: true,
            },
          },
        },
        orderBy: { event: { startDate: 'asc' } },
      });

      return rsvps;
    }),

  // Advanced Event Management Features

  // Create event with advanced features
  createAdvanced: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      content: z.any().optional(),
      type: z.nativeEnum(EventType).default(EventType.GENERAL),
      category: z.string().optional(),
      startDate: z.date(),
      endDate: z.date().optional(),
      location: z.string().optional(),
      address: z.string().optional(),
      virtualUrl: z.string().optional(),
      maxAttendees: z.number().int().positive().optional(),
      price: z.number().int().nonnegative().optional(),
      currency: z.string().default('USD'),
      isPublic: z.boolean().default(true),
      requiresApproval: z.boolean().default(false),
      allowGuestRSVPs: z.boolean().default(true),
      tags: z.array(z.string()).optional(),
      customFields: z.record(z.any()).optional(),
      notifications: z.object({
        sendReminders: z.boolean().default(true),
        reminderTimes: z.array(z.number()).default([24, 2]),
        sendWaitlistNotifications: z.boolean().default(true)
      }).optional(),
      ticketTypes: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
        maxPerPerson: z.number().int().positive().default(1),
        saleStartDate: z.date().optional(),
        saleEndDate: z.date().optional()
      })).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await eventsService.createEvent(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  // Search events with advanced filtering
  search: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      type: z.nativeEnum(EventType).optional(),
      category: z.string().optional(),
      status: z.nativeEnum(EventStatus).optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      location: z.string().optional(),
      isPublic: z.boolean().optional(),
      hasSpace: z.boolean().optional(),
      priceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input, ctx }) => {
      const { query, page, limit, ...filters } = input;
      return await eventsService.searchEvents(
        ctx.tenant?.id || '',
        ctx.user?.id,
        query,
        filters,
        page,
        limit
      );
    }),

  // Get detailed event with analytics
  getDetailed: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await eventsService.getEventById(
        input.id,
        ctx.tenant?.id || '',
        ctx.user?.id
      );
    }),

  // RSVP with advanced options
  rsvpAdvanced: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      response: z.string().optional(),
      attendees: z.number().int().positive().default(1),
      dietaryRestrictions: z.array(z.string()).optional(),
      accessibilityNeeds: z.string().optional(),
      emergencyContact: z.object({
        name: z.string(),
        phone: z.string(),
        relationship: z.string()
      }).optional(),
      customResponses: z.record(z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await eventsService.createRSVP(
        input.eventId,
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  // Update RSVP
  updateRSVPAdvanced: protectedProcedure
    .input(z.object({
      rsvpId: z.string(),
      status: z.nativeEnum(RSVPStatus).optional(),
      response: z.string().optional(),
      attendees: z.number().int().positive().optional(),
      metadata: z.any().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { rsvpId, ...data } = input;
      return await eventsService.updateRSVP(
        rsvpId,
        ctx.user.tenantId,
        ctx.user.id,
        data
      );
    }),

  // Get event statistics
  getStats: protectedProcedure
    .input(z.object({
      dateRange: z.object({
        from: z.date(),
        to: z.date()
      }).optional()
    }))
    .query(async ({ input, ctx }) => {
      return await eventsService.getEventStats(
        ctx.user.tenantId,
        input.dateRange
      );
    }),

  // Get event analytics
  getAnalytics: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await eventsService.getEventAnalytics(input.eventId);
    }),

  // Ticket Management
  tickets: router({
    // Create ticket type
    createType: protectedProcedure
      .input(z.object({
        eventId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
        maxPerPerson: z.number().int().positive().default(1),
        saleStartDate: z.date().optional(),
        saleEndDate: z.date().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.eventTicketType.create({
          data: {
            ...input,
            tenantId: ctx.user.tenantId
          }
        });
      }),

    // Purchase tickets
    purchase: protectedProcedure
      .input(z.object({
        ticketTypeId: z.string(),
        quantity: z.number().int().positive().max(10)
      }))
      .mutation(async ({ input, ctx }) => {
        const ticketType = await ctx.prisma.eventTicketType.findFirst({
          where: { 
            id: input.ticketTypeId,
            tenantId: ctx.user.tenantId,
            isActive: true
          },
          include: { event: true }
        });

        if (!ticketType) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket type not found'
          });
        }

        // Check availability
        if (ticketType.sold + input.quantity > ticketType.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough tickets available'
          });
        }

        // Generate tickets
        const tickets = [];
        for (let i = 0; i < input.quantity; i++) {
          const ticketNumber = `${ticketType.event.id.slice(-6)}-${Date.now()}-${i + 1}`;
          tickets.push({
            ticketTypeId: input.ticketTypeId,
            userId: ctx.user.id,
            tenantId: ctx.user.tenantId,
            ticketNumber,
            purchasePrice: ticketType.price,
            qrCode: `https://api.campalborz.org/tickets/${ticketNumber}/qr`
          });
        }

        await ctx.prisma.$transaction([
          ctx.prisma.eventTicket.createMany({ data: tickets }),
          ctx.prisma.eventTicketType.update({
            where: { id: input.ticketTypeId },
            data: { sold: { increment: input.quantity } }
          })
        ]);

        return { success: true, ticketCount: input.quantity };
      }),

    // Check in ticket
    checkIn: protectedProcedure
      .input(z.object({
        ticketNumber: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await ctx.prisma.eventTicket.findFirst({
          where: { 
            ticketNumber: input.ticketNumber,
            tenantId: ctx.user.tenantId
          },
          include: {
            ticketType: {
              include: { event: true }
            },
            user: true
          }
        });

        if (!ticket) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ticket not found'
          });
        }

        if (ticket.status !== TicketStatus.VALID) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Ticket is ${ticket.status.toLowerCase()}`
          });
        }

        if (ticket.checkedInAt) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ticket already checked in'
          });
        }

        return await ctx.prisma.eventTicket.update({
          where: { id: ticket.id },
          data: {
            status: TicketStatus.USED,
            checkedInAt: new Date(),
            checkedInBy: ctx.user.id
          },
          include: {
            user: true,
            ticketType: {
              include: { event: true }
            }
          }
        });
      })
  }),

  // Session Management for multi-session events
  sessions: router({
    // Create session
    create: protectedProcedure
      .input(z.object({
        eventId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
        location: z.string().optional(),
        maxAttendees: z.number().int().positive().optional(),
        speakers: z.array(z.any()).optional(),
        materials: z.array(z.string()).optional(),
        level: z.nativeEnum(SessionLevel).default(SessionLevel.BEGINNER),
        tags: z.array(z.string()).default([]),
        isRequired: z.boolean().default(false)
      }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.eventSession.create({
          data: {
            ...input,
            tenantId: ctx.user.tenantId
          }
        });
      }),

    // Register for session
    register: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        notes: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.sessionAttendee.create({
          data: {
            sessionId: input.sessionId,
            userId: ctx.user.id,
            notes: input.notes
          }
        });
      }),

    // Submit session feedback
    feedback: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        rating: z.number().int().min(1).max(5),
        feedback: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.sessionAttendee.update({
          where: {
            sessionId_userId: {
              sessionId: input.sessionId,
              userId: ctx.user.id
            }
          },
          data: {
            rating: input.rating,
            feedback: input.feedback,
            status: AttendeeStatus.ATTENDED
          }
        });
      })
  }),

  // Sponsor Management
  sponsors: router({
    // Add sponsor
    add: protectedProcedure
      .input(z.object({
        eventId: z.string(),
        name: z.string(),
        logo: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
        level: z.nativeEnum(SponsorLevel).default(SponsorLevel.BRONZE),
        amount: z.number().int().nonnegative().optional(),
        benefits: z.array(z.string()).optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.eventSponsor.create({
          data: {
            ...input,
            tenantId: ctx.user.tenantId,
            benefits: input.benefits || []
          }
        });
      }),

    // List sponsors for event
    list: publicProcedure
      .input(z.object({ eventId: z.string() }))
      .query(async ({ input, ctx }) => {
        return await ctx.prisma.eventSponsor.findMany({
          where: {
            eventId: input.eventId,
            isActive: true
          },
          orderBy: [
            { level: 'asc' },
            { createdAt: 'asc' }
          ]
        });
      })
  }),

  // Event Feedback
  feedback: router({
    // Submit feedback
    submit: protectedProcedure
      .input(z.object({
        eventId: z.string(),
        rating: z.number().int().min(1).max(5),
        feedback: z.string().optional(),
        categories: z.record(z.number().int().min(1).max(5)).optional(),
        wouldRecommend: z.boolean().optional(),
        suggestions: z.string().optional(),
        isAnonymous: z.boolean().default(false)
      }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.eventFeedback.create({
          data: {
            ...input,
            tenantId: ctx.user.tenantId,
            userId: ctx.user.id
          }
        });
      }),

    // Get feedback for event (admin only)
    getForEvent: protectedProcedure
      .input(z.object({ 
        eventId: z.string(),
        includeAnonymous: z.boolean().default(true)
      }))
      .query(async ({ input, ctx }) => {
        // Check admin permissions
        if (!['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Admin access required'
          });
        }

        return await ctx.prisma.eventFeedback.findMany({
          where: {
            eventId: input.eventId,
            tenantId: ctx.user.tenantId
          },
          include: {
            user: {
              select: input.includeAnonymous ? 
                { id: true, name: true } : 
                { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      })
  })
});