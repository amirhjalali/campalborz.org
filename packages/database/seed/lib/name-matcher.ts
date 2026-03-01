import { normalizeName } from './data-transforms';

export interface MemberRef {
  id: string;
  email: string;
  name: string;
  seasonMemberId?: string;
}

/**
 * Known aliases: maps variant spellings/nicknames in payment/build sheets
 * to the canonical name used in the Alborzians sheet.
 */
const ALIASES: Record<string, string> = {
  'steve hatz': 'stevie hatz',
  'kristopher berg': 'kristofer berg',
  'michael gold': 'mike gold',
  'samuel huckstep': 'sam huckstep',
  'ebbs klingspor': 'ebba klingspor',
  'timothee boullie': 'timothée boullié',
  'simonavedissian': 'simon avedissian',
  'simon avedissian': 'simon avedissian',
  'artin babayans': 'artin babayan',
  'marclo': 'marcelo costa',
  'nikko': 'nikko gibler',
  'cam': 'cameron willingham',
  'kris': 'kris brons',
};

/**
 * Name matcher that indexes members by email, full name, and first name.
 * Used for cross-sheet matching (payments, build crew, etc.)
 */
export class NameMatcher {
  private byEmail = new Map<string, MemberRef>();
  private byFullName = new Map<string, MemberRef>();
  private byFirstName = new Map<string, MemberRef[]>();
  public warnings: string[] = [];

  addMember(ref: MemberRef) {
    // Index by email (primary)
    if (ref.email) {
      this.byEmail.set(ref.email.trim().toLowerCase(), ref);
    }

    // Index by full name (secondary)
    const fullName = normalizeName(ref.name);
    if (fullName) {
      this.byFullName.set(fullName, ref);
    }

    // Index by first name (tertiary, for ambiguity checks)
    const firstName = fullName.split(' ')[0];
    if (firstName) {
      const existing = this.byFirstName.get(firstName) || [];
      existing.push(ref);
      this.byFirstName.set(firstName, existing);
    }
  }

  /**
   * Find a member by email, name, or first name.
   * Returns the MemberRef or null if not found.
   */
  find(nameOrEmail: string, context?: string): MemberRef | null {
    if (!nameOrEmail || !nameOrEmail.trim()) return null;

    const input = nameOrEmail.trim();

    // Try email first
    if (input.includes('@')) {
      const ref = this.byEmail.get(input.toLowerCase());
      if (ref) return ref;
    }

    // Try full name
    const normalized = normalizeName(input);
    const byName = this.byFullName.get(normalized);
    if (byName) return byName;

    // Try alias
    const alias = ALIASES[normalized];
    if (alias) {
      const byAlias = this.byFullName.get(normalizeName(alias));
      if (byAlias) return byAlias;
    }

    // Try collapsed (no spaces) - handles "SimonAvedissian" -> "simon avedissian"
    const collapsed = normalized.replace(/\s/g, '');
    for (const [key, ref] of this.byFullName) {
      if (key.replace(/\s/g, '') === collapsed) return ref;
    }

    // Try first name (only if unambiguous)
    const firstName = normalized.split(' ')[0];
    const candidates = this.byFirstName.get(firstName);
    if (candidates && candidates.length === 1) {
      return candidates[0];
    }

    // Log warning
    const ctx = context ? ` (${context})` : '';
    if (candidates && candidates.length > 1) {
      this.warnings.push(`Ambiguous name "${input}"${ctx} - matches: ${candidates.map(c => c.name).join(', ')}`);
    } else {
      this.warnings.push(`Unmatched: "${input}"${ctx}`);
    }

    return null;
  }

  /**
   * Find by email only (strict matching).
   */
  findByEmail(email: string): MemberRef | null {
    if (!email) return null;
    return this.byEmail.get(email.trim().toLowerCase()) || null;
  }

  get size(): number {
    return this.byEmail.size;
  }
}
