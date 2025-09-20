import { z } from "zod";
import { router, protectedProcedure, publicProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { membersService } from "../services/members";

// Member schemas
const MemberProfileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  yearsWithCamp: z.number().optional(),
  emergencyContact: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  socialLinks: z.object({
    website: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
});

const MemberApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  experience: z.string().optional(),
  interests: z.string().min(1, "Please tell us about your interests"),
  contribution: z.string().min(1, "Please tell us how you'd like to contribute"),
  dietary: z.string().optional(),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  additionalInfo: z.string().optional(),
});

const MemberUpdateSchema = z.object({
  id: z.string(),
  profile: MemberProfileSchema.partial(),
  status: z.enum(["pending", "approved", "rejected", "inactive"]).optional(),
  role: z.enum(["member", "admin", "moderator", "lead"]).optional(),
});

const MemberFilterSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "inactive"]).optional(),
  role: z.enum(["member", "admin", "moderator", "lead"]).optional(),
  yearsWithCamp: z.number().optional(),
  skills: z.array(z.string()).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const membersRouter = router({
  // Public application submission
  apply: publicProcedure
    .input(MemberApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      try {
        // Check if email already exists for this tenant
        const existingApplication = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
            tenantId: ctx.tenant.id,
          },
        });

        if (existingApplication) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An application with this email already exists",
          });
        }

        // Create the application
        const application = await ctx.prisma.user.create({
          data: {
            email: input.email,
            name: input.name,
            tenantId: ctx.tenant.id,
            status: "pending",
            role: "member",
            profile: {
              phone: input.phone,
              experience: input.experience,
              interests: input.interests,
              contribution: input.contribution,
              dietary: input.dietary,
              emergencyContact: input.emergencyContact,
              additionalInfo: input.additionalInfo,
              appliedAt: new Date(),
            },
          },
        });

        // TODO: Send notification email to admins
        // TODO: Send confirmation email to applicant

        return {
          id: application.id,
          status: "submitted",
          message: "Application submitted successfully. We'll be in touch soon!",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit application",
        });
      }
    }),

  // Get all members (with filtering)
  list: protectedProcedure
    .input(MemberFilterSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const where: any = {
        tenantId: ctx.tenant.id,
      };

      // Apply filters
      if (input.status) {
        where.status = input.status;
      }
      if (input.role) {
        where.role = input.role;
      }
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [members, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true,
            profile: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        members,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  // Get member by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const member = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return member;
    }),

  // Update member (admin only)
  update: protectedProcedure
    .input(MemberUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check if user has permission to update members
      if (!["admin", "lead"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        });
      }

      const member = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      const updateData: any = {};

      if (input.status) {
        updateData.status = input.status;
      }
      if (input.role) {
        updateData.role = input.role;
      }
      if (input.profile) {
        updateData.profile = {
          ...member.profile,
          ...input.profile,
        };
      }

      const updatedMember = await ctx.prisma.user.update({
        where: { id: input.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: true,
          profile: true,
          updatedAt: true,
        },
      });

      // TODO: Send notification email on status change
      // TODO: Log the update action

      return updatedMember;
    }),

  // Delete member (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check if user has permission to delete members
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete members",
        });
      }

      // Prevent self-deletion
      if (input.id === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      const member = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      await ctx.prisma.user.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get member statistics
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const [
        totalMembers,
        pendingApplications,
        activeMembers,
        membersByRole,
        recentApplications,
      ] = await Promise.all([
        ctx.prisma.user.count({
          where: { tenantId: ctx.tenant.id },
        }),
        ctx.prisma.user.count({
          where: { 
            tenantId: ctx.tenant.id,
            status: "pending",
          },
        }),
        ctx.prisma.user.count({
          where: { 
            tenantId: ctx.tenant.id,
            status: "approved",
          },
        }),
        ctx.prisma.user.groupBy({
          by: ['role'],
          where: { tenantId: ctx.tenant.id },
          _count: { role: true },
        }),
        ctx.prisma.user.findMany({
          where: { 
            tenantId: ctx.tenant.id,
            status: "pending",
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        totalMembers,
        pendingApplications,
        activeMembers,
        membersByRole: membersByRole.map(item => ({
          role: item.role,
          count: item._count.role,
        })),
        recentApplications,
      };
    }),

  // Update own profile
  updateProfile: protectedProcedure
    .input(MemberProfileSchema.partial())
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          profile: {
            ...ctx.user.profile,
            ...input,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      });

      return updatedUser;
    }),

  // Advanced Member Portal Features
  submitMembershipApplication: protectedProcedure
    .input(z.object({
      answers: z.record(z.any()),
      references: z.array(z.object({
        name: z.string(),
        email: z.string(),
        relationship: z.string()
      })).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return membersService.submitMembershipApplication(
        ctx.user.id,
        ctx.tenant.id,
        input
      );
    }),

  reviewMembershipApplication: adminProcedure
    .input(z.object({
      applicationId: z.string(),
      decision: z.enum(['approved', 'rejected']),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return membersService.reviewMembershipApplication(
        input.applicationId,
        ctx.user.id,
        ctx.tenant.id,
        input.decision,
        input.notes
      );
    }),

  getMemberProfile: protectedProcedure
    .input(z.object({
      userId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.id;
      return membersService.getMemberProfile(userId, ctx.tenant.id);
    }),

  searchMembers: protectedProcedure
    .input(z.object({
      searchTerm: z.string().optional(),
      skills: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      roles: z.array(z.enum(['MEMBER', 'ADMIN', 'LEAD', 'VOLUNTEER'])).optional(),
      status: z.array(z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'])).optional(),
      sortBy: z.enum(['name', 'joinDate', 'contributions']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      return membersService.searchMembers(ctx.tenant.id, input);
    }),

  awardPoints: adminProcedure
    .input(z.object({
      userId: z.string(),
      points: z.number().min(1),
      reason: z.string(),
      category: z.enum(['event', 'volunteer', 'donation', 'participation', 'other'])
    }))
    .mutation(async ({ ctx, input }) => {
      return membersService.awardPoints(
        input.userId,
        ctx.tenant.id,
        input.points,
        input.reason,
        input.category
      );
    }),

  getMyPoints: protectedProcedure
    .query(async ({ ctx }) => {
      return membersService.getMemberPoints(
        ctx.user.id,
        ctx.tenant.id
      );
    }),

  logVolunteerHours: protectedProcedure
    .input(z.object({
      eventId: z.string().optional(),
      hours: z.number().min(0.5).max(24),
      description: z.string(),
      date: z.string().transform(str => new Date(str)),
      category: z.enum(['setup', 'event', 'cleanup', 'maintenance', 'administration', 'other'])
    }))
    .mutation(async ({ ctx, input }) => {
      const volunteerLog = await ctx.prisma.volunteerLog.create({
        data: {
          userId: ctx.user.id,
          tenantId: ctx.tenant.id,
          eventId: input.eventId,
          hours: input.hours,
          description: input.description,
          date: input.date,
          category: input.category
        }
      });

      await membersService.awardPoints(
        ctx.user.id,
        ctx.tenant.id,
        Math.floor(input.hours * 10),
        `Volunteer work: ${input.description}`,
        'volunteer'
      );

      return volunteerLog;
    }),

  getVolunteerHistory: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
      year: z.number().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20)
    }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.id;
      
      const where = {
        userId,
        tenantId: ctx.tenant.id,
        ...(input.year && {
          date: {
            gte: new Date(input.year, 0, 1),
            lt: new Date(input.year + 1, 0, 1)
          }
        })
      };

      const [logs, total] = await Promise.all([
        ctx.prisma.volunteerLog.findMany({
          where,
          include: {
            event: {
              select: { id: true, title: true, startDate: true }
            }
          },
          orderBy: { date: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit
        }),
        ctx.prisma.volunteerLog.count({ where })
      ]);

      const totalHours = await ctx.prisma.volunteerLog.aggregate({
        where,
        _sum: { hours: true }
      });

      return {
        logs,
        totalHours: totalHours._sum.hours || 0,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit)
        }
      };
    }),

  getPointsLeaderboard: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      timeframe: z.enum(['all_time', 'year', 'month']).default('all_time')
    }))
    .query(async ({ ctx, input }) => {
      const whereClause = {
        tenantId: ctx.tenant.id,
        ...(input.timeframe !== 'all_time' && {
          awardedAt: {
            gte: input.timeframe === 'year' 
              ? new Date(new Date().getFullYear(), 0, 1)
              : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        })
      };

      return ctx.prisma.memberPoints.groupBy({
        by: ['userId'],
        where: whereClause,
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: input.limit
      }).then(async (results) => {
        const userIds = results.map(r => r.userId);
        const users = await ctx.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            avatar: true,
            metadata: true
          }
        });

        return results.map((result, index) => {
          const user = users.find(u => u.id === result.userId);
          return {
            rank: index + 1,
            user,
            points: result._sum.points || 0
          };
        });
      });
    })
});