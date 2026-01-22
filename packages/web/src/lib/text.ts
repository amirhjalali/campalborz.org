/**
 * Text and String Utility Functions
 *
 * Helper functions for string manipulation, formatting, and validation
 */

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert to sentence case (first letter capitalized, rest lowercase)
 */
export function sentenceCase(str: string): string {
  if (!str) return '';
  return capitalize(str.toLowerCase());
}

/**
 * Convert to slug (URL-friendly string)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert to camelCase
 */
export function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert to PascalCase
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Convert to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Convert to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate string to a maximum length
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Truncate string at word boundary
 */
export function truncateWords(str: string, maxWords: number, suffix: string = '...'): string {
  if (!str) return '';
  const words = str.split(/\s+/);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for HTML display
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'\/]/g, (char) => htmlEntities[char]);
}

/**
 * Count words in a string
 */
export function wordCount(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count characters (excluding whitespace)
 */
export function charCount(str: string, includeSpaces: boolean = false): number {
  if (!str) return 0;
  return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

/**
 * Calculate reading time (words per minute)
 */
export function readingTime(str: string, wordsPerMinute: number = 200): {
  minutes: number;
  words: number;
  text: string;
} {
  const words = wordCount(str);
  const minutes = Math.ceil(words / wordsPerMinute);

  return {
    minutes,
    words,
    text: `${minutes} min read`,
  };
}

/**
 * Pluralize a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  if (plural) return plural;

  // Common pluralization rules
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Format a count with pluralized word
 */
export function formatCount(count: number, word: string, plural?: string): string {
  return `${count} ${pluralize(word, count, plural)}`;
}

/**
 * Extract initials from a name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, maxLength).toUpperCase();
  }

  const initials = parts
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials.substring(0, maxLength);
}

/**
 * Format a name (First Last)
 */
export function formatName(firstName: string, lastName: string, format: 'full' | 'last-first' | 'initials' = 'full'): string {
  const first = firstName.trim();
  const last = lastName.trim();

  if (!first && !last) return '';
  if (!first) return last;
  if (!last) return first;

  switch (format) {
    case 'full':
      return `${first} ${last}`;
    case 'last-first':
      return `${last}, ${first}`;
    case 'initials':
      return getInitials(`${first} ${last}`);
    default:
      return `${first} ${last}`;
  }
}

/**
 * Extract URLs from text
 */
export function extractUrls(str: string): string[] {
  if (!str) return [];
  const urlRegex = /https?:\/\/[^\s]+/g;
  return str.match(urlRegex) || [];
}

/**
 * Extract email addresses from text
 */
export function extractEmails(str: string): string[] {
  if (!str) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return str.match(emailRegex) || [];
}

/**
 * Mask email address (show first/last characters)
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;

  const maskedUsername = username.length > 2
    ? username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
    : username;

  return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone number (show last 4 digits)
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `***-***-${digits.slice(-4)}`;
}

/**
 * Format phone number (US format)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.charAt(0) === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    ...options,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Compact number (1000 -> 1K, 1000000 -> 1M)
 */
export function compactNumber(num: number, decimals: number = 1): string {
  if (num < 1000) return num.toString();

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
  const scaled = num / Math.pow(1000, magnitude);

  return `${scaled.toFixed(decimals)}${suffixes[magnitude]}`;
}

/**
 * Highlight text matches
 */
export function highlightText(text: string, query: string, className: string = 'highlight'): string {
  if (!query || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * Escape special characters in a string for use in a regular expression
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if string contains only letters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Generate random string
 */
export function randomString(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = randomString(5);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Reverse a string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Pad string to a certain length
 */
export function pad(str: string, length: number, char: string = ' ', position: 'start' | 'end' | 'both' = 'end'): string {
  const padding = char.repeat(Math.max(0, length - str.length));

  switch (position) {
    case 'start':
      return padding + str;
    case 'both':
      const half = Math.floor(padding.length / 2);
      return padding.slice(0, half) + str + padding.slice(half);
    case 'end':
    default:
      return str + padding;
  }
}

/**
 * Remove extra whitespace from string
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Convert string to boolean
 */
export function toBoolean(str: string): boolean {
  const normalized = str.toLowerCase().trim();
  return ['true', '1', 'yes', 'on', 'y'].includes(normalized);
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Format list of items
 */
export function formatList(items: string[], conjunction: 'and' | 'or' = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(` ${conjunction} `);

  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, ${conjunction} ${last}`;
}

/**
 * Convert text to title (for display)
 */
export function toTitle(str: string): string {
  // Handle special cases
  const specialWords = ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];

  return str
    .split(/\s+/)
    .map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return capitalize(word);
      }

      // Don't capitalize special words unless they're at the start
      if (specialWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }

      return capitalize(word);
    })
    .join(' ');
}

/**
 * Smart quote replacement
 */
export function smartQuotes(str: string): string {
  return str
    .replace(/(\s|^)"([^"]*)"/g, '$1\u201C$2\u201D') // Replace double quotes
    .replace(/(\s|^)'([^']*)'/g, '$1\u2018$2\u2019'); // Replace single quotes
}

/**
 * Remove diacritics (accents) from string
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Similarity score between two strings (Levenshtein distance)
 */
export function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
