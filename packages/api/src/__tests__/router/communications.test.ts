/**
 * Tests for the communications tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma and email service mocked to avoid database/network access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  season: {
    findUnique: jest.fn(),
  },
  seasonMember: {
    findMany: jest.fn(),
  },
  ticket: {
    findMany: jest.fn(),
  },
  application: {
    findMany: jest.fn(),
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

// Mock email service
jest.mock('../../lib/email', () => ({
  sendMassEmailToRecipients: jest.fn().mockResolvedValue({ sent: 1, failed: 0, errors: [] }),
}));

import { communicationsRouter } from '../../router/communications';
import { router } from '../../trpc';
import { sendMassEmailToRecipients } from '../../lib/email';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ communications: communicationsRouter });
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

// Helper: create mock season members with payments
function createMockSeasonMembers() {
  return [
    {
      id: 'sm-1',
      seasonId,
      status: 'CONFIRMED',
      addedToWhatsApp: true,
      preApprovalForm: 'YES',
      buildCrew: true,
      strikeCrew: false,
      member: { id: 'mem-1', name: 'Alice', email: 'alice@example.com', playaName: 'Sparkle' },
      payments: [{ amount: 300 }],
    },
    {
      id: 'sm-2',
      seasonId,
      status: 'REGISTERED',
      addedToWhatsApp: false,
      preApprovalForm: null,
      buildCrew: false,
      strikeCrew: true,
      member: { id: 'mem-2', name: 'Bob', email: 'bob@example.com', playaName: 'Dusty' },
      payments: [{ amount: 100 }],
    },
    {
      id: 'sm-3',
      seasonId,
      status: 'CONFIRMED',
      addedToWhatsApp: true,
      preApprovalForm: 'NO',
      buildCrew: false,
      strikeCrew: false,
      member: { id: 'mem-3', name: 'Charlie', email: 'charlie@example.com', playaName: null },
      payments: [],
    },
  ];
}

describe('communicationsRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // getActionItems (manager+ only)
  // ----------------------------------------------------------------
  describe('getActionItems', () => {
    it('should return all action items with counts', async () => {
      const mockSeason = { id: seasonId, duesAmount: 300 };
      const mockSeasonMembers = createMockSeasonMembers();

      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);
      mockPrisma.ticket.findMany.mockResolvedValue([
        { memberId: 'mem-1' }, // Only Alice has a ticket
      ]);
      mockPrisma.application.findMany.mockResolvedValue([
        { id: 'app-1', name: 'New Applicant', email: 'new@example.com', playaName: null, createdAt: new Date() },
      ]);

      const caller = createTestCaller(managerUser);
      const result = await caller.communications.getActionItems({ seasonId });

      // Unpaid dues: Bob (100 < 300) and Charlie (0 < 300)
      expect(result.unpaidDues.count).toBe(2);
      expect(result.unpaidDues.members.map((m: any) => m.name)).toContain('Bob');
      expect(result.unpaidDues.members.map((m: any) => m.name)).toContain('Charlie');

      // No ticket: Bob and Charlie (only Alice has one)
      expect(result.noTicket.count).toBe(2);

      // Not on WhatsApp: Bob
      expect(result.notOnWhatsApp.count).toBe(1);
      expect(result.notOnWhatsApp.members[0].name).toBe('Bob');

      // No pre-approval: Bob (null) and Charlie ('NO')
      expect(result.noPreApproval.count).toBe(2);

      // Pending applications
      expect(result.pendingApplications.count).toBe(1);
      expect(result.pendingApplications.applications[0].name).toBe('New Applicant');
    });

    it('should return empty state when no season members exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.application.findMany.mockResolvedValue([]);

      const caller = createTestCaller(managerUser);
      const result = await caller.communications.getActionItems({ seasonId });

      expect(result.unpaidDues.count).toBe(0);
      expect(result.noTicket.count).toBe(0);
      expect(result.notOnWhatsApp.count).toBe(0);
      expect(result.noPreApproval.count).toBe(0);
      expect(result.pendingApplications.count).toBe(0);
    });

    it('should throw NOT_FOUND for non-existent season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(managerUser);
      await expect(
        caller.communications.getActionItems({ seasonId })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should allow LEAD role', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);
      mockPrisma.ticket.findMany.mockResolvedValue([]);
      mockPrisma.application.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.communications.getActionItems({ seasonId });

      expect(result.unpaidDues.count).toBe(0);
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.communications.getActionItems({ seasonId })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.communications.getActionItems({ seasonId })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  // ----------------------------------------------------------------
  // sendMassEmail (lead only)
  // ----------------------------------------------------------------
  describe('sendMassEmail', () => {
    const validEmailInput = {
      seasonId,
      subject: 'Test Email',
      body: 'This is a test mass email.',
      recipientFilter: 'all' as const,
    };

    it('should send mass email to all members', async () => {
      const mockSeasonMembers = createMockSeasonMembers();
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);
      (sendMassEmailToRecipients as jest.Mock).mockResolvedValue({ sent: 3, failed: 0, errors: [] });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.communications.sendMassEmail(validEmailInput);

      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
      expect(sendMassEmailToRecipients).toHaveBeenCalledWith(
        expect.arrayContaining(['alice@example.com', 'bob@example.com', 'charlie@example.com']),
        'Test Email',
        'This is a test mass email.',
        leadUser.name,
      );
    });

    it('should filter by confirmed status', async () => {
      const mockSeasonMembers = createMockSeasonMembers();
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);
      (sendMassEmailToRecipients as jest.Mock).mockResolvedValue({ sent: 2, failed: 0, errors: [] });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.communications.sendMassEmail({
        ...validEmailInput,
        recipientFilter: 'confirmed',
      });

      // Alice and Charlie are CONFIRMED
      expect(sendMassEmailToRecipients).toHaveBeenCalledWith(
        expect.arrayContaining(['alice@example.com', 'charlie@example.com']),
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
      const recipientArg = (sendMassEmailToRecipients as jest.Mock).mock.calls[0][0];
      expect(recipientArg).not.toContain('bob@example.com');
    });

    it('should filter by build crew', async () => {
      const mockSeasonMembers = createMockSeasonMembers();
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);
      (sendMassEmailToRecipients as jest.Mock).mockResolvedValue({ sent: 1, failed: 0, errors: [] });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.communications.sendMassEmail({
        ...validEmailInput,
        recipientFilter: 'build_crew',
      });

      // Only Alice is on build crew
      expect(sendMassEmailToRecipients).toHaveBeenCalledWith(
        ['alice@example.com'],
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should send to custom email list', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      (sendMassEmailToRecipients as jest.Mock).mockResolvedValue({ sent: 2, failed: 0, errors: [] });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.communications.sendMassEmail({
        ...validEmailInput,
        recipientFilter: 'custom',
        customEmails: ['custom1@example.com', 'custom2@example.com'],
      });

      expect(sendMassEmailToRecipients).toHaveBeenCalledWith(
        ['custom1@example.com', 'custom2@example.com'],
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should throw BAD_REQUEST for custom filter without emails', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.communications.sendMassEmail({
          ...validEmailInput,
          recipientFilter: 'custom',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw BAD_REQUEST when no recipients match filter', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      // All members already on WhatsApp - so 'not_on_whatsapp' returns no one
      const allOnWhatsApp = createMockSeasonMembers().map((sm) => ({
        ...sm,
        addedToWhatsApp: true,
      }));
      mockPrisma.seasonMember.findMany.mockResolvedValue(allOnWhatsApp);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.communications.sendMassEmail({
          ...validEmailInput,
          recipientFilter: 'not_on_whatsapp',
        })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should throw NOT_FOUND for non-existent season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.communications.sendMassEmail(validEmailInput)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should create audit log after sending', async () => {
      const mockSeasonMembers = createMockSeasonMembers();
      mockPrisma.season.findUnique.mockResolvedValue({ id: seasonId, duesAmount: 300 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);
      (sendMassEmailToRecipients as jest.Mock).mockResolvedValue({ sent: 3, failed: 0, errors: [] });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.communications.sendMassEmail(validEmailInput);

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: leadUser.id,
          action: 'MASS_EMAIL_SENT',
          entityType: 'Season',
          entityId: seasonId,
          details: expect.objectContaining({
            subject: 'Test Email',
            recipientFilter: 'all',
            recipientCount: 3,
            sent: 3,
            failed: 0,
          }),
        }),
      });
    });

    it('should reject with empty subject', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.communications.sendMassEmail({
          ...validEmailInput,
          subject: '',
        })
      ).rejects.toThrow();
    });

    it('should reject with empty body', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.communications.sendMassEmail({
          ...validEmailInput,
          body: '',
        })
      ).rejects.toThrow();
    });

    it('should reject MANAGER role (requires LEAD)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.communications.sendMassEmail(validEmailInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.communications.sendMassEmail(validEmailInput)
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.communications.sendMassEmail(validEmailInput)
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });
});
