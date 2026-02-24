import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, memberProcedure, managerProcedure, adminProcedure } from '../trpc';
import { signInviteToken } from './auth';
import logger from '../lib/logger';

// --- Validation schemas ---

const memberSearchInput = z.object({
  search: z.string().max(200).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'role']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
}).optional().default({});

const memberProfileInput = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  playaName: z.string().max(100).nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable().optional(),
  emergencyContactName: z.string().max(100).nullable().optional(),
  emergencyContactPhone: z.string().max(20).nullable().optional(),
  dietaryRestrictions: z.string().max(500).nullable().optional(),
});

// --- Router ---

export const membersRouter = router({
  /** List members with search, filter, sort, and pagination (manager+) */
  list: managerProcedure
    .input(memberSearchInput)
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
          { playaName: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input.role) where.role = input.role;
      if (input.isActive !== undefined) where.isActive = input.isActive;

      const [members, total] = await Promise.all([
        ctx.prisma.member.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            playaName: true,
            phone: true,
            role: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
          },
          orderBy: { [input.sortBy]: input.sortOrder },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.member.count({ where }),
      ]);

      return { members, total, limit: input.limit, offset: input.offset };
    }),

  /** Get a single member by ID with season history (manager+) */
  getById: managerProcedure
    .input(z.object({ id: z.string().uuid('Invalid member ID') }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { id: input.id },
        include: {
          seasonMembers: {
            include: {
              season: { select: { id: true, year: true, name: true, isActive: true } },
              payments: true,
            },
            orderBy: { season: { year: 'desc' } },
          },
        },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      // Omit passwordHash from response
      const { passwordHash, ...rest } = member;
      return rest;
    }),

  /** Invite a new member by email (admin only) */
  invite: adminProcedure
    .input(z.object({
      email: z.string().email('Invalid email address').max(255),
      name: z.string().min(1, 'Name is required').max(100),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional().default('MEMBER'),
    }))
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      const existing = await ctx.prisma.member.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'A member with this email already exists' });
      }

      const member = await ctx.prisma.member.create({
        data: {
          email: normalizedEmail,
          name: input.name,
          role: input.role,
        },
      });

      const inviteToken = signInviteToken(member.id);

      logger.info(`Member invited: ${member.email} by ${ctx.user.email}`);

      // TODO: Send invite email via SendGrid/Nodemailer
      // await sendInviteEmail(member.email, inviteToken);

      return { member, inviteToken };
    }),

  /** Update a member's role (admin only) */
  updateRole: adminProcedure
    .input(z.object({
      memberId: z.string().uuid('Invalid member ID'),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.memberId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot change your own role' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      const updated = await ctx.prisma.member.update({
        where: { id: input.memberId },
        data: { role: input.role },
        select: { id: true, email: true, name: true, role: true },
      });

      logger.info(`Role changed for ${member.email}: ${member.role} -> ${input.role} by ${ctx.user.email}`);

      return updated;
    }),

  /** Deactivate a member (admin only) */
  deactivate: adminProcedure
    .input(z.object({
      memberId: z.string().uuid('Invalid member ID'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.memberId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot deactivate your own account' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      if (!member.isActive) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Member is already deactivated' });
      }

      const updated = await ctx.prisma.member.update({
        where: { id: input.memberId },
        data: { isActive: false },
        select: { id: true, email: true, name: true, isActive: true },
      });

      logger.info(`Member deactivated: ${member.email} by ${ctx.user.email}`);

      return updated;
    }),

  /** Reactivate a deactivated member (admin only) */
  reactivate: adminProcedure
    .input(z.object({
      memberId: z.string().uuid('Invalid member ID'),
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      if (member.isActive) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Member is already active' });
      }

      const updated = await ctx.prisma.member.update({
        where: { id: input.memberId },
        data: { isActive: true },
        select: { id: true, email: true, name: true, isActive: true },
      });

      logger.info(`Member reactivated: ${member.email} by ${ctx.user.email}`);

      return updated;
    }),

  /** Permanently delete a member and all related data (admin only) */
  delete: adminProcedure
    .input(z.object({
      memberId: z.string().uuid('Invalid member ID'),
      confirmEmail: z.string().email('Must confirm with member email'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.memberId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot delete your own account' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      if (member.email !== input.confirmEmail.toLowerCase().trim()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email confirmation does not match. Deletion cancelled.' });
      }

      await ctx.prisma.member.delete({
        where: { id: input.memberId },
      });

      logger.info(`Member permanently deleted: ${member.email} by ${ctx.user.email}`);

      return { success: true, deletedEmail: member.email };
    }),

  /** Update admin notes on a member (manager+) */
  updateNotes: managerProcedure
    .input(z.object({
      memberId: z.string().uuid('Invalid member ID'),
      notes: z.string().max(2000).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      return ctx.prisma.member.update({
        where: { id: input.memberId },
        data: { notes: input.notes },
        select: { id: true, name: true, notes: true },
      });
    }),

  /** Get current user's profile */
  getMyProfile: memberProcedure
    .query(async ({ ctx }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          playaName: true,
          phone: true,
          gender: true,
          role: true,
          isActive: true,
          emailVerified: true,
          emergencyContactName: true,
          emergencyContactPhone: true,
          dietaryRestrictions: true,
          createdAt: true,
        },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      return member;
    }),

  /** Update current user's own profile */
  updateMyProfile: memberProcedure
    .input(memberProfileInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.member.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          playaName: true,
          phone: true,
          gender: true,
          role: true,
          emergencyContactName: true,
          emergencyContactPhone: true,
          dietaryRestrictions: true,
        },
      });
    }),

  /** Get total member count by status (manager+) */
  getCounts: managerProcedure
    .query(async ({ ctx }) => {
      const [total, active, inactive, byRole] = await Promise.all([
        ctx.prisma.member.count(),
        ctx.prisma.member.count({ where: { isActive: true } }),
        ctx.prisma.member.count({ where: { isActive: false } }),
        ctx.prisma.member.groupBy({
          by: ['role'],
          _count: true,
        }),
      ]);

      const roleMap: Record<string, number> = {};
      for (const r of byRole) {
        roleMap[r.role] = r._count;
      }

      return { total, active, inactive, byRole: roleMap };
    }),
});
