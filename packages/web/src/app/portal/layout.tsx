'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, LogOut, LayoutDashboard, Calendar, CreditCard, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../../components/navigation';

const portalNavItems = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Season', href: '/portal/season', icon: Calendar },
  { label: 'Payments', href: '/portal/payments', icon: CreditCard },
  { label: 'Profile', href: '/portal/profile', icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
        </div>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/portal') return pathname === '/portal';
    return pathname.startsWith(href);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#FAF7F2] pt-20">
        {/* Portal sub-navigation */}
        <div className="border-b border-[#D4C4A8]/40 bg-white/80 backdrop-blur-sm sticky top-16 md:top-20 z-40">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                {portalNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'text-[#D4AF37] bg-[#D4AF37]/5'
                          : 'text-[#4F4434] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {active && (
                        <motion.div
                          layoutId="portal-nav-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 text-[#4F4434] hover:text-[#D4AF37] transition-colors"
                aria-label="Toggle portal navigation"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* User info + logout */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#4F4434] hidden sm:inline">
                  {user.playaName || user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-[#4A5D5A] hover:text-[#D4AF37] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile nav dropdown */}
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#D4C4A8]/20 bg-white"
            >
              <div className="px-4 py-2 space-y-1">
                {portalNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? 'text-[#D4AF37] bg-[#D4AF37]/5 font-medium'
                          : 'text-[#4F4434] hover:text-[#D4AF37]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Page content */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </>
  );
}
