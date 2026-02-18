import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, memberProcedure, managerProcedure, adminProcedure } from '../trpc';
import { signInviteToken } from './auth';

export const membersRouter = router({
  list: managerProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
      isActive: z.boolean().optional(),
      sortBy: z.enum(['name', 'email', 'createdAt', 'role']).optional().default('name'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }).optional().default({}))
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
            createdAt: true,
          },
          orderBy: { [input.sortBy]: input.sortOrder },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.member.count({ where }),
      ]);

      return { members, total };
    }),

  getById: managerProcedure
    .input(z.object({ id: z.string().uuid() }))
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

      // Omit passwordHash
      const { passwordHash, ...rest } = member;
      return rest;
    }),

  invite: adminProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional().default('MEMBER'),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.member.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'A member with this email already exists' });
      }

      const member = await ctx.prisma.member.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          role: input.role,
        },
      });

      const inviteToken = signInviteToken(member.id);

      return { member, inviteToken };
    }),

  updateRole: adminProcedure
    .input(z.object({
      memberId: z.string().uuid(),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
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
        data: { role: input.role },
      });
    }),

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

  updateMyProfile: memberProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      playaName: z.string().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      dietaryRestrictions: z.string().optional(),
    }))
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
});
