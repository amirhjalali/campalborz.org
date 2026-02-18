import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, memberProcedure, managerProcedure, adminProcedure } from '../trpc';

export const seasonMembersRouter = router({
  list: managerProcedure
    .input(z.object({
      seasonId: z.string().uuid().optional(),
      status: z.enum(['INTERESTED', 'MAYBE', 'CONFIRMED', 'WAITLISTED', 'CANCELLED']).optional(),
      housingType: z.enum(['TENT', 'SHIFTPOD', 'RV', 'TRAILER', 'DORM', 'SHARED', 'HEXAYURT', 'OTHER']).optional(),
      buildCrew: z.boolean().optional(),
      strikeCrew: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(200).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }).optional().default({}))
    .query(async ({ ctx, input }) => {
      // Default to active season if no seasonId provided
      let seasonId = input.seasonId;
      if (!seasonId) {
        const activeSeason = await ctx.prisma.season.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        if (!activeSeason) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No active season found' });
        }
        seasonId = activeSeason.id;
      }

      const where: any = { seasonId };

      if (input.status) where.status = input.status;
      if (input.housingType) where.housingType = input.housingType;
      if (input.buildCrew !== undefined) where.buildCrew = input.buildCrew;
      if (input.strikeCrew !== undefined) where.strikeCrew = input.strikeCrew;

      if (input.search) {
        where.member = {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' } },
            { email: { contains: input.search, mode: 'insensitive' } },
            { playaName: { contains: input.search, mode: 'insensitive' } },
          ],
        };
      }

      const [seasonMembers, total] = await Promise.all([
        ctx.prisma.seasonMember.findMany({
          where,
          include: {
            member: {
              select: { id: true, email: true, name: true, playaName: true, phone: true, role: true },
            },
          },
          orderBy: { member: { name: 'asc' } },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.seasonMember.count({ where }),
      ]);

      return { seasonMembers, total };
    }),

  getById: managerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const sm = await ctx.prisma.seasonMember.findUnique({
        where: { id: input.id },
        include: {
          member: {
            select: {
              id: true, email: true, name: true, playaName: true, phone: true,
              gender: true, role: true, emergencyContactName: true,
              emergencyContactPhone: true, dietaryRestrictions: true,
            },
          },
          payments: { orderBy: { paidAt: 'desc' } },
          season: { select: { id: true, year: true, name: true } },
        },
      });

      if (!sm) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season member not found' });
      }

      return sm;
    }),

  enroll: adminProcedure
    .input(z.object({
      seasonId: z.string().uuid(),
      memberId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check for existing enrollment
      const existing = await ctx.prisma.seasonMember.findUnique({
        where: { seasonId_memberId: { seasonId: input.seasonId, memberId: input.memberId } },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Member already enrolled in this season' });
      }

      return ctx.prisma.seasonMember.create({
        data: {
          seasonId: input.seasonId,
          memberId: input.memberId,
          status: 'INTERESTED',
        },
        include: {
          member: { select: { id: true, name: true, email: true } },
        },
      });
    }),

  bulkEnroll: adminProcedure
    .input(z.object({
      seasonId: z.string().uuid(),
      memberIds: z.array(z.string().uuid()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find existing enrollments to skip
      const existing = await ctx.prisma.seasonMember.findMany({
        where: {
          seasonId: input.seasonId,
          memberId: { in: input.memberIds },
        },
        select: { memberId: true },
      });

      const existingIds = new Set(existing.map((e) => e.memberId));
      const newIds = input.memberIds.filter((id) => !existingIds.has(id));

      if (newIds.length === 0) {
        return { created: 0, skipped: input.memberIds.length };
      }

      await ctx.prisma.seasonMember.createMany({
        data: newIds.map((memberId) => ({
          seasonId: input.seasonId,
          memberId,
          status: 'INTERESTED' as const,
        })),
      });

      return { created: newIds.length, skipped: existingIds.size };
    }),

  updateStatus: managerProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['INTERESTED', 'MAYBE', 'CONFIRMED', 'WAITLISTED', 'CANCELLED']),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.seasonMember.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  updateHousing: managerProcedure
    .input(z.object({
      id: z.string().uuid(),
      housingType: z.enum(['TENT', 'SHIFTPOD', 'RV', 'TRAILER', 'DORM', 'SHARED', 'HEXAYURT', 'OTHER']).nullable().optional(),
      housingSize: z.string().nullable().optional(),
      gridPower: z.enum(['NONE', 'AMP_30', 'AMP_50']).optional(),
      sharedWithId: z.string().uuid().nullable().optional(),
      mapObject: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.seasonMember.update({
        where: { id },
        data,
      });
    }),

  getMySeasonStatus: memberProcedure
    .query(async ({ ctx }) => {
      const activeSeason = await ctx.prisma.season.findFirst({
        where: { isActive: true },
        select: { id: true, year: true, name: true, duesAmount: true, startDate: true, endDate: true },
      });

      if (!activeSeason) {
        return null;
      }

      const sm = await ctx.prisma.seasonMember.findUnique({
        where: {
          seasonId_memberId: {
            seasonId: activeSeason.id,
            memberId: ctx.user.id,
          },
        },
        include: {
          payments: { orderBy: { paidAt: 'desc' } },
        },
      });

      return sm ? { ...sm, season: activeSeason } : null;
    }),

  updateMyArrival: memberProcedure
    .input(z.object({
      arrivalDate: z.string().datetime().nullable().optional(),
      departureDate: z.string().datetime().nullable().optional(),
      rideDetails: z.string().nullable().optional(),
      specialRequests: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const activeSeason = await ctx.prisma.season.findFirst({
        where: { isActive: true },
        select: { id: true },
      });

      if (!activeSeason) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No active season found' });
      }

      const sm = await ctx.prisma.seasonMember.findUnique({
        where: {
          seasonId_memberId: {
            seasonId: activeSeason.id,
            memberId: ctx.user.id,
          },
        },
      });

      if (!sm) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'You are not enrolled in the current season' });
      }

      const data: any = {};
      if (input.arrivalDate !== undefined) data.arrivalDate = input.arrivalDate ? new Date(input.arrivalDate) : null;
      if (input.departureDate !== undefined) data.departureDate = input.departureDate ? new Date(input.departureDate) : null;
      if (input.rideDetails !== undefined) data.rideDetails = input.rideDetails;
      if (input.specialRequests !== undefined) data.specialRequests = input.specialRequests;

      return ctx.prisma.seasonMember.update({
        where: { id: sm.id },
        data,
      });
    }),
});
