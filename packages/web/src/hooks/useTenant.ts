"use client";

import { useState, useEffect } from "react";
import { Tenant } from "@camp-platform/shared";
import { applyTenantTheme, getTenantTheme, ThemeConfig } from "@/lib/theme";

// Mock tenant data - in real app this would come from API/context
const mockCampAlborzTenant: Tenant = {
  id: "camp-alborz-id",
  name: "Camp Alborz",
  subdomain: "campalborz",
  status: "active",
  plan: "professional",
  settings: {
    branding: {
      primaryColor: "#8B5A3C", // Persian brown
      secondaryColor: "#D4AF37", // Persian gold
      logo: "",
      favicon: "",
    },
    features: {
      memberManagement: true,
      eventManagement: true,
      taskManagement: true,
      resourceManagement: true,
      paymentProcessing: true,
      customBranding: false,
      apiAccess: false,
    },
    limits: {
      maxMembers: 200,
      maxEvents: 50,
      maxStorage: 5000,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would:
    // 1. Extract subdomain from window.location
    // 2. Make API call to get tenant data
    // 3. Handle loading states and errors
    
    // For now, simulate API call
    const loadTenant = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if we're on a tenant subdomain
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname.includes("campalborz") || hostname.includes("localhost")) {
          setTenant(mockCampAlborzTenant);
          setTheme(getTenantTheme(mockCampAlborzTenant));
        }
      }
      
      setIsLoading(false);
    };

    loadTenant();
  }, []);

  const applyTheme = () => {
    if (tenant) {
      applyTenantTheme(tenant);
    }
  };

  return {
    tenant,
    theme,
    isLoading,
    applyTheme,
  };
}