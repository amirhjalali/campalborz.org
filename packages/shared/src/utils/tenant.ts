/**
 * Extracts tenant information from request hostname
 */
export function extractTenantFromHost(host: string): {
  subdomain: string | null;
  domain: string;
  isCustomDomain: boolean;
} {
  const parts = host.split(".");
  
  // Check if it's a custom domain (not our platform domain)
  const platformDomains = ["localhost", "campplatform.com", "camps.app"];
  const isCustomDomain = !platformDomains.some(domain => host.includes(domain));
  
  if (isCustomDomain) {
    return {
      subdomain: null,
      domain: host,
      isCustomDomain: true,
    };
  }
  
  // Extract subdomain from platform domain
  if (parts.length >= 3) {
    return {
      subdomain: parts[0],
      domain: parts.slice(1).join("."),
      isCustomDomain: false,
    };
  }
  
  return {
    subdomain: null,
    domain: host,
    isCustomDomain: false,
  };
}

/**
 * Generates a unique subdomain for a tenant
 */
export function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 63); // DNS label limit
}

/**
 * Validates if a subdomain is available and valid
 */
export function isValidSubdomain(subdomain: string): boolean {
  // RFC 1123 hostname validation
  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return regex.test(subdomain);
}

/**
 * Reserved subdomains that cannot be used by tenants
 */
export const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "admin",
  "app",
  "docs",
  "help",
  "support",
  "blog",
  "mail",
  "email",
  "ftp",
  "test",
  "staging",
  "dev",
  "demo",
  "status",
  "dashboard",
  "portal",
  "console",
  "manage",
  "control",
  "panel",
];