/**
 * Tests for the dashboard tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma mocked to avoid database access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  season: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  seasonMember: {
    findUnique: jest.fn(),
    groupBy: jest.fn(),
  },
  payment: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  member: {
    count: jest.fn(),
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
    security: jest.fn(),
  },
}));

import { dashboardRouter } from '../../router/dashboard';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ dashboard: dashboardRouter });
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

const seasonId = '550e8400-e29b-41d4-a716-446655440000';

describe('dashboardRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // getAdminDashboard (lead only)
  // ----------------------------------------------------------------
  describe('getAdminDashboard', () => {
    function setupMockDashboardData() {
      const mockSeason = {
        id: seasonId,
        year: 2025,
        name: 'Burning Man 2025',
        isActive: true,
        duesAmount: 300,
        startDate: new Date('2025-08-24'),
        endDate: new Date('2025-09-01'),
      };

      mockPrisma.season.findFirst.mockResolvedValue(mockSeason);
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);

      mockPrisma.seasonMember.groupBy
        .mockResolvedValueOnce([
          { status: 'CONFIRMED', _count: 15 },
          { status: 'REGISTERED', _count: 5 },
          { status: 'CANCELLED', _count: 2 },
        ])
        .mockResolvedValueOnce([
          { housingType: 'RV', _count: 8 },
          { housingType: 'TENT', _count: 10 },
          { housingType: 'YURT', _count: 2 },
        ]);

      mockPrisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: 4500 },
        _count: 18,
      });

      mockPrisma.payment.findMany.mockResolvedValue([
        {
          id: 'pay-1',
          amount: 300,
          type: 'DUES',
          method: 'ZELLE',
          paidAt: new Date('2025-06-15'),
          seasonMember: {
            member: { name: 'Alice', playaName: 'Sparkle' },
          },
        },
        {
          id: 'pay-2',
          amount: 150,
          type: 'DUES',
          method: 'CASH',
          paidAt: new Date('2025-06-14'),
          seasonMember: {
            member: { name: 'Bob', playaName: 'Dusty' },
          },
        },
      ]);

      mockPrisma.member.count.mockResolvedValue(25);

      return mockSeason;
    }

    it('should return aggregated dashboard stats for the active season', async () => {
      setupMockDashboardData();

      const caller = createTestCaller(leadUser);
      const result = await caller.dashboard.getAdminDashboard();

      expect(result.season).toBeDefined();
      expect(result.season!.id).toBe(seasonId);
      expect(result.totalActiveMembers).toBe(25);

      // Members by status
      expect(result.membersByStatus).toEqual({
        CONFIRMED: 15,
        REGISTERED: 5,
        CANCELLED: 2,
      });

      // Housing breakdown
      expect(result.housingBreakdown).toEqual({
        RV: 8,
        TENT: 10,
        YURT: 2,
      });

      // Financial data
      expect(result.financial.totalCollected).toBe(4500);
      expect(result.financial.totalPayments).toBe(18);

      // Recent payments
      expect(result.recentPayments).toHaveLength(2);
      expect(result.recentPayments[0]).toEqual(
        expect.objectContaining({
          id: 'pay-1',
          amount: 300,
          type: 'DUES',
          memberName: 'Alice',
          playaName: 'Sparkle',
        })
      );
    });

    it('should accept an explicit seasonId', async () => {
      setupMockDashboardData();

      const caller = createTestCaller(leadUser);
      await caller.dashboard.getAdminDashboard({ seasonId });

      // Should NOT call findFirst since we provided a seasonId
      expect(mockPrisma.season.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.season.findUnique).toHaveBeenCalledWith({
        where: { id: seasonId },
      });
    });

    it('should auto-resolve active season when no seasonId is provided', async () => {
      setupMockDashboardData();

      const caller = createTestCaller(leadUser);
      await caller.dashboard.getAdminDashboard();

      expect(mockPrisma.season.findFirst).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { id: true },
      });
    });

    it('should throw NOT_FOUND when no active season exists', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.dashboard.getAdminDashboard()
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should handle empty state (no members, no payments)', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.season.findUnique.mockResolvedValue({
        id: seasonId,
        year: 2025,
        name: 'Empty Season',
        isActive: true,
        duesAmount: 300,
      });
      mockPrisma.seasonMember.groupBy
        .mockResolvedValueOnce([])   // no members by status
        .mockResolvedValueOnce([]);  // no housing breakdown
      mockPrisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: 0,
      });
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.member.count.mockResolvedValue(0);

      const caller = createTestCaller(leadUser);
      const result = await caller.dashboard.getAdminDashboard();

      expect(result.totalActiveMembers).toBe(0);
      expect(result.membersByStatus).toEqual({});
      expect(result.housingBreakdown).toEqual({});
      expect(result.financial.totalCollected).toBe(0);
      expect(result.financial.totalPayments).toBe(0);
      expect(result.recentPayments).toHaveLength(0);
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.dashboard.getAdminDashboard()
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.dashboard.getAdminDashboard()
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.dashboard.getAdminDashboard()
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // getMemberDashboard (member+ only)
  // ----------------------------------------------------------------
  describe('getMemberDashboard', () => {
    it('should return season and enrollment data for enrolled member', async () => {
      const activeSeason = {
        id: seasonId,
        year: 2025,
        name: 'Burning Man 2025',
        isActive: true,
        duesAmount: 300,
        startDate: new Date('2025-08-24'),
        endDate: new Date('2025-09-01'),
        buildStartDate: new Date('2025-08-20'),
        strikeEndDate: new Date('2025-09-03'),
      };

      const enrollment = {
        id: 'sm-1',
        seasonId,
        memberId: memberUser.id,
        status: 'CONFIRMED',
      };

      const payments = [
        { id: 'pay-1', amount: 200, type: 'DUES', paidAt: new Date('2025-06-01') },
        { id: 'pay-2', amount: 100, type: 'DUES', paidAt: new Date('2025-06-15') },
      ];

      mockPrisma.season.findFirst.mockResolvedValue(activeSeason);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(enrollment);
      mockPrisma.payment.findMany.mockResolvedValue(payments);

      const caller = createTestCaller(memberUser);
      const result = await caller.dashboard.getMemberDashboard();

      expect(result.season).toBeDefined();
      expect(result.season!.id).toBe(seasonId);
      expect(result.season!.year).toBe(2025);
      expect(result.enrollment).toEqual(enrollment);
      expect(result.payments).toHaveLength(2);
      expect(result.duesStatus).toEqual({
        required: 300,
        paid: 300,
        remaining: 0,
        isPaid: true,
      });
    });

    it('should return null enrollment when member is not enrolled', async () => {
      const activeSeason = {
        id: seasonId,
        year: 2025,
        name: 'Burning Man 2025',
        isActive: true,
        duesAmount: 300,
        startDate: new Date('2025-08-24'),
        endDate: new Date('2025-09-01'),
        buildStartDate: new Date('2025-08-20'),
        strikeEndDate: new Date('2025-09-03'),
      };

      mockPrisma.season.findFirst.mockResolvedValue(activeSeason);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.dashboard.getMemberDashboard();

      expect(result.season).toBeDefined();
      expect(result.enrollment).toBeNull();
      expect(result.payments).toEqual([]);
      expect(result.duesStatus).toBeNull();
    });

    it('should return all nulls when no active season exists', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.dashboard.getMemberDashboard();

      expect(result.season).toBeNull();
      expect(result.enrollment).toBeNull();
      expect(result.payments).toEqual([]);
      expect(result.duesStatus).toBeNull();
    });

    it('should calculate remaining dues correctly for partial payment', async () => {
      const activeSeason = {
        id: seasonId,
        year: 2025,
        name: 'Burning Man 2025',
        isActive: true,
        duesAmount: 300,
        startDate: new Date('2025-08-24'),
        endDate: new Date('2025-09-01'),
        buildStartDate: new Date('2025-08-20'),
        strikeEndDate: new Date('2025-09-03'),
      };

      const enrollment = {
        id: 'sm-1',
        seasonId,
        memberId: memberUser.id,
        status: 'REGISTERED',
      };

      const payments = [
        { id: 'pay-1', amount: 100, type: 'DUES', paidAt: new Date('2025-06-01') },
        { id: 'pay-2', amount: 50, type: 'DONATION', paidAt: new Date('2025-06-10') }, // Not DUES
      ];

      mockPrisma.season.findFirst.mockResolvedValue(activeSeason);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(enrollment);
      mockPrisma.payment.findMany.mockResolvedValue(payments);

      const caller = createTestCaller(memberUser);
      const result = await caller.dashboard.getMemberDashboard();

      // Only the DUES payment of 100 counts
      expect(result.duesStatus).toEqual({
        required: 300,
        paid: 100,
        remaining: 200,
        isPaid: false,
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.dashboard.getMemberDashboard()
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
