"use client";

import Image from "next/image";
import { useTenant } from "@/hooks/useTenant";

interface TenantLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function TenantLogo({ className = "h-8 w-auto", width, height }: TenantLogoProps) {
  const { tenant, theme } = useTenant();

  // If tenant has a custom logo, use it
  if (tenant?.settings?.branding?.logo) {
    return (
      <Image
        src={tenant.settings.branding.logo}
        alt={`${tenant.name} logo`}
        className={className}
        width={width || 32}
        height={height || 32}
      />
    );
  }

  // Default logo - could be a simple branded text or icon
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-primary-600 text-white font-bold ${className}`}
      style={{
        backgroundColor: theme?.colors.primary || "#3b82f6",
        width: width || 32,
        height: height || 32,
      }}
    >
      {tenant?.name?.charAt(0).toUpperCase() || "C"}
    </div>
  );
}