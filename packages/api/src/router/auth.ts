import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { router, publicProcedure, memberProcedure } from '../trpc';
import logger from '../lib/logger';

// --- Token helpers ---

function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

function signInviteToken(memberId: string): string {
  return jwt.sign({ memberId, type: 'invite' }, process.env.JWT_SECRET!);
}

function signResetToken(memberId: string): string {
  return jwt.sign({ memberId, type: 'reset' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

// --- Validation schemas ---

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

const emailSchema = z.string().email('Invalid email address').max(255);

// --- Router ---

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: emailSchema,
      password: z.string().min(1, 'Password is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { email: input.email.toLowerCase().trim() },
      });

      if (!member || !member.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(input.password, member.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      if (!member.isActive) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is deactivated. Contact a camp admin.' });
      }

      const accessToken = signAccessToken(member.id, member.role);
      const refreshToken = signRefreshToken(member.id);

      logger.info(`Login successful for ${member.email}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: member.id,
          email: member.email,
          name: member.name,
          playaName: member.playaName,
          role: member.role,
        },
      };
    }),

  register: publicProcedure
    .input(z.object({
      email: emailSchema,
      password: passwordSchema,
      name: z.string().min(1, 'Name is required').max(100),
      playaName: z.string().max(100).optional(),
      phone: z.string().max(20).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      const existing = await ctx.prisma.member.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists',
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const member = await ctx.prisma.member.create({
        data: {
          email: normalizedEmail,
          name: input.name,
          playaName: input.playaName,
          phone: input.phone,
          passwordHash,
          role: 'MEMBER',
          isActive: true,
          emailVerified: false,
        },
      });

      const accessToken = signAccessToken(member.id, member.role);
      const refreshToken = signRefreshToken(member.id);

      logger.info(`New registration: ${member.email}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: member.id,
          email: member.email,
          name: member.name,
          playaName: member.playaName,
          role: member.role,
        },
      };
    }),

  refresh: publicProcedure
    .input(z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      let decoded: { userId: string; type: string };
      try {
        decoded = jwt.verify(input.refreshToken, process.env.JWT_SECRET!) as any;
      } catch {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
      }

      if (decoded.type !== 'refresh') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token type' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, playaName: true, role: true, isActive: true },
      });

      if (!member) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User no longer exists' });
      }

      if (!member.isActive) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is deactivated' });
      }

      const accessToken = signAccessToken(member.id, member.role);
      const newRefreshToken = signRefreshToken(member.id);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: member.id,
          email: member.email,
          name: member.name,
          playaName: member.playaName,
          role: member.role,
        },
      };
    }),

  acceptInvite: publicProcedure
    .input(z.object({
      inviteToken: z.string().min(1, 'Invite token is required'),
      password: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      let decoded: { memberId: string; type: string };
      try {
        decoded = jwt.verify(input.inviteToken, process.env.JWT_SECRET!) as any;
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired invite token' });
      }

      if (decoded.type !== 'invite') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid token type' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: decoded.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      if (member.passwordHash) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invite already accepted' });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      await ctx.prisma.member.update({
        where: { id: member.id },
        data: { passwordHash, emailVerified: true },
      });

      const accessToken = signAccessToken(member.id, member.role);
      const refreshToken = signRefreshToken(member.id);

      logger.info(`Invite accepted by ${member.email}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: member.id,
          email: member.email,
          name: member.name,
          playaName: member.playaName,
          role: member.role,
        },
      };
    }),

  validateInvite: publicProcedure
    .input(z.object({
      inviteToken: z.string().min(1, 'Invite token is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      let decoded: { memberId: string; type: string };
      try {
        decoded = jwt.verify(input.inviteToken, process.env.JWT_SECRET!) as { memberId: string; type: string };
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired invite link.' });
      }

      if (decoded.type !== 'invite') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid token type' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: decoded.memberId },
        select: { id: true, email: true, name: true, passwordHash: true },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found.' });
      }

      if (member.passwordHash) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This invitation has already been accepted.' });
      }

      return {
        valid: true,
        email: member.email,
        name: member.name,
      };
    }),

  forgotPassword: publicProcedure
    .input(z.object({
      email: emailSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { email: input.email.toLowerCase().trim() },
      });

      // Always return success to prevent email enumeration
      if (member && member.isActive) {
        const resetToken = signResetToken(member.id);
        // In production, send email with resetToken
        // For now, log it in development
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Reset token for ${member.email}: ${resetToken}`);
        }
        // TODO: Send email via SendGrid/Nodemailer
        // await sendResetEmail(member.email, resetToken);
      }

      return { success: true, message: 'If an account with that email exists, a reset link has been sent.' };
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(1, 'Reset token is required'),
      newPassword: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      let decoded: { memberId: string; type: string };
      try {
        decoded = jwt.verify(input.token, process.env.JWT_SECRET!) as any;
      } catch {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired reset token' });
      }

      if (decoded.type !== 'reset') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid token type' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: decoded.memberId },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.member.update({
        where: { id: decoded.memberId },
        data: { passwordHash },
      });

      logger.info(`Password reset completed for ${member.email}`);

      return { success: true };
    }),

  changePassword: memberProcedure
    .input(z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.currentPassword === input.newPassword) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'New password must be different from current password' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: ctx.user.id },
      });

      if (!member || !member.passwordHash) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No password set for this account' });
      }

      const valid = await bcrypt.compare(input.currentPassword, member.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.member.update({
        where: { id: ctx.user.id },
        data: { passwordHash },
      });

      logger.info(`Password changed for ${member.email}`);

      return { success: true };
    }),

  getProfile: memberProcedure
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

  updateProfile: memberProcedure
    .input(z.object({
      name: z.string().min(1).max(100).optional(),
      playaName: z.string().max(100).nullable().optional(),
      phone: z.string().max(20).nullable().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable().optional(),
      emergencyContactName: z.string().max(100).nullable().optional(),
      emergencyContactPhone: z.string().max(20).nullable().optional(),
      dietaryRestrictions: z.string().max(500).nullable().optional(),
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

// Export helpers for use in other routers
export { signInviteToken, signAccessToken, signRefreshToken };
