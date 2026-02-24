import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { router, publicProcedure, adminProcedure, managerProcedure } from '../trpc';
import { signInviteToken } from './auth';
import logger from '../lib/logger';

// --- Router ---

export const invitationsRouter = router({
  /**
   * Create a new member invite (admin only).
   * Creates the member record and generates an invite JWT token.
   */
  create: adminProcedure
    .input(z.object({
      email: z.string().email('Invalid email address').max(255),
      name: z.string().min(1, 'Name is required').max(100),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional().default('MEMBER'),
      playaName: z.string().max(100).optional(),
      phone: z.string().max(20).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if a member already exists with this email
      const existing = await ctx.prisma.member.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        // If they exist but never set a password, re-generate the invite token
        if (!existing.passwordHash) {
          const inviteToken = signInviteToken(existing.id);

          logger.info(`Invite re-sent for ${normalizedEmail} by ${ctx.user.email}`);

          // TODO: Send invite email
          // await sendInviteEmail(normalizedEmail, inviteToken);

          return {
            member: {
              id: existing.id,
              email: existing.email,
              name: existing.name,
              role: existing.role,
            },
            inviteToken,
            resent: true,
          };
        }

        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A member with this email already exists and has accepted their invite',
        });
      }

      // Create the new member record (without password -- they set it when accepting)
      const member = await ctx.prisma.member.create({
        data: {
          email: normalizedEmail,
          name: input.name,
          role: input.role,
          playaName: input.playaName,
          phone: input.phone,
          isActive: true,
          emailVerified: false,
        },
      });

      const inviteToken = signInviteToken(member.id);

      logger.info(`Invitation created for ${normalizedEmail} by ${ctx.user.email}`);

      // TODO: Send invite email
      // await sendInviteEmail(normalizedEmail, inviteToken);

      return {
        member: {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
        },
        inviteToken,
        resent: false,
      };
    }),

  /**
   * Bulk create invitations (admin only).
   * Accepts an array of email/name pairs and creates members + invite tokens for each.
   */
  bulkCreate: adminProcedure
    .input(z.object({
      invites: z.array(z.object({
        email: z.string().email('Invalid email address').max(255),
        name: z.string().min(1).max(100),
        role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional().default('MEMBER'),
      })).min(1, 'At least one invite is required').max(50, 'Maximum 50 invites at a time'),
    }))
    .mutation(async ({ ctx, input }) => {
      const results: {
        email: string;
        status: 'created' | 'resent' | 'already_active' | 'error';
        inviteToken?: string;
        error?: string;
      }[] = [];

      for (const invite of input.invites) {
        const normalizedEmail = invite.email.toLowerCase().trim();

        try {
          const existing = await ctx.prisma.member.findUnique({
            where: { email: normalizedEmail },
          });

          if (existing) {
            if (!existing.passwordHash) {
              // Re-send invite
              const inviteToken = signInviteToken(existing.id);
              results.push({ email: normalizedEmail, status: 'resent', inviteToken });
            } else {
              results.push({ email: normalizedEmail, status: 'already_active' });
            }
            continue;
          }

          const member = await ctx.prisma.member.create({
            data: {
              email: normalizedEmail,
              name: invite.name,
              role: invite.role,
              isActive: true,
              emailVerified: false,
            },
          });

          const inviteToken = signInviteToken(member.id);
          results.push({ email: normalizedEmail, status: 'created', inviteToken });
        } catch (err: any) {
          results.push({
            email: normalizedEmail,
            status: 'error',
            error: err.message || 'Unknown error',
          });
        }
      }

      const created = results.filter((r) => r.status === 'created').length;
      const resent = results.filter((r) => r.status === 'resent').length;
      const skipped = results.filter((r) => r.status === 'already_active').length;
      const errors = results.filter((r) => r.status === 'error').length;

      logger.info(`Bulk invitations by ${ctx.user.email}: ${created} created, ${resent} resent, ${skipped} skipped, ${errors} errors`);

      return { results, summary: { created, resent, skipped, errors } };
    }),

  /**
   * Validate an invite token (public).
   * Returns the member info associated with the token without accepting it.
   */
  validate: publicProcedure
    .input(z.object({
      token: z.string().min(1, 'Invite token is required'),
    }))
    .query(async ({ ctx, input }) => {
      let decoded: { memberId: string; type: string };
      try {
        decoded = jwt.verify(input.token, process.env.JWT_SECRET!) as any;
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This invite has expired. Please request a new one.' });
        }
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid invite token' });
      }

      if (decoded.type !== 'invite') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid token type' });
      }

      const member = await ctx.prisma.member.findUnique({
        where: { id: decoded.memberId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          passwordHash: true,
          isActive: true,
        },
      });

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'The member associated with this invite no longer exists' });
      }

      if (member.passwordHash) {
        return {
          valid: false,
          accepted: true,
          message: 'This invite has already been accepted. Please log in instead.',
          member: {
            email: member.email,
            name: member.name,
          },
        };
      }

      if (!member.isActive) {
        return {
          valid: false,
          accepted: false,
          message: 'This member account has been deactivated.',
          member: {
            email: member.email,
            name: member.name,
          },
        };
      }

      return {
        valid: true,
        accepted: false,
        message: 'Invite is valid. Set a password to complete registration.',
        member: {
          email: member.email,
          name: member.name,
          role: member.role,
        },
      };
    }),

  /**
   * List pending invitations (members who have not yet set a password).
   * Manager+ only.
   */
  listPending: managerProcedure
    .input(z.object({
      search: z.string().max(200).optional(),
      limit: z.number().int().min(1).max(100).optional().default(50),
      offset: z.number().int().min(0).optional().default(0),
    }).optional().default({}))
    .query(async ({ ctx, input }) => {
      const where: any = {
        passwordHash: null,
        isActive: true,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [invitations, total] = await Promise.all([
        ctx.prisma.member.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            playaName: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.member.count({ where }),
      ]);

      return { invitations, total };
    }),

  /**
   * Resend an invitation for a specific member (admin only).
   * Generates a new invite token.
   */
  resend: adminProcedure
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

      if (member.passwordHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This member has already accepted their invite and set a password',
        });
      }

      const inviteToken = signInviteToken(member.id);

      logger.info(`Invite resent for ${member.email} by ${ctx.user.email}`);

      // TODO: Send invite email
      // await sendInviteEmail(member.email, inviteToken);

      return {
        memberId: member.id,
        email: member.email,
        inviteToken,
      };
    }),

  /**
   * Revoke an invitation by deactivating the member (admin only).
   * Only works for members who haven't accepted yet.
   */
  revoke: adminProcedure
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

      if (member.passwordHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot revoke an accepted invitation. Use the members.deactivate endpoint instead.',
        });
      }

      // Deactivate the member so the invite token validation will fail
      await ctx.prisma.member.update({
        where: { id: input.memberId },
        data: { isActive: false },
      });

      logger.info(`Invite revoked for ${member.email} by ${ctx.user.email}`);

      return { success: true, email: member.email };
    }),
});
