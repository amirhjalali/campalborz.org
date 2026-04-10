/**
 * Tests for the payments tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma mocked to avoid database access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  payment: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
  seasonMember: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  season: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

import { paymentsRouter } from '../../router/payments';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ payments: paymentsRouter });
  return testRouter.createCaller({
    req: {} as any,
    res: {} as any,
    prisma: mockPrisma as any,
    user: user,
  });
}

// Reusable test users
const managerUser = {
  id: 'manager-1',
  email: 'manager@example.com',
  name: 'Test Manager',
  role: 'MANAGER',
};

const leadUser = {
  id: 'lead-1',
  email: 'lead@example.com',
  name: 'Test Lead',
  role: 'LEAD',
};

const memberUser = {
  id: 'member-1',
  email: 'member@example.com',
  name: 'Test Member',
  role: 'MEMBER',
};

describe('paymentsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // list
  // ----------------------------------------------------------------
  describe('list', () => {
    it('should return paginated payments with defaults', async () => {
      const mockPayments = [
        {
          id: 'pay-1',
          type: 'DUES',
          amount: 50000,
          method: 'VENMO',
          paidAt: new Date('2025-06-01'),
          seasonMember: {
            member: { id: 'member-1', name: 'Alice', email: 'alice@example.com', playaName: 'Sparky' },
            season: { id: 'season-1', year: 2025, name: '2025' },
          },
        },
      ];

      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);
      mockPrisma.payment.count.mockResolvedValue(1);

      const caller = createTestCaller(managerUser);
      const result = await caller.payments.list();

      expect(result.payments).toEqual(mockPayments);
      expect(result.total).toBe(1);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
          orderBy: { paidAt: 'desc' },
        })
      );
    });

    it('should filter by payment type', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.payments.list({ type: 'DONATION' });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'DONATION' }),
        })
      );
    });

    it('should filter by payment method', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.payments.list({ method: 'ZELLE' });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ method: 'ZELLE' }),
        })
      );
    });

    it('should filter by seasonId', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const seasonId = '550e8400-e29b-41d4-a716-446655440000';
      const caller = createTestCaller(managerUser);
      await caller.payments.list({ seasonId });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            seasonMember: expect.objectContaining({ seasonId }),
          }),
        })
      );
    });

    it('should filter by memberId', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const memberId = '550e8400-e29b-41d4-a716-446655440001';
      const caller = createTestCaller(managerUser);
      await caller.payments.list({ memberId });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            seasonMember: expect.objectContaining({ memberId }),
          }),
        })
      );
    });

    it('should respect custom limit and offset', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      await caller.payments.list({ limit: 10, offset: 20 });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 20 })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller(); // No user
      await expect(caller.payments.list()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject MEMBER role requests', async () => {
      const caller = createTestCaller(memberUser);
      await expect(caller.payments.list()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });

    it('should allow LEAD role', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const caller = createTestCaller(leadUser);
      const result = await caller.payments.list();

      expect(result.payments).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------
  describe('create', () => {
    const validPaymentInput = {
      seasonMemberId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'DUES' as const,
      amount: 50000,
      method: 'VENMO' as const,
      paidAt: '2025-06-15T12:00:00.000Z',
      notes: 'Dues payment for 2025 season',
    };

    it('should create a payment with valid data', async () => {
      const mockSeasonMember = {
        id: validPaymentInput.seasonMemberId,
        memberId: 'member-1',
        seasonId: 'season-1',
        member: { name: 'Alice', email: 'alice@example.com' },
      };

      const mockCreatedPayment = {
        id: 'pay-new',
        ...validPaymentInput,
        paidAt: new Date(validPaymentInput.paidAt),
        recordedBy: managerUser.name,
        seasonMember: {
          member: { id: 'member-1', name: 'Alice', email: 'alice@example.com' },
        },
      };

      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSeasonMember);
      mockPrisma.payment.create.mockResolvedValue(mockCreatedPayment);

      const caller = createTestCaller(managerUser);
      const result = await caller.payments.create(validPaymentInput);

      expect(result).toEqual(mockCreatedPayment);
      expect(mockPrisma.seasonMember.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: validPaymentInput.seasonMemberId },
        })
      );
      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          seasonMemberId: validPaymentInput.seasonMemberId,
          type: 'DUES',
          amount: 50000,
          method: 'VENMO',
          recordedBy: managerUser.name,
        }),
        include: expect.any(Object),
      });
    });

    it('should use custom recordedBy when provided', async () => {
      mockPrisma.seasonMember.findUnique.mockResolvedValue({
        id: validPaymentInput.seasonMemberId,
        member: { name: 'Alice', email: 'alice@example.com' },
      });
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-new' });

      const caller = createTestCaller(managerUser);
      await caller.payments.create({
        ...validPaymentInput,
        recordedBy: 'Custom Recorder',
      });

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ recordedBy: 'Custom Recorder' }),
        })
      );
    });

    it('should throw NOT_FOUND if season member does not exist', async () => {
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.payments.create(validPaymentInput)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });

      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
    });

    it('should reject payment with amount less than 1', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.payments.create({ ...validPaymentInput, amount: 0 })
      ).rejects.toThrow();
    });

    it('should reject payment with invalid type', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.payments.create({ ...validPaymentInput, type: 'INVALID_TYPE' as any })
      ).rejects.toThrow();
    });

    it('should reject payment with invalid method', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.payments.create({ ...validPaymentInput, method: 'BITCOIN' as any })
      ).rejects.toThrow();
    });

    it('should reject payment with missing required fields', async () => {
      const caller = createTestCaller(managerUser);
      // Missing seasonMemberId
      await expect(
        caller.payments.create({
          type: 'DUES',
          amount: 50000,
          method: 'VENMO',
          paidAt: '2025-06-15T12:00:00.000Z',
        } as any)
      ).rejects.toThrow();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.payments.create(validPaymentInput)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.payments.create(validPaymentInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  // ----------------------------------------------------------------
  // getMyPayments
  // ----------------------------------------------------------------
  describe('getMyPayments', () => {
    it('should return payments for the authenticated member in active season', async () => {
      const mockActiveSeason = { id: 'season-1' };
      const mockSeasonMember = { id: 'sm-1' };
      const mockPayments = [
        { id: 'pay-1', type: 'DUES', amount: 50000, method: 'VENMO', paidAt: new Date() },
      ];

      mockPrisma.season.findFirst.mockResolvedValue(mockActiveSeason);
      mockPrisma.seasonMember.findUnique.mockResolvedValue(mockSeasonMember);
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const caller = createTestCaller(memberUser);
      const result = await caller.payments.getMyPayments();

      expect(result).toEqual(mockPayments);
      expect(mockPrisma.season.findFirst).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { id: true },
      });
      expect(mockPrisma.seasonMember.findUnique).toHaveBeenCalledWith({
        where: {
          seasonId_memberId: {
            seasonId: 'season-1',
            memberId: memberUser.id,
          },
        },
        select: { id: true },
      });
    });

    it('should return empty array when no active season', async () => {
      mockPrisma.season.findFirst.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.payments.getMyPayments();

      expect(result).toEqual([]);
      expect(mockPrisma.seasonMember.findUnique).not.toHaveBeenCalled();
    });

    it('should return empty array when member has no season membership', async () => {
      mockPrisma.season.findFirst.mockResolvedValue({ id: 'season-1' });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(memberUser);
      const result = await caller.payments.getMyPayments();

      expect(result).toEqual([]);
      expect(mockPrisma.payment.findMany).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(caller.payments.getMyPayments()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  // ----------------------------------------------------------------
  // getSummary
  // ----------------------------------------------------------------
  describe('getSummary', () => {
    const seasonId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return payment summary for a season', async () => {
      const mockByType = [
        { type: 'DUES', _sum: { amount: 300000 }, _count: 6 },
        { type: 'DONATION', _sum: { amount: 50000 }, _count: 2 },
      ];
      const mockByMethod = [
        { method: 'VENMO', _sum: { amount: 200000 }, _count: 4 },
        { method: 'ZELLE', _sum: { amount: 150000 }, _count: 4 },
      ];
      const mockTotal = { _sum: { amount: 350000 }, _count: 8 };
      const mockSeason = { duesAmount: 50000 };

      mockPrisma.payment.groupBy.mockResolvedValueOnce(mockByType);
      mockPrisma.payment.groupBy.mockResolvedValueOnce(mockByMethod);
      mockPrisma.payment.aggregate.mockResolvedValue(mockTotal);
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.seasonMember.count.mockResolvedValue(10);

      const caller = createTestCaller(managerUser);
      const result = await caller.payments.getSummary({ seasonId });

      expect(result.totalCollected).toBe(350000);
      expect(result.totalPayments).toBe(8);
      expect(result.byType).toHaveLength(2);
      expect(result.byType[0]).toEqual({ type: 'DUES', total: 300000, count: 6 });
      expect(result.byMethod).toHaveLength(2);
      expect(result.duesProgress).toEqual({
        collected: 300000,
        expected: 500000, // 10 members * 50000 dues
        confirmedMembers: 10,
      });
    });

    it('should handle zero totals', async () => {
      mockPrisma.payment.groupBy.mockResolvedValueOnce([]);
      mockPrisma.payment.groupBy.mockResolvedValueOnce([]);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null }, _count: 0 });
      mockPrisma.season.findUnique.mockResolvedValue({ duesAmount: 50000 });
      mockPrisma.seasonMember.count.mockResolvedValue(0);

      const caller = createTestCaller(managerUser);
      const result = await caller.payments.getSummary({ seasonId });

      expect(result.totalCollected).toBe(0);
      expect(result.totalPayments).toBe(0);
      expect(result.byType).toHaveLength(0);
      expect(result.duesProgress.collected).toBe(0);
      expect(result.duesProgress.expected).toBe(0);
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.payments.getSummary({ seasonId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.payments.getSummary({ seasonId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });
});
