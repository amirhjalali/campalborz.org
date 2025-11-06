'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  fonts: {
    heading: string;
    body: string;
    [key: string]: string;
  };
  layout?: {
    navigation?: 'top' | 'side';
    footer?: boolean;
    [key: string]: any;
  };
  customCss?: string;
  favicon?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string | null;
  logo?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  theme?: TenantTheme;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
}

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  refreshTenant: () => void;
  hasFeature: (feature: string) => boolean;
  isWithinLimit: (limit: string, current: number) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

// Get tenant info from current domain
function getTenantIdentifier(): { type: 'subdomain' | 'custom' | 'development'; value: string } | null {
  if (typeof window === 'undefined') return null;
  
  const host = window.location.hostname;
  
  // Development mode
  if (host === 'localhost' || host === '127.0.0.1') {
    // Check URL params for tenant
    const urlParams = new URLSearchParams(window.location.search);
    const tenant = urlParams.get('tenant');
    if (tenant) {
      return { type: 'development', value: tenant };
    }
    // Default to campalborz in development
    return { type: 'development', value: 'campalborz' };
  }
  
  // Check for platform subdomain
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'campplatform.org';
  if (host.endsWith(`.${platformDomain}`)) {
    const subdomain = host.replace(`.${platformDomain}`, '');
    return { type: 'subdomain', value: subdomain };
  }
  
  // Custom domain
  return { type: 'custom', value: host };
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  
  const { data: tenant, isLoading, error, refetch } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const identifier = getTenantIdentifier();
      if (!identifier) throw new Error('Could not identify tenant');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // In development, pass tenant as header
      if (identifier.type === 'development') {
        headers['X-Tenant-Slug'] = identifier.value;
      }
      
      const response = await fetch('/api/tenant/current', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to load tenant information');
      }
      
      const data = await response.json();
      setTenantId(data.id);
      return data as Tenant;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    enabled: true,
  });
  
  // Apply tenant theme
  useEffect(() => {
    if (!tenant) return;
    
    const root = document.documentElement;
    
    // Apply base colors
    root.style.setProperty('--color-primary', tenant.primaryColor);
    root.style.setProperty('--color-secondary', tenant.secondaryColor);
    root.style.setProperty('--color-accent', tenant.accentColor);
    root.style.setProperty('--font-heading', tenant.fontFamily);
    
    // Apply theme if exists
    if (tenant.theme) {
      // Apply color variables
      Object.entries(tenant.theme.colors || {}).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      
      // Apply font variables
      Object.entries(tenant.theme.fonts || {}).forEach(([key, value]) => {
        root.style.setProperty(`--font-${key}`, value);
      });
      
      // Apply custom CSS
      if (tenant.theme.customCss) {
        const styleId = 'tenant-custom-styles';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;
        
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }
        
        styleElement.innerHTML = tenant.theme.customCss;
      }
    }
    
    // Update page title
    document.title = `${tenant.name} - Community Platform`;
    
    // Update favicon if provided
    if (tenant.theme?.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || 
                   document.createElement('link');
      link.rel = 'icon';
      link.href = tenant.theme.favicon;
      document.head.appendChild(link);
    }
  }, [tenant]);
  
  const hasFeature = (feature: string): boolean => {
    if (!tenant) return false;
    return tenant.features[feature] === true;
  };
  
  const isWithinLimit = (limit: string, current: number): boolean => {
    if (!tenant) return false;
    const maxLimit = tenant.limits[limit];
    return maxLimit === undefined || current <= maxLimit;
  };
  
  const value: TenantContextValue = {
    tenant,
    isLoading,
    error: error as Error | null,
    refreshTenant: () => refetch(),
    hasFeature,
    isWithinLimit,
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

// HOC for feature gating
export function withFeature(feature: string) {
  return function <T extends {}>(Component: React.ComponentType<T>) {
    return function FeatureGatedComponent(props: T) {
      const { hasFeature } = useTenant();
      
      if (!hasFeature(feature)) {
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700">Feature Not Available</h3>
            <p className="text-gray-600 mt-2">
              This feature is not available in your current plan.
            </p>
          </div>
        );
      }
      
      return <Component {...props} />;
    };
  };
}

// Hook for tenant-aware API calls
export function useTenantApi() {
  const { tenant } = useTenant();
  
  const fetchWithTenant = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    
    if (tenant) {
      headers.set('X-Tenant-Id', tenant.id);
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  };
  
  return { fetchWithTenant };
}