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
    <footer className="bg-ink text-tan-light/80">
      <div className="section-contained py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-display-thin text-2xl text-tan-light">{campConfig.name}</h3>
            <p className="text-body-relaxed text-sm text-tan-light/60">
              {footer?.tagline || campConfig.tagline}
            </p>
            <p className="text-xs text-tan-light/40">
              {campConfig.taxStatus} Non-Profit Organization
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-tan-light/50">
              Navigation
            </h4>
            <nav className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-tan-light/70 hover:text-gold-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-tan-light/50">
              Connect
            </h4>
            <div className="space-y-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-tan-light/70 hover:text-gold-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {campConfig.email && (
                <a
                  href={`mailto:${campConfig.email}`}
                  className="block text-sm text-tan-light/70 hover:text-gold-400 transition-colors"
                >
                  {campConfig.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex justify-center mb-6">
            <span className="simurgh-accent" aria-hidden="true" />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-tan-light/40">
              &copy; {currentYear} {footer?.copyright || campConfig.name}. All rights reserved.
            </p>
            <p className="text-xs text-tan-light/30">
              Black Rock City, Nevada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
