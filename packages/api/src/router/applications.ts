import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, managerProcedure, adminProcedure } from '../trpc';
import logger from '../lib/logger';
import { emitAdminUpdate } from '../lib/socket';

// --- Validation schemas ---

const applicationStatusEnum = z.enum(['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'WAITLISTED']);
const experienceEnum = z.enum(['FIRST_TIMER', 'BEEN_BEFORE', 'VETERAN']);

const submitApplicationInput = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(1, 'Phone number is required').max(20),
  playaName: z.string().max(100).optional(),
  referredBy: z.string().max(200).optional(),
  experience: experienceEnum,
  interests: z.string().max(2000).optional(),
  contribution: z.string().max(2000).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  housingPreference: z.string().max(500).optional(),
  message: z.string().max(5000).optional(),
});

const listApplicationsInput = z.object({
  status: applicationStatusEnum.optional(),
  search: z.string().max(200).optional(),
  experience: experienceEnum.optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
}).optional().default({});

// --- Router ---

export const applicationsRouter = router({
  /** Submit a new membership application (public) */
  submit: publicProcedure
    .input(submitApplicationInput)
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      // Check for duplicate pending/reviewed applications
      const existing = await ctx.prisma.application.findFirst({
        where: {
          email: normalizedEmail,
          status: { in: ['PENDING', 'REVIEWED'] },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An application with this email is already under review',
        });
      }

      const application = await ctx.prisma.application.create({
        data: {
          name: input.name,
          email: normalizedEmail,
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

      logger.info(`New application submitted: ${normalizedEmail}`);

      // Notify admin dashboards in real-time
      emitAdminUpdate('new_application', {
        id: application.id,
        name: application.name,
        email: normalizedEmail,
        status: application.status,
        createdAt: application.createdAt,
      });

      return {
        id: application.id,
        status: application.status,
        message: 'Application submitted successfully. We will review it and get back to you.',
      };
    }),

  /** List applications with filters, search, and pagination (manager+) */
  list: managerProcedure
    .input(listApplicationsInput)
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.status) where.status = input.status;
      if (input.experience) where.experience = input.experience;

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
          { playaName: { contains: input.search, mode: 'insensitive' } },
          { referredBy: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [applications, total] = await Promise.all([
        ctx.prisma.application.findMany({
          where,
          orderBy: { [input.sortBy]: input.sortOrder },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.application.count({ where }),
      ]);

      return { applications, total, limit: input.limit, offset: input.offset };
    }),

  /** Get a single application by ID (manager+) */
  getById: managerProcedure
    .input(z.object({ id: z.string().uuid('Invalid application ID') }))
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      return application;
    }),

  /** Review an application: approve, reject, or waitlist (admin only) */
  review: adminProcedure
    .input(z.object({
      applicationId: z.string().uuid('Invalid application ID'),
      status: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
      reviewNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      if (application.status === 'ACCEPTED' || application.status === 'REJECTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Application has already been ${application.status.toLowerCase()}. Use updateStatus to change it.`,
        });
      }

      const updated = await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: {
          status: input.status,
          reviewedBy: ctx.user.id,
          reviewNotes: input.reviewNotes,
        },
      });

      logger.info(`Application ${input.applicationId} ${input.status} by ${ctx.user.email}`);

      // Notify admin dashboards of the status change
      emitAdminUpdate('application_reviewed', {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        reviewedBy: ctx.user.name,
      });

      return updated;
    }),

  /** Update status of an already-reviewed application (admin only) */
  updateStatus: adminProcedure
    .input(z.object({
      applicationId: z.string().uuid('Invalid application ID'),
      status: applicationStatusEnum,
      reviewNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      const data: any = {
        status: input.status,
        reviewedBy: ctx.user.id,
      };

      if (input.reviewNotes !== undefined) {
        data.reviewNotes = input.reviewNotes;
      }

      const updated = await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data,
      });

      logger.info(`Application ${input.applicationId} status changed to ${input.status} by ${ctx.user.email}`);

      return updated;
    }),

  /** Delete an application (admin only) */
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid('Invalid application ID') }))
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      await ctx.prisma.application.delete({ where: { id: input.id } });

      logger.info(`Application ${input.id} deleted by ${ctx.user.email}`);

      return { success: true };
    }),

  /** Get application counts by status (manager+) */
  getCounts: managerProcedure
    .query(async ({ ctx }) => {
      const counts = await ctx.prisma.application.groupBy({
        by: ['status'],
        _count: true,
      });

      const statusMap: Record<string, number> = {
        PENDING: 0,
        REVIEWED: 0,
        ACCEPTED: 0,
        REJECTED: 0,
        WAITLISTED: 0,
      };

      for (const c of counts) {
        statusMap[c.status] = c._count;
      }

      const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

      return { ...statusMap, total };
    }),
});
