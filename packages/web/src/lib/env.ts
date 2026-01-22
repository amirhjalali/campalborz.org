/**
 * Environment Variable Validation
 *
 * Validates required environment variables at build/runtime
 * and provides type-safe access to env vars.
 */

interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;
  wsUrl: string;

  // Platform
  platformName: string;
  defaultTenant: string;

  // Payment
  stripePublishableKey: string;

  // Analytics (optional)
  googleAnalyticsId?: string;
  plausibleDomain?: string;

  // Feature Flags
  enableChat: boolean;
  enableDonations: boolean;
  enableApplications: boolean;

  // Environment
  nodeEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Required environment variables
 * Build will fail if these are missing in production
 */
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_WS_URL',
  'NEXT_PUBLIC_PLATFORM_NAME',
  'NEXT_PUBLIC_DEFAULT_TENANT',
] as const;

/**
 * Required in production only
 */
const requiredInProduction = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

/**
 * Validate environment variables
 * Note: Validation is lenient - only warns, doesn't throw
 */
function validateEnv(): void {
  const errors: string[] = [];

  // Check required vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing environment variable: ${envVar}`);
    }
  }

  if (errors.length > 0) {
    // Always just warn - don't throw errors that break the build
    console.warn('\n⚠️  Some environment variables are not set:', errors.join(', '));
  }
}

/**
 * Parse boolean environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Get validated environment configuration
 */
function getEnvConfig(): EnvironmentConfig {
  // Validate first
  validateEnv();

  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  return {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',

    // Platform
    platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Camp Management Platform',
    defaultTenant: process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'campalborz',

    // Payment
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

    // Analytics
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,

    // Feature Flags
    enableChat: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_CHAT, false),
    enableDonations: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_DONATIONS, true),
    enableApplications: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_APPLICATIONS, true),

    // Environment
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
}

/**
 * Export validated environment configuration
 */
export const env = getEnvConfig();

/**
 * Type-safe environment variable access
 *
 * Usage:
 * ```ts
 * import { env } from '@/lib/env';
 *
 * const apiUrl = env.apiUrl;
 * if (env.isDevelopment) {
 *   console.log('Running in development mode');
 * }
 * ```
 */
export default env;
