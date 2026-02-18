import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, memberProcedure, managerProcedure, adminProcedure } from '../trpc';

export const seasonsRouter = router({
  list: memberProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.season.findMany({
        orderBy: { year: 'desc' },
      });
    }),

  getCurrent: memberProcedure
    .query(async ({ ctx }) => {
      const season = await ctx.prisma.season.findFirst({
        where: { isActive: true },
      });

      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No active season found' });
      }

      return season;
    }),

  create: adminProcedure
    .input(z.object({
      year: z.number().int().min(2020).max(2100),
      name: z.string().min(1),
      duesAmount: z.number().int().min(0),
      gridFee30amp: z.number().int().min(0),
      gridFee50amp: z.number().int().min(0),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      buildStartDate: z.string().datetime().optional(),
      strikeEndDate: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.season.create({
        data: {
          year: input.year,
          name: input.name,
          duesAmount: input.duesAmount,
          gridFee30amp: input.gridFee30amp,
          gridFee50amp: input.gridFee50amp,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          buildStartDate: input.buildStartDate ? new Date(input.buildStartDate) : null,
          strikeEndDate: input.strikeEndDate ? new Date(input.strikeEndDate) : null,
        },
      });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      duesAmount: z.number().int().min(0).optional(),
      gridFee30amp: z.number().int().min(0).optional(),
      gridFee50amp: z.number().int().min(0).optional(),
      startDate: z.string().datetime().nullable().optional(),
      endDate: z.string().datetime().nullable().optional(),
      buildStartDate: z.string().datetime().nullable().optional(),
      strikeEndDate: z.string().datetime().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, startDate, endDate, buildStartDate, strikeEndDate, ...rest } = input;

      const data: any = { ...rest };
      if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
      if (buildStartDate !== undefined) data.buildStartDate = buildStartDate ? new Date(buildStartDate) : null;
      if (strikeEndDate !== undefined) data.strikeEndDate = strikeEndDate ? new Date(strikeEndDate) : null;

      return ctx.prisma.season.update({
        where: { id },
        data,
      });
    }),

  activate: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Deactivate all seasons, then activate the target
      await ctx.prisma.season.updateMany({
        data: { isActive: false },
      });

      return ctx.prisma.season.update({
        where: { id: input.id },
        data: { isActive: true },
      });
    }),

  getStats: managerProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [statusCounts, housingCounts, payments] = await Promise.all([
        ctx.prisma.seasonMember.groupBy({
          by: ['status'],
          where: { seasonId: input.seasonId },
          _count: true,
        }),
        ctx.prisma.seasonMember.groupBy({
          by: ['housingType'],
          where: { seasonId: input.seasonId, housingType: { not: null } },
          _count: true,
        }),
        ctx.prisma.payment.aggregate({
          where: { seasonMember: { seasonId: input.seasonId } },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      const membersByStatus: Record<string, number> = {};
      for (const s of statusCounts) {
        membersByStatus[s.status] = s._count;
      }

      const housingBreakdown: Record<string, number> = {};
      for (const h of housingCounts) {
        if (h.housingType) housingBreakdown[h.housingType] = h._count;
      }

      return {
        membersByStatus,
        housingBreakdown,
        totalMembers: Object.values(membersByStatus).reduce((a, b) => a + b, 0),
        totalCollected: payments._sum.amount || 0,
        totalPayments: payments._count,
      };
    }),
});
