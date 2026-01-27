'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
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
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 10);
  });

  useEffect(() => {
    setMounted(true);
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
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-warm-white/95 dark:bg-sage-dark/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={cn(
                'text-2xl font-display font-light tracking-wide transition-colors',
                isScrolled ? 'text-sage-dark dark:text-tan-light' : 'text-sage-dark'
              )}
            >
              {campConfig.name.toUpperCase()}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
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
                    'nav-link-gold px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                    isScrolled
                      ? 'text-sage-dark dark:text-tan-light hover:text-gold'
                      : 'text-sage-dark hover:text-gold'
                  )}
                  onKeyDown={(e) => handleDropdownKeyDown(e, item)}
                  aria-expanded={item.children ? activeDropdown === item.label : undefined}
                  aria-haspopup={item.children ? 'true' : undefined}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  )}
                </Link>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.label && item.children && (
                    <motion.div
                      data-dropdown={item.label}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-2 w-56 bg-warm-white/95 dark:bg-sage/95 backdrop-blur-lg rounded-lg shadow-xl border border-tan-300 dark:border-sage-light overflow-hidden"
                      role="menu"
                      aria-label={`${item.label} submenu`}
                    >
                      {item.children.map((child, index) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-sm text-sage-dark dark:text-tan-light hover:bg-gold/10 hover:text-gold transition-colors duration-200 focus:outline-none focus-visible:bg-gold/10 focus-visible:text-gold"
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
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                  isScrolled
                    ? 'text-sage-dark dark:text-tan-light hover:bg-gold/10'
                    : 'text-sage-dark hover:bg-gold/10'
                )}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
              </button>
            )}

            {/* Donate button */}
            <Link
              href="/donate"
              className="hidden md:inline-flex items-center px-6 py-2 rounded-lg font-display font-semibold transition-all duration-300 bg-gold text-white hover:bg-gold-dark hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Donate
            </Link>

            {/* Member login */}
            <Link
              href="/members"
              className={cn(
                'hidden md:inline-flex items-center px-6 py-2 rounded-lg font-display font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                isScrolled
                  ? 'border-2 border-sage text-sage-dark dark:text-tan-light dark:border-tan hover:bg-sage hover:text-tan-light dark:hover:bg-tan dark:hover:text-sage-dark'
                  : 'border-2 border-sage text-sage-dark hover:bg-sage hover:text-tan-light'
              )}
            >
              Member Login
            </Link>

            {/* Mobile menu toggle */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                isScrolled
                  ? 'text-sage-dark dark:text-tan-light hover:bg-gold/10'
                  : 'text-sage-dark hover:bg-gold/10'
              )}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-warm-white/95 dark:bg-sage/95 backdrop-blur-lg border-t border-tan-300 dark:border-sage-light"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block py-2 text-sage-dark dark:text-tan-light font-medium hover:text-gold focus:outline-none focus-visible:text-gold transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-1 text-sm text-sage dark:text-tan-200 hover:text-gold focus:outline-none focus-visible:text-gold transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 space-y-3 border-t border-tan-300 dark:border-sage-light">
                <Link
                  href="/donate"
                  className="block w-full text-center px-6 py-3 bg-gold text-white rounded-lg font-display font-semibold hover:bg-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Donate
                </Link>
                <Link
                  href="/members"
                  className="block w-full text-center px-6 py-3 border-2 border-sage text-sage-dark dark:text-tan-light dark:border-tan rounded-lg font-display font-semibold hover:bg-sage hover:text-tan-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:hover:bg-tan dark:hover:text-sage-dark transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Member Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}