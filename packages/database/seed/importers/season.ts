import { PrismaClient } from '@prisma/client';
import { d } from '../lib/data-transforms';
import { addReport } from '../lib/report';

/**
 * Upsert the 2025 season.
 */
export async function importSeason(prisma: PrismaClient) {
  const season = await prisma.season.upsert({
    where: { year: 2025 },
    update: {
      name: 'Alborz 2025',
      duesAmount: 120000, // $1,200
      gridFee30amp: 50000, // $500
      gridFee50amp: 100000, // $1,000
      startDate: d('2025-08-24'),
      endDate: d('2025-09-01'),
      buildStartDate: d('2025-08-19'),
      strikeEndDate: d('2025-09-03'),
    },
    create: {
      year: 2025,
      name: 'Alborz 2025',
      isActive: false,
      duesAmount: 120000,
      gridFee30amp: 50000,
      gridFee50amp: 100000,
      startDate: d('2025-08-24'),
      endDate: d('2025-09-01'),
      buildStartDate: d('2025-08-19'),
      strikeEndDate: d('2025-09-03'),
    },
  });

  addReport({
    step: 'Season',
    created: 1,
    updated: 0,
    skipped: 0,
    warnings: [],
    details: { id: season.id, year: 2025 },
  });

  return season;
}
