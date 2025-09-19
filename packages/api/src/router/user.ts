import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { CreateUserSchema } from "@camp-platform/shared";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRouter = router({
  // Register a new user
  register: publicProcedure
    .input(CreateUserSchema.extend({
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password, tenantId, ...rest } = input;
      
      // Check if user already exists
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          email,
          tenantId,
        },
      });
      
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          email,
          passwordHash,
          tenantId,
          ...rest,
        },
      });
      
      // Don't return password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  // Login user
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
      tenantId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password, tenantId } = input;
      
      // If no tenantId provided, try to get from context
      const actualTenantId = tenantId || ctx.tenant?.id;
      
      if (!actualTenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID required",
        });
      }
      
      // Find user
      const user = await ctx.prisma.user.findFirst({
        where: {
          email,
          tenantId: actualTenantId,
          status: "ACTIVE",
        },
      });
      
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      
      // Update last login
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenantId,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    }),

  // Get current user profile
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          permissions: true,
          metadata: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return user;
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      avatar: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          permissions: true,
          metadata: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return user;
    }),

  // List users (admin only)
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Check permission
      if (!ctx.user.permissions.includes("member:view")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view members",
        });
      }
      
      const users = await ctx.prisma.user.findMany({
        where: { tenantId: ctx.user.tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
        skip: input.offset,
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
      
      const total = await ctx.prisma.user.count({
        where: { tenantId: ctx.user.tenantId },
      });
      
      return {
        users,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),
});