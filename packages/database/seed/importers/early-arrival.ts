import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { NameMatcher } from '../lib/name-matcher';
import { parseDate } from '../lib/data-transforms';
import { addReport } from '../lib/report';

/**
 * Early Arrival Passes sheet structure:
 * Row 0-1: empty
 * Row 2: [null, "NAME", "DATE", "Ticket ID", "Ticket ID"]
 * Row 3+: [num, name, date, ticketId, ...]
 */

/**
 * Import early arrival passes.
 */
export async function importEarlyArrival(
  prisma: PrismaClient,
  sheet: SheetData,
  seasonId: string,
  matcher: NameMatcher
) {
  const warnings: string[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const rows = sheet.rawRows;

  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const name = row[1] ? String(row[1]).trim() : null;
    if (!name || name.length < 2) continue;

    const ref = matcher.find(name, `early arrival row ${i}`);
    if (!ref || !ref.seasonMemberId) {
      warnings.push(`Unmatched early arrival: "${name}" (row ${i})`);
      skipped++;
      continue;
    }

    const arrivalDate = parseDate(row[2]);
    if (!arrivalDate) {
      warnings.push(`No date for early arrival: "${name}" (row ${i})`);
      skipped++;
      continue;
    }

    const ticketId = row[3] != null ? String(row[3]).trim() : null;
    const passId = ticketId && ticketId !== 'NA' ? ticketId : null;

    const passData = { arrivalDate, passId };

    await prisma.earlyArrivalPass.upsert({
      where: { seasonMemberId: ref.seasonMemberId },
      update: passData,
      create: { seasonId, seasonMemberId: ref.seasonMemberId, ...passData },
    });
    created++;
  }

  addReport({
    step: 'Early Arrival',
    created,
    updated,
    skipped,
    warnings,
  });
}
