'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon, ArrowRight } from 'lucide-react';
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
      { label: 'HOMA Art Car', href: '/art/homa', description: 'Interactive fire art installation' },
      { label: 'DAMAVAND Art Car', href: '/art/damavand', description: 'Persian mountain-inspired sculpture' },
    ],
  },
  {
    label: 'Culture',
    href: '/culture',
  },
  {
    label: 'Community',
    href: '/community',
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const { scrollY } = useScroll();

  // Smooth opacity transition for background based on scroll
  const navBgOpacity = useTransform(scrollY, [0, 60], [0, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileDropdownOpen(null);
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

  // Handle dropdown hover with delay for better UX
  const handleDropdownEnter = useCallback((label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(label);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

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
    <>
      <motion.nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background layer with smooth scroll-driven opacity */}
        <motion.div
          className="absolute inset-0 backdrop-blur-xl border-b"
          style={{
            opacity: navBgOpacity,
            backgroundColor: 'var(--color-cream)',
            borderColor: 'var(--color-warm-border)',
          }}
        />

        {/* Decorative gold accent line at top - visible when scrolled */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            opacity: navBgOpacity,
            background: 'linear-gradient(90deg, transparent 10%, var(--color-gold-muted) 50%, transparent 90%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 rounded-sm"
            >
              {/* Small decorative diamond */}
              <span
                className="hidden sm:block w-2 h-2 rotate-45 transition-all duration-500 group-hover:rotate-[225deg] group-hover:scale-110"
                style={{ backgroundColor: 'var(--color-gold-muted)' }}
                aria-hidden="true"
              />
              <span
                className="text-xl font-display tracking-tight transition-all duration-300 group-hover:tracking-normal"
                style={{ color: 'var(--color-ink)' }}
              >
                {campConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center" role="menubar">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                  role="none"
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-5 py-2.5 text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 rounded-sm',
                      isActive(item.href)
                        ? 'text-ink'
                        : 'text-ink-soft hover:text-ink'
                    )}
                    onKeyDown={(e) => handleDropdownKeyDown(e, item)}
                    aria-expanded={item.children ? activeDropdown === item.label : undefined}
                    aria-haspopup={item.children ? 'true' : undefined}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    role="menuitem"
                  >
                    <span className="relative">
                      {item.label}
                      {/* Hover underline effect */}
                      <span
                        className={cn(
                          'absolute -bottom-0.5 left-0 h-[1px] transition-all duration-300 ease-out',
                          isActive(item.href)
                            ? 'w-full'
                            : 'w-0 group-hover:w-full'
                        )}
                        style={{ backgroundColor: 'var(--color-terracotta)' }}
                        aria-hidden="true"
                      />
                    </span>
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 transition-transform duration-300',
                          activeDropdown === item.label && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </Link>

                  {/* Animated active indicator */}
                  {isActive(item.href) && (
                    <motion.div
                      className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full"
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
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-0 mt-2 w-72 overflow-hidden rounded-md"
                        style={{
                          backgroundColor: 'var(--color-cream)',
                          border: '1px solid var(--color-warm-border)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                        }}
                        role="menu"
                        aria-label={`${item.label} submenu`}
                      >
                        {/* Dropdown decorative top accent */}
                        <div
                          className="h-[1px] w-full"
                          style={{
                            background: 'linear-gradient(90deg, var(--color-gold-muted), var(--color-terracotta), var(--color-gold-muted))',
                            opacity: 0.4,
                          }}
                          aria-hidden="true"
                        />
                        <div className="py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                'group/item flex items-start gap-3 px-5 py-3.5 transition-all duration-200',
                                'hover:bg-cream-warm/60 focus:outline-none focus-visible:bg-cream-warm',
                              )}
                              role="menuitem"
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setActiveDropdown(null);
                                }
                              }}
                            >
                              <span
                                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 group-hover/item:scale-125"
                                style={{ backgroundColor: 'var(--color-gold-muted)' }}
                                aria-hidden="true"
                              />
                              <div>
                                <span
                                  className="block text-[13px] font-medium transition-colors duration-200"
                                  style={{ color: 'var(--color-ink)' }}
                                >
                                  {child.label}
                                </span>
                                {'description' in child && (child as { description?: string }).description && (
                                  <span
                                    className="block text-[11px] mt-0.5 transition-colors duration-200"
                                    style={{ color: 'var(--color-ink-faint)' }}
                                  >
                                    {(child as { description: string }).description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              {/* Dark mode toggle */}
              {mounted && (
                <motion.button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-300 text-ink-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={theme}
                      initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="block"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
                      ) : (
                        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Donate button - desktop */}
              <Link
                href="/donate"
                className={cn(
                  'hidden md:inline-flex items-center gap-2 px-7 py-2.5 text-[11px] uppercase tracking-[0.14em] font-medium',
                  'transition-all duration-400 rounded-sm relative overflow-hidden group',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2'
                )}
                style={{
                  backgroundColor: 'var(--color-ink)',
                  color: 'var(--color-cream)',
                }}
              >
                {/* Hover sweep effect */}
                <span
                  className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ backgroundColor: 'var(--color-terracotta)' }}
                  aria-hidden="true"
                />
                <span className="relative z-10">Donate</span>
                <ArrowRight className="relative z-10 h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>

              {/* Mobile menu toggle */}
              <motion.button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-soft hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 rounded-sm"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isMobileMenuOpen ? 'close' : 'open'}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Full screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu panel */}
            <motion.div
              ref={mobileMenuRef}
              id="mobile-menu"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm lg:hidden overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-cream)',
                borderLeft: '1px solid var(--color-warm-border)',
              }}
              aria-label="Mobile navigation menu"
              role="dialog"
              aria-modal="true"
            >
              {/* Mobile menu header */}
              <div
                className="flex items-center justify-between px-6 h-16"
                style={{ borderBottom: '1px solid var(--color-warm-border)' }}
              >
                <span
                  className="font-display text-lg tracking-tight"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {campConfig.name}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" style={{ color: 'var(--color-ink)' }} aria-hidden="true" />
                </button>
              </div>

              {/* Mobile menu content */}
              <div className="px-6 py-8">
                <nav aria-label="Mobile navigation">
                  <ul className="space-y-1">
                    {navItems.map((item, i) => (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="relative">
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center justify-between py-3.5 text-lg font-display transition-all duration-200',
                              'focus:outline-none focus-visible:text-ink rounded-sm',
                              'hover:pl-2',
                              isActive(item.href)
                                ? 'text-ink'
                                : 'text-ink-soft hover:text-ink'
                            )}
                            onClick={() => {
                              if (!item.children) setIsMobileMenuOpen(false);
                            }}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                          >
                            <span className="flex items-center gap-3">
                              {/* Active dot indicator */}
                              {isActive(item.href) && (
                                <motion.span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: 'var(--color-terracotta)' }}
                                  layoutId="mobile-active"
                                  aria-hidden="true"
                                />
                              )}
                              {item.label}
                            </span>
                            {item.children && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMobileDropdownOpen(
                                    mobileDropdownOpen === item.label ? null : item.label
                                  );
                                }}
                                className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-sm"
                                aria-label={`${mobileDropdownOpen === item.label ? 'Collapse' : 'Expand'} ${item.label} submenu`}
                                aria-expanded={mobileDropdownOpen === item.label}
                              >
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 transition-transform duration-300',
                                    mobileDropdownOpen === item.label && 'rotate-180'
                                  )}
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                          </Link>

                          {/* Mobile submenu */}
                          <AnimatePresence>
                            {item.children && mobileDropdownOpen === item.label && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <div
                                  className="ml-4 pl-4 space-y-1 pb-2"
                                  style={{ borderLeft: '1px solid var(--color-warm-border)' }}
                                >
                                  {item.children.map((child) => (
                                    <li key={child.href}>
                                      <Link
                                        href={child.href}
                                        className={cn(
                                          'block py-2.5 text-sm transition-all duration-200',
                                          'hover:pl-1 focus:outline-none focus-visible:text-ink rounded-sm',
                                          isActive(child.href)
                                            ? 'text-ink font-medium'
                                            : 'text-ink-faint hover:text-ink'
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        aria-current={isActive(child.href) ? 'page' : undefined}
                                      >
                                        {child.label}
                                      </Link>
                                    </li>
                                  ))}
                                </div>
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Subtle separator */}
                        <div
                          className="h-[1px] w-full"
                          style={{ backgroundColor: 'var(--color-warm-border)', opacity: 0.5 }}
                          aria-hidden="true"
                        />
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile CTA section */}
                <motion.div
                  className="mt-10 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Link
                    href="/donate"
                    className="group flex items-center justify-center gap-2 w-full text-center px-6 py-4 text-[11px] uppercase tracking-[0.14em] font-medium transition-all duration-300 rounded-sm relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: 'var(--color-ink)',
                      color: 'var(--color-cream)',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span
                      className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ backgroundColor: 'var(--color-terracotta)' }}
                      aria-hidden="true"
                    />
                    <span className="relative z-10">Donate</span>
                    <ArrowRight className="relative z-10 h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>

                  <Link
                    href="/apply"
                    className="block w-full text-center px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] font-medium transition-all duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
                    style={{
                      border: '1px solid var(--color-warm-border)',
                      color: 'var(--color-ink)',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Apply to Join
                  </Link>
                </motion.div>

                {/* Decorative element at bottom */}
                <div className="mt-12 flex items-center justify-center gap-3" aria-hidden="true">
                  <div
                    className="w-12 h-[1px]"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-muted))' }}
                  />
                  <div
                    className="w-2 h-2 rotate-45"
                    style={{ border: '1px solid var(--color-gold-muted)', opacity: 0.5 }}
                  />
                  <div
                    className="w-12 h-[1px]"
                    style={{ background: 'linear-gradient(90deg, var(--color-gold-muted), transparent)' }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
