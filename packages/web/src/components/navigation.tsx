'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '../lib/utils';
import { useCampConfig } from '../hooks/useConfig';

const navItems = [
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Events',
    href: '/events',
  },
  {
    label: 'Art',
    href: '/art',
    children: [
      { label: 'HOMA Art Car', href: '/art/homa' },
      { label: 'DAMAVAND Art Car', href: '/art/damavand' },
    ],
  },
  {
    label: 'Culture',
    href: '/culture',
  },
  {
    label: 'Members',
    href: '/members',
  },
];

export function Navigation() {
  const campConfig = useCampConfig();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 10);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle keyboard navigation for dropdowns
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent, item: typeof navItems[0]) => {
    if (!item.children) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdown(activeDropdown === item.label ? null : item.label);
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
    } else if (e.key === 'ArrowDown' && activeDropdown === item.label) {
      e.preventDefault();
      const firstChild = document.querySelector(`[data-dropdown="${item.label}"] a`) as HTMLElement;
      firstChild?.focus();
    }
  }, [activeDropdown]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const menuElement = mobileMenuRef.current;
    if (!menuElement) return;

    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.nav
      aria-label="Main navigation"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-cream/90 dark:bg-[#1a1f1a]/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)]'
          : 'bg-transparent'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span
              className="text-xl font-heading tracking-tight transition-colors duration-300 group-hover:text-terracotta"
              style={{ color: 'var(--color-ink)' }}
            >
              {campConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" role="menubar" aria-label="Site pages">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-[13px] font-medium transition-colors duration-300 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2',
                    isActive(item.href)
                      ? 'text-ink'
                      : 'text-ink-soft hover:text-ink'
                  )}
                  onKeyDown={(e) => handleDropdownKeyDown(e, item)}
                  aria-expanded={item.children ? activeDropdown === item.label : undefined}
                  aria-haspopup={item.children ? 'true' : undefined}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className={cn('h-3 w-3 transition-transform duration-300', activeDropdown === item.label && 'rotate-180')} aria-hidden="true" />
                  )}
                </Link>

                {/* Active indicator */}
                {isActive(item.href) && (
                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-[1.5px]"
                    style={{ backgroundColor: 'var(--color-terracotta)' }}
                    layoutId="nav-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.label && item.children && (
                    <motion.div
                      data-dropdown={item.label}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-full left-0 mt-1 w-56 bg-cream/95 dark:bg-[#1a1f1a]/95 backdrop-blur-md border border-warm-border dark:border-[#3a3830] shadow-lg overflow-hidden"
                      role="menu"
                      aria-label={`${item.label} submenu`}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-5 py-3 text-[13px] text-ink-soft dark:text-[#b8b4aa] hover:text-ink dark:hover:text-[#e8e4dc] hover:bg-cream-warm/60 dark:hover:bg-white/10 transition-all duration-200 focus:outline-none focus-visible:bg-cream-warm dark:focus-visible:bg-white/10 focus-visible:text-ink dark:focus-visible:text-[#e8e4dc]"
                          role="menuitem"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setActiveDropdown(null);
                            }
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-full transition-all duration-300 text-ink-soft hover:text-ink hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
              </button>
            )}

            {/* Donate button */}
            <Link
              href="/donate"
              className="hidden md:inline-flex items-center bg-ink dark:bg-[#e8e4dc] text-cream dark:text-[#1a1f1a] px-6 py-2 text-[11px] uppercase tracking-[0.14em] font-medium transition-all duration-300 hover:bg-terracotta dark:hover:bg-[#c47040] hover:text-cream dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
            >
              Donate
            </Link>

            {/* Mobile menu toggle */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-ink-soft hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-cream/98 dark:bg-[#1a1f1a]/98 backdrop-blur-md border-t border-warm-border dark:border-[#3a3830]"
            aria-label="Mobile navigation menu"
          >
            <div className="px-5 py-8 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'block py-3 text-lg font-heading transition-colors duration-200 hover:text-terracotta focus:outline-none focus-visible:text-ink',
                      isActive(item.href)
                        ? 'text-ink'
                        : 'text-ink-soft'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block py-2 text-sm transition-colors duration-200 hover:text-terracotta focus:outline-none focus-visible:text-ink',
                            isActive(child.href)
                              ? 'text-ink'
                              : 'text-ink-faint'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div
                className="pt-6 space-y-3 border-t border-warm-border mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href="/donate"
                  className="block w-full text-center bg-ink dark:bg-[#e8e4dc] text-cream dark:text-[#1a1f1a] px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-300 hover:bg-terracotta dark:hover:bg-[#c47040] hover:text-cream dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Donate
                </Link>
                <Link
                  href="/members"
                  className="block w-full text-center px-6 py-3 text-sm text-ink-soft hover:text-ink transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Member Login
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
