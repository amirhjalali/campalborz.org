import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, leadProcedure } from '../trpc';
import * as XLSX from 'xlsx';

// ─── Reverse-mapping helpers (enum -> Excel-friendly strings) ────────

function housingLabel(v: string | null): string {
  if (!v) return '';
  const map: Record<string, string> = {
    TENT: 'Tent',
    SHIFTPOD: 'Shiftpod',
    RV: 'RV',
    TRAILER: 'Trailer',
    DORM: 'Dorm',
    SHARED: 'Shared',
    HEXAYURT: 'Hexayurt',
    OTHER: 'Other',
  };
  return map[v] ?? v;
}

function genderLabel(v: string | null): string {
  if (!v) return '';
  if (v === 'MALE') return 'M';
  if (v === 'FEMALE') return 'F';
  return '';
}

function statusLabel(v: string): string {
  if (v === 'CONFIRMED') return 'Y';
  return '';
}

function preApprovalLabel(v: string | null): string {
  if (!v) return '';
  const map: Record<string, string> = { YES: 'Yes', MAYBE: 'Maybe', NO: 'No' };
  return map[v] ?? '';
}

function ynBool(v: boolean): string {
  return v ? 'Y' : '';
}

function paymentTypeLabel(v: string): string {
  const map: Record<string, string> = {
    DUES: 'Dues',
    GRID: 'Grid',
    FOOD: 'Food',
    DONATION: 'Donation',
    RV_VOUCHER: 'RV Voucher',
    BEER_FUND: 'Beer',
    TENT: 'Tent',
    TICKET: 'Ticket',
    STRIKE_DONATION: 'Strike Donation',
    FUNDRAISING: 'Fundraising',
    OTHER: 'Other',
  };
  return map[v] ?? v;
}

function paymentMethodLabel(v: string): string {
  const map: Record<string, string> = {
    VENMO: 'Venmo',
    ZELLE: 'Zelle',
    CASH: 'Cash',
    CARD: 'Card',
    PAYPAL: 'Paypal',
    GIVEBUTTER: 'Givebutter',
    OTHER: 'Other',
  };
  return map[v] ?? v;
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Router ──────────────────────────────────────────────────────────

export const exportRouter = router({
  season: leadProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
        select: { id: true, year: true, name: true },
      });
      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      // Fetch all season members with member data
      const seasonMembers = await ctx.prisma.seasonMember.findMany({
        where: { seasonId: input.seasonId },
        include: {
          member: {
            select: { id: true, name: true, email: true, gender: true, dietaryRestrictions: true },
          },
          payments: {
            orderBy: { paidAt: 'asc' },
          },
        },
        orderBy: { member: { name: 'asc' } },
      });

      // ─── Alborzians sheet ──────────────────────────────────
      const alborzianHeaders = [
        'Confirmed',       // A (0)
        'WhatsApp',        // B (1)
        'Group',           // C (2) - actually the name
        'Email',           // D (3)
        'Dues Paid',       // E (4)
        'Grid Code',       // F (5)
        'Housing',         // G (6)
        'Housing Size',    // H (7)
        '',                // I (8)
        'Ride',            // J (9)
        'Arrival',         // K (10)
        'Departure',       // L (11)
        'Dietary',         // M (12)
        '',                // N (13)
        'Pre-Approval',    // O (14)
        'Gender',          // P (15)
        '',                // Q (16)
        'Build Crew',      // R (17)
        'Strike Crew',     // S (18)
        'Alborz Virgin',   // T (19)
        'BM Virgin',       // U (20)
        'Map Object',      // V (21)
      ];

      const alborzianRows = [alborzianHeaders];

      for (const sm of seasonMembers) {
        const hasDues = sm.payments.some((p) => p.type === 'DUES');
        alborzianRows.push([
          statusLabel(sm.status),               // A
          ynBool(sm.addedToWhatsApp),           // B
          sm.member.name,                       // C
          sm.member.email,                      // D
          hasDues ? 'Y' : '',                   // E
          sm.mapObject ?? '',                   // F - grid code (mapObject holds grid ref)
          housingLabel(sm.housingType),         // G
          sm.housingSize ?? '',                 // H
          '',                                   // I
          sm.rideDetails ?? '',                 // J
          formatDate(sm.arrivalDate),           // K
          formatDate(sm.departureDate),         // L
          sm.member.dietaryRestrictions ?? '',  // M
          '',                                   // N
          preApprovalLabel(sm.preApprovalForm), // O
          genderLabel(sm.member.gender),        // P
          '',                                   // Q
          ynBool(sm.buildCrew),                 // R
          ynBool(sm.strikeCrew),                // S
          ynBool(sm.isAlborzVirgin),            // T
          ynBool(sm.isBMVirgin),                // U
          sm.mapObject ?? '',                   // V
        ]);
      }

      // ─── Dues + Fees Paid sheet ────────────────────────────
      const duesHeaders = [
        '',        // A (0)
        'Type',    // B (1)
        'Name',    // C (2)
        'Date',    // D (3)
        'Amount',  // E (4)
        'Method',  // F (5)
        'Notes',   // G (6)
        'Paid To', // H (7)
      ];

      const duesRows = [duesHeaders];

      // Collect all payments across all members
      const allPayments: Array<{
        memberName: string;
        type: string;
        paidAt: Date;
        amount: number;
        method: string;
        notes: string | null;
        paidTo: string | null;
      }> = [];

      for (const sm of seasonMembers) {
        for (const p of sm.payments) {
          allPayments.push({
            memberName: sm.member.name,
            type: p.type,
            paidAt: p.paidAt,
            amount: p.amount,
            method: p.method,
            notes: p.notes,
            paidTo: p.paidTo,
          });
        }
      }

      // Sort by date
      allPayments.sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime());

      for (const p of allPayments) {
        duesRows.push([
          '',                                          // A
          paymentTypeLabel(p.type),                    // B
          p.memberName,                                // C
          formatDate(p.paidAt),                        // D
          (p.amount / 100).toFixed(2),                 // E - convert cents to dollars
          paymentMethodLabel(p.method),                // F
          p.notes ?? '',                               // G
          p.paidTo ?? '',                              // H
        ]);
      }

      // ─── Build workbook ────────────────────────────────────
      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.aoa_to_sheet(alborzianRows);
      XLSX.utils.book_append_sheet(wb, ws1, 'Alborzians');

      const ws2 = XLSX.utils.aoa_to_sheet(duesRows);
      XLSX.utils.book_append_sheet(wb, ws2, 'Dues + Fees Paid');

      // Set column widths for readability
      ws1['!cols'] = [
        { wch: 10 }, // A
        { wch: 10 }, // B
        { wch: 25 }, // C - name
        { wch: 30 }, // D - email
        { wch: 10 }, // E
        { wch: 10 }, // F
        { wch: 12 }, // G
        { wch: 10 }, // H
        { wch: 5 },  // I
        { wch: 20 }, // J
        { wch: 12 }, // K
        { wch: 12 }, // L
        { wch: 20 }, // M
        { wch: 5 },  // N
        { wch: 12 }, // O
        { wch: 8 },  // P
        { wch: 5 },  // Q
        { wch: 10 }, // R
        { wch: 10 }, // S
        { wch: 12 }, // T
        { wch: 10 }, // U
        { wch: 15 }, // V
      ];

      ws2['!cols'] = [
        { wch: 5 },  // A
        { wch: 15 }, // B
        { wch: 25 }, // C
        { wch: 12 }, // D
        { wch: 10 }, // E
        { wch: 10 }, // F
        { wch: 25 }, // G
        { wch: 15 }, // H
      ];

      const xlsBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const base64 = Buffer.from(xlsBuf).toString('base64');

      return {
        fileName: `Alborz_Master_Document_${season.year}.xlsx`,
        base64,
        memberCount: seasonMembers.length,
        paymentCount: allPayments.length,
      };
    }),

  emailList: leadProcedure
    .input(z.object({
      seasonId: z.string().uuid(),
      status: z.enum(['INTERESTED', 'MAYBE', 'CONFIRMED', 'WAITLISTED', 'CANCELLED']).optional(),
      filter: z.enum([
        'all',
        'unpaid_dues',
        'no_ticket',
        'not_on_whatsapp',
        'build_crew',
        'strike_crew',
        'virgins',
        'no_preapproval',
      ]).optional().default('all'),
    }))
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
        select: { id: true, year: true, name: true, duesAmount: true },
      });
      if (!season) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Season not found' });
      }

      // Build the base where clause
      const where: Record<string, unknown> = { seasonId: input.seasonId };
      if (input.status) {
        where.status = input.status;
      }

      // Fetch all season members with related data
      const seasonMembers = await ctx.prisma.seasonMember.findMany({
        where,
        include: {
          member: { select: { id: true, name: true, email: true } },
          payments: { select: { type: true, amount: true } },
        },
        orderBy: { member: { name: 'asc' } },
      });

      // Apply filters
      let filtered = seasonMembers;

      switch (input.filter) {
        case 'unpaid_dues': {
          filtered = seasonMembers.filter((sm) => {
            const duesTotal = sm.payments
              .filter((p) => p.type === 'DUES')
              .reduce((sum, p) => sum + p.amount, 0);
            return duesTotal < (season.duesAmount ?? 0);
          });
          break;
        }
        case 'no_ticket': {
          // Members who haven't paid for a ticket
          filtered = seasonMembers.filter((sm) => {
            return !sm.payments.some((p) => p.type === 'TICKET');
          });
          break;
        }
        case 'not_on_whatsapp': {
          filtered = seasonMembers.filter((sm) => !sm.addedToWhatsApp);
          break;
        }
        case 'build_crew': {
          filtered = seasonMembers.filter((sm) => sm.buildCrew);
          break;
        }
        case 'strike_crew': {
          filtered = seasonMembers.filter((sm) => sm.strikeCrew);
          break;
        }
        case 'virgins': {
          filtered = seasonMembers.filter((sm) => sm.isAlborzVirgin || sm.isBMVirgin);
          break;
        }
        case 'no_preapproval': {
          filtered = seasonMembers.filter(
            (sm) => !sm.preApprovalForm || sm.preApprovalForm === 'NO',
          );
          break;
        }
        case 'all':
        default:
          break;
      }

      const emails = filtered.map((sm) => ({
        name: sm.member.name,
        email: sm.member.email,
      }));

      const csvString = emails.map((e) => `${e.name},${e.email}`).join('\n');
      const emailOnly = emails.map((e) => e.email).join(', ');

      return {
        count: emails.length,
        emails,
        csvString,
        emailOnly,
      };
    }),
});
