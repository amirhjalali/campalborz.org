'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Loader2,
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  Home,
  CreditCard,
  Hammer,
  Package,
  PieChart,
  Ticket,
  FileText,
  Megaphone,
  Menu,
  X,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSeasonProvider, useAdminSeason } from '../../contexts/AdminSeasonContext';
import { NotificationBell } from '../../components/notifications/NotificationBell';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Season', href: '/admin/season', icon: Calendar },
  { label: 'Housing', href: '/admin/housing', icon: Home },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Build', href: '/admin/build', icon: Hammer },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Budget', href: '/admin/budget', icon: PieChart },
  { label: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
];

function SeasonSelector() {
  const { seasons, selectedSeasonId, setSelectedSeasonId, isLoading } = useAdminSeason();

  if (isLoading || seasons.length <= 1) return null;

  return (
    <select
      value={selectedSeasonId || ''}
      onChange={(e) => setSelectedSeasonId(e.target.value)}
      className="form-input w-auto min-w-[140px] text-sm py-1.5"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}{s.isActive ? ' (Active)' : ''}
        </option>
      ))}
    </select>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Skip auth checks for the admin login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    if (!isLoading && isAuthenticated && user) {
      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        router.replace('/portal');
      }
    }
  }, [isLoading, isAuthenticated, user, router, isLoginPage, pathname]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // For the login page, render children without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <AdminSeasonProvider>
    <div className="min-h-screen bg-cream flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sage transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gold" />
              <span className="font-display text-sm tracking-wider text-cream">
                CAMP ALBORZ ADMIN
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-white/60 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-white/10 text-gold border-l-2 border-gold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer - user info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                <span className="text-sm font-medium text-gold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-tan/30 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            {/* Left: hamburger + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-ink-soft hover:text-gold transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-display-thin text-lg text-ink">
                {sidebarItems.find((item) => isActive(item.href))?.label || 'Admin'}
              </h2>
            </div>

            {/* Right: season selector, notifications, user */}
            <div className="flex items-center gap-4">
              <SeasonSelector />
              <NotificationBell />
              <Link
                href="/"
                className="text-sm text-sage hover:text-gold transition-colors hidden sm:inline"
              >
                View Site
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-sm text-ink-soft hover:text-gold transition-colors"
                >
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-tan/30 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-tan/20">
                        <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                        <p className="text-xs text-ink-soft truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-cream rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </AdminSeasonProvider>
  );
}
