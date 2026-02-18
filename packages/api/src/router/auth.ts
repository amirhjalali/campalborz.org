import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { router, publicProcedure, memberProcedure } from '../trpc';

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

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (!member || !member.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(input.password, member.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      if (!member.isActive) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is deactivated' });
      }

      const accessToken = signAccessToken(member.id, member.role);
      const refreshToken = signRefreshToken(member.id);

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

  acceptInvite: publicProcedure
    .input(z.object({
      inviteToken: z.string(),
      password: z.string().min(8),
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

  forgotPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (member) {
        const resetToken = signResetToken(member.id);
        // In production, send email with resetToken
        // For now, log it in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Reset token for ${member.email}: ${resetToken}`);
        }
      }

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8),
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

      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.member.update({
        where: { id: decoded.memberId },
        data: { passwordHash },
      });

      return { success: true };
    }),

  changePassword: memberProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.member.findUnique({
        where: { id: ctx.user.id },
      });

      if (!member || !member.passwordHash) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No password set' });
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
});

// Export helpers for use in members router
export { signInviteToken };
