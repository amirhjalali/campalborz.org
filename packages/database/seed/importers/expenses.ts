import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { cents, parseDate } from '../lib/data-transforms';
import { addReport } from '../lib/report';

/**
 * Expenses sheet structure:
 * Row 0: [2025]
 * Row 1: ["Paid by", "Date", "Charge", "Amount", "Notes", "Comment", "Total"]
 * Row 2: (empty)
 * Row 3+: data rows
 *
 * HUBS Shared Costs:
 * Row 0: ["Shared Resources", "Vendor", "Cost", "Notes", "Cost Share"]
 * Row 1+: data
 */

const EXP_COL = {
  PAID_BY: 0,
  DATE: 1,
  CHARGE: 2,
  AMOUNT: 3,
  NOTES: 4,
  COMMENT: 5,
};

/**
 * Import expenses from the Expenses sheet + HUBS Shared Costs.
 */
export async function importExpenses(
  prisma: PrismaClient,
  expensesSheet: SheetData,
  hubsSheet: SheetData | undefined,
  seasonId: string
) {
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;

  // --- EXPENSES SHEET ---
  const rows = expensesSheet.rawRows;

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;

    const paidBy = row[EXP_COL.PAID_BY] ? String(row[EXP_COL.PAID_BY]).trim() : null;
    if (!paidBy) continue;

    const description = row[EXP_COL.CHARGE] ? String(row[EXP_COL.CHARGE]).trim() : null;
    if (!description || description.length < 2) continue;

    const amountVal = row[EXP_COL.AMOUNT];
    if (amountVal == null || amountVal === '') continue;
    const amountCents = cents(amountVal);
    if (amountCents === 0) continue;
    const date = parseDate(row[EXP_COL.DATE]);
    if (!date) {
      warnings.push(`No date for expense: "${description}" - skipping`);
      skipped++;
      continue;
    }

    const notes = row[EXP_COL.NOTES] ? String(row[EXP_COL.NOTES]).trim() : null;
    const comment = row[EXP_COL.COMMENT] ? String(row[EXP_COL.COMMENT]).trim() : null;
    const fullNotes = [notes, comment].filter(Boolean).join('; ') || null;

    // Determine if needs reimbursement (paid by individual, not ALBORZ)
    const isPersonal = paidBy.toUpperCase() !== 'ALBORZ';

    // Deduplicate
    const existing = await prisma.expense.findFirst({
      where: {
        seasonId,
        description,
        amount: amountCents,
        date,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.expense.create({
      data: {
        seasonId,
        description,
        amount: amountCents,
        paidBy,
        date,
        notes: fullNotes,
        needsReimbursement: isPersonal,
      },
    });
    created++;
  }

  // --- HUBS SHARED COSTS ---
  if (hubsSheet) {
    const hubsRows = hubsSheet.rawRows;
    for (let i = 1; i < hubsRows.length; i++) {
      const row = hubsRows[i];
      if (!row || row.length < 3) continue;

      const resource = row[0] ? String(row[0]).trim() : null;
      if (!resource) continue;

      const vendor = row[1] ? String(row[1]).trim() : null;
      const costVal = row[2];
      if (costVal == null) continue;
      const amountCents = cents(costVal);
      if (amountCents === 0) continue;

      const notes = row[3] ? String(row[3]).trim() : null;
      const description = `HUBS Shared: ${resource}${vendor ? ` (${vendor})` : ''}`;

      // Deduplicate
      const existing = await prisma.expense.findFirst({
        where: {
          seasonId,
          description,
          amount: amountCents,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.expense.create({
        data: {
          seasonId,
          description,
          amount: amountCents,
          paidBy: 'HUBS Shared',
          date: new Date('2025-08-24T12:00:00Z'), // Event start as proxy date
          category: 'SHARED',
          notes,
          needsReimbursement: false,
        },
      });
      created++;
    }
  }

  addReport({
    step: 'Expenses',
    created,
    updated: 0,
    skipped,
    warnings,
  });
}
