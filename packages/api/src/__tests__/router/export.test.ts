/**
 * Tests for the export tRPC router.
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
  seasonMember: {
    findMany: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

// Mock XLSX
const mockBookNew = jest.fn();
const mockAoaToSheet = jest.fn();
const mockBookAppendSheet = jest.fn();
const mockWrite = jest.fn();

jest.mock('xlsx', () => ({
  utils: {
    book_new: () => mockBookNew(),
    aoa_to_sheet: (data: any) => mockAoaToSheet(data),
    book_append_sheet: (wb: any, ws: any, name: string) => mockBookAppendSheet(wb, ws, name),
  },
  write: (wb: any, opts: any) => mockWrite(wb, opts),
}));

import { exportRouter } from '../../router/export';
import { router } from '../../trpc';

// Create a test caller with mocked context
function createTestCaller(user?: { id: string; email: string; name: string; role: string }) {
  const testRouter = router({ export: exportRouter });
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

describe('exportRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default XLSX mocks
    mockBookNew.mockReturnValue({ SheetNames: [], Sheets: {} });
    mockAoaToSheet.mockReturnValue({ '!ref': 'A1' });
    mockBookAppendSheet.mockReturnValue(undefined);
    // Return a buffer-like object that can be converted to base64
    mockWrite.mockReturnValue(Buffer.from('mock-xlsx-content'));
  });

  // ----------------------------------------------------------------
  // season
  // ----------------------------------------------------------------
  describe('season', () => {
    it('should export season data as base64 Excel file', async () => {
      const mockSeasonMembers = [
        {
          status: 'CONFIRMED',
          addedToWhatsApp: true,
          housingType: 'RV',
          housingSize: 'Large',
          rideDetails: 'Driving from LA',
          arrivalDate: new Date('2025-08-24'),
          departureDate: new Date('2025-09-02'),
          preApprovalForm: 'YES',
          mapObject: 'G7',
          buildCrew: true,
          strikeCrew: false,
          isAlborzVirgin: false,
          isBMVirgin: false,
          member: {
            id: 'm-1',
            name: 'Alice Smith',
            email: 'alice@test.com',
            gender: 'FEMALE',
            dietaryRestrictions: 'Vegetarian',
          },
          payments: [
            {
              type: 'DUES',
              amount: 50000,
              method: 'VENMO',
              paidAt: new Date('2025-06-01'),
              notes: 'First payment',
              paidTo: 'Camp Lead',
            },
          ],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.season({ seasonId: validUUID });

      expect(result.fileName).toBe('Alborz_Master_Document_2025.xlsx');
      expect(result.base64).toBeDefined();
      expect(result.memberCount).toBe(1);
      expect(result.paymentCount).toBe(1);
    });

    it('should build Alborzians sheet with correct header and data rows', async () => {
      const mockSeasonMembers = [
        {
          status: 'CONFIRMED',
          addedToWhatsApp: true,
          housingType: 'TENT',
          housingSize: null,
          rideDetails: null,
          arrivalDate: null,
          departureDate: null,
          preApprovalForm: null,
          mapObject: null,
          buildCrew: false,
          strikeCrew: true,
          isAlborzVirgin: true,
          isBMVirgin: false,
          member: {
            id: 'm-1',
            name: 'Bob Jones',
            email: 'bob@test.com',
            gender: 'MALE',
            dietaryRestrictions: null,
          },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      await caller.export.season({ seasonId: validUUID });

      // Verify aoa_to_sheet was called with correct data structure
      expect(mockAoaToSheet).toHaveBeenCalledTimes(2);

      // First call = Alborzians sheet
      const alborzianData = mockAoaToSheet.mock.calls[0][0];
      expect(alborzianData[0]).toContain('Confirmed'); // header
      expect(alborzianData[1][2]).toBe('Bob Jones'); // name col
      expect(alborzianData[1][3]).toBe('bob@test.com'); // email col
      expect(alborzianData[1][15]).toBe('M'); // gender mapped
    });

    it('should build Dues sheet with payment data sorted by date', async () => {
      const mockSeasonMembers = [
        {
          status: 'CONFIRMED',
          addedToWhatsApp: false,
          housingType: null,
          housingSize: null,
          rideDetails: null,
          arrivalDate: null,
          departureDate: null,
          preApprovalForm: null,
          mapObject: null,
          buildCrew: false,
          strikeCrew: false,
          isAlborzVirgin: false,
          isBMVirgin: false,
          member: { id: 'm-1', name: 'Alice Smith', email: 'alice@test.com', gender: null, dietaryRestrictions: null },
          payments: [
            { type: 'DONATION', amount: 10000, method: 'CASH', paidAt: new Date('2025-07-01'), notes: null, paidTo: null },
            { type: 'DUES', amount: 50000, method: 'VENMO', paidAt: new Date('2025-06-01'), notes: 'Dues', paidTo: 'Lead' },
          ],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.season({ seasonId: validUUID });

      // Second call = Dues sheet
      const duesData = mockAoaToSheet.mock.calls[1][0];
      expect(duesData[0]).toContain('Type'); // header
      // Payments should be sorted by date (Dues=June before Donation=July)
      expect(duesData[1][1]).toBe('Dues'); // first payment type label
      expect(duesData[1][4]).toBe('500.00'); // amount in dollars
      expect(duesData[2][1]).toBe('Donation'); // second payment type label
      expect(duesData[2][4]).toBe('100.00');

      expect(result.paymentCount).toBe(2);
    });

    it('should handle empty season with no members', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.season({ seasonId: validUUID });

      expect(result.memberCount).toBe(0);
      expect(result.paymentCount).toBe(0);
      expect(result.fileName).toBe('Alborz_Master_Document_2025.xlsx');
    });

    it('should mark dues paid correctly', async () => {
      const mockSeasonMembers = [
        {
          status: 'CONFIRMED',
          addedToWhatsApp: false,
          housingType: null,
          housingSize: null,
          rideDetails: null,
          arrivalDate: null,
          departureDate: null,
          preApprovalForm: null,
          mapObject: null,
          buildCrew: false,
          strikeCrew: false,
          isAlborzVirgin: false,
          isBMVirgin: false,
          member: { id: 'm-1', name: 'Alice', email: 'alice@test.com', gender: null, dietaryRestrictions: null },
          payments: [{ type: 'DUES', amount: 50000, method: 'VENMO', paidAt: new Date(), notes: null, paidTo: null }],
        },
        {
          status: 'INTERESTED',
          addedToWhatsApp: false,
          housingType: null,
          housingSize: null,
          rideDetails: null,
          arrivalDate: null,
          departureDate: null,
          preApprovalForm: null,
          mapObject: null,
          buildCrew: false,
          strikeCrew: false,
          isAlborzVirgin: false,
          isBMVirgin: false,
          member: { id: 'm-2', name: 'Bob', email: 'bob@test.com', gender: null, dietaryRestrictions: null },
          payments: [{ type: 'DONATION', amount: 10000, method: 'CASH', paidAt: new Date(), notes: null, paidTo: null }],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025' });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      await caller.export.season({ seasonId: validUUID });

      const alborzianData = mockAoaToSheet.mock.calls[0][0];
      // Alice has dues payment -> 'Y'
      expect(alborzianData[1][4]).toBe('Y');
      // Bob has donation only, no dues -> ''
      expect(alborzianData[2][4]).toBe('');
    });

    it('should throw NOT_FOUND when season does not exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.export.season({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.export.season({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (lead only)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.export.season({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.export.season({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject invalid seasonId format', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.export.season({ seasonId: 'not-a-uuid' })
      ).rejects.toThrow();
    });
  });

  // ----------------------------------------------------------------
  // emailList
  // ----------------------------------------------------------------
  describe('emailList', () => {
    const baseMemberData = {
      addedToWhatsApp: true,
      buildCrew: false,
      strikeCrew: false,
      isAlborzVirgin: false,
      isBMVirgin: false,
      preApprovalForm: 'YES',
    };

    it('should return all emails when filter is "all"', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          status: 'CONFIRMED',
          member: { id: 'm-1', name: 'Alice Smith', email: 'alice@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          status: 'INTERESTED',
          member: { id: 'm-2', name: 'Bob Jones', email: 'bob@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({ seasonId: validUUID });

      expect(result.count).toBe(2);
      expect(result.emails).toHaveLength(2);
      expect(result.csvString).toContain('Alice Smith,alice@test.com');
      expect(result.emailOnly).toContain('alice@test.com');
      expect(result.emailOnly).toContain('bob@test.com');
    });

    it('should filter by status when provided', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue([
        {
          ...baseMemberData,
          status: 'CONFIRMED',
          member: { id: 'm-1', name: 'Alice', email: 'alice@test.com' },
          payments: [],
        },
      ]);

      const caller = createTestCaller(leadUser);
      await caller.export.emailList({ seasonId: validUUID, status: 'CONFIRMED' });

      expect(mockPrisma.seasonMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CONFIRMED',
          }),
        })
      );
    });

    it('should filter unpaid_dues members', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          member: { id: 'm-1', name: 'Paid Alice', email: 'paid@test.com' },
          payments: [{ type: 'DUES', amount: 50000 }],
        },
        {
          ...baseMemberData,
          member: { id: 'm-2', name: 'Unpaid Bob', email: 'unpaid@test.com' },
          payments: [{ type: 'DUES', amount: 10000 }], // partial - less than duesAmount
        },
        {
          ...baseMemberData,
          member: { id: 'm-3', name: 'No Dues Carol', email: 'nodues@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'unpaid_dues',
      });

      // Only Bob (partial) and Carol (none) should be in the result
      expect(result.count).toBe(2);
      expect(result.emails.map((e) => e.email)).toContain('unpaid@test.com');
      expect(result.emails.map((e) => e.email)).toContain('nodues@test.com');
      expect(result.emails.map((e) => e.email)).not.toContain('paid@test.com');
    });

    it('should filter no_ticket members', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          member: { id: 'm-1', name: 'Has Ticket', email: 'ticket@test.com' },
          payments: [{ type: 'TICKET', amount: 60000 }],
        },
        {
          ...baseMemberData,
          member: { id: 'm-2', name: 'No Ticket', email: 'noticket@test.com' },
          payments: [{ type: 'DUES', amount: 50000 }],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'no_ticket',
      });

      expect(result.count).toBe(1);
      expect(result.emails[0].email).toBe('noticket@test.com');
    });

    it('should filter not_on_whatsapp members', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          addedToWhatsApp: true,
          member: { id: 'm-1', name: 'On WA', email: 'onwa@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          addedToWhatsApp: false,
          member: { id: 'm-2', name: 'Not On WA', email: 'notwa@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'not_on_whatsapp',
      });

      expect(result.count).toBe(1);
      expect(result.emails[0].email).toBe('notwa@test.com');
    });

    it('should filter build_crew members', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          buildCrew: true,
          member: { id: 'm-1', name: 'Builder', email: 'builder@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          buildCrew: false,
          member: { id: 'm-2', name: 'Not Builder', email: 'notbuilder@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'build_crew',
      });

      expect(result.count).toBe(1);
      expect(result.emails[0].email).toBe('builder@test.com');
    });

    it('should filter strike_crew members', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          strikeCrew: true,
          member: { id: 'm-1', name: 'Striker', email: 'striker@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          strikeCrew: false,
          member: { id: 'm-2', name: 'Not Striker', email: 'notstriker@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'strike_crew',
      });

      expect(result.count).toBe(1);
      expect(result.emails[0].email).toBe('striker@test.com');
    });

    it('should filter virgins (Alborz or BM virgins)', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          isAlborzVirgin: true,
          isBMVirgin: false,
          member: { id: 'm-1', name: 'Alborz Virgin', email: 'av@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          isAlborzVirgin: false,
          isBMVirgin: true,
          member: { id: 'm-2', name: 'BM Virgin', email: 'bmv@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          isAlborzVirgin: false,
          isBMVirgin: false,
          member: { id: 'm-3', name: 'Veteran', email: 'vet@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'virgins',
      });

      expect(result.count).toBe(2);
      expect(result.emails.map((e) => e.email)).toContain('av@test.com');
      expect(result.emails.map((e) => e.email)).toContain('bmv@test.com');
      expect(result.emails.map((e) => e.email)).not.toContain('vet@test.com');
    });

    it('should filter no_preapproval members', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          preApprovalForm: 'YES',
          member: { id: 'm-1', name: 'Approved', email: 'approved@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          preApprovalForm: 'NO',
          member: { id: 'm-2', name: 'Declined', email: 'declined@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          preApprovalForm: null,
          member: { id: 'm-3', name: 'Not Done', email: 'notdone@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({
        seasonId: validUUID,
        filter: 'no_preapproval',
      });

      expect(result.count).toBe(2);
      expect(result.emails.map((e) => e.email)).toContain('declined@test.com');
      expect(result.emails.map((e) => e.email)).toContain('notdone@test.com');
      expect(result.emails.map((e) => e.email)).not.toContain('approved@test.com');
    });

    it('should return properly formatted CSV and email-only strings', async () => {
      const mockSeasonMembers = [
        {
          ...baseMemberData,
          member: { id: 'm-1', name: 'Alice', email: 'alice@test.com' },
          payments: [],
        },
        {
          ...baseMemberData,
          member: { id: 'm-2', name: 'Bob', email: 'bob@test.com' },
          payments: [],
        },
      ];

      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue(mockSeasonMembers);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({ seasonId: validUUID });

      expect(result.csvString).toBe('Alice,alice@test.com\nBob,bob@test.com');
      expect(result.emailOnly).toBe('alice@test.com, bob@test.com');
    });

    it('should handle empty result set', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: validUUID, year: 2025, name: '2025', duesAmount: 50000 });
      mockPrisma.seasonMember.findMany.mockResolvedValue([]);

      const caller = createTestCaller(leadUser);
      const result = await caller.export.emailList({ seasonId: validUUID });

      expect(result.count).toBe(0);
      expect(result.emails).toEqual([]);
      expect(result.csvString).toBe('');
      expect(result.emailOnly).toBe('');
    });

    it('should throw NOT_FOUND when season does not exist', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);

      const caller = createTestCaller(leadUser);
      await expect(
        caller.export.emailList({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should reject unauthenticated requests', async () => {
      const caller = createTestCaller();
      await expect(
        caller.export.emailList({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('should reject MANAGER role (lead only)', async () => {
      const caller = createTestCaller(managerUser);
      await expect(
        caller.export.emailList({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject MEMBER role', async () => {
      const caller = createTestCaller(memberUser);
      await expect(
        caller.export.emailList({ seasonId: validUUID })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('should reject invalid status enum value', async () => {
      const caller = createTestCaller(leadUser);
      await expect(
        caller.export.emailList({
          seasonId: validUUID,
          status: 'INVALID_STATUS' as any,
        })
      ).rejects.toThrow();
    });
  });
});
