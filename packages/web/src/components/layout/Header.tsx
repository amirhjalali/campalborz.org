"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTenant } from "@/hooks/useTenant";
import { TenantLogo } from "@/components/ui/TenantLogo";
import SearchBar from "@/components/search/SearchBar";

interface NavItem {
  name: string;
  href: string;
  current?: boolean;
}

interface HeaderProps {
  navigation: NavItem[];
  className?: string;
}

export function Header({ navigation, className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tenant, theme } = useTenant();

  return (
    <header className={`bg-warm-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(160,82,45,0.08)] border-b border-dust-khaki/20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and tenant name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <TenantLogo className="h-8 w-auto" />
              <span className="ml-3 text-xl font-display font-bold text-desert-night">
                {tenant?.name || "Camp Platform"}
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-ui font-medium rounded-lg transition-all duration-300 ${
                  item.current
                    ? "bg-desert-sand/30 text-burnt-sienna font-semibold"
                    : "text-desert-night/70 hover:text-burnt-sienna hover:bg-desert-sand/20"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-6">
            <SearchBar 
              placeholder="Search..." 
              className="w-full"
              showFilters={false}
            />
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            {/* User profile dropdown would go here */}
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-desert-night/70 hover:text-burnt-sienna hover:bg-desert-sand/20 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dust-khaki/20 pt-4 pb-4">
            {/* Mobile Search */}
            <div className="px-3 pb-3 mb-3 border-b border-dust-khaki/10">
              <SearchBar 
                placeholder="Search..." 
                className="w-full"
                showFilters={false}
              />
            </div>
            
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-ui font-medium rounded-lg transition-all duration-300 ${
                    item.current
                      ? "bg-desert-sand/30 text-burnt-sienna font-semibold"
                      : "text-desert-night/70 hover:text-burnt-sienna hover:bg-desert-sand/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}