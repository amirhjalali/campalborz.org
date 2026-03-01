import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { NameMatcher } from '../lib/name-matcher';
import { parseYesNo } from '../lib/data-transforms';
import { addReport } from '../lib/report';

/**
 * DGS sheet structure:
 * Headers: ["Number", "Name", "Email", "# of Tix", "Added", "Purchased Confirmed", "Vehicle Pass", "Notes", ...]
 *
 * Note: Sheet name has leading space in 2025 file: " DGS"
 */

const COL = {
  NUMBER: 0,
  NAME: 1,
  EMAIL: 2,
  TIX: 3,
  ADDED: 4,
  CONFIRMED: 5,
  VEHICLE_PASS: 6,
  NOTES: 7,
};

/**
 * Import DGS ticket allocations.
 */
export async function importTickets(
  prisma: PrismaClient,
  sheet: SheetData,
  seasonId: string,
  matcher: NameMatcher
) {
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;

  const rows = sheet.rawRows;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;

    const name = row[COL.NAME] ? String(row[COL.NAME]).trim() : null;
    if (!name || name.length < 2) continue;

    const email = row[COL.EMAIL] ? String(row[COL.EMAIL]).trim() : null;
    const tix = row[COL.TIX] != null ? Number(row[COL.TIX]) : 0;

    // Try email first, then name
    const ref = email && email.includes('@')
      ? matcher.findByEmail(email) || matcher.find(name, `DGS row ${i}`)
      : matcher.find(name, `DGS row ${i}`);

    if (!ref) {
      warnings.push(`Unmatched DGS: "${name}" (row ${i})`);
      skipped++;
      continue;
    }

    const vehiclePass = parseYesNo(row[COL.VEHICLE_PASS] ? String(row[COL.VEHICLE_PASS]) : null);
    const confirmed = parseYesNo(row[COL.CONFIRMED] ? String(row[COL.CONFIRMED]) : null);
    const notes = row[COL.NOTES] ? String(row[COL.NOTES]).trim() : null;

    // Check for existing ticket
    const existing = await prisma.ticket.findFirst({
      where: {
        seasonId,
        memberId: ref.id,
        type: 'DGS',
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.ticket.create({
      data: {
        seasonId,
        memberId: ref.id,
        type: 'DGS',
        quantity: tix || 1,
        vehiclePass,
        purchaseConfirmed: confirmed,
        notes,
      },
    });
    created++;
  }

  addReport({
    step: 'Tickets (DGS)',
    created,
    updated: 0,
    skipped,
    warnings,
  });
}
