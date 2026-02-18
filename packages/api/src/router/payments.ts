import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, memberProcedure, managerProcedure } from '../trpc';

const paymentTypeEnum = z.enum([
  'DUES', 'GRID', 'FOOD', 'DONATION', 'RV_VOUCHER',
  'BEER_FUND', 'TENT', 'TICKET', 'STRIKE_DONATION', 'FUNDRAISING', 'OTHER',
]);

const paymentMethodEnum = z.enum([
  'VENMO', 'ZELLE', 'CASH', 'CARD', 'PAYPAL', 'GIVEBUTTER', 'OTHER',
]);

export const paymentsRouter = router({
  list: managerProcedure
    .input(z.object({
      seasonId: z.string().uuid().optional(),
      type: paymentTypeEnum.optional(),
      method: paymentMethodEnum.optional(),
      memberId: z.string().uuid().optional(),
      limit: z.number().min(1).max(200).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }).optional().default({}))
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.seasonId) {
        where.seasonMember = { seasonId: input.seasonId };
      }
      if (input.type) where.type = input.type;
      if (input.method) where.method = input.method;
      if (input.memberId) {
        where.seasonMember = { ...where.seasonMember, memberId: input.memberId };
      }

      const [payments, total] = await Promise.all([
        ctx.prisma.payment.findMany({
          where,
          include: {
            seasonMember: {
              include: {
                member: { select: { id: true, name: true, email: true, playaName: true } },
                season: { select: { id: true, year: true, name: true } },
              },
            },
          },
          orderBy: { paidAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.payment.count({ where }),
      ]);

      return { payments, total };
    }),

  create: managerProcedure
    .input(z.object({
      seasonMemberId: z.string().uuid(),
      type: paymentTypeEnum,
      amount: z.number().int().min(1),
      method: paymentMethodEnum,
      paidTo: z.string().optional(),
      paidAt: z.string().datetime(),
      notes: z.string().optional(),
      recordedBy: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the season member exists
      const sm = await ctx.prisma.seasonMember.findUnique({
        where: { id: input.seasonMemberId },
      });

      if (!sm) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season member not found' });
      }

      return ctx.prisma.payment.create({
        data: {
          seasonMemberId: input.seasonMemberId,
          type: input.type,
          amount: input.amount,
          method: input.method,
          paidTo: input.paidTo,
          paidAt: new Date(input.paidAt),
          notes: input.notes,
          recordedBy: input.recordedBy || ctx.user.name,
        },
        include: {
          seasonMember: {
            include: {
              member: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    }),

  getMyPayments: memberProcedure
    .query(async ({ ctx }) => {
      const activeSeason = await ctx.prisma.season.findFirst({
        where: { isActive: true },
        select: { id: true },
      });

      if (!activeSeason) return [];

      const sm = await ctx.prisma.seasonMember.findUnique({
        where: {
          seasonId_memberId: {
            seasonId: activeSeason.id,
            memberId: ctx.user.id,
          },
        },
        select: { id: true },
      });

      if (!sm) return [];

      return ctx.prisma.payment.findMany({
        where: { seasonMemberId: sm.id },
        orderBy: { paidAt: 'desc' },
      });
    }),

  getSummary: managerProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [byType, byMethod, total] = await Promise.all([
        ctx.prisma.payment.groupBy({
          by: ['type'],
          where: { seasonMember: { seasonId: input.seasonId } },
          _sum: { amount: true },
          _count: true,
        }),
        ctx.prisma.payment.groupBy({
          by: ['method'],
          where: { seasonMember: { seasonId: input.seasonId } },
          _sum: { amount: true },
          _count: true,
        }),
        ctx.prisma.payment.aggregate({
          where: { seasonMember: { seasonId: input.seasonId } },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Dues progress: how many members have paid dues and how much
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
        select: { duesAmount: true },
      });

      const confirmedCount = await ctx.prisma.seasonMember.count({
        where: { seasonId: input.seasonId, status: 'CONFIRMED' },
      });

      const duesCollected = byType.find((t) => t.type === 'DUES')?._sum.amount || 0;
      const expectedDues = confirmedCount * (season?.duesAmount || 0);

      return {
        totalCollected: total._sum.amount || 0,
        totalPayments: total._count,
        byType: byType.map((t) => ({
          type: t.type,
          total: t._sum.amount || 0,
          count: t._count,
        })),
        byMethod: byMethod.map((m) => ({
          method: m.method,
          total: m._sum.amount || 0,
          count: m._count,
        })),
        duesProgress: {
          collected: duesCollected,
          expected: expectedDues,
          confirmedMembers: confirmedCount,
        },
      };
    }),
});
