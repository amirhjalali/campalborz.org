/**
 * Tests for the auth tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma mocked to avoid database access.
 */

import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  member: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

import { authRouter } from '../../router/auth';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ auth: authRouter });
  return testRouter.createCaller({
    req: {} as any,
    res: {} as any,
    prisma: mockPrisma as any,
    user: user,
  });
}

describe('authRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const validPasswordHash = bcrypt.hashSync('correctpassword', 12);

    it('should return tokens and user data for valid credentials', async () => {
      const mockMember = {
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        playaName: 'Dusty',
        role: 'MEMBER',
        passwordHash: validPasswordHash,
        isActive: true,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);

      const caller = createTestCaller();
      const result = await caller.auth.login({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual({
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        playaName: 'Dusty',
        role: 'MEMBER',
      });

      // Verify the access token contains correct claims
      const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET!) as any;
      expect(decoded.userId).toBe('member-1');
      expect(decoded.role).toBe('MEMBER');
    });

    it('should throw UNAUTHORIZED for non-existent email', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller();
      await expect(
        caller.auth.login({ email: 'nonexistent@example.com', password: 'password' })
      ).rejects.toThrow(TRPCError);

      await expect(
        caller.auth.login({ email: 'nonexistent@example.com', password: 'password' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should throw UNAUTHORIZED for wrong password', async () => {
      const mockMember = {
        id: 'member-1',
        email: 'test@example.com',
        passwordHash: validPasswordHash,
        isActive: true,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);

      const caller = createTestCaller();
      await expect(
        caller.auth.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow(TRPCError);
    });

    it('should throw FORBIDDEN for deactivated accounts', async () => {
      const mockMember = {
        id: 'member-1',
        email: 'test@example.com',
        passwordHash: validPasswordHash,
        isActive: false,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);

      const caller = createTestCaller();
      await expect(
        caller.auth.login({ email: 'test@example.com', password: 'correctpassword' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should normalize email to lowercase', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller();
      try {
        await caller.auth.login({ email: 'Test@Example.COM', password: 'password' });
      } catch {
        // Expected to throw
      }

      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw UNAUTHORIZED for member with no password hash', async () => {
      const mockMember = {
        id: 'member-1',
        email: 'test@example.com',
        passwordHash: null,
        isActive: true,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);

      const caller = createTestCaller();
      await expect(
        caller.auth.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('forgotPassword', () => {
    it('should always return success regardless of email existence', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller();
      const result = await caller.auth.forgotPassword({ email: 'nonexistent@example.com' });

      expect(result.success).toBe(true);
    });

    it('should return success for existing email', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        isActive: true,
      });

      const caller = createTestCaller();
      const result = await caller.auth.forgotPassword({ email: 'test@example.com' });

      expect(result.success).toBe(true);
    });

    it('should not reveal whether email exists in the system', async () => {
      // Non-existent email
      mockPrisma.member.findUnique.mockResolvedValue(null);
      const caller = createTestCaller();
      const resultNotFound = await caller.auth.forgotPassword({ email: 'nobody@example.com' });

      // Existing email
      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        isActive: true,
      });
      const resultFound = await caller.auth.forgotPassword({ email: 'test@example.com' });

      // Both should succeed (prevents email enumeration)
      expect(resultNotFound.success).toBe(true);
      expect(resultFound.success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetToken = jwt.sign(
        { memberId: 'member-1', type: 'reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
      });
      mockPrisma.member.update.mockResolvedValue({});

      const caller = createTestCaller();
      const result = await caller.auth.resetPassword({
        token: resetToken,
        newPassword: 'newpassword123',
      });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { passwordHash: expect.any(String) },
      });
    });

    it('should throw BAD_REQUEST for invalid token', async () => {
      const caller = createTestCaller();
      await expect(
        caller.auth.resetPassword({ token: 'invalid-token', newPassword: 'newpassword123' })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw BAD_REQUEST for wrong token type', async () => {
      const inviteToken = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!
      );

      const caller = createTestCaller();
      await expect(
        caller.auth.resetPassword({ token: inviteToken, newPassword: 'newpassword123' })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });
  });

  describe('acceptInvite', () => {
    it('should set password and return tokens for valid invite', async () => {
      const inviteToken = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!
      );

      const mockMember = {
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        playaName: 'Dusty',
        role: 'MEMBER',
        passwordHash: null,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);
      mockPrisma.member.update.mockResolvedValue({});

      const caller = createTestCaller();
      const result = await caller.auth.acceptInvite({
        inviteToken,
        password: 'newpassword123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe('member-1');
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: {
          passwordHash: expect.any(String),
          emailVerified: true,
        },
      });
    });

    it('should throw BAD_REQUEST if invite already accepted', async () => {
      const inviteToken = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!
      );

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        passwordHash: 'already-set',
      });

      const caller = createTestCaller();
      await expect(
        caller.auth.acceptInvite({ inviteToken, password: 'newpassword123' })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      const inviteToken = jwt.sign(
        { memberId: 'nonexistent', type: 'invite' },
        process.env.JWT_SECRET!
      );

      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller();
      await expect(
        caller.auth.acceptInvite({ inviteToken, password: 'newpassword123' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('changePassword', () => {
    const currentPasswordHash = bcrypt.hashSync('currentpassword', 12);

    it('should change password for authenticated user with correct current password', async () => {
      const authenticatedUser = {
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
      };

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        passwordHash: currentPasswordHash,
      });
      mockPrisma.member.update.mockResolvedValue({});

      const caller = createTestCaller(authenticatedUser);
      const result = await caller.auth.changePassword({
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
      });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { passwordHash: expect.any(String) },
      });
    });

    it('should throw BAD_REQUEST for incorrect current password', async () => {
      const authenticatedUser = {
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
      };

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        passwordHash: currentPasswordHash,
      });

      const caller = createTestCaller(authenticatedUser);
      await expect(
        caller.auth.changePassword({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw UNAUTHORIZED for unauthenticated users', async () => {
      const caller = createTestCaller(); // No user
      await expect(
        caller.auth.changePassword({
          currentPassword: 'currentpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('getProfile', () => {
    it('should return profile for authenticated user', async () => {
      const authenticatedUser = {
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
      };

      const profileData = {
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        playaName: 'Dusty',
        phone: '555-0100',
        gender: 'Male',
        role: 'MEMBER',
        isActive: true,
        emailVerified: true,
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '555-0101',
        dietaryRestrictions: null,
        createdAt: new Date('2024-01-01'),
      };

      mockPrisma.member.findUnique.mockResolvedValue(profileData);

      const caller = createTestCaller(authenticatedUser);
      const result = await caller.auth.getProfile();

      expect(result).toEqual(profileData);
      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          role: true,
        }),
      });
    });

    it('should throw NOT_FOUND when member does not exist', async () => {
      const authenticatedUser = {
        id: 'deleted-member',
        email: 'deleted@example.com',
        name: 'Deleted',
        role: 'MEMBER',
      };

      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(authenticatedUser);
      await expect(caller.auth.getProfile()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should throw UNAUTHORIZED for unauthenticated users', async () => {
      const caller = createTestCaller(); // No user
      await expect(caller.auth.getProfile()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
