'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '../lib/utils';
import { useCampConfig } from '../hooks/useConfig';

const navItems = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Story', href: '/about/story' },
      { label: 'Mission & Values', href: '/about/mission' },
      { label: 'Team & Leadership', href: '/about/team' },
      { label: '501(c)(3) Info', href: '/about/nonprofit' },
    ],
  },
  {
    label: 'Experience',
    href: '/experience',
    children: [
      { label: 'At Burning Man', href: '/experience/burning-man' },
      { label: 'Year-Round Events', href: '/experience/events' },
      { label: 'Virtual Gatherings', href: '/experience/virtual' },
      { label: 'Photo Gallery', href: '/experience/gallery' },
    ],
  },
  {
    label: 'Art & Culture',
    href: '/art',
    children: [
      { label: 'HOMA Fire Sculpture', href: '/art/homa' },
      { label: 'DAMAVAND Project', href: '/art/damavand' },
      { label: 'Artist Showcase', href: '/art/artists' },
      { label: 'Cultural Programs', href: '/art/culture' },
    ],
  },
  {
    label: 'Get Involved',
    href: '/join',
    children: [
      { label: 'Membership', href: '/join/membership' },
      { label: 'Volunteer', href: '/join/volunteer' },
      { label: 'Camp Application', href: '/join/apply' },
      { label: 'Sponsorship', href: '/join/sponsor' },
    ],
  },
  {
    label: 'Community',
    href: '/community',
    children: [
      { label: 'Member Portal', href: '/members' },
      { label: 'Forum', href: '/community/forum' },
      { label: 'Resources', href: '/community/resources' },
      { label: 'Newsletter', href: '/community/newsletter' },
    ],
  },
];

export function Navigation() {
  const campConfig = useCampConfig();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-midnight/95 backdrop-blur-lg shadow-lg'
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
                'text-2xl font-display font-bold transition-colors',
                isScrolled ? 'text-primary' : 'text-white'
              )}
            >
              {campConfig.name.toUpperCase()}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
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
                    'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1',
                    isScrolled
                      ? 'text-neutral-900 hover:text-primary hover:bg-secondary/10'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Link>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.label && item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-midnight-dark rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-primary/10 hover:text-primary transition-colors"
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
                  'p-2 rounded-lg transition-colors',
                  isScrolled
                    ? 'text-neutral-900 hover:bg-neutral-200'
                    : 'text-white hover:bg-white/10'
                )}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* Donate button */}
            <Link
              href="/donate"
              className={cn(
                'hidden md:inline-flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-300',
                isScrolled
                  ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-105'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              )}
            >
              Donate
            </Link>

            {/* Member login */}
            <Link
              href="/members"
              className={cn(
                'hidden md:inline-flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-300',
                isScrolled
                  ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  : 'text-white border-2 border-white/30 hover:bg-white/10'
              )}
            >
              Member Login
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                isScrolled
                  ? 'text-neutral-900 hover:bg-neutral-200'
                  : 'text-white hover:bg-white/10'
              )}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white dark:bg-midnight-dark border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block py-2 text-neutral-700 dark:text-neutral-300 font-medium"
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
                          className="block py-1 text-sm text-neutral-600 dark:text-neutral-400"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700">
                <Link
                  href="/donate"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Donate
                </Link>
                <Link
                  href="/members"
                  className="block w-full text-center px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold"
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