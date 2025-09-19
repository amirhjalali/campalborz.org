import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { emailService, emailQueue } from "../services/email";

// Email schemas
const SendEmailSchema = z.object({
  to: z.string().email(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
});

const SendTemplateEmailSchema = z.object({
  templateName: z.string().min(1),
  to: z.string().email(),
  data: z.record(z.any()),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
});

const ConfigureEmailSchema = z.object({
  provider: z.enum(["sendgrid", "mailgun", "ses", "resend"]),
  apiKey: z.string().min(1),
  fromEmail: z.string().email(),
  fromName: z.string().min(1),
});

export const emailRouter = router({
  // Configure email service (admin only)
  configure: protectedProcedure
    .input(ConfigureEmailSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can configure email settings",
        });
      }

      try {
        // Configure the email service
        emailService.configure({
          provider: input.provider,
          apiKey: input.apiKey,
          fromEmail: input.fromEmail,
          fromName: input.fromName,
        });

        // Store email configuration in tenant settings
        await ctx.prisma.tenant.update({
          where: { id: ctx.tenant.id },
          data: {
            settings: {
              ...ctx.tenant.settings as any,
              email: {
                provider: input.provider,
                fromEmail: input.fromEmail,
                fromName: input.fromName,
                // Note: API key should be stored securely, not in database
                configured: true,
              },
            },
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to configure email service",
        });
      }
    }),

  // Send direct email (admin/moderator only)
  send: protectedProcedure
    .input(SendEmailSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to send emails",
        });
      }

      try {
        const jobId = await emailQueue.add({
          type: "direct",
          data: {
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            subject: input.subject,
            html: input.html,
            text: input.text,
          },
          priority: input.priority,
          scheduledAt: input.scheduledAt,
          maxAttempts: 3,
        });

        return {
          success: true,
          jobId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue email",
        });
      }
    }),

  // Send template email
  sendTemplate: protectedProcedure
    .input(SendTemplateEmailSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions based on template type
      const restrictedTemplates = ["password-reset", "member-application-approved"];
      const requiresAdmin = restrictedTemplates.includes(input.templateName);

      if (requiresAdmin && !["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions for this email template",
        });
      }

      if (!requiresAdmin && !["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to send emails",
        });
      }

      try {
        const jobId = await emailQueue.add({
          type: "template",
          data: {
            templateName: input.templateName,
            to: input.to,
            data: {
              ...input.data,
              campName: ctx.tenant.name,
            },
          },
          priority: input.priority,
          scheduledAt: input.scheduledAt,
          maxAttempts: 3,
        });

        return {
          success: true,
          jobId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue template email",
        });
      }
    }),

  // Send welcome email to new member
  sendWelcomeEmail: protectedProcedure
    .input(z.object({
      userId: z.string(),
      memberName: z.string(),
      memberEmail: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to send welcome emails",
        });
      }

      try {
        const jobId = await emailQueue.add({
          type: "template",
          data: {
            templateName: "member-welcome",
            to: input.memberEmail,
            data: {
              memberName: input.memberName,
              campName: ctx.tenant.name,
              profileLink: `${process.env.FRONTEND_URL}/profile`,
              eventsLink: `${process.env.FRONTEND_URL}/events`,
              communityLink: `${process.env.FRONTEND_URL}/community`,
              guidelinesLink: `${process.env.FRONTEND_URL}/guidelines`,
            },
          },
          priority: "normal",
          maxAttempts: 3,
        });

        return {
          success: true,
          jobId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send welcome email",
        });
      }
    }),

  // Send donation receipt
  sendDonationReceipt: protectedProcedure
    .input(z.object({
      donationId: z.string(),
      donorName: z.string(),
      donorEmail: z.string(),
      amount: z.number(),
      date: z.string(),
      transactionId: z.string(),
      campaign: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to send receipts",
        });
      }

      try {
        const jobId = await emailQueue.add({
          type: "template",
          data: {
            templateName: "donation-receipt",
            to: input.donorEmail,
            data: {
              donorName: input.donorName,
              campName: ctx.tenant.name,
              amount: (input.amount / 100).toFixed(2),
              date: input.date,
              transactionId: input.transactionId,
              campaign: input.campaign,
              ein: "XX-XXXXXXX", // Should come from tenant settings
            },
          },
          priority: "high",
          maxAttempts: 3,
        });

        // Mark donation as receipt sent
        await ctx.prisma.donation.update({
          where: { id: input.donationId },
          data: { taxReceiptSent: true },
        });

        return {
          success: true,
          jobId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send donation receipt",
        });
      }
    }),

  // Send event RSVP confirmation
  sendEventConfirmation: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      attendeeName: z.string(),
      attendeeEmail: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        // Get event details
        const event = await ctx.prisma.event.findFirst({
          where: {
            id: input.eventId,
            tenantId: ctx.tenant.id,
          },
        });

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }

        const jobId = await emailQueue.add({
          type: "template",
          data: {
            templateName: "event-rsvp-confirmation",
            to: input.attendeeEmail,
            data: {
              attendeeName: input.attendeeName,
              campName: ctx.tenant.name,
              eventTitle: event.title,
              eventDate: event.startDate.toLocaleDateString(),
              eventTime: event.startDate.toLocaleTimeString(),
              eventLocation: event.location || "TBD",
              eventAddress: event.address,
              eventDescription: event.description,
            },
          },
          priority: "normal",
          maxAttempts: 3,
        });

        return {
          success: true,
          jobId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send event confirmation",
        });
      }
    }),

  // Get email queue status (admin only)
  getQueueStatus: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view queue status",
        });
      }

      return emailQueue.getQueueStatus();
    }),

  // Get available email templates
  getTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to view templates",
        });
      }

      return [
        {
          name: "member-application-received",
          description: "Sent when a new member application is received",
          variables: ["applicantName", "campName"],
        },
        {
          name: "member-application-approved",
          description: "Sent when a member application is approved",
          variables: ["memberName", "campName", "communityLink", "eventsLink", "guidelinesLink"],
        },
        {
          name: "member-welcome",
          description: "Welcome email for new members",
          variables: ["memberName", "campName", "profileLink", "eventsLink", "communityLink", "guidelinesLink"],
        },
        {
          name: "donation-receipt",
          description: "Tax receipt for donations",
          variables: ["donorName", "campName", "amount", "date", "transactionId", "campaign", "ein"],
        },
        {
          name: "event-rsvp-confirmation",
          description: "RSVP confirmation for events",
          variables: ["attendeeName", "campName", "eventTitle", "eventDate", "eventTime", "eventLocation", "eventAddress", "eventDescription"],
        },
        {
          name: "password-reset",
          description: "Password reset email",
          variables: ["userName", "campName", "resetLink"],
        },
      ];
    }),
});