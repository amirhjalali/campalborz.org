import { prisma } from '../lib/prisma';
import { securityService } from './security';
import { emailService } from './email';
import { cacheService } from './cache';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';
import { AuditLogger } from '../middleware/security';

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatar?: string;
  permissions: string[];
  lastLoginAt?: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
  totpToken?: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  tenantId?: string;
  inviteToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface PasswordResetRequest {
  email: string;
  tenantId?: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

class AuthService {
  async login(credentials: LoginCredentials, ip: string, userAgent: string): Promise<AuthTokens> {
    const { email, password, tenantId, totpToken, rememberMe } = credentials;

    try {
      // Find user by email and tenant
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          ...(tenantId && { tenantId }),
          status: {
            in: ['ACTIVE', 'PENDING'],
          },
        },
        include: {
          tenant: true,
        },
      });

      if (!user) {
        // Log failed login attempt
        await AuditLogger.log({
          tenantId,
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ip,
          userAgent,
          severity: 'warning',
          metadata: { email, reason: 'user_not_found' },
        });

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await securityService.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        // Log failed login attempt
        await AuditLogger.log({
          tenantId: user.tenantId,
          userId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ip,
          userAgent,
          severity: 'warning',
          metadata: { email, reason: 'invalid_password' },
        });

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        await AuditLogger.log({
          tenantId: user.tenantId,
          userId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ip,
          userAgent,
          severity: 'warning',
          metadata: { email, reason: 'user_not_active', status: user.status },
        });

        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account is not active. Please verify your email or contact support.',
        });
      }

      // Check tenant status
      if (user.tenant?.status !== 'ACTIVE') {
        await AuditLogger.log({
          tenantId: user.tenantId,
          userId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ip,
          userAgent,
          severity: 'warning',
          metadata: { email, reason: 'tenant_not_active', tenantStatus: user.tenant?.status },
        });

        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Organization account is suspended. Please contact support.',
        });
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!totpToken) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Two-factor authentication token required',
          });
        }

        const isValidTotp = await securityService.verifyTOTP(totpToken, user.twoFactorSecret || '');
        if (!isValidTotp) {
          await AuditLogger.log({
            tenantId: user.tenantId,
            userId: user.id,
            action: 'LOGIN_FAILED',
            resource: 'auth',
            ip,
            userAgent,
            severity: 'warning',
            metadata: { email, reason: 'invalid_totp' },
          });

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid two-factor authentication token',
          });
        }
      }

      // Generate tokens
      const accessTokenExpiry = rememberMe ? '30d' : '24h';
      const refreshTokenExpiry = rememberMe ? '90d' : '7d';

      const accessToken = await securityService.generateJWT({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      }, accessTokenExpiry);

      const refreshToken = await securityService.generateSecureToken(64);

      // Calculate expiry dates
      const accessExpiresAt = new Date();
      accessExpiresAt.setTime(
        accessExpiresAt.getTime() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
      );

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setTime(
        refreshExpiresAt.getTime() + (rememberMe ? 90 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)
      );

      // Store refresh token
      await this.storeRefreshToken({
        token: refreshToken,
        userId: user.id,
        tenantId: user.tenantId,
        expiresAt: refreshExpiresAt,
        ip,
        userAgent,
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });

      // Log successful login
      await AuditLogger.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resource: 'auth',
        ip,
        userAgent,
        severity: 'info',
        metadata: { email, rememberMe },
      });

      const authUser: AuthUser = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar || undefined,
        permissions: user.permissions,
        lastLoginAt: new Date(),
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      return {
        accessToken,
        refreshToken,
        expiresAt: accessExpiresAt,
        user: authUser,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error('Login error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed due to server error',
      });
    }
  }

  async register(data: RegisterData, ip: string, userAgent: string): Promise<{
    user: AuthUser;
    emailVerificationSent: boolean;
  }> {
    const { email, password, name, tenantId, inviteToken } = data;

    try {
      // Validate password
      const passwordValidation = await securityService.validatePassword(password, tenantId);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          ...(tenantId && { tenantId }),
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Validate invite token if provided
      let inviteData = null;
      if (inviteToken) {
        inviteData = await this.validateInviteToken(inviteToken);
        if (!inviteData) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid or expired invite token',
          });
        }
      }

      // Hash password
      const passwordHash = await securityService.hashPassword(password);

      // Generate email verification token
      const emailVerificationToken = await securityService.generateSecureToken();
      const emailVerificationExpiry = new Date();
      emailVerificationExpiry.setTime(emailVerificationExpiry.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          tenantId: tenantId || inviteData?.tenantId,
          role: inviteData?.role || 'MEMBER',
          status: 'PENDING', // Requires email verification
          permissions: inviteData?.permissions || [],
          emailVerificationToken,
          emailVerificationExpiry,
          inviteAcceptedAt: inviteToken ? new Date() : undefined,
        },
        include: {
          tenant: true,
        },
      });

      // Mark invite as used if applicable
      if (inviteToken && inviteData) {
        await this.markInviteAsUsed(inviteToken, user.id);
      }

      // Send email verification
      const emailSent = await this.sendEmailVerification(user.email, user.name, emailVerificationToken, user.tenant?.name);

      // Log registration
      await AuditLogger.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: 'auth',
        ip,
        userAgent,
        severity: 'info',
        metadata: { email, hasInvite: !!inviteToken },
      });

      const authUser: AuthUser = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar || undefined,
        permissions: user.permissions,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      return {
        user: authUser,
        emailVerificationSent: emailSent,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error('Registration error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Registration failed due to server error',
      });
    }
  }

  async refreshToken(refreshToken: string, ip: string, userAgent: string): Promise<AuthTokens> {
    try {
      // Validate refresh token
      const tokenData = await this.validateRefreshToken(refreshToken);
      if (!tokenData) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
        include: { tenant: true },
      });

      if (!user || user.status !== 'ACTIVE' || user.tenant?.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User or tenant no longer active',
        });
      }

      // Generate new tokens
      const newAccessToken = await securityService.generateJWT({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      }, '24h');

      const newRefreshToken = await securityService.generateSecureToken(64);

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + 24 * 60 * 60 * 1000);

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setTime(refreshExpiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Replace old refresh token
      await this.replaceRefreshToken(refreshToken, {
        token: newRefreshToken,
        userId: user.id,
        tenantId: user.tenantId,
        expiresAt: refreshExpiresAt,
        ip,
        userAgent,
      });

      // Log token refresh
      await AuditLogger.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'TOKEN_REFRESHED',
        resource: 'auth',
        ip,
        userAgent,
        severity: 'info',
      });

      const authUser: AuthUser = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar || undefined,
        permissions: user.permissions,
        lastLoginAt: user.lastLoginAt || undefined,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt,
        user: authUser,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error('Token refresh error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token refresh failed',
      });
    }
  }

  async logout(refreshToken: string, ip: string, userAgent: string): Promise<void> {
    try {
      // Validate and get token data
      const tokenData = await this.validateRefreshToken(refreshToken);
      
      if (tokenData) {
        // Log logout
        await AuditLogger.log({
          tenantId: tokenData.tenantId,
          userId: tokenData.userId,
          action: 'USER_LOGOUT',
          resource: 'auth',
          ip,
          userAgent,
          severity: 'info',
        });

        // Revoke refresh token
        await this.revokeRefreshToken(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - just log it
    }
  }

  async requestPasswordReset(request: PasswordResetRequest, ip: string, userAgent: string): Promise<void> {
    const { email, tenantId } = request;

    try {
      // Find user
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          ...(tenantId && { tenantId }),
        },
        include: { tenant: true },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        await AuditLogger.log({
          tenantId,
          action: 'PASSWORD_RESET_REQUESTED',
          resource: 'auth',
          ip,
          userAgent,
          severity: 'warning',
          metadata: { email, reason: 'user_not_found' },
        });
        return;
      }

      // Generate reset token
      const resetToken = await securityService.generateSecureToken();
      const resetExpiry = new Date();
      resetExpiry.setTime(resetExpiry.getTime() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetExpiry,
        },
      });

      // Send reset email
      await this.sendPasswordResetEmail(user.email, user.name, resetToken, user.tenant?.name);

      // Log password reset request
      await AuditLogger.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'auth',
        ip,
        userAgent,
        severity: 'info',
        metadata: { email },
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      // Don't throw error to prevent information disclosure
    }
  }

  async resetPassword(reset: PasswordReset, ip: string, userAgent: string): Promise<void> {
    const { token, newPassword } = reset;

    try {
      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        });
      }

      // Validate new password
      const passwordValidation = await securityService.validatePassword(newPassword, user.tenantId);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        });
      }

      // Hash new password
      const passwordHash = await securityService.hashPassword(newPassword);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpiry: null,
          passwordChangedAt: new Date(),
        },
      });

      // Revoke all existing sessions
      await this.revokeAllUserSessions(user.id);

      // Log password reset
      await AuditLogger.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'auth',
        ip,
        userAgent,
        severity: 'info',
      });

      // Send confirmation email
      await this.sendPasswordResetConfirmation(user.email, user.name);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error('Password reset error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Password reset failed',
      });
    }
  }

  async verifyEmail(token: string, ip: string, userAgent: string): Promise<AuthUser> {
    try {
      // Find user with verification token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpiry: {
            gt: new Date(),
          },
        },
        include: { tenant: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification token',
        });
      }

      // Verify email
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          status: 'ACTIVE', // Activate user after email verification
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          emailVerifiedAt: new Date(),
        },
      });

      // Log email verification
      await AuditLogger.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'EMAIL_VERIFIED',
        resource: 'auth',
        ip,
        userAgent,
        severity: 'info',
      });

      const authUser: AuthUser = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: 'ACTIVE',
        avatar: user.avatar || undefined,
        permissions: user.permissions,
        emailVerified: true,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      return authUser;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error('Email verification error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Email verification failed',
      });
    }
  }

  // Helper methods for token management
  private async storeRefreshToken(tokenData: {
    token: string;
    userId: string;
    tenantId: string;
    expiresAt: Date;
    ip: string;
    userAgent: string;
  }) {
    const cacheKey = `refresh_token:${tokenData.token}`;
    await cacheService.set(cacheKey, tokenData, {
      ttl: Math.floor((tokenData.expiresAt.getTime() - Date.now()) / 1000),
    });
  }

  private async validateRefreshToken(token: string): Promise<any> {
    const cacheKey = `refresh_token:${token}`;
    return await cacheService.get(cacheKey);
  }

  private async revokeRefreshToken(token: string): Promise<void> {
    const cacheKey = `refresh_token:${token}`;
    await cacheService.delete(cacheKey);
  }

  private async replaceRefreshToken(oldToken: string, newTokenData: any): Promise<void> {
    await this.revokeRefreshToken(oldToken);
    await this.storeRefreshToken(newTokenData);
  }

  private async revokeAllUserSessions(userId: string): Promise<void> {
    // In a real implementation, we'd need to track all tokens for a user
    // For now, we'll just log the action
    console.log(`Revoking all sessions for user: ${userId}`);
  }

  private async validateInviteToken(token: string): Promise<any> {
    // Implementation would validate invite tokens
    return null;
  }

  private async markInviteAsUsed(token: string, userId: string): Promise<void> {
    // Implementation would mark invite as used
    console.log(`Marking invite ${token} as used by ${userId}`);
  }

  private async sendEmailVerification(email: string, name: string, token: string, tenantName?: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      await emailService.sendEmail({
        to: email,
        subject: `Verify your email - ${tenantName || 'Camp Platform'}`,
        template: 'email-verification',
        data: {
          name,
          verificationUrl,
          tenantName: tenantName || 'Camp Platform',
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  private async sendPasswordResetEmail(email: string, name: string, token: string, tenantName?: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await emailService.sendEmail({
      to: email,
      subject: `Reset your password - ${tenantName || 'Camp Platform'}`,
      template: 'password-reset',
      data: {
        name,
        resetUrl,
        tenantName: tenantName || 'Camp Platform',
      },
    });
  }

  private async sendPasswordResetConfirmation(email: string, name: string): Promise<void> {
    await emailService.sendEmail({
      to: email,
      subject: 'Password reset successful',
      template: 'password-reset-confirmation',
      data: {
        name,
      },
    });
  }
}

export const authService = new AuthService();