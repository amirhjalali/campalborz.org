import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, managerProcedure, leadProcedure } from '../trpc';
import { sendMassEmailToRecipients } from '../lib/email';

const recipientFilterEnum = z.enum([
  'all',
  'confirmed',
  'unpaid_dues',
  'build_crew',
  'strike_crew',
  'not_on_whatsapp',
  'no_preapproval',
  'no_ticket',
  'custom',
]);

export const communicationsRouter = router({
  /**
   * Returns counts and member lists for action items that need attention.
   * Excludes CANCELLED members from all queries.
   */
  getActionItems: managerProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { seasonId } = input;

      // Verify season exists
      const season = await ctx.prisma.season.findUnique({
        where: { id: seasonId },
        select: { id: true, duesAmount: true },
      });

      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      // ── Unpaid Dues ──
      // Find season members whose DUES payments total less than the season's duesAmount
      const allNonCancelledSMs = await ctx.prisma.seasonMember.findMany({
        where: {
          seasonId,
          status: { not: 'CANCELLED' },
        },
        include: {
          member: { select: { id: true, name: true, email: true, playaName: true } },
          payments: {
            where: { type: 'DUES' },
            select: { amount: true },
          },
        },
      });

      const unpaidDues = allNonCancelledSMs
        .filter((sm) => {
          const totalPaid = sm.payments.reduce((sum, p) => sum + p.amount, 0);
          return totalPaid < season.duesAmount;
        })
        .map((sm) => ({
          seasonMemberId: sm.id,
          memberId: sm.member.id,
          name: sm.member.name,
          email: sm.member.email,
          playaName: sm.member.playaName,
          totalPaid: sm.payments.reduce((sum, p) => sum + p.amount, 0),
          duesAmount: season.duesAmount,
        }));

      // ── No Ticket ──
      // Members without a Ticket record for this season
      const membersWithTickets = await ctx.prisma.ticket.findMany({
        where: { seasonId },
        select: { memberId: true },
      });
      const memberIdsWithTickets = new Set(membersWithTickets.map((t) => t.memberId));

      const noTicket = allNonCancelledSMs
        .filter((sm) => !memberIdsWithTickets.has(sm.member.id))
        .map((sm) => ({
          seasonMemberId: sm.id,
          memberId: sm.member.id,
          name: sm.member.name,
          email: sm.member.email,
          playaName: sm.member.playaName,
        }));

      // ── Not on WhatsApp ──
      const notOnWhatsApp = allNonCancelledSMs
        .filter((sm) => !sm.addedToWhatsApp)
        .map((sm) => ({
          seasonMemberId: sm.id,
          memberId: sm.member.id,
          name: sm.member.name,
          email: sm.member.email,
          playaName: sm.member.playaName,
        }));

      // ── No Pre-Approval ──
      const noPreApproval = allNonCancelledSMs
        .filter((sm) => sm.preApprovalForm === null || sm.preApprovalForm === 'NO')
        .map((sm) => ({
          seasonMemberId: sm.id,
          memberId: sm.member.id,
          name: sm.member.name,
          email: sm.member.email,
          playaName: sm.member.playaName,
          preApprovalForm: sm.preApprovalForm,
        }));

      // ── Pending Applications ──
      const pendingApplications = await ctx.prisma.application.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          name: true,
          email: true,
          playaName: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      return {
        unpaidDues: { count: unpaidDues.length, members: unpaidDues },
        noTicket: { count: noTicket.length, members: noTicket },
        notOnWhatsApp: { count: notOnWhatsApp.length, members: notOnWhatsApp },
        noPreApproval: { count: noPreApproval.length, members: noPreApproval },
        pendingApplications: { count: pendingApplications.length, applications: pendingApplications },
      };
    }),

  /**
   * Send a mass email to filtered groups of members.
   * Only available to camp leads.
   */
  sendMassEmail: leadProcedure
    .input(z.object({
      seasonId: z.string().uuid(),
      subject: z.string().min(1).max(200),
      body: z.string().min(1),
      recipientFilter: recipientFilterEnum,
      customEmails: z.array(z.string().email()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { seasonId, subject, body, recipientFilter, customEmails } = input;

      // Verify season exists
      const season = await ctx.prisma.season.findUnique({
        where: { id: seasonId },
        select: { id: true, duesAmount: true },
      });

      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      let recipientEmails: string[] = [];

      if (recipientFilter === 'custom') {
        if (!customEmails || customEmails.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'customEmails must be provided when using the "custom" filter',
          });
        }
        recipientEmails = customEmails;
      } else {
        // Fetch all non-cancelled season members with their data
        const seasonMembers = await ctx.prisma.seasonMember.findMany({
          where: {
            seasonId,
            status: { not: 'CANCELLED' },
          },
          include: {
            member: { select: { id: true, email: true } },
            payments: {
              where: { type: 'DUES' },
              select: { amount: true },
            },
          },
        });

        switch (recipientFilter) {
          case 'all':
            recipientEmails = seasonMembers.map((sm) => sm.member.email);
            break;

          case 'confirmed':
            recipientEmails = seasonMembers
              .filter((sm) => sm.status === 'CONFIRMED')
              .map((sm) => sm.member.email);
            break;

          case 'unpaid_dues':
            recipientEmails = seasonMembers
              .filter((sm) => {
                const totalPaid = sm.payments.reduce((sum, p) => sum + p.amount, 0);
                return totalPaid < season.duesAmount;
              })
              .map((sm) => sm.member.email);
            break;

          case 'build_crew':
            recipientEmails = seasonMembers
              .filter((sm) => sm.buildCrew)
              .map((sm) => sm.member.email);
            break;

          case 'strike_crew':
            recipientEmails = seasonMembers
              .filter((sm) => sm.strikeCrew)
              .map((sm) => sm.member.email);
            break;

          case 'not_on_whatsapp':
            recipientEmails = seasonMembers
              .filter((sm) => !sm.addedToWhatsApp)
              .map((sm) => sm.member.email);
            break;

          case 'no_preapproval':
            recipientEmails = seasonMembers
              .filter((sm) => sm.preApprovalForm === null || sm.preApprovalForm === 'NO')
              .map((sm) => sm.member.email);
            break;

          case 'no_ticket': {
            const membersWithTickets = await ctx.prisma.ticket.findMany({
              where: { seasonId },
              select: { memberId: true },
            });
            const ticketMemberIds = new Set(membersWithTickets.map((t) => t.memberId));
            recipientEmails = seasonMembers
              .filter((sm) => !ticketMemberIds.has(sm.member.id))
              .map((sm) => sm.member.email);
            break;
          }
        }
      }

      // Deduplicate emails
      recipientEmails = [...new Set(recipientEmails)];

      if (recipientEmails.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No recipients matched the selected filter',
        });
      }

      // Send emails
      const result = await sendMassEmailToRecipients(
        recipientEmails,
        subject,
        body,
        ctx.user.name,
      );

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          memberId: ctx.user.id,
          action: 'MASS_EMAIL_SENT',
          entityType: 'Season',
          entityId: seasonId,
          details: {
            subject,
            recipientFilter,
            recipientCount: recipientEmails.length,
            sent: result.sent,
            failed: result.failed,
            errors: result.errors,
          },
        },
      });

      return result;
    }),
});
