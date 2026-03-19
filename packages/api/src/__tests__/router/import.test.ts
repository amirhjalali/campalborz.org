/**
 * Tests for the import tRPC router.
 *
 * We test the router procedures by calling them through a tRPC caller,
 * with Prisma and XLSX mocked to avoid database and file system access.
 */

import { TRPCError } from '@trpc/server';

// Set JWT_SECRET before importing router modules
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes';

// Mock Prisma
const mockPrisma = {
  season: {
    findUnique: jest.fn(),
  },
  member: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  seasonMember: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  payment: {
    findFirst: jest.fn(),
    create: jest.fn(),
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

// Mock XLSX
const mockSheetToJson = jest.fn();
const mockRead = jest.fn();
const mockSSF = {
  parse_date_code: jest.fn(),
};

jest.mock('xlsx', () => ({
  read: (...args: any[]) => mockRead(...args),
  utils: {
    sheet_to_json: (...args: any[]) => mockSheetToJson(...args),
  },
  SSF: mockSSF,
}));

import { importRouter } from '../../router/import';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ import: importRouter });
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

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

// Helper to create a small valid base64 string
const validBase64 = Buffer.from('mock-file-data').toString('base64');

// Helper to set up a mock workbook with Alborzians and Dues sheets
function setupMockWorkbook(
  alborzianRows: unknown[][] = [],
  duesRows: unknown[][] = [],
  sheetNames: string[] = ['Alborzians', 'Dues + Fees Paid'],
) {
  const sheets: Record<string, any> = {};
  for (const name of sheetNames) {
    sheets[name] = { '!ref': 'A1:Z100' };
  }

  const workbook = {
    SheetNames: sheetNames,
    Sheets: sheets,
  };

  mockRead.mockReturnValue(workbook);

  // sheet_to_json returns different data based on which sheet is accessed
  mockSheetToJson.mockImplementation((sheet: any) => {
    if (sheet === sheets['Alborzians'] || sheet === sheets[sheetNames[0]]) {
      return alborzianRows;
    }
    // Find the dues-like sheet
    const duesSheetName = sheetNames.find(
      (s) => s.toLowerCase().includes('dues') || s.toLowerCase().includes('fee') || s.toLowerCase().includes('paid'),
    );
    if (duesSheetName && sheet === sheets[duesSheetName]) {
      return duesRows;
    }
    if (sheet === sheets[sheetNames[1]]) {
      return duesRows;
    }
    return [];
  });

  return workbook;
}

describe('importRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // preview
  // ----------------------------------------------------------------
  describe('preview', () => {
    it('should parse and preview members from Alborzians sheet', async () => {
      setupMockWorkbook(
        [
          // header row
          ['Confirmed', 'WhatsApp', 'Name', 'Email', 'Dues', 'Grid', 'Housing'],
          // data rows (columns: 0=status, 1=whatsapp, 2=name, 3=email, ...)
          ['Y', 'Y', 'Alice Smith', 'alice@test.com', 'Y', 'G1', 'RV'],
          ['', '', 'Bob Jones', 'bob@test.com', '', '', 'TENT'],
        ],
        [],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.season).toEqual({ id: validUUID, year: 2025, name: '2025' });
      expect(result.members.total).toBe(2);
      expect(result.members.new).toBe(2);
      expect(result.members.existing).toBe(0);
    });

    it('should identify existing members by email', async () => {
      setupMockWorkbook([
        ['', '', '', ''], // header
        ['', '', 'Alice Smith', 'alice@test.com'],
        ['', '', 'Bob Jones', 'bob@test.com'],
      ]);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([
        { id: 'existing-1', email: 'alice@test.com', name: 'Alice Smith' },
      ]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.members.existing).toBe(1);
      expect(result.members.new).toBe(1);
    });

    it('should identify already enrolled members', async () => {
      setupMockWorkbook([
        ['', '', '', ''],
        ['', '', 'Alice Smith', 'alice@test.com'],
      ]);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([
        { id: 'existing-1', email: 'alice@test.com', name: 'Alice Smith' },
      ]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([
        { member: { email: 'alice@test.com' } },
      ]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.members.alreadyEnrolled).toBe(1);
    });

    it('should report duplicate emails as errors', async () => {
      setupMockWorkbook([
        ['', '', '', ''],
        ['', '', 'Alice Smith', 'alice@test.com'],
        ['', '', 'Alice Duplicate', 'alice@test.com'],
      ]);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.members.total).toBe(1); // only first occurrence
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
      expect(result.errors.some((e) => e.message.includes('Duplicate email'))).toBe(true);
    });

    it('should skip rows without email and add errors', async () => {
      setupMockWorkbook([
        ['', '', '', ''],
        ['', '', 'No Email Person', ''],
        ['', '', 'Has Email', 'has@test.com'],
      ]);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.members.total).toBe(1);
      expect(result.errors.some((e) => e.message.includes('no email'))).toBe(true);
    });

    it('should skip blank rows', async () => {
      setupMockWorkbook([
        ['', '', '', ''],
        ['', '', '', ''], // blank name
        ['', '', 'Valid Person', 'valid@test.com'],
      ]);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.members.total).toBe(1);
    });

    it('should preview payments and match to members', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''], // header
          ['', 'Dues', 'Alice Smith', '2025-06-01', 500, 'Venmo'],
          ['', 'Donation', 'Unknown Person', '2025-06-01', 100, 'Cash'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.payments.total).toBe(2);
      expect(result.payments.matched).toBe(1);
      expect(result.payments.unmatched).toBe(1);
      expect(result.payments.unmatchedNames).toContain('Unknown Person');
    });

    it('should throw NOT_FOUND when season does not exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.import.preview({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST for malformed Excel file', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockRead.mockImplementation(() => {
        throw new Error('Invalid file');
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.import.preview({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.import.preview({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (lead only)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.import.preview({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.import.preview({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject file exceeding 5MB limit', async () => {
      // Create a base64 string that exceeds the 5MB limit
      // The zod schema validates the base64 string length (5 * 1024 * 1024 chars)
      const largeBase64 = 'A'.repeat(5 * 1024 * 1024 + 1);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.import.preview({ fileBase64: largeBase64, seasonId: validUUID })
      ).rejects.toThrow();
    });

    it('should reject invalid seasonId format', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.import.preview({ fileBase64: validBase64, seasonId: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('should return sheet names from the workbook', async () => {
      setupMockWorkbook([], [], ['Alborzians', 'Dues + Fees Paid', 'Extra Sheet']);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.sheets).toEqual(['Alborzians', 'Dues + Fees Paid', 'Extra Sheet']);
    });

    it('should report payments with invalid amounts as errors', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''],
          ['', 'Dues', 'Alice Smith', '2025-06-01', 'not-a-number', 'Venmo'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.import.preview({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.payments.total).toBe(0); // skipped due to invalid amount
      expect(result.errors.some((e) => e.message.includes('invalid amount'))).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // execute
  // ----------------------------------------------------------------
  describe('execute', () => {
    it('should create new members from import', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', 'Y', 'Alice Smith', 'alice@test.com', 'Y', '', 'RV'],
        ],
        [],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue(null); // no existing member
      mockPrisma.member.create.mockResolvedValue({ id: 'new-member-1' });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null); // no existing enrollment
      mockPrisma.seasonMember.create.mockResolvedValue({ id: 'new-sm-1' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.success).toBe(true);
      expect(result.stats.membersCreated).toBe(1);
      expect(result.stats.enrollmentsCreated).toBe(1);
      expect(mockPrisma.member.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'alice@test.com',
          name: 'Alice Smith',
          role: 'MEMBER',
        }),
      });
    });

    it('should update existing members with missing fields', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com', '', '', '', '', '', '', '', '', '', '', '', 'F'],
        ],
        [],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({
        id: 'existing-1',
        email: 'alice@test.com',
        gender: null, // not set yet
        dietaryRestrictions: null,
      });
      mockPrisma.member.update.mockResolvedValue({});
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);
      mockPrisma.seasonMember.create.mockResolvedValue({ id: 'new-sm-1' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.success).toBe(true);
      expect(result.stats.membersCreated).toBe(0);
      expect(result.stats.membersUpdated).toBe(1);
    });

    it('should not update member when existing fields already populated', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com', '', '', '', '', '', '', '', '', '', '', '', 'F'],
        ],
        [],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({
        id: 'existing-1',
        email: 'alice@test.com',
        gender: 'MALE', // already set
        dietaryRestrictions: 'Vegetarian', // already set
      });
      // No update should happen
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'existing-sm' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.stats.membersUpdated).toBe(0);
      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });

    it('should update existing season enrollments', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'existing-1', email: 'alice@test.com', gender: 'FEMALE', dietaryRestrictions: null });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'existing-sm-1' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.stats.enrollmentsUpdated).toBe(1);
      expect(result.stats.enrollmentsCreated).toBe(0);
    });

    it('should create payments and skip duplicates', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''],
          ['', 'Dues', 'Alice Smith', '2025-06-01', 500, 'Venmo'],
          ['', 'Donation', 'Alice Smith', '2025-06-15', 100, 'Cash'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'existing-1', email: 'alice@test.com', gender: null, dietaryRestrictions: null });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([{ name: 'Alice Smith', email: 'alice@test.com' }]);

      // First payment is new, second is duplicate
      mockPrisma.payment.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce({ id: 'existing-payment' }); // duplicate

      mockPrisma.payment.create.mockResolvedValue({ id: 'new-pay-1' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.stats.paymentsCreated).toBe(1);
      expect(result.stats.paymentsSkipped).toBe(1);
    });

    it('should report unmatched payments', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''],
          ['', 'Dues', 'Unknown Person', '2025-06-01', 500, 'Venmo'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'existing-1', email: 'alice@test.com', gender: null, dietaryRestrictions: null });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([{ name: 'Alice Smith', email: 'alice@test.com' }]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.stats.paymentsUnmatched).toBe(1);
      expect(result.errors.some((e) => e.message.includes('no matching member'))).toBe(true);
    });

    it('should create audit log entry on completion', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue(null);
      mockPrisma.member.create.mockResolvedValue({ id: 'new-1' });
      mockPrisma.seasonMember.findUnique.mockResolvedValue(null);
      mockPrisma.seasonMember.create.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: leadUser.id,
          action: 'EXCEL_IMPORT',
          entityType: 'Season',
          entityId: validUUID,
          details: expect.objectContaining({
            membersCreated: expect.any(Number),
            paymentsCreated: expect.any(Number),
          }),
        }),
      });
    });

    it('should throw NOT_FOUND when season does not exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.import.execute({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw BAD_REQUEST for malformed Excel file', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockRead.mockImplementation(() => {
        throw new Error('Invalid file');
      });

      const caller = createTestCaller(leadUser);
      await expect(
        caller.import.execute({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.import.execute({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (lead only)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.import.execute({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.import.execute({ fileBase64: validBase64, seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should handle import with empty sheets', async () => {
      setupMockWorkbook([], []);

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.success).toBe(true);
      expect(result.stats.membersCreated).toBe(0);
      expect(result.stats.paymentsCreated).toBe(0);
    });

    it('should auto-enroll members for payments when not yet enrolled', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
        ],
        [
          ['', '', '', '', ''],
          ['', 'Dues', 'Database Person', '2025-06-01', 500, 'Venmo'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      // No parsed members, so membersByName is empty initially
      // But member.findMany returns DB members for broader matching
      mockPrisma.member.findMany.mockResolvedValue([
        { name: 'Database Person', email: 'db@test.com' },
      ]);
      // When trying to find member by email for the payment
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'db-member-1', email: 'db@test.com' });
      mockPrisma.seasonMember.upsert.mockResolvedValue({ id: 'auto-sm-1' });
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.stats.paymentsCreated).toBe(1);
      expect(mockPrisma.seasonMember.upsert).toHaveBeenCalled();
    });

    it('should map payment types correctly', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''],
          ['', 'BEER FUND', 'Alice Smith', '2025-06-01', 50, 'Venmo'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'existing-1', email: 'alice@test.com', gender: null, dietaryRestrictions: null });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([{ name: 'Alice Smith', email: 'alice@test.com' }]);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      const result = await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(result.stats.paymentsCreated).toBe(1);
      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'BEER_FUND',
        }),
      });
    });

    it('should map payment methods correctly', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''],
          ['', 'Dues', 'Alice Smith', '2025-06-01', 500, 'Zelle'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'existing-1', email: 'alice@test.com', gender: null, dietaryRestrictions: null });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([{ name: 'Alice Smith', email: 'alice@test.com' }]);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          method: 'ZELLE',
        }),
      });
    });

    it('should set recordedBy to the importing user name', async () => {
      setupMockWorkbook(
        [
          ['', '', '', ''],
          ['Y', '', 'Alice Smith', 'alice@test.com'],
        ],
        [
          ['', '', '', '', ''],
          ['', 'Dues', 'Alice Smith', '2025-06-01', 500, 'Venmo'],
        ],
      );

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.member.findFirst.mockResolvedValue({ id: 'existing-1', email: 'alice@test.com', gender: null, dietaryRestrictions: null });
      mockPrisma.seasonMember.findUnique.mockResolvedValue({ id: 'sm-1' });
      mockPrisma.seasonMember.update.mockResolvedValue({});
      mockPrisma.member.findMany.mockResolvedValue([{ name: 'Alice Smith', email: 'alice@test.com' }]);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const caller = createTestCaller(leadUser);
      await caller.import.execute({
        fileBase64: validBase64,
        seasonId: validUUID,
      });

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recordedBy: `Excel Import by ${leadUser.name}`,
        }),
      });
    });
  });
});
