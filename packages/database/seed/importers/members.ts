import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { NameMatcher, MemberRef } from '../lib/name-matcher';
import {
  parseHousingType,
  parseGridPower,
  parseGender,
  parseYesNo,
  parsePreApproval,
  parseDate,
  normalizeName,
} from '../lib/data-transforms';
import { addReport } from '../lib/report';

// Column indices in the Alborzians sheet
const COL = {
  CONFIRMED: 0,
  WHATSAPP: 1,
  NAME: 2,
  EMAIL: 3,
  DUES_PAID: 4,
  GRID: 5,
  HOUSING: 6,
  SIZE: 7,
  // 8 is null
  RIDE_DETAILS: 9,
  ARRIVAL: 10,
  DEPARTURE: 11,
  DIETARY: 12,
  SHIFTS: 13,
  PRE_APPROVAL: 14,
  GENDER: 15,
  TICKET: 16,
  BUILD: 17,
  STRIKE: 18,
  ALBORZ_VIRGIN: 19,
  BM_VIRGIN: 20,
  MAP_OBJECT: 21,
};

function isRealMember(row: any[]): boolean {
  if (!row || row.length <= COL.NAME) return false;
  const name = row[COL.NAME];
  if (!name || typeof name !== 'string') return false;
  const n = name.trim();
  if (!n) return false;
  // Filter out summary/stats rows
  if (n.includes(':') || n.includes('Total') || /^\d+$/.test(n)) return false;
  return true;
}

function generatePlaceholderEmail(name: string): string {
  const parts = normalizeName(name).split(' ');
  const slug = parts.join('.').replace(/[^a-z0-9.]/g, '');
  return `${slug}@placeholder.campalborz.org`;
}

/**
 * Import members from Alborzians sheet.
 * Creates Member + SeasonMember records.
 * Returns a NameMatcher populated with all imported members.
 */
export async function importMembers(
  prisma: PrismaClient,
  sheet: SheetData,
  seasonId: string
): Promise<NameMatcher> {
  const matcher = new NameMatcher();
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;

  const rows = sheet.rawRows;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!isRealMember(row)) continue;

    const name = String(row[COL.NAME]).trim();
    let email = row[COL.EMAIL] ? String(row[COL.EMAIL]).trim().toLowerCase() : '';

    // Clean up email - remove trailing spaces
    email = email.replace(/\s+/g, '');

    if (!email || !email.includes('@')) {
      // Generate placeholder email for members without one
      email = generatePlaceholderEmail(name);
      warnings.push(`No email for "${name}" - using placeholder: ${email}`);
    }

    // Determine role
    const role = normalizeName(name) === 'amir jalali' ? 'ADMIN' : 'MEMBER';

    // Upsert member
    const member = await prisma.member.upsert({
      where: { email },
      update: {
        name,
        gender: parseGender(row[COL.GENDER]) ?? undefined,
      },
      create: {
        email,
        name,
        gender: parseGender(row[COL.GENDER]),
        role: role as any,
        isActive: true,
        passwordHash: null,
        dietaryRestrictions: row[COL.DIETARY] ? String(row[COL.DIETARY]).trim() : null,
      },
    });

    // Parse housing type - handle "shared with X" patterns
    let housingStr = row[COL.HOUSING] ? String(row[COL.HOUSING]).trim() : null;
    let housingNotes: string | null = null;
    if (housingStr && housingStr.toLowerCase().startsWith('shared w')) {
      housingNotes = housingStr;
      housingStr = 'Shared';
    }
    if (housingStr === 'Dorm or Tent') {
      housingNotes = housingStr;
      housingStr = 'Dorm';
    }

    // Parse confirmed status
    const confirmedVal = row[COL.CONFIRMED] ? String(row[COL.CONFIRMED]).trim().toUpperCase() : '';
    let status: 'CONFIRMED' | 'INTERESTED' | 'MAYBE' | 'CANCELLED' = 'CONFIRMED';
    if (confirmedVal === 'Y' || confirmedVal === 'YES' || confirmedVal === 'CONFIRMED') {
      status = 'CONFIRMED';
    } else if (confirmedVal === 'N' || confirmedVal === 'NO' || confirmedVal === 'CANCELLED') {
      status = 'CANCELLED';
    } else if (confirmedVal === 'MAYBE') {
      status = 'MAYBE';
    }

    // Build specialRequests from dues-paid notes and housing notes
    const specialParts: string[] = [];
    const duesPaid = row[COL.DUES_PAID] ? String(row[COL.DUES_PAID]).trim() : '';
    if (duesPaid && duesPaid !== 'Y' && duesPaid !== 'N') {
      specialParts.push(`Dues: ${duesPaid}`);
    }
    if (housingNotes) specialParts.push(`Housing: ${housingNotes}`);

    // Shared fields for season member upsert
    const seasonMemberData = {
      status,
      housingType: parseHousingType(housingStr),
      housingSize: row[COL.SIZE] ? String(row[COL.SIZE]).trim() : null,
      gridPower: parseGridPower(row[COL.GRID] ? String(row[COL.GRID]) : null),
      arrivalDate: parseDate(row[COL.ARRIVAL]),
      departureDate: parseDate(row[COL.DEPARTURE]),
      preApprovalForm: parsePreApproval(row[COL.PRE_APPROVAL] ? String(row[COL.PRE_APPROVAL]) : null),
      buildCrew: parseYesNo(row[COL.BUILD] ? String(row[COL.BUILD]) : null),
      strikeCrew: parseYesNo(row[COL.STRIKE] ? String(row[COL.STRIKE]) : null),
      isAlborzVirgin: parseYesNo(row[COL.ALBORZ_VIRGIN] ? String(row[COL.ALBORZ_VIRGIN]) : null),
      isBMVirgin: parseYesNo(row[COL.BM_VIRGIN] ? String(row[COL.BM_VIRGIN]) : null),
      addedToWhatsApp: parseYesNo(row[COL.WHATSAPP] ? String(row[COL.WHATSAPP]) : null),
      specialRequests: specialParts.length > 0 ? specialParts.join('; ') : null,
      rideDetails: row[COL.RIDE_DETAILS] ? String(row[COL.RIDE_DETAILS]).trim() : null,
      mapObject: row[COL.MAP_OBJECT] ? String(row[COL.MAP_OBJECT]).trim() : null,
    };

    // Upsert season member
    const sm = await prisma.seasonMember.upsert({
      where: {
        seasonId_memberId: { seasonId, memberId: member.id },
      },
      update: seasonMemberData,
      create: { seasonId, memberId: member.id, ...seasonMemberData },
    });

    // Add to matcher
    const ref: MemberRef = {
      id: member.id,
      email: member.email,
      name: member.name,
      seasonMemberId: sm.id,
    };
    matcher.addMember(ref);
    created++;
  }

  addReport({
    step: 'Members',
    created,
    updated: 0,
    skipped,
    warnings,
    details: {
      'With email': created - warnings.filter(w => w.includes('placeholder')).length,
      'Placeholder email': warnings.filter(w => w.includes('placeholder')).length,
    },
  });

  return matcher;
}
