import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { NameMatcher } from '../lib/name-matcher';
import { d } from '../lib/data-transforms';
import { addReport } from '../lib/report';

/**
 * Build sheet structure:
 * Row 0 (headers): [null, "Tuesday (19)", "EMAIL", "Ticket ID", null, null, null, "Friday (22)", "EMAIL", "Ticket ID"]
 * Data rows have names and optional emails in columns grouped by day.
 * Day headers appear in the data rows too (e.g., row 8: "Wednesday(20)", row 18: "Thursday (21)")
 *
 * Layout: Columns 1-3 = left side days (Tue, Wed, Thu, Sat), Columns 7-9 = right side (Fri)
 */

interface BuildDayConfig {
  name: string;
  date: string;
  // Column offsets for name, email, ticketId
  nameCol: number;
  emailCol: number;
  ticketCol: number;
  // Row range to scan (start is inclusive header row, end is exclusive)
}

// Parse the build sheet by scanning for day header patterns
function parseBuildSheet(rawRows: any[][]): Map<string, { name: string; email: string | null; ticketId: string | null }[]> {
  const days = new Map<string, { name: string; email: string | null; ticketId: string | null }[]>();

  // Left side columns (1=name, 2=email, 3=ticketId) contain Tue, Wed, Thu, Sat
  // Right side columns (7=name, 8=email, 9=ticketId) contain Fri
  // Day headers appear as text in the name column

  let currentLeftDay = 'Tuesday';
  let currentRightDay = 'Friday';

  // First pass: collect right-side entries, detecting day headers
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row) continue;
    const rightName = row[7] ? String(row[7]).trim() : null;
    if (rightName && rightName.length > 1) {
      // Check if it's a day header (e.g., "Saturday (23)")
      if (/tuesday|wednesday|thursday|friday|saturday|sunday/i.test(rightName)) {
        if (/saturday/i.test(rightName)) currentRightDay = 'Saturday';
        else if (/friday/i.test(rightName)) currentRightDay = 'Friday';
        continue;
      }
      // Skip non-name entries (numbers, "Ticket ID", "EMAIL", summary rows)
      if (/^\d+$/.test(rightName) || rightName === 'Ticket ID' || rightName === 'EMAIL') continue;
      if (rightName.includes('WAPS') || rightName.includes('Total')) continue;

      const rightEmail = row[8] ? String(row[8]).trim() : null;
      const rightTicket = row[9] != null ? String(row[9]).trim() : null;
      if (!days.has(currentRightDay)) days.set(currentRightDay, []);
      days.get(currentRightDay)!.push({
        name: rightName,
        email: rightEmail && rightEmail.includes('@') ? rightEmail : null,
        ticketId: rightTicket && rightTicket !== 'NA' ? rightTicket : null,
      });
    }
  }

  // Second pass: collect left-side entries, detecting day headers
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row) continue;

    const leftRaw = row[1];
    const leftName = leftRaw != null ? String(leftRaw).trim() : null;
    if (!leftName || leftName.length < 2) continue;

    // Skip non-name entries (numbers, ticket IDs, headers, summary rows)
    if (/^\d+$/.test(leftName) || leftName === 'Ticket ID' || leftName === 'EMAIL') continue;
    if (leftName.includes('WAPS') || leftName.includes('Total')) continue;

    // Day header detection
    if (/tuesday|wednesday|thursday|saturday/i.test(leftName)) {
      if (/tuesday/i.test(leftName)) currentLeftDay = 'Tuesday';
      else if (/wednesday/i.test(leftName)) currentLeftDay = 'Wednesday';
      else if (/thursday/i.test(leftName)) currentLeftDay = 'Thursday';
      else if (/saturday/i.test(leftName)) currentLeftDay = 'Saturday';
      continue;
    }

    const leftEmail = row[2] ? String(row[2]).trim() : null;
    const leftTicket = row[3] != null ? String(row[3]).trim() : null;

    if (!days.has(currentLeftDay)) days.set(currentLeftDay, []);
    days.get(currentLeftDay)!.push({
      name: leftName,
      email: leftEmail && leftEmail.includes('@') ? leftEmail : null,
      ticketId: leftTicket && leftTicket !== 'NA' ? leftTicket : null,
    });
  }

  return days;
}

const BUILD_DAY_DATES: Record<string, string> = {
  'Tuesday': '2025-08-19',
  'Wednesday': '2025-08-20',
  'Thursday': '2025-08-21',
  'Friday': '2025-08-22',
  'Saturday': '2025-08-23',
};

/**
 * Import build days and assignments from the "Build sheet".
 */
export async function importBuildCrew(
  prisma: PrismaClient,
  sheet: SheetData,
  seasonId: string,
  matcher: NameMatcher
) {
  const warnings: string[] = [];
  let daysCreated = 0;
  let assignmentsCreated = 0;
  let skipped = 0;

  const dayEntries = parseBuildSheet(sheet.rawRows);

  for (const [dayName, entries] of dayEntries) {
    const dateStr = BUILD_DAY_DATES[dayName];
    if (!dateStr) {
      warnings.push(`Unknown build day: ${dayName}`);
      continue;
    }

    const date = d(dateStr);

    // Find or create build day
    let buildDay = await prisma.buildDay.findFirst({
      where: { seasonId, date },
    });

    if (!buildDay) {
      buildDay = await prisma.buildDay.create({
        data: {
          seasonId,
          date,
          name: `${dayName} Build`,
        },
      });
      daysCreated++;
    }

    // Create assignments
    for (const entry of entries) {
      // Try to match by email first, then name
      const ref = entry.email
        ? matcher.findByEmail(entry.email) || matcher.find(entry.name, `build ${dayName}`)
        : matcher.find(entry.name, `build ${dayName}`);

      if (!ref || !ref.seasonMemberId) {
        warnings.push(`Unmatched build crew: "${entry.name}" on ${dayName}`);
        skipped++;
        continue;
      }

      // Upsert assignment
      const existing = await prisma.buildAssignment.findUnique({
        where: {
          buildDayId_seasonMemberId: {
            buildDayId: buildDay.id,
            seasonMemberId: ref.seasonMemberId,
          },
        },
      });

      if (!existing) {
        await prisma.buildAssignment.create({
          data: {
            buildDayId: buildDay.id,
            seasonMemberId: ref.seasonMemberId,
            wapTicketId: entry.ticketId,
          },
        });
        assignmentsCreated++;
      } else {
        skipped++;
      }
    }
  }

  addReport({
    step: 'Build Crew',
    created: assignmentsCreated,
    updated: 0,
    skipped,
    warnings,
    details: {
      'Build days': daysCreated,
      'Assignments': assignmentsCreated,
    },
  });
}
