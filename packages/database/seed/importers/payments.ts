import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { NameMatcher } from '../lib/name-matcher';
import {
  cents,
  parseDate,
  parsePaymentType,
  parsePaymentMethod,
} from '../lib/data-transforms';
import { addReport } from '../lib/report';

// Column indices for "Dues + Fees Paid" sheet
// Headers: [null, "Type", "Member", "DATE", "Amount", "Method", "Notes", "Paid to"]
const COL = {
  TYPE: 1,
  MEMBER: 2,
  DATE: 3,
  AMOUNT: 4,
  METHOD: 5,
  NOTES: 6,
  PAID_TO: 7,
};

function isPaymentRow(row: any[]): boolean {
  if (!row || row.length < 5) return false;
  // Must have a type AND member name AND amount
  const type = row[COL.TYPE];
  const member = row[COL.MEMBER];
  const amount = row[COL.AMOUNT];
  if (!type || !member) return false;
  if (typeof member !== 'string' || member.trim().length < 2) return false;
  if (amount == null || amount === '' || amount === 0) return false;
  return true;
}

/**
 * Import payment transactions from "Dues + Fees Paid" sheet.
 */
export async function importPayments(
  prisma: PrismaClient,
  sheet: SheetData,
  seasonId: string,
  matcher: NameMatcher
) {
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;
  let totalCents = 0;

  const rows = sheet.rawRows;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!isPaymentRow(row)) continue;

    const memberName = String(row[COL.MEMBER]).trim();
    const ref = matcher.find(memberName, `payment row ${i}`);

    if (!ref || !ref.seasonMemberId) {
      warnings.push(`Skipped payment for unmatched member: "${memberName}" (row ${i})`);
      skipped++;
      continue;
    }

    const type = parsePaymentType(String(row[COL.TYPE]));
    const amountCents = cents(row[COL.AMOUNT]);
    const method = parsePaymentMethod(row[COL.METHOD] ? String(row[COL.METHOD]) : null);
    const paidAt = parseDate(row[COL.DATE]);
    const notes = row[COL.NOTES] ? String(row[COL.NOTES]).trim() : null;
    const paidTo = row[COL.PAID_TO] ? String(row[COL.PAID_TO]).trim() : null;

    if (!paidAt) {
      warnings.push(`No date for payment by "${memberName}" row ${i} - using 2025-01-01`);
    }

    const effectiveDate = paidAt || new Date('2025-01-01T12:00:00Z');

    // Deduplicate: check if exact payment already exists
    const existing = await prisma.payment.findFirst({
      where: {
        seasonMemberId: ref.seasonMemberId,
        type,
        amount: amountCents,
        paidAt: effectiveDate,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.payment.create({
      data: {
        seasonMemberId: ref.seasonMemberId,
        type,
        amount: amountCents,
        method,
        paidAt: effectiveDate,
        paidTo,
        notes,
        recordedBy: 'seed-2025',
      },
    });

    totalCents += amountCents;
    created++;
  }

  // Also capture matcher warnings from payment lookups
  warnings.push(...matcher.warnings.filter(w => w.includes('payment')));

  addReport({
    step: 'Payments',
    created,
    updated: 0,
    skipped,
    warnings,
    details: {
      'Total collected': `$${(totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
  });
}
