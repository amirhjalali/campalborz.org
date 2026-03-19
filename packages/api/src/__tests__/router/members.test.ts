/**
 * Tests for the members tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma mocked to avoid database access.
 */

import { TRPCError } from '@trpc/server';

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
    delete: jest.fn(),
    groupBy: jest.fn(),
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

// Mock the signInviteToken from auth router (used by invite)
jest.mock('../../router/auth', () => ({
  signInviteToken: jest.fn().mockReturnValue('mock-invite-token'),
}));

import { membersRouter } from '../../router/members';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ members: membersRouter });
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

describe('membersRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // list
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return paginated members with defaults', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          email: 'alice@example.com',
          name: 'Alice',
          playaName: 'Sparky',
          phone: '555-0001',
          role: 'MEMBER',
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.member.findMany.mockResolvedValue(mockMembers);
      mockPrisma.member.count.mockResolvedValue(1);

      const caller = createTestCaller(managerUser);
      const result = await caller.members.list();

      expect(result.members).toEqual(mockMembers);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should filter by search query across name, email, and playaName', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.members.list({ search: 'alice' });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'alice', mode: 'insensitive' } },
              { email: { contains: 'alice', mode: 'insensitive' } },
              { playaName: { contains: 'alice', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should filter by role', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.members.list({ role: 'MANAGER' });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'MANAGER' }),
        })
      );
    });

    it('should filter by isActive status', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.members.list({ isActive: false });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        })
      );
    });

    it('should support custom pagination', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(100);

      const caller = createTestCaller(managerUser);
      const result = await caller.members.list({ limit: 10, offset: 30 });

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(30);
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 30 })
      );
    });

    it('should support custom sorting', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.members.list({ sortBy: 'createdAt', sortOrder: 'desc' });

      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.members.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.members.list()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should allow LEAD role', async () => {
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(leadUser);
      const result = await caller.members.list();

      expect(result.members).toEqual([]);
    });
  });

  // ----------------------------------------------------------------
  // getById
  // ----------------------------------------------------------------
  describe('getById', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return member with season history', async () => {
      const mockMember = {
        id: memberId,
        email: 'alice@example.com',
        name: 'Alice',
        playaName: 'Sparky',
        role: 'MEMBER',
        isActive: true,
        passwordHash: 'secret-hash-should-be-omitted',
        seasonMembers: [
          {
            season: { id: 's-1', year: 2025, name: '2025', isActive: true },
            payments: [],
          },
        ],
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);

      const caller = createTestCaller(managerUser);
      const result = await caller.members.getById({ id: memberId });

      // passwordHash should be stripped
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe(memberId);
      expect(result.name).toBe('Alice');
      expect(result.seasonMembers).toHaveLength(1);
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.members.getById({ id: memberId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject invalid UUID', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.members.getById({ id: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.members.getById({ id: memberId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.members.getById({ id: memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // updateRole
  // ----------------------------------------------------------------
  describe('updateRole', () => {
    const targetMemberId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a member role', async () => {
      const mockMember = {
        id: targetMemberId,
        email: 'alice@example.com',
        name: 'Alice',
        role: 'MEMBER',
      };

      const updatedMember = {
        id: targetMemberId,
        email: 'alice@example.com',
        name: 'Alice',
        role: 'MANAGER',
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);
      mockPrisma.member.update.mockResolvedValue(updatedMember);

      const caller = createTestCaller(leadUser);
      const result = await caller.members.updateRole({
        memberId: targetMemberId,
        role: 'MANAGER',
      });

      expect(result.role).toBe('MANAGER');
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: targetMemberId },
        data: { role: 'MANAGER' },
        select: { id: true, email: true, name: true, role: true },
      });
    });

    it('should throw BAD_REQUEST when changing own role', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.updateRole({
          memberId: leadUser.id,
          role: 'MEMBER',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.updateRole({ memberId: targetMemberId, role: 'MANAGER' })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.members.updateRole({ memberId: targetMemberId, role: 'MANAGER' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.members.updateRole({ memberId: targetMemberId, role: 'MANAGER' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.members.updateRole({ memberId: targetMemberId, role: 'MANAGER' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // deactivate
  // ----------------------------------------------------------------
  describe('deactivate', () => {
    const targetMemberId = '550e8400-e29b-41d4-a716-446655440000';

    it('should deactivate an active member', async () => {
      const mockMember = {
        id: targetMemberId,
        email: 'alice@example.com',
        name: 'Alice',
        isActive: true,
      };

      const updatedMember = {
        id: targetMemberId,
        email: 'alice@example.com',
        name: 'Alice',
        isActive: false,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);
      mockPrisma.member.update.mockResolvedValue(updatedMember);

      const caller = createTestCaller(leadUser);
      const result = await caller.members.deactivate({ memberId: targetMemberId });

      expect(result.isActive).toBe(false);
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: targetMemberId },
        data: { isActive: false },
        select: { id: true, email: true, name: true, isActive: true },
      });
    });

    it('should throw BAD_REQUEST when deactivating self', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.deactivate({ memberId: leadUser.id })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.deactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST if member is already deactivated', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: targetMemberId,
        email: 'alice@example.com',
        isActive: false,
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.deactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.members.deactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.members.deactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // reactivate
  // ----------------------------------------------------------------
  describe('reactivate', () => {
    const targetMemberId = '550e8400-e29b-41d4-a716-446655440000';

    it('should reactivate a deactivated member', async () => {
      const mockMember = {
        id: targetMemberId,
        email: 'alice@example.com',
        name: 'Alice',
        isActive: false,
      };

      const updatedMember = {
        id: targetMemberId,
        email: 'alice@example.com',
        name: 'Alice',
        isActive: true,
      };

      mockPrisma.member.findUnique.mockResolvedValue(mockMember);
      mockPrisma.member.update.mockResolvedValue(updatedMember);

      const caller = createTestCaller(leadUser);
      const result = await caller.members.reactivate({ memberId: targetMemberId });

      expect(result.isActive).toBe(true);
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: targetMemberId },
        data: { isActive: true },
        select: { id: true, email: true, name: true, isActive: true },
      });
    });

    it('should throw NOT_FOUND for non-existent member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.reactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST if member is already active', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({
        id: targetMemberId,
        email: 'alice@example.com',
        isActive: true,
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.members.reactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.members.reactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.members.reactivate({ memberId: targetMemberId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // getMyProfile
  // ----------------------------------------------------------------
  describe('getMyProfile', () => {
    it('should return profile for authenticated member', async () => {
      const profileData = {
        id: memberUser.id,
        email: memberUser.email,
        name: memberUser.name,
        playaName: 'Dusty',
        phone: '555-0100',
        gender: 'MALE',
        role: 'MEMBER',
        isActive: true,
        emailVerified: true,
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '555-0101',
        dietaryRestrictions: null,
        createdAt: new Date('2024-01-01'),
      };

      mockPrisma.member.findUnique.mockResolvedValue(profileData);

      const caller = createTestCaller(memberUser);
      const result = await caller.members.getMyProfile();

      expect(result).toEqual(profileData);
      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: memberUser.id },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          role: true,
        }),
      });
    });

    it('should throw NOT_FOUND when member does not exist', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(caller.members.getMyProfile()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.members.getMyProfile()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ----------------------------------------------------------------
  // updateMyProfile
  // ----------------------------------------------------------------
  describe('updateMyProfile', () => {
    it('should update own profile fields', async () => {
      const updatedProfile = {
        id: memberUser.id,
        email: memberUser.email,
        name: 'Updated Name',
        playaName: 'New Playa Name',
        phone: '555-9999',
        gender: 'MALE',
        role: 'MEMBER',
        emergencyContactName: 'Emergency Person',
        emergencyContactPhone: '555-0000',
        dietaryRestrictions: 'Vegetarian',
      };

      mockPrisma.member.update.mockResolvedValue(updatedProfile);

      const caller = createTestCaller(memberUser);
      const result = await caller.members.updateMyProfile({
        name: 'Updated Name',
        playaName: 'New Playa Name',
        phone: '555-9999',
        dietaryRestrictions: 'Vegetarian',
      });

      expect(result.name).toBe('Updated Name');
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: memberUser.id },
        data: expect.objectContaining({
          name: 'Updated Name',
          playaName: 'New Playa Name',
        }),
        select: expect.any(Object),
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.members.updateMyProfile({ name: 'New Name' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // getCounts
  // ----------------------------------------------------------------
  describe('getCounts', () => {
    it('should return member counts by status and role', async () => {
      mockPrisma.member.count
        .mockResolvedValueOnce(25)  // total
        .mockResolvedValueOnce(20)  // active
        .mockResolvedValueOnce(5);  // inactive

      mockPrisma.member.groupBy.mockResolvedValue([
        { role: 'LEAD', _count: 2 },
        { role: 'MANAGER', _count: 3 },
        { role: 'MEMBER', _count: 20 },
      ]);

      const caller = createTestCaller(managerUser);
      const result = await caller.members.getCounts();

      expect(result.total).toBe(25);
      expect(result.active).toBe(20);
      expect(result.inactive).toBe(5);
      expect(result.byRole).toEqual({
        LEAD: 2,
        MANAGER: 3,
        MEMBER: 20,
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.members.getCounts()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.members.getCounts()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
