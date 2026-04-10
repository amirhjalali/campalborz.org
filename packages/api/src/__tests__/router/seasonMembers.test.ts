/**
 * Tests for the seasonMembers tRPC router.
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
  },
  seasonMember: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
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
    security: jest.fn(),
  },
}));

import { seasonMembersRouter } from '../../router/seasonMembers';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ seasonMembers: seasonMembersRouter });
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
const memberId = '550e8400-e29b-41d4-a716-446655440002';
const smId = '550e8400-e29b-41d4-a716-446655440003';

describe('seasonMembersRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // list
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return paginated season members for active season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      const mockSeasonMembers = [
        {
          id: smId,
          seasonId,
          memberId,
          status: 'CONFIRMED',
          member: { id: memberId, email: 'alice@example.com', name: 'Alice', playaName: 'Sparky', phone: '555', role: 'MEMBER' },
        },
      ];
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);
      mockPrisma.seasonMember.count.mockResolvedValue(1);

      const caller = createTestCaller(managerUser);
      const result = await caller.seasonMembers.list();

      expect(result.seasonMembers).toEqual(mockSeasonMembers);
      expect(result.total).toBe(1);
      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId },
          take: 50,
          skip: 0,
        })
      );
    });

    it('should use provided seasonId instead of active season', async () => {
      const customSeasonId = '550e8400-e29b-41d4-a716-446655440099';
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.seasonMembers.list({ seasonId: customSeasonId });

      expect(mockPrisma.season.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ seasonId: customSeasonId }),
        })
      );
    });

    it('should throw NOT_FOUND when no active season exists', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(caller.seasonMembers.list()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should filter by status', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.seasonMembers.list({ status: 'CONFIRMED' });

      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'CONFIRMED' }),
        })
      );
    });

    it('should filter by housingType', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.seasonMembers.list({ housingType: 'RV' });

      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ housingType: 'RV' }),
        })
      );
    });

    it('should filter by search query', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.seasonMembers.list({ search: 'alice' });

      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            member: {
              OR: [
                { name: { contains: 'alice', mode: 'insensitive' } },
                { email: { contains: 'alice', mode: 'insensitive' } },
                { playaName: { contains: 'alice', mode: 'insensitive' } },
              ],
            },
          }),
        })
      );
    });

    it('should support custom pagination', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.count.mockResolvedValue(100);

      const caller = createTestCaller(managerUser);
      await caller.seasonMembers.list({ limit: 10, offset: 30 });

      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 30 })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.seasonMembers.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.seasonMembers.list()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  // ----------------------------------------------------------------
  // getById
  // ----------------------------------------------------------------
  describe('getById', () => {
    it('should return season member with details', async () => {
      const mockSM = {
        id: smId,
        seasonId,
        memberId,
        status: 'CONFIRMED',
        member: {
          id: memberId,
          email: 'alice@example.com',
          name: 'Alice',
          playaName: 'Sparky',
          phone: '555',
          gender: 'FEMALE',
          role: 'MEMBER',
          emergencyContactName: 'Bob',
          emergencyContactPhone: '555-0001',
          dietaryRestrictions: null,
        },
        payments: [],
        season: { id: seasonId, year: 2025, name: '2025' },
      };

      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSM);

      const caller = createTestCaller(managerUser);
      const result = await caller.seasonMembers.getById({ id: smId });

      expect(result.id).toBe(smId);
      expect(result.member.name).toBe('Alice');
      expect(result.season.year).toBe(2025);
    });

    it('should throw NOT_FOUND for non-existent season member', async () => {
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.seasonMembers.getById({ id: smId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.getById({ id: smId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.getById({ id: smId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // enroll
  // ----------------------------------------------------------------
  describe('enroll', () => {
    it('should enroll a new member in a season', async () => {
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);
      mockPrisma.seasonMember.create.mockResolvedValue({
        id: smId,
        seasonId,
        memberId,
        status: 'INTERESTED',
        member: { id: memberId, name: 'Alice', email: 'alice@example.com' },
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.seasonMembers.enroll({ seasonId, memberId });

      expect(result.status).toBe('INTERESTED');
      expect(result.member.name).toBe('Alice');
      expect(mockPrisma.seasonMember.create).toHaveBeenCalledWith({
        data: {
          seasonId,
          memberId,
          status: 'INTERESTED',
        },
        include: {
          member: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it('should throw CONFLICT for duplicate enrollment', async () => {
      mockPrisma.seasonMember.findUnique.mockResolvedValue({
        id: smId,
        seasonId,
        memberId,
        status: 'CONFIRMED',
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.seasonMembers.enroll({ seasonId, memberId })
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.enroll({ seasonId, memberId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.seasonMembers.enroll({ seasonId, memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.enroll({ seasonId, memberId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // bulkEnroll
  // ----------------------------------------------------------------
  describe('bulkEnroll', () => {
    const memberIds = [
      '550e8400-e29b-41d4-a716-446655440010',
      '550e8400-e29b-41d4-a716-446655440011',
      '550e8400-e29b-41d4-a716-446655440012',
    ];

    it('should enroll multiple members skipping existing', async () => {
      mockPrisma.seasonMember.findMany.mockResolvedValue([
        { memberId: memberIds[0] },
      ]);
      mockPrisma.seasonMember.createMany.mockResolvedValue({ count: 2 });

      const caller = createTestCaller(leadUser);
      const result = await caller.seasonMembers.bulkEnroll({ seasonId, memberIds });

      expect(result.created).toBe(2);
      expect(result.skipped).toBe(1);
      expect(mockPrisma.seasonMember.createMany).toHaveBeenCalledWith({
        data: [
          { seasonId, memberId: memberIds[1], status: 'INTERESTED' },
          { seasonId, memberId: memberIds[2], status: 'INTERESTED' },
        ],
      });
    });

    it('should return zero created when all already enrolled', async () => {
      mockPrisma.seasonMember.findMany.mockResolvedValue(
        memberIds.map((id) => ({ memberId: id }))
      );

      const caller = createTestCaller(leadUser);
      const result = await caller.seasonMembers.bulkEnroll({ seasonId, memberIds });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(3);
      expect(mockPrisma.seasonMember.createMany).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.bulkEnroll({ seasonId, memberIds })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.bulkEnroll({ seasonId, memberIds })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // updateStatus
  // ----------------------------------------------------------------
  describe('updateStatus', () => {
    it('should update status of a season member', async () => {
      mockPrisma.seasonMember.update.mockResolvedValue({
        id: smId,
        status: 'CONFIRMED',
      });

      const caller = createTestCaller(managerUser);
      const result = await caller.seasonMembers.updateStatus({
        id: smId,
        status: 'CONFIRMED',
      });

      expect(result.status).toBe('CONFIRMED');
      expect(mockPrisma.seasonMember.update).toHaveBeenCalledWith({
        where: { id: smId },
        data: { status: 'CONFIRMED' },
      });
    });

    it('should allow LEAD role', async () => {
      mockPrisma.seasonMember.update.mockResolvedValue({
        id: smId,
        status: 'CANCELLED',
      });

      const caller = createTestCaller(leadUser);
      const result = await caller.seasonMembers.updateStatus({
        id: smId,
        status: 'CANCELLED',
      });

      expect(result.status).toBe('CANCELLED');
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.updateStatus({ id: smId, status: 'CONFIRMED' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.updateStatus({ id: smId, status: 'CONFIRMED' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // updateHousing
  // ----------------------------------------------------------------
  describe('updateHousing', () => {
    it('should update housing data for a season member', async () => {
      mockPrisma.seasonMember.update.mockResolvedValue({
        id: smId,
        housingType: 'RV',
        housingSize: '24ft',
        gridPower: 'AMP_30',
      });

      const caller = createTestCaller(managerUser);
      const result = await caller.seasonMembers.updateHousing({
        id: smId,
        housingType: 'RV',
        housingSize: '24ft',
        gridPower: 'AMP_30',
      });

      expect(result.housingType).toBe('RV');
      expect(result.gridPower).toBe('AMP_30');
      expect(mockPrisma.seasonMember.update).toHaveBeenCalledWith({
        where: { id: smId },
        data: {
          housingType: 'RV',
          housingSize: '24ft',
          gridPower: 'AMP_30',
        },
      });
    });

    it('should allow setting housingType to null', async () => {
      mockPrisma.seasonMember.update.mockResolvedValue({
        id: smId,
        housingType: null,
      });

      const caller = createTestCaller(managerUser);
      await caller.seasonMembers.updateHousing({
        id: smId,
        housingType: null,
      });

      expect(mockPrisma.seasonMember.update).toHaveBeenCalledWith({
        where: { id: smId },
        data: { housingType: null },
      });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.updateHousing({ id: smId, housingType: 'TENT' })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.updateHousing({ id: smId, housingType: 'TENT' })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // getMySeasonStatus
  // ----------------------------------------------------------------
  describe('getMySeasonStatus', () => {
    it('should return season status for authenticated user', async () => {
      const activeSeason = {
        id: seasonId,
        year: 2025,
        name: '2025',
        duesAmount: 500,
        startDate: new Date('2025-08-24'),
        endDate: new Date('2025-09-01'),
      };
      mockPrisma.season.findFirst.mockResolvedValue(activeSeason);

      const mockSM = {
        id: smId,
        seasonId,
        memberId: memberUser.id,
        status: 'CONFIRMED',
        payments: [],
      };
      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSM);

      const caller = createTestCaller(memberUser);
      const result = await caller.seasonMembers.getMySeasonStatus();

      expect(result).not.toBeNull();
      expect(result!.status).toBe('CONFIRMED');
      expect(result!.season.year).toBe(2025);
    });

    it('should return null when no active season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.seasonMembers.getMySeasonStatus();

      expect(result).toBeNull();
    });

    it('should return null when user not enrolled in active season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({
        id: seasonId,
        year: 2025,
        name: '2025',
        duesAmount: 500,
        startDate: null,
        endDate: null,
      });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.seasonMembers.getMySeasonStatus();

      expect(result).toBeNull();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.getMySeasonStatus()
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // updateMyArrival
  // ----------------------------------------------------------------
  describe('updateMyArrival', () => {
    it('should update arrival and departure dates', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({
        id: smId,
        seasonId,
        memberId: memberUser.id,
      });
      mockPrisma.seasonMember.update.mockResolvedValue({
        id: smId,
        arrivalDate: new Date('2025-08-24T12:00:00.000Z'),
        departureDate: new Date('2025-09-01T12:00:00.000Z'),
      });

      const caller = createTestCaller(memberUser);
      const result = await caller.seasonMembers.updateMyArrival({
        arrivalDate: '2025-08-24T12:00:00.000Z',
        departureDate: '2025-09-01T12:00:00.000Z',
      });

      expect(result.arrivalDate).toEqual(new Date('2025-08-24T12:00:00.000Z'));
      expect(mockPrisma.seasonMember.update).toHaveBeenCalledWith({
        where: { id: smId },
        data: expect.objectContaining({
          arrivalDate: new Date('2025-08-24T12:00:00.000Z'),
          departureDate: new Date('2025-09-01T12:00:00.000Z'),
        }),
      });
    });

    it('should update optional fields like rideDetails and specialRequests', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({
        id: smId,
        seasonId,
        memberId: memberUser.id,
      });
      mockPrisma.seasonMember.update.mockResolvedValue({
        id: smId,
        rideDetails: 'Driving from SF',
        specialRequests: 'Quiet area preferred',
      });

      const caller = createTestCaller(memberUser);
      const result = await caller.seasonMembers.updateMyArrival({
        rideDetails: 'Driving from SF',
        specialRequests: 'Quiet area preferred',
      });

      expect(result.rideDetails).toBe('Driving from SF');
    });

    it('should throw NOT_FOUND when no active season exists', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.updateMyArrival({
          arrivalDate: '2025-08-24T12:00:00.000Z',
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw NOT_FOUND when user not enrolled in season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: seasonId });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      await expect(
        caller.seasonMembers.updateMyArrival({
          arrivalDate: '2025-08-24T12:00:00.000Z',
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.seasonMembers.updateMyArrival({
          arrivalDate: '2025-08-24T12:00:00.000Z',
        })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
