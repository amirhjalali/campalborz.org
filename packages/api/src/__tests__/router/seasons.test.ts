/**
 * Tests for the seasons tRPC router.
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
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  seasonMember: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    groupBy: jest.fn(),
  },
  payment: {
    aggregate: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
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

import { seasonsRouter } from '../../router/seasons';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ seasons: seasonsRouter });
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

const seasonId = '550e8400-e29b-41d4-a716-446655440001';

describe('seasonsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // list
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return all seasons ordered by year descending', async () => {
      const mockSeasons = [
        { id: 'season-2', year: 2026, name: '2026', isActive: false },
        { id: 'season-1', year: 2025, name: '2025', isActive: true },
      ];

      mockPrisma.season.findMany.mockResolvedValue(mockSeasons);

      const caller = createTestCaller(memberUser);
      const result = await caller.seasons.list();

      expect(result).toEqual(mockSeasons);
      expect(result).toHaveLength(2);
      expect(mockPrisma.season.findMany).toHaveBeenCalledWith({
        orderBy: { year: 'desc' },
      });
    });

    it('should return empty array when no seasons exist', async () => {
      mockPrisma.season.findMany.mockResolvedValue([]);

      const caller = createTestCaller(memberUser);
      const result = await caller.seasons.list();

      expect(result).toEqual([]);
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.seasons.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ----------------------------------------------------------------
  // getCurrent
  // ----------------------------------------------------------------
  describe('getCurrent', () => {
    it('should return the active season', async () => {
      const activeSeason = {
        id: seasonId,
        year: 2025,
        name: '2025',
        isActive: true,
        duesAmount: 500,
      };

      mockPrisma.season.findFirst.mockResolvedValue(activeSeason);

      const caller = createTestCaller(memberUser);
      const result = await caller.seasons.getCurrent();

      expect(result.id).toBe(seasonId);
      expect(result.year).toBe(2025);
      expect(result.isActive).toBe(true);
      expect(mockPrisma.season.findFirst).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should throw NOT_FOUND when no active season exists', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(caller.seasons.getCurrent()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.seasons.getCurrent()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------
  describe('create', () => {
    it('should create a new season', async () => {
      const newSeason = {
        id: seasonId,
        year: 2026,
        name: 'Burning Man 2026',
        duesAmount: 600,
        gridFee30amp: 200,
        gridFee50amp: 350,
        startDate: null,
        endDate: null,
        buildStartDate: null,
        strikeEndDate: null,
        isActive: false,
      };

      mockPrisma.season.create.mockResolvedValue(newSeason);

      const caller = createTestCaller(leadUser);
      const result = await caller.seasons.create({
        year: 2026,
        name: 'Burning Man 2026',
        duesAmount: 600,
        gridFee30amp: 200,
        gridFee50amp: 350,
      });

      expect(result.year).toBe(2026);
      expect(result.name).toBe('Burning Man 2026');
      expect(mockPrisma.season.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          year: 2026,
          name: 'Burning Man 2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        }),
      });
    });

    it('should create a season with date fields', async () => {
      const startDate = '2026-08-24T00:00:00.000Z';
      const endDate = '2026-09-01T00:00:00.000Z';

      mockPrisma.season.create.mockResolvedValue({
        id: seasonId,
        year: 2026,
        name: '2026',
        duesAmount: 600,
        gridFee30amp: 200,
        gridFee50amp: 350,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      const caller = createTestCaller(leadUser);
      await caller.seasons.create({
        year: 2026,
        name: '2026',
        duesAmount: 600,
        gridFee30amp: 200,
        gridFee50amp: 350,
        startDate,
        endDate,
      });

      expect(mockPrisma.season.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
      });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.seasons.create({
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasons.create({
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasons.create({
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // update
  // ----------------------------------------------------------------
  describe('update', () => {
    it('should update season fields', async () => {
      mockPrisma.season.update.mockResolvedValue({
        id: seasonId,
        year: 2025,
        name: 'Updated Season',
        duesAmount: 700,
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.seasons.update({
        id: seasonId,
        name: 'Updated Season',
        duesAmount: 700,
      });

      expect(result.name).toBe('Updated Season');
      expect(result.duesAmount).toBe(700);
      expect(mockPrisma.season.update).toHaveBeenCalledWith({
        where: { id: seasonId },
        data: expect.objectContaining({
          name: 'Updated Season',
          duesAmount: 700,
        }),
      });
    });

    it('should handle date field updates', async () => {
      const startDate = '2025-08-24T00:00:00.000Z';

      mockPrisma.season.update.mockResolvedValue({
        id: seasonId,
        startDate: new Date(startDate),
      });

      const caller = createTestCaller(leadUser);
      await caller.seasons.update({
        id: seasonId,
        startDate,
      });

      expect(mockPrisma.season.update).toHaveBeenCalledWith({
        where: { id: seasonId },
        data: expect.objectContaining({
          startDate: new Date(startDate),
        }),
      });
    });

    it('should allow setting date fields to null', async () => {
      mockPrisma.season.update.mockResolvedValue({
        id: seasonId,
        startDate: null,
        endDate: null,
      });

      const caller = createTestCaller(leadUser);
      await caller.seasons.update({
        id: seasonId,
        startDate: null,
        endDate: null,
      });

      expect(mockPrisma.season.update).toHaveBeenCalledWith({
        where: { id: seasonId },
        data: expect.objectContaining({
          startDate: null,
          endDate: null,
        }),
      });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.seasons.update({ id: seasonId, name: 'Updated' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasons.update({ id: seasonId, name: 'Updated' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // activate
  // ----------------------------------------------------------------
  describe('activate', () => {
    it('should deactivate all seasons then activate the target', async () => {
      mockPrisma.season.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.season.update.mockResolvedValue({
        id: seasonId,
        year: 2025,
        name: '2025',
        isActive: true,
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.seasons.activate({ id: seasonId });

      expect(result.isActive).toBe(true);
      expect(mockPrisma.season.updateMany).toHaveBeenCalledWith({
        data: { isActive: false },
      });
      expect(mockPrisma.season.update).toHaveBeenCalledWith({
        where: { id: seasonId },
        data: { isActive: true },
      });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.seasons.activate({ id: seasonId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasons.activate({ id: seasonId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasons.activate({ id: seasonId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // rollover
  // ----------------------------------------------------------------
  describe('rollover', () => {
    const fromSeasonId = '550e8400-e29b-41d4-a716-446655440010';

    it('should create a new season and enroll members from source', async () => {
      mockPrisma.season.findUnique
        .mockResolvedValueOnce({ id: fromSeasonId, year: 2025, name: '2025' })
        .mockResolvedValueOnce(null);

      const newSeason = {
        id: seasonId,
        year: 2026,
        name: '2026',
        duesAmount: 600,
        gridFee30amp: 200,
        gridFee50amp: 350,
        isActive: false,
      };
      mockPrisma.season.create.mockResolvedValue(newSeason);
      mockPrisma.seasonMember.findMany.mockResolvedValue([
        { memberId: 'member-a' },
        { memberId: 'member-b' },
      ]);
      mockPrisma.seasonMember.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.seasons.rollover({
        fromSeasonId,
        year: 2026,
        name: '2026',
        duesAmount: 600,
        gridFee30amp: 200,
        gridFee50amp: 350,
      });

      expect(result.season.year).toBe(2026);
      expect(result.membersEnrolled).toBe(2);
      expect(mockPrisma.seasonMember.createMany).toHaveBeenCalledWith({
        data: [
          { seasonId, memberId: 'member-a', status: 'INTERESTED' },
          { seasonId, memberId: 'member-b', status: 'INTERESTED' },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw NOT_FOUND when source season does not exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.seasons.rollover({
          fromSeasonId,
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw CONFLICT when target year already exists', async () => {
      mockPrisma.season.findUnique
        .mockResolvedValueOnce({ id: fromSeasonId, year: 2025, name: '2025' })
        .mockResolvedValueOnce({ id: 'existing', year: 2026, name: '2026' });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.seasons.rollover({
          fromSeasonId,
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.seasons.rollover({
          fromSeasonId,
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasons.rollover({
          fromSeasonId,
          year: 2026,
          name: '2026',
          duesAmount: 600,
          gridFee30amp: 200,
          gridFee50amp: 350,
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // getStats
  // ----------------------------------------------------------------
  describe('getStats', () => {
    it('should return season statistics', async () => {
      mockPrisma.seasonMember.groupBy
        .mockResolvedValueOnce([
          { status: 'CONFIRMED', _count: 15 },
          { status: 'INTERESTED', _count: 5 },
          { status: 'CANCELLED', _count: 2 },
        ])
        .mockResolvedValueOnce([
          { housingType: 'RV', _count: 8 },
          { housingType: 'TENT', _count: 5 },
        ]);

      mockPrisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: 7500 },
        _count: 15,
      });

      const caller = createTestCaller(managerUser);
      const result = await caller.seasons.getStats({ seasonId });

      expect(result.membersByStatus).toEqual({
        CONFIRMED: 15,
        INTERESTED: 5,
        CANCELLED: 2,
      });
      expect(result.housingBreakdown).toEqual({
        RV: 8,
        TENT: 5,
      });
      expect(result.totalMembers).toBe(22);
      expect(result.totalCollected).toBe(7500);
      expect(result.totalPayments).toBe(15);
    });

    it('should handle empty stats', async () => {
      mockPrisma.seasonMember.groupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: 0,
      });

      const caller = createTestCaller(managerUser);
      const result = await caller.seasons.getStats({ seasonId });

      expect(result.totalMembers).toBe(0);
      expect(result.totalCollected).toBe(0);
      expect(result.totalPayments).toBe(0);
    });

    it('should allow LEAD role', async () => {
      mockPrisma.seasonMember.groupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: 0,
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.seasons.getStats({ seasonId });

      expect(result.totalMembers).toBe(0);
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasons.getStats({ seasonId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasons.getStats({ seasonId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
