import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { cents } from '../lib/data-transforms';
import { addReport } from '../lib/report';

type BudgetCategory = 'GENERATOR' | 'FUEL' | 'STORAGE' | 'TRUCKS' | 'SOUND' | 'FOOD' |
  'CONTAINERS' | 'BATHROOMS' | 'WATER' | 'GREY_WATER' | 'SHOWERS' | 'DECORATION' |
  'TRASH' | 'SUPPLIES' | 'ART' | 'INFRASTRUCTURE' | 'MISC';

function mapBudgetCategory(description: string): BudgetCategory | null {
  const lower = description.toLowerCase().trim();

  // Exact matches first
  const exactMap: Record<string, BudgetCategory> = {
    'generator': 'GENERATOR',
    'generator fuel estimate': 'FUEL',
    'storage': 'STORAGE',
    'truck rentals': 'TRUCKS',
    'sound equipment': 'SOUND',
    'food': 'FOOD',
    'containers delivery and storage': 'CONTAINERS',
    'bathrooms': 'BATHROOMS',
    'bathrooms + water': 'BATHROOMS',
    'fresh water': 'WATER',
    'grey water': 'GREY_WATER',
    'showers': 'SHOWERS',
    'decoration': 'DECORATION',
    'trash bin': 'TRASH',
    'beer fund': 'MISC',
    'reno pre burn cleanup': 'INFRASTRUCTURE',
    'chef payments': 'FOOD',
    'michael k meals': 'FOOD',
    'bonanza food delivery': 'FOOD',
  };

  // Try exact (also with trailing space trimmed)
  if (exactMap[lower]) return exactMap[lower];

  // Fuzzy matches
  if (lower.includes('generator') && lower.includes('fuel')) return 'FUEL';
  if (lower.includes('generator')) return 'GENERATOR';
  if (lower.includes('food') || lower.includes('meals') || lower.includes('chef')) return 'FOOD';
  if (lower.includes('water') && lower.includes('grey')) return 'GREY_WATER';
  if (lower.includes('water') && lower.includes('fresh')) return 'WATER';
  if (lower.includes('water')) return 'WATER';
  if (lower.includes('bathroom') || lower.includes('ecozoic')) return 'BATHROOMS';
  if (lower.includes('shower')) return 'SHOWERS';
  if (lower.includes('container')) return 'CONTAINERS';
  if (lower.includes('trash') || lower.includes('walker lake')) return 'TRASH';
  if (lower.includes('truck') || lower.includes('reefer')) return 'TRUCKS';
  if (lower.includes('sound') || lower.includes('speaker') || lower.includes('stage')) return 'SOUND';
  if (lower.includes('storage') || lower.includes('fernley')) return 'STORAGE';
  if (lower.includes('decor') || lower.includes('rug') || lower.includes('aluminet') || lower.includes('necklace')) return 'DECORATION';
  if (lower.includes('art car') || lower.includes('damavand') || lower.includes('homa')) return 'ART';
  if (lower.includes('shade') || lower.includes('infrastructure') || lower.includes('ac unit') || lower.includes('demolition') || lower.includes('build') || lower.includes('cleanup')) return 'INFRASTRUCTURE';
  if (lower.includes('ticket') || lower.includes('comped')) return 'MISC';

  return null;
}

/**
 * Import budget lines from the Budget sheet (2025 column).
 *
 * Budget sheet structure:
 * Rows 0-10: Inflow estimations
 * Row 11: ["Budget Estimates:", 2022, null, 2023, null, 2024, null, 2025]
 * Row 12+: [description, 2022val, notes, 2023val, notes, 2024val, notes, 2025val, notes, ...]
 */
export async function importBudget(
  prisma: PrismaClient,
  sheet: SheetData,
  seasonId: string
) {
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;

  const rows = sheet.rawRows;

  // Find the "Budget Estimates:" row
  let startRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row && row[0] && String(row[0]).includes('Budget Estimates')) {
      startRow = i + 1;
      break;
    }
  }

  if (startRow < 0) {
    addReport({ step: 'Budget', created: 0, updated: 0, skipped: 0, warnings: ['Could not find Budget Estimates header'] });
    return;
  }

  // 2025 column index = 7
  const COL_2025 = 7;

  // Track categories we've seen (for merging duplicates)
  const categorySums = new Map<BudgetCategory, { amount: number; descriptions: string[]; notes: string[] }>();

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;

    const description = String(row[0]).trim();
    if (!description || description.includes('Total') || description.startsWith('Budget ')) continue;

    const category = mapBudgetCategory(description);
    if (!category) {
      warnings.push(`Unknown budget category: "${description}"`);
      skipped++;
      continue;
    }

    // Get 2025 value - some rows might have "NA" or text
    const raw2025 = row[COL_2025];
    let amount2025 = 0;
    if (raw2025 != null && raw2025 !== '' && raw2025 !== 'NA') {
      const parsed = typeof raw2025 === 'string'
        ? parseFloat(raw2025.replace(/[$,]/g, ''))
        : Number(raw2025);
      if (!isNaN(parsed)) amount2025 = parsed;
    }

    if (amount2025 === 0) {
      skipped++;
      continue;
    }

    const notes2025 = row[COL_2025 + 1] ? String(row[COL_2025 + 1]).trim() : '';

    // Accumulate into category sums
    const existing = categorySums.get(category);
    if (existing) {
      existing.amount += amount2025;
      existing.descriptions.push(description);
      if (notes2025) existing.notes.push(notes2025);
    } else {
      categorySums.set(category, {
        amount: amount2025,
        descriptions: [description],
        notes: notes2025 ? [notes2025] : [],
      });
    }
  }

  // Write aggregated budget lines
  for (const [category, data] of categorySums) {
    const estimatedAmount = cents(data.amount);
    const description = data.descriptions.join(', ');
    const notes = data.notes.length > 0 ? data.notes.join('; ') : null;

    try {
      await prisma.budgetLine.upsert({
        where: {
          seasonId_category: { seasonId, category },
        },
        update: {
          estimatedAmount,
          description,
          notes,
        },
        create: {
          seasonId,
          category,
          estimatedAmount,
          description,
          notes,
        },
      });
      created++;
    } catch (e: any) {
      warnings.push(`Error importing budget "${category}": ${e.message}`);
      skipped++;
    }
  }

  addReport({
    step: 'Budget',
    created,
    updated: 0,
    skipped,
    warnings,
  });
}
