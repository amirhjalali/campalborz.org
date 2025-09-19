import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { authService } from "../services/auth";
import { rateLimiters } from "../middleware/security";

// Authentication schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  tenantId: z.string().optional(),
  totpToken: z.string().length(6).optional(),
  rememberMe: z.boolean().optional().default(false),
});

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  tenantId: z.string().optional(),
  inviteToken: z.string().optional(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const LogoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  tenantId: z.string().optional(),
});

const PasswordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

const Setup2FASchema = z.object({
  totpToken: z.string().length(6, "TOTP token must be 6 digits"),
  secret: z.string().min(1, "TOTP secret is required"),
});

const Disable2FASchema = z.object({
  totpToken: z.string().length(6, "TOTP token must be 6 digits"),
  password: z.string().min(1, "Password is required"),
});

export const authRouter = router({
  // Login
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        const result = await authService.login(input, ip, userAgent);
        
        return {
          success: true,
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt,
          message: "Login successful",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Login error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
        });
      }
    }),

  // Register
  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        const result = await authService.register(input, ip, userAgent);
        
        return {
          success: true,
          user: result.user,
          emailVerificationSent: result.emailVerificationSent,
          message: result.emailVerificationSent 
            ? "Registration successful. Please check your email to verify your account."
            : "Registration successful. Please contact support to activate your account.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),

  // Refresh token
  refreshToken: publicProcedure
    .input(RefreshTokenSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        const result = await authService.refreshToken(input.refreshToken, ip, userAgent);
        
        return {
          success: true,
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Token refresh error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Token refresh failed",
        });
      }
    }),

  // Logout
  logout: publicProcedure
    .input(LogoutSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        await authService.logout(input.refreshToken, ip, userAgent);
        
        return {
          success: true,
          message: "Logout successful",
        };
      } catch (error) {
        console.error("Logout error:", error);
        // Don't throw errors for logout - always return success
        return {
          success: true,
          message: "Logout completed",
        };
      }
    }),

  // Request password reset
  requestPasswordReset: publicProcedure
    .input(PasswordResetRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        await authService.requestPasswordReset(input, ip, userAgent);
        
        return {
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        };
      } catch (error) {
        console.error("Password reset request error:", error);
        // Always return success to prevent email enumeration
        return {
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        };
      }
    }),

  // Reset password
  resetPassword: publicProcedure
    .input(PasswordResetSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        await authService.resetPassword(input, ip, userAgent);
        
        return {
          success: true,
          message: "Password reset successful. You can now login with your new password.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Password reset error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Password reset failed",
        });
      }
    }),

  // Verify email
  verifyEmail: publicProcedure
    .input(VerifyEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req?.ip || '127.0.0.1';
      const userAgent = ctx.req?.get('User-Agent') || 'unknown';

      try {
        const user = await authService.verifyEmail(input.token, ip, userAgent);
        
        return {
          success: true,
          user,
          message: "Email verified successfully. Your account is now active.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Email verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Email verification failed",
        });
      }
    }),

  // Get current user profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        // Get fresh user data from database
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: {
            id: true,
            tenantId: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            status: true,
            permissions: true,
            emailVerified: true,
            twoFactorEnabled: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          user,
          retrievedAt: new Date(),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Get profile error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve profile",
        });
      }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.avatar && { avatar: input.avatar }),
            updatedAt: new Date(),
          },
          select: {
            id: true,
            tenantId: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            status: true,
            permissions: true,
            emailVerified: true,
            twoFactorEnabled: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          user: updatedUser,
          message: "Profile updated successfully",
        };
      } catch (error) {
        console.error("Update profile error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(ChangePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        // Get current user with password
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: {
            id: true,
            tenantId: true,
            passwordHash: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Verify current password
        const isValidPassword = await securityService.verifyPassword(
          input.currentPassword,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }

        // Validate new password
        const passwordValidation = await securityService.validatePassword(
          input.newPassword,
          user.tenantId
        );

        if (!passwordValidation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Password validation failed: ${passwordValidation.errors.join(', ')}`,
          });
        }

        // Hash new password
        const newPasswordHash = await securityService.hashPassword(input.newPassword);

        // Update password
        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: newPasswordHash,
            passwordChangedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Change password error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
        });
      }
    }),

  // Setup 2FA
  setup2FA: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        const totpData = await securityService.generateTOTPSecret();
        
        return {
          success: true,
          secret: totpData.secret,
          qrCode: totpData.qrCode,
          backupCodes: totpData.backupCodes,
          message: "Two-factor authentication setup initiated. Please verify with your authenticator app.",
        };
      } catch (error) {
        console.error("Setup 2FA error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to setup two-factor authentication",
        });
      }
    }),

  // Enable 2FA
  enable2FA: protectedProcedure
    .input(Setup2FASchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        // Verify TOTP token
        const isValid = await securityService.verifyTOTP(input.totpToken, input.secret);
        
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }

        // Enable 2FA for user
        await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            twoFactorEnabled: true,
            twoFactorSecret: input.secret,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Two-factor authentication enabled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Enable 2FA error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enable two-factor authentication",
        });
      }
    }),

  // Disable 2FA
  disable2FA: protectedProcedure
    .input(Disable2FASchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        // Get user with password and 2FA secret
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: {
            id: true,
            passwordHash: true,
            twoFactorSecret: true,
            twoFactorEnabled: true,
          },
        });

        if (!user || !user.twoFactorEnabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Two-factor authentication is not enabled",
          });
        }

        // Verify password
        const isValidPassword = await securityService.verifyPassword(
          input.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Password is incorrect",
          });
        }

        // Verify TOTP token
        const isValidTotp = await securityService.verifyTOTP(
          input.totpToken,
          user.twoFactorSecret || ''
        );

        if (!isValidTotp) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }

        // Disable 2FA
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: null,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Two-factor authentication disabled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Disable 2FA error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable two-factor authentication",
        });
      }
    }),

  // Get user sessions
  getSessions: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        // In a real implementation, this would fetch active sessions from cache/database
        // For now, return mock data
        const sessions = [
          {
            id: 'current',
            current: true,
            ip: ctx.req?.ip || '127.0.0.1',
            userAgent: ctx.req?.get('User-Agent') || 'unknown',
            createdAt: new Date(),
            lastAccessedAt: new Date(),
          },
        ];

        return {
          sessions,
          total: sessions.length,
        };
      } catch (error) {
        console.error("Get sessions error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve sessions",
        });
      }
    }),

  // Revoke session
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      try {
        // In a real implementation, this would revoke the specific session
        console.log(`Revoking session ${input.sessionId} for user ${ctx.user.id}`);

        return {
          success: true,
          message: "Session revoked successfully",
        };
      } catch (error) {
        console.error("Revoke session error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to revoke session",
        });
      }
    }),
});