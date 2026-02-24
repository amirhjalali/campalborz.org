'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Users,
  FolderOpen,
  Megaphone,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Navigation } from '../navigation';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface MemberPortalLayoutProps {
  children: ReactNode;
}

const sidebarLinks = [
  { href: '/members', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/members/announcements', label: 'Announcements', icon: Megaphone, exact: false },
  { href: '/members/directory', label: 'Directory', icon: Users, exact: false },
  { href: '/members/resources', label: 'Resources', icon: FolderOpen, exact: false },
  { href: '/members/profile', label: 'My Profile', icon: User, exact: false },
];

export function MemberPortalLayout({ children }: MemberPortalLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-cream pt-20 md:pt-24">
        <div className="section-contained">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28">
                {/* Member Info */}
                <div className="luxury-card p-5 mb-4 hover:translate-y-0">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/40 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                      <p className="text-xs text-ink-soft truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="luxury-card p-2 hover:translate-y-0" aria-label="Member portal navigation">
                  <ul className="space-y-0.5">
                    {sidebarLinks.map((link) => {
                      const active = isActive(link.href, link.exact);
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              active
                                ? 'bg-gold/10 text-gold border border-gold/20'
                                : 'text-ink-soft hover:text-ink hover:bg-cream/80'
                            )}
                            aria-current={active ? 'page' : undefined}
                          >
                            <link.icon className="h-4.5 w-4.5 shrink-0" />
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="border-t border-line/30 mt-3 pt-3">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-4.5 w-4.5 shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-16 md:top-20 left-0 right-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-line/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 flex items-center justify-center">
                    <User className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-sm font-semibold text-ink">{user?.name}</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gold/10 transition-colors"
                  aria-label={mobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
                >
                  {mobileSidebarOpen ? (
                    <X className="h-5 w-5 text-ink" />
                  ) : (
                    <Menu className="h-5 w-5 text-ink" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {mobileSidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                  <motion.nav
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 w-72 bg-cream z-50 lg:hidden shadow-2xl pt-28 px-4"
                    aria-label="Member portal navigation"
                  >
                    <ul className="space-y-1">
                      {sidebarLinks.map((link) => {
                        const active = isActive(link.href, link.exact);
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={() => setMobileSidebarOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                active
                                  ? 'bg-gold/10 text-gold border border-gold/20'
                                  : 'text-ink-soft hover:text-ink hover:bg-cream/80'
                              )}
                              aria-current={active ? 'page' : undefined}
                            >
                              <link.icon className="h-5 w-5 shrink-0" />
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="border-t border-line/30 mt-4 pt-4">
                      <button
                        onClick={() => { handleLogout(); setMobileSidebarOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink-soft hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 w-full"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </motion.nav>
                </>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 pb-16 pt-16 lg:pt-0">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
