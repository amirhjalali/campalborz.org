import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, memberProcedure, adminProcedure } from '../trpc';

export const announcementsRouter = router({
  list: memberProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.announcement.findMany({
        where: {
          isPublished: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          author: { select: { id: true, name: true, playaName: true } },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
      expiresAt: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.announcement.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: ctx.user.id,
          priority: input.priority,
          isPublished: true,
          publishedAt: new Date(),
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        },
      });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
      isPublished: z.boolean().optional(),
      expiresAt: z.string().datetime().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, expiresAt, ...rest } = input;

      const existing = await ctx.prisma.announcement.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Announcement not found' });
      }

      const data: any = { ...rest };
      if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

      return ctx.prisma.announcement.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.announcement.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Announcement not found' });
      }

      await ctx.prisma.announcement.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
