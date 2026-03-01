import XLSX from 'xlsx';
import path from 'path';

export interface SheetData {
  name: string;
  headers: string[];
  rawRows: any[][];
}

/**
 * Read an Excel workbook and return all sheets as typed row arrays.
 * Uses cellDates to properly handle Excel date serial numbers.
 */
export function readWorkbook(filePath: string): Map<string, SheetData> {
  const absPath = path.resolve(filePath);
  const wb = XLSX.readFile(absPath, { cellDates: true });
  const sheets = new Map<string, SheetData>();

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

    // Extract headers from first row
    const headers = rawRows.length > 0
      ? (rawRows[0] as any[]).map(h => h != null ? String(h).trim() : '')
      : [];

    sheets.set(name, { name, headers, rawRows });
  }

  return sheets;
}

/**
 * Get a sheet by name (with flexible matching: trimmed, case-insensitive).
 */
export function getSheet(sheets: Map<string, SheetData>, name: string): SheetData | undefined {
  // Exact match first
  if (sheets.has(name)) return sheets.get(name);

  // Try trimmed/case-insensitive
  const normalized = name.trim().toLowerCase();
  for (const [key, value] of sheets) {
    if (key.trim().toLowerCase() === normalized) return value;
  }

  return undefined;
}
