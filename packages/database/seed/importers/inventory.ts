import { PrismaClient } from '@prisma/client';
import { SheetData } from '../lib/excel-reader';
import { addReport } from '../lib/report';

/**
 * Inventory sheet is a multi-column layout:
 * Col 0: "Shade"     Col 2: "Tools"     Col 4: "Kitchen"     Col 6: "Bedding"     Col 8: "Bikes"
 *
 * Each column is a list of items (strings). We parse vertically per category.
 */

type InventoryCategory = 'SHADE' | 'TENT' | 'AC_UNIT' | 'MATTRESS' | 'COT' | 'KITCHEN' | 'BIKE' | 'RUG' | 'CONTAINER' | 'GENERATOR' | 'OTHER';

interface InventoryEntry {
  category: InventoryCategory;
  name: string;
  description?: string;
  quantity: number;
}

function mapCategory(header: string): InventoryCategory {
  const h = header.trim().toLowerCase();
  if (h === 'shade') return 'SHADE';
  if (h === 'kitchen') return 'KITCHEN';
  if (h === 'bedding') return 'MATTRESS'; // bedding covers mattresses/cots
  if (h === 'bikes') return 'BIKE';
  if (h === 'tools') return 'OTHER';
  return 'OTHER';
}

function parseQuantity(str: string): { name: string; quantity: number } {
  // Patterns like "11 XL Twin mattresses with base", "6 Coolers"
  const match = str.match(/^(\d+)\s+(.+)$/);
  if (match) {
    return { name: match[2].trim(), quantity: parseInt(match[1], 10) };
  }
  return { name: str, quantity: 1 };
}

function refineCategory(name: string, baseCategory: InventoryCategory): InventoryCategory {
  const lower = name.toLowerCase();
  if (lower.includes('cot')) return 'COT';
  if (lower.includes('mattress')) return 'MATTRESS';
  if (lower.includes('ac') || lower.includes('a/c') || lower.includes('air condition')) return 'AC_UNIT';
  if (lower.includes('rug') || lower.includes('carpet')) return 'RUG';
  if (lower.includes('generator')) return 'GENERATOR';
  if (lower.includes('container')) return 'CONTAINER';
  if (lower.includes('tent') || lower.includes('shade') || lower.includes('aluminet')) return 'SHADE';
  return baseCategory;
}

/**
 * Import inventory items from the Inventory sheet.
 */
export async function importInventory(
  prisma: PrismaClient,
  sheet: SheetData
) {
  const warnings: string[] = [];
  let created = 0;
  let skipped = 0;

  const rows = sheet.rawRows;
  if (rows.length === 0) {
    addReport({ step: 'Inventory', created: 0, updated: 0, skipped: 0, warnings: ['Empty sheet'] });
    return;
  }

  const headers = rows[0] as any[];

  // Find category column positions
  const categoryColumns: { col: number; category: InventoryCategory }[] = [];
  for (let c = 0; c < headers.length; c++) {
    if (headers[c] && typeof headers[c] === 'string' && headers[c].trim()) {
      categoryColumns.push({
        col: c,
        category: mapCategory(headers[c]),
      });
    }
  }

  // Parse each category column vertically
  for (const { col, category } of categoryColumns) {
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || !row[col]) continue;

      const cellValue = String(row[col]).trim();
      if (!cellValue || cellValue.startsWith('http')) continue; // Skip URLs

      const { name, quantity } = parseQuantity(cellValue);
      if (!name || name.length < 2) continue;

      const refinedCategory = refineCategory(name, category);

      // Check for existing
      const existing = await prisma.inventoryItem.findFirst({
        where: { name, category: refinedCategory },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.inventoryItem.create({
        data: {
          category: refinedCategory,
          name,
          quantity,
        },
      });
      created++;
    }
  }

  addReport({
    step: 'Inventory',
    created,
    updated: 0,
    skipped,
    warnings,
  });
}
