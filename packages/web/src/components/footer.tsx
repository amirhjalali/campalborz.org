'use client';

import Link from 'next/link';
import { useCampConfig, useContentConfig } from '../hooks/useConfig';

export function Footer() {
  const campConfig = useCampConfig();
  const { footer } = useContentConfig();

  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Art', href: '/art' },
    { label: 'Culture', href: '/culture' },
    { label: 'Donate', href: '/donate' },
    { label: 'Members', href: '/members' },
  ];

  const socialLinks = [
    campConfig.social?.instagram && { label: 'Instagram', href: campConfig.social.instagram },
    campConfig.social?.youtube && { label: 'YouTube', href: campConfig.social.youtube },
    campConfig.social?.soundcloud && { label: 'SoundCloud', href: campConfig.social.soundcloud },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="relative" role="contentinfo">
      {/* Decorative top border */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--color-gold-muted) 30%, var(--color-terracotta) 50%, var(--color-gold-muted) 70%, transparent)',
          opacity: 0.3,
        }}
      />

      <div style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-cream)' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.8fr] gap-12 md:gap-16">
            {/* Brand Column */}
            <div className="space-y-5">
              <h3
                className="font-display text-2xl tracking-tight"
                style={{ color: 'var(--color-cream)' }}
              >
                {campConfig.name}
              </h3>
              <p
                className="text-sm max-w-xs leading-relaxed"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.72)' }}
              >
                {footer?.tagline || campConfig.tagline}
              </p>
              <div
                className="w-12 h-px"
                style={{ backgroundColor: 'rgba(var(--color-cream-rgb), 0.15)' }}
              />
              <p
                className="text-[11px] tracking-[0.2em] uppercase"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.45)' }}
              >
                {campConfig.taxStatus} Non-Profit Organization
              </p>
            </div>

            {/* Navigation Column */}
            <div className="space-y-6">
              <h4
                className="text-[11px] tracking-[0.25em] uppercase font-medium"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.5)' }}
              >
                Navigation
              </h4>
              <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-6 gap-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-gold focus-visible:text-gold"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.72)' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Connect Column */}
            <div className="space-y-6">
              <h4
                className="text-[11px] tracking-[0.25em] uppercase font-medium"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.5)' }}
              >
                Connect
              </h4>
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Camp Alborz on ${link.label} (opens in new tab)`}
                    className="block text-sm transition-colors duration-300 hover:text-gold focus-visible:text-gold"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.72)' }}
                  >
                    {link.label}
                  </a>
                ))}
                {campConfig.email && (
                  <a
                    href={`mailto:${campConfig.email}`}
                    aria-label={`Send email to ${campConfig.email}`}
                    className="block text-sm transition-colors duration-300 hover:text-gold focus-visible:text-gold"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.72)' }}
                  >
                    {campConfig.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="mt-16 pt-8"
            style={{ borderTop: '1px solid rgba(var(--color-cream-rgb), 0.08)' }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p
                className="text-[11px]"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.45)' }}
              >
                &copy; {currentYear} {footer?.copyright || campConfig.name}. All rights reserved.
              </p>
              <p
                className="text-[11px] tracking-[0.15em]"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.4)' }}
              >
                Black Rock City, Nevada
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
