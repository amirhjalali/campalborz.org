import { Tenant } from "@camp-platform/shared";

export interface ThemeColors {
  primary: string;
  secondary: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  logo?: string;
  favicon?: string;
  fontFamily?: string;
  borderRadius?: number;
}

/**
 * Converts a hex color to HSL values
 */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Generates color palette from a base color
 */
function generateColorPalette(baseColor: string): Record<string, string> {
  const [h, s, l] = hexToHsl(baseColor);
  
  const palette: Record<string, string> = {};
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lightnesses = [95, 90, 80, 65, 50, 40, 30, 25, 20, 15, 10];
  
  shades.forEach((shade, index) => {
    const newL = lightnesses[index];
    const newS = shade === 50 || shade === 950 ? Math.max(s - 20, 10) : s;
    palette[shade] = `hsl(${h}, ${newS}%, ${newL}%)`;
  });
  
  return palette;
}

/**
 * Applies tenant theme to the document
 */
export function applyTenantTheme(tenant: Tenant) {
  const settings = tenant.settings as any;
  const branding = settings?.branding || {};
  
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply primary colors
  if (branding.primaryColor) {
    const primaryPalette = generateColorPalette(branding.primaryColor);
    Object.entries(primaryPalette).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
  }
  
  // Apply secondary colors
  if (branding.secondaryColor) {
    const secondaryPalette = generateColorPalette(branding.secondaryColor);
    Object.entries(secondaryPalette).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });
  }
  
  // Apply favicon
  if (branding.favicon) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = branding.favicon;
    }
  }
  
  // Set page title
  document.title = `${tenant.name} - Camp Management Platform`;
}

/**
 * Gets theme configuration for tenant
 */
export function getTenantTheme(tenant: Tenant): ThemeConfig {
  const settings = tenant.settings as any;
  const branding = settings?.branding || {};
  
  return {
    colors: {
      primary: branding.primaryColor || '#3b82f6',
      secondary: branding.secondaryColor || '#6b7280',
    },
    logo: branding.logo,
    favicon: branding.favicon,
  };
}

/**
 * Default theme configuration
 */
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
  },
};

/**
 * Camp Alborz theme configuration
 */
export const campAlborzTheme: ThemeConfig = {
  colors: {
    primary: '#8B5A3C', // Persian brown
    secondary: '#D4AF37', // Persian gold
  },
};