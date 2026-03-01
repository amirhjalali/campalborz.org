import { PrismaClient } from '@prisma/client';
import { addReport } from '../lib/report';

/**
 * Import strike assignments.
 * Strike data comes from the Alborzians sheet's "Strike" column (strikeCrew flag),
 * which is already parsed during member import. This importer creates
 * StrikeAssignment records for members with strikeCrew=true.
 */
export async function importStrike(
  prisma: PrismaClient,
  seasonId: string
) {
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;

  // Find all season members with strikeCrew flag
  const strikeMembers = await prisma.seasonMember.findMany({
    where: {
      seasonId,
      strikeCrew: true,
    },
    include: {
      member: true,
    },
  });

  for (const sm of strikeMembers) {
    // Upsert by seasonMemberId (unique)
    const existing = await prisma.strikeAssignment.findUnique({
      where: { seasonMemberId: sm.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.strikeAssignment.create({
      data: {
        seasonId,
        seasonMemberId: sm.id,
        departureDate: sm.departureDate,
      },
    });
    created++;
  }

  addReport({
    step: 'Strike',
    created,
    updated: 0,
    skipped,
    warnings,
  });
}
