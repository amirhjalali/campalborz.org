import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, managerProcedure, adminProcedure } from '../trpc';

export const applicationsRouter = router({
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      playaName: z.string().optional(),
      referredBy: z.string().optional(),
      experience: z.enum(['FIRST_TIMER', 'BEEN_BEFORE', 'VETERAN']),
      interests: z.string().optional(),
      contribution: z.string().optional(),
      dietaryRestrictions: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      housingPreference: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.application.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          phone: input.phone,
          playaName: input.playaName,
          referredBy: input.referredBy,
          experience: input.experience,
          interests: input.interests,
          contribution: input.contribution,
          dietaryRestrictions: input.dietaryRestrictions,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
          housingPreference: input.housingPreference,
          message: input.message,
          status: 'PENDING',
        },
      });
    }),

  list: managerProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'WAITLISTED']).optional(),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }).optional().default({}))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.status) where.status = input.status;

      const [applications, total] = await Promise.all([
        ctx.prisma.application.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.application.count({ where }),
      ]);

      return { applications, total };
    }),

  review: adminProcedure
    .input(z.object({
      applicationId: z.string().uuid(),
      status: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      return ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: {
          status: input.status,
          reviewedBy: ctx.user.id,
          reviewNotes: input.reviewNotes,
        },
      });
    }),
});
