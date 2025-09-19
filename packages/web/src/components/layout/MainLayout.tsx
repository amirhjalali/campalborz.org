"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useTenant } from "@/hooks/useTenant";

interface MainLayoutProps {
  children: ReactNode;
  navigation?: Array<{
    name: string;
    href: string;
    current?: boolean;
  }>;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
  full: "max-w-none",
};

const defaultNavigation = [
  { name: "Home", href: "/", current: true },
  { name: "About", href: "/about" },
  { name: "Members", href: "/members" },
  { name: "Events", href: "/events" },
  { name: "Art", href: "/art" },
  { name: "Apply", href: "/apply" },
  { name: "Donate", href: "/donate" },
];

export function MainLayout({
  children,
  navigation = defaultNavigation,
  showHeader = true,
  showFooter = true,
  maxWidth = "7xl",
  className,
}: MainLayoutProps) {
  const { tenant, applyTheme } = useTenant();

  // Apply tenant theme on mount
  if (typeof window !== "undefined" && tenant) {
    applyTheme();
  }

  return (
    <div className={`min-h-screen flex flex-col bg-secondary-50 ${className}`}>
      {showHeader && <Header navigation={navigation} />}
      
      <main className="flex-1">
        <div className={`mx-auto ${maxWidthClasses[maxWidth]} px-4 sm:px-6 lg:px-8`}>
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}