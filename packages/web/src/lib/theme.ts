/**
 * Theme Utilities
 *
 * Functions for generating CSS custom properties from brand configuration
 * and applying them to the document.
 */

import { brandConfig } from '../../../../config/brand.config';
import type { BrandConfig } from '../../../../config/types';

/**
 * Generate CSS custom properties from brand configuration
 */
export function generateCSSVariables(config: BrandConfig): Record<string, string> {
  const variables: Record<string, string> = {};

  // Extended theme colors
  if (config.theme.colors) {
    const { colors } = config.theme;

    // Primary colors
    if (colors.primary) {
      variables['--color-primary'] = colors.primary.DEFAULT;
      variables['--color-primary-light'] = colors.primary.light;
      variables['--color-primary-dark'] = colors.primary.dark;

      // Add full scale if available
      for (let i = 50; i <= 900; i += (i < 100 ? 50 : 100)) {
        const shade = colors.primary[i as keyof typeof colors.primary];
        if (shade) {
          variables[`--color-primary-${i}`] = shade;
        }
      }
    }

    // Secondary colors
    if (colors.secondary) {
      variables['--color-secondary'] = colors.secondary.DEFAULT;
      variables['--color-secondary-light'] = colors.secondary.light;
      variables['--color-secondary-dark'] = colors.secondary.dark;

      for (let i = 50; i <= 900; i += (i < 100 ? 50 : 100)) {
        const shade = colors.secondary[i as keyof typeof colors.secondary];
        if (shade) {
          variables[`--color-secondary-${i}`] = shade;
        }
      }
    }

    // Accent colors
    if (colors.accent) {
      variables['--color-accent'] = colors.accent.DEFAULT;
      variables['--color-accent-light'] = colors.accent.light;
      variables['--color-accent-dark'] = colors.accent.dark;

      for (let i = 50; i <= 900; i += (i < 100 ? 50 : 100)) {
        const shade = colors.accent[i as keyof typeof colors.accent];
        if (shade) {
          variables[`--color-accent-${i}`] = shade;
        }
      }
    }

    // Neutral colors
    if (colors.neutral) {
      for (let i = 50; i <= 900; i += (i < 100 ? 50 : 100)) {
        const shade = colors.neutral[i as keyof typeof colors.neutral];
        if (shade) {
          variables[`--color-neutral-${i}`] = shade;
        }
      }
    }

    // Semantic colors
    if (colors.semantic) {
      variables['--color-success'] = colors.semantic.success;
      variables['--color-warning'] = colors.semantic.warning;
      variables['--color-error'] = colors.semantic.error;
      variables['--color-info'] = colors.semantic.info;
    }

    // Background colors
    if (colors.background) {
      variables['--color-bg-primary'] = colors.background.primary;
      variables['--color-bg-secondary'] = colors.background.secondary;
      variables['--color-bg-tertiary'] = colors.background.tertiary;
    }

    // Text colors
    if (colors.text) {
      variables['--color-text-primary'] = colors.text.primary;
      variables['--color-text-secondary'] = colors.text.secondary;
      variables['--color-text-tertiary'] = colors.text.tertiary;
      variables['--color-text-inverse'] = colors.text.inverse;
    }

    // Border colors
    if (colors.border) {
      variables['--color-border-light'] = colors.border.light;
      variables['--color-border'] = colors.border.DEFAULT;
      variables['--color-border-dark'] = colors.border.dark;
    }
  }

  // Gradients
  if (config.theme.gradients) {
    const { gradients } = config.theme;
    Object.entries(gradients).forEach(([key, value]) => {
      variables[`--gradient-${key}`] = value;
    });
  }

  // Shadows
  if (config.theme.shadows) {
    const { shadows } = config.theme;
    Object.entries(shadows).forEach(([key, value]) => {
      const cssKey = key === 'DEFAULT' ? 'shadow' : `shadow-${key}`;
      variables[`--${cssKey}`] = value;
    });
  }

  // Border radius
  if (config.theme.radius) {
    const { radius } = config.theme;
    Object.entries(radius).forEach(([key, value]) => {
      const cssKey = key === 'DEFAULT' ? 'radius' : `radius-${key}`;
      variables[`--${cssKey}`] = value;
    });
  }

  // Spacing
  if (config.theme.spacing) {
    const { spacing } = config.theme;
    Object.entries(spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });
  }

  // Fonts
  variables['--font-display'] = config.fonts.display;
  variables['--font-body'] = config.fonts.body;
  variables['--font-ui'] = config.fonts.ui;

  return variables;
}

/**
 * Apply CSS variables to the document root
 */
export function applyCSSVariables(variables: Record<string, string>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Apply theme from brand configuration
 */
export function applyTheme(config: BrandConfig = brandConfig): void {
  const variables = generateCSSVariables(config);
  applyCSSVariables(variables);
}

/**
 * Get a CSS variable value
 */
export function getCSSVariable(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Convert RGB string to hex
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgb;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    display?: string;
    body?: string;
    ui?: string;
  };
}

/**
 * Get theme configuration for a tenant
 * @param tenant - Tenant object with branding settings
 * @returns Theme configuration
 */
export function getTenantTheme(tenant: any): ThemeConfig {
  const { branding } = tenant.settings || {};

  return {
    colors: {
      primary: branding?.primaryColor || brandConfig.theme.colors.primary.DEFAULT,
      secondary: branding?.secondaryColor || brandConfig.theme.colors.secondary.DEFAULT,
      accent: branding?.accentColor || brandConfig.theme.colors.accent?.DEFAULT,
    },
    fonts: {
      display: brandConfig.fonts.display,
      body: brandConfig.fonts.body,
      ui: brandConfig.fonts.ui,
    },
  };
}

/**
 * Apply tenant-specific theme to the document
 * @param theme - Theme configuration to apply
 */
export function applyTenantTheme(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);

  if (theme.colors.accent) {
    root.style.setProperty('--color-accent', theme.colors.accent);
  }

  if (theme.colors.background) {
    root.style.setProperty('--color-bg-primary', theme.colors.background);
  }

  if (theme.colors.text) {
    root.style.setProperty('--color-text-primary', theme.colors.text);
  }

  // Apply fonts
  if (theme.fonts?.display) {
    root.style.setProperty('--font-display', theme.fonts.display);
  }

  if (theme.fonts?.body) {
    root.style.setProperty('--font-body', theme.fonts.body);
  }

  if (theme.fonts?.ui) {
    root.style.setProperty('--font-ui', theme.fonts.ui);
  }
}
