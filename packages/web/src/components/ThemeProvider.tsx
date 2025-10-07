'use client';

/**
 * ThemeProvider Component
 *
 * Applies CSS custom properties from brand configuration to the document.
 * This enables dynamic theming across the entire application.
 */

import { useEffect } from 'react';
import { applyTheme } from '../lib/theme';
import { useBrandConfig } from '../hooks/useConfig';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const brandConfig = useBrandConfig();

  useEffect(() => {
    // Apply theme on mount and whenever brand config changes
    applyTheme(brandConfig);
  }, [brandConfig]);

  // The provider doesn't render anything - it just applies CSS variables
  return <>{children}</>;
}
