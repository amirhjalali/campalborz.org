"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTenant } from "@/hooks/useTenant";
import { TenantLogo } from "@/components/ui/TenantLogo";

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
    <header className={`bg-white shadow-sm border-b border-secondary-200 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and tenant name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <TenantLogo className="h-8 w-auto" />
              <span className="ml-3 text-xl font-bold text-secondary-900">
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
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? "bg-primary-100 text-primary-700"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            {/* User profile dropdown would go here */}
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
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
          <div className="md:hidden border-t border-secondary-200 pt-4 pb-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    item.current
                      ? "bg-primary-100 text-primary-700"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
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