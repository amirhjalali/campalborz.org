/** Convert dollar amount to integer cents */
export function cents(dollars: number | string | null | undefined): number {
  if (dollars == null || dollars === '') return 0;
  const num = typeof dollars === 'string'
    ? parseFloat(dollars.replace(/[$,]/g, ''))
    : dollars;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/** Create a Date at noon UTC for a given YYYY-MM-DD string */
export function d(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00Z');
}

/** Parse Excel date (serial number or string or Date) to JS Date or null */
export function parseDate(val: any): Date | null {
  if (val == null || val === '' || val === 'NA' || val === 'N/A') return null;

  // Already a Date
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val;
  }

  // Excel serial number (number > 40000 is likely a date in 2009+)
  if (typeof val === 'number' && val > 40000) {
    // Convert Excel serial to JS Date
    // Excel epoch: Jan 0, 1900 (with the 1900 leap year bug)
    const utcDays = Math.floor(val - 25569);
    const utcMs = utcDays * 86400 * 1000;
    const date = new Date(utcMs + 12 * 3600 * 1000); // noon UTC
    if (isNaN(date.getTime())) return null;
    return date;
  }

  // String date
  if (typeof val === 'string') {
    // Try various formats
    const str = val.trim();
    if (!str) return null;

    // ISO format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const date = new Date(str.slice(0, 10) + 'T12:00:00Z');
      if (!isNaN(date.getTime())) return date;
    }

    // MM/DD/YYYY
    const parts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (parts) {
      const date = new Date(`${parts[3]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T12:00:00Z`);
      if (!isNaN(date.getTime())) return date;
    }

    // Last resort: let JS parse it
    const date = new Date(str);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

export type HousingType = 'TENT' | 'SHIFTPOD' | 'RV' | 'TRAILER' | 'DORM' | 'SHARED' | 'HEXAYURT' | 'OTHER';

export function parseHousingType(str: string | null | undefined): HousingType | null {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (!s) return null;

  if (s === 'tent') return 'TENT';
  if (s === 'shiftpod') return 'SHIFTPOD';
  if (s === 'rv') return 'RV';
  if (s === 'trailer') return 'TRAILER';
  if (s === 'dorm') return 'DORM';
  if (s === 'shared') return 'SHARED';
  if (s === 'hexayurt') return 'HEXAYURT';

  // Fuzzy matches
  if (s.includes('tent')) return 'TENT';
  if (s.includes('shift')) return 'SHIFTPOD';
  if (s.includes('rv') || s.includes('camper')) return 'RV';
  if (s.includes('trail') || s.includes('airstream')) return 'TRAILER';
  if (s.includes('dorm')) return 'DORM';
  if (s.includes('share')) return 'SHARED';
  if (s.includes('hexa')) return 'HEXAYURT';

  return 'OTHER';
}

export type GridPower = 'NONE' | 'AMP_30' | 'AMP_50';

export function parseGridPower(str: string | null | undefined): GridPower {
  if (!str) return 'NONE';
  const s = str.trim().toLowerCase();
  if (!s || s === 'no' || s === 'n' || s === 'none' || s === 'n/a') return 'NONE';

  if (s.includes('50')) return 'AMP_50';
  if (s.includes('30') || s === 'paid' || s === 'bal' || s === 'yes' || s === 'y') return 'AMP_30';

  return 'NONE';
}

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export function parseGender(str: string | null | undefined): Gender | null {
  if (!str) return null;
  const s = str.trim().toUpperCase();
  if (s === 'M' || s === 'MALE') return 'MALE';
  if (s === 'F' || s === 'FEMALE') return 'FEMALE';
  if (s === 'NB' || s === 'NON-BINARY' || s === 'NON_BINARY') return 'NON_BINARY';
  return null;
}

export function parseYesNo(str: string | null | undefined): boolean {
  if (!str) return false;
  const s = str.trim().toUpperCase();
  return s === 'Y' || s === 'YES' || s === 'TRUE' || s === '1';
}

export type PaymentType = 'DUES' | 'GRID' | 'FOOD' | 'DONATION' | 'RV_VOUCHER' | 'BEER_FUND' | 'TENT' | 'TICKET' | 'STRIKE_DONATION' | 'FUNDRAISING' | 'OTHER';

export function parsePaymentType(str: string | null | undefined): PaymentType {
  if (!str) return 'OTHER';
  const s = str.trim().toLowerCase();

  if (s === 'dues') return 'DUES';
  if (s === 'grid') return 'GRID';
  if (s === 'food') return 'FOOD';
  if (s.includes('donation') && !s.includes('strike')) return 'DONATION';
  if (s.includes('strike')) return 'STRIKE_DONATION';
  if (s.includes('rv') || s.includes('voucher')) return 'RV_VOUCHER';
  if (s.includes('beer')) return 'BEER_FUND';
  if (s === 'tent') return 'TENT';
  if (s === 'ticket') return 'TICKET';
  if (s.includes('fundrais') || s === 'gs') return 'FUNDRAISING';
  if (s.includes('dorm') || s.includes('flama')) return 'OTHER';

  return 'OTHER';
}

export type PaymentMethod = 'VENMO' | 'ZELLE' | 'CASH' | 'CARD' | 'PAYPAL' | 'GIVEBUTTER' | 'OTHER';

export function parsePaymentMethod(str: string | null | undefined): PaymentMethod {
  if (!str) return 'OTHER';
  const s = str.trim().toLowerCase();

  if (s === 'zelle') return 'ZELLE';
  if (s === 'paypal' || s.includes('paypal')) return 'PAYPAL';
  if (s === 'venmo' || s.includes('venmo')) return 'VENMO';
  if (s === 'cash') return 'CASH';
  if (s.includes('card') || s === 'cc') return 'CARD';
  if (s.includes('givebutter')) return 'GIVEBUTTER';
  if (s.includes('direct') || s.includes('ach') || s.includes('deposit')) return 'OTHER';

  return 'OTHER';
}

export type PreApprovalForm = 'YES' | 'MAYBE' | 'NO';

export function parsePreApproval(str: string | null | undefined): PreApprovalForm | null {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s === 'yes' || s === 'y') return 'YES';
  if (s === 'maybe' || s === 'm') return 'MAYBE';
  if (s === 'no' || s === 'n') return 'NO';
  return null;
}

/** Normalize a name for matching: lowercase, trimmed, collapsed spaces */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
