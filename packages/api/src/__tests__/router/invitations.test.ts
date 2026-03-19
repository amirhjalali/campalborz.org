/**
 * Tests for the invitations tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma mocked to avoid database access.
 */

import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  member: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

// Mock logger to suppress console output in tests
jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock email service
jest.mock('../../lib/email', () => ({
  __esModule: true,
  sendInviteEmail: jest.fn().mockResolvedValue(true),
}));

// Mock the signInviteToken from auth router
jest.mock('../../router/auth', () => ({
  signInviteToken: jest.fn().mockReturnValue('mock-invite-token'),
}));

import { invitationsRouter } from '../../router/invitations';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ invitations: invitationsRouter });
  return testRouter.createCaller({
    req: {} as any,
    res: {} as any,
    prisma: mockPrisma as any,
    user: user,
  });
}

// Reusable test users
const leadUser = {
  id: 'lead-1',
  email: 'lead@example.com',
  name: 'Test Lead',
  role: 'LEAD',
};

const managerUser = {
  id: 'manager-1',
  email: 'manager@example.com',
  name: 'Test Manager',
  role: 'MANAGER',
};

const memberUser = {
  id: 'member-1',
  email: 'member@example.com',
  name: 'Test Member',
  role: 'MEMBER',
};

describe('invitationsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------
  describe('create', () => {
    it('should create a new member and return invite token', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);
      mockPrisma.member.create.mockResolvedValue({
        id: 'new-member-1',
        email: 'newbie@example.com',
        name: 'New Member',
        role: 'MEMBER',
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.create({
        email: 'newbie@example.com',
        name: 'New Member',
      });

      expect(result.member.id).toBe('new-member-1');
      expect(result.member.email).toBe('newbie@example.com');
      expect(result.inviteToken).toBe('mock-invite-token');
      expect(result.resent).toBe(false);
      expect(mockPrisma.member.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newbie@example.com',
          name: 'New Member',
          role: 'MEMBER',
          isActive: true,
          emailVerified: false,
        }),
      });
    });

    it('should normalize email to lowercase', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);
      mockPrisma.member.create.mockResolvedValue({
        id: 'new-member-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'MEMBER',
      });

      const caller = createTestCaller(leadUser);
      await caller.invitations.create({
        email: 'Test@Example.COM',
        name: 'Test',
      });

      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrisma.member.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      });
    });

    it('should re-send invite for existing member without password', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'existing-1',
        email: 'existing@example.com',
        name: 'Existing User',
        role: 'MEMBER',
        passwordHash: null,
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.create({
        email: 'existing@example.com',
        name: 'Existing User',
      });

      expect(result.resent).toBe(true);
      expect(result.member.id).toBe('existing-1');
      expect(result.inviteToken).toBe('mock-invite-token');
      expect(mockPrisma.member.create).not.toHaveBeenCalled();
    });

    it('should throw CONFLICT for existing member who accepted invite', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'existing-1',
        email: 'existing@example.com',
        name: 'Existing User',
        role: 'MEMBER',
        passwordHash: 'some-hash',
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.invitations.create({
          email: 'existing@example.com',
          name: 'Existing User',
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('should create member with optional fields', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);
      mockPrisma.member.create.mockResolvedValue({
        id: 'new-member-1',
        email: 'newbie@example.com',
        name: 'New Member',
        role: 'MANAGER',
        playaName: 'Dusty',
        phone: '555-1234',
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.create({
        email: 'newbie@example.com',
        name: 'New Member',
        role: 'MANAGER',
        playaName: 'Dusty',
        phone: '555-1234',
      });

      expect(result.member.role).toBe('MANAGER');
      expect(mockPrisma.member.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'MANAGER',
          playaName: 'Dusty',
          phone: '555-1234',
        }),
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.invitations.create({ email: 'test@example.com', name: 'Test' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.invitations.create({ email: 'test@example.com', name: 'Test' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.invitations.create({ email: 'test@example.com', name: 'Test' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // bulkCreate
  // ----------------------------------------------------------------
  describe('bulkCreate', () => {
    it('should create multiple invitations', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);
      mockPrisma.member.create
        .mockResolvedValueOnce({ id: 'new-1', email: 'a@example.com', name: 'A', role: 'MEMBER' })
        .mockResolvedValueOnce({ id: 'new-2', email: 'b@example.com', name: 'B', role: 'MEMBER' });

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.bulkCreate({
        invites: [
          { email: 'a@example.com', name: 'A' },
          { email: 'b@example.com', name: 'B' },
        ],
      });

      expect(result.summary.created).toBe(2);
      expect(result.summary.errors).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].status).toBe('created');
      expect(result.results[1].status).toBe('created');
    });

    it('should handle partial failures with existing members', async () => {
      // First invite: existing member without password (resend)
      mockPrisma.member.findUnique
        .mockResolvedValueOnce({ id: 'existing-1', email: 'existing@example.com', passwordHash: null })
        .mockResolvedValueOnce({ id: 'existing-2', email: 'active@example.com', passwordHash: 'hash' })
        .mockResolvedValueOnce(null);

      mockPrisma.member.create.mockResolvedValue({
        id: 'new-1',
        email: 'new@example.com',
        name: 'New',
        role: 'MEMBER',
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.bulkCreate({
        invites: [
          { email: 'existing@example.com', name: 'Existing' },
          { email: 'active@example.com', name: 'Active' },
          { email: 'new@example.com', name: 'New' },
        ],
      });

      expect(result.summary.resent).toBe(1);
      expect(result.summary.skipped).toBe(1);
      expect(result.summary.created).toBe(1);
      expect(result.summary.errors).toBe(0);
    });

    it('should handle errors in individual invitations', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);
      mockPrisma.member.create
        .mockResolvedValueOnce({ id: 'new-1', email: 'a@example.com', name: 'A', role: 'MEMBER' })
        .mockRejectedValueOnce(new Error('DB error'));

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.bulkCreate({
        invites: [
          { email: 'a@example.com', name: 'A' },
          { email: 'b@example.com', name: 'B' },
        ],
      });

      expect(result.summary.created).toBe(1);
      expect(result.summary.errors).toBe(1);
      expect(result.results[1].status).toBe('error');
      expect(result.results[1].error).toBe('DB error');
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.invitations.bulkCreate({
          invites: [{ email: 'a@example.com', name: 'A' }],
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.invitations.bulkCreate({
          invites: [{ email: 'a@example.com', name: 'A' }],
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // validate
  // ----------------------------------------------------------------
  describe('validate', () => {
    it('should return valid for a pending invite', async () => {
      const token = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!
      );

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
        passwordHash: null,
        isActive: true,
      });

      const caller = createTestCaller();
      const result = await caller.invitations.validate({ token });

      expect(result.valid).toBe(true);
      expect(result.accepted).toBe(false);
      expect(result.member.email).toBe('test@example.com');
      expect(result.member.name).toBe('Test User');
      expect(result.member.role).toBe('MEMBER');
    });

    it('should return invalid for already accepted invite', async () => {
      const token = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!
      );

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
        passwordHash: 'some-hash',
        isActive: true,
      });

      const caller = createTestCaller();
      const result = await caller.invitations.validate({ token });

      expect(result.valid).toBe(false);
      expect(result.accepted).toBe(true);
    });

    it('should return invalid for deactivated member', async () => {
      const token = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!
      );

      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
        passwordHash: null,
        isActive: false,
      });

      const caller = createTestCaller();
      const result = await caller.invitations.validate({ token });

      expect(result.valid).toBe(false);
      expect(result.accepted).toBe(false);
      expect(result.message).toContain('deactivated');
    });

    it('should throw BAD_REQUEST for expired token', async () => {
      const token = jwt.sign(
        { memberId: 'member-1', type: 'invite' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' }
      );

      const caller = createTestCaller();
      await expect(
        caller.invitations.validate({ token })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw BAD_REQUEST for invalid token', async () => {
      const caller = createTestCaller();
      await expect(
        caller.invitations.validate({ token: 'not-a-valid-jwt' })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw BAD_REQUEST for wrong token type', async () => {
      const token = jwt.sign(
        { memberId: 'member-1', type: 'reset' },
        process.env.JWT_SECRET!
      );

      const caller = createTestCaller();
      await expect(
        caller.invitations.validate({ token })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND when member does not exist', async () => {
      const token = jwt.sign(
        { memberId: 'nonexistent', type: 'invite' },
        process.env.JWT_SECRET!
      );

      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller();
      await expect(
        caller.invitations.validate({ token })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  // ----------------------------------------------------------------
  // listPending
  // ----------------------------------------------------------------
  describe('listPending', () => {
    it('should return paginated pending invitations', async () => {
      const mockInvitations = [
        {
          id: 'member-1',
          email: 'pending@example.com',
          name: 'Pending User',
          role: 'MEMBER',
          playaName: null,
          createdAt: new Date('2025-01-01'),
        },
      ];

      mockPrisma.member.findMany.mockResolvedValue(mockInvitations);
      mockPrisma.member.count.mockResolvedValue(1);

      const caller = createTestCaller(managerUser);
      const result = await caller.invitations.listPending();

      expect(result.invitations).toEqual(mockInvitations);
      expect(result.total).toBe(1);
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            passwordHash: null,
            isActive: true,
          }),
          take: 50,
          skip: 0,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should filter by search query', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.invitations.listPending({ search: 'alice' });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'alice', mode: 'insensitive' } },
              { email: { contains: 'alice', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should support custom pagination', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(100);

      const caller = createTestCaller(managerUser);
      await caller.invitations.listPending({ limit: 10, offset: 20 });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 20 })
      );
    });

    it('should allow LEAD role', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.listPending();

      expect(result.invitations).toEqual([]);
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.invitations.listPending()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.invitations.listPending()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  // ----------------------------------------------------------------
  // resend
  // ----------------------------------------------------------------
  describe('resend', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';

    it('should resend invite for pending member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: memberId,
        email: 'pending@example.com',
        name: 'Pending User',
        passwordHash: null,
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.resend({ memberId });

      expect(result.memberId).toBe(memberId);
      expect(result.email).toBe('pending@example.com');
      expect(result.inviteToken).toBe('mock-invite-token');
    });

    it('should throw BAD_REQUEST for member who already accepted', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: memberId,
        email: 'active@example.com',
        name: 'Active User',
        passwordHash: 'some-hash',
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.invitations.resend({ memberId })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.invitations.resend({ memberId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.invitations.resend({ memberId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.invitations.resend({ memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.invitations.resend({ memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // revoke
  // ----------------------------------------------------------------
  describe('revoke', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';

    it('should revoke a pending invitation', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: memberId,
        email: 'pending@example.com',
        name: 'Pending User',
        passwordHash: null,
      });
      mockPrisma.member.update.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.invitations.revoke({ memberId });

      expect(result.success).toBe(true);
      expect(result.email).toBe('pending@example.com');
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: memberId },
        data: { isActive: false },
      });
    });

    it('should throw BAD_REQUEST for member who already accepted', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: memberId,
        email: 'active@example.com',
        name: 'Active User',
        passwordHash: 'some-hash',
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.invitations.revoke({ memberId })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.invitations.revoke({ memberId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.invitations.revoke({ memberId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.invitations.revoke({ memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.invitations.revoke({ memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });
});
