'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Mail, Heart } from 'lucide-react';
import { useCampConfig, useContentConfig } from '../hooks/useConfig';

function PersianDiamond({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 0L12 6L6 12L0 6Z"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <path
        d="M6 2L10 6L6 10L2 6Z"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}

function FooterDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-1" aria-hidden="true">
      <div
        className="w-16 sm:w-24 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--color-cream-rgb), 0.15))' }}
      />
      <PersianDiamond className="text-[var(--color-gold-muted)] opacity-40" />
      <div
        className="w-16 sm:w-24 h-[1px]"
        style={{ background: 'linear-gradient(90deg, rgba(var(--color-cream-rgb), 0.15), transparent)' }}
      />
    </div>
  );
}

export function Footer() {
  const campConfig = useCampConfig();
  const { footer } = useContentConfig();
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-80px' });

  const currentYear = new Date().getFullYear();

  const navSections = [
    {
      title: 'Explore',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Events', href: '/events' },
        { label: 'Art', href: '/art' },
        { label: 'Culture', href: '/culture' },
      ],
    },
    {
      title: 'Join Us',
      links: [
        { label: 'Apply', href: '/apply' },
        { label: 'Donate', href: '/donate' },
        { label: 'Members', href: '/members' },
      ],
    },
  ];

  const socialLinks = [
    campConfig.social?.instagram && {
      label: 'Instagram',
      href: campConfig.social.instagram,
      handle: '@campalborz',
    },
    campConfig.social?.youtube && {
      label: 'YouTube',
      href: campConfig.social.youtube,
      handle: 'Camp Alborz',
    },
    campConfig.social?.soundcloud && {
      label: 'SoundCloud',
      href: campConfig.social.soundcloud,
      handle: 'Camp Alborz',
    },
  ].filter(Boolean) as { label: string; href: string; handle: string }[];

  return (
    <footer ref={footerRef} className="relative" role="contentinfo">
      {/* Decorative top border - gradient gold line */}
      <div className="relative" aria-hidden="true">
        <div
          className="h-[1px] w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--color-gold-muted) 20%, var(--color-terracotta) 50%, var(--color-gold-muted) 80%, transparent)',
            opacity: 0.35,
          }}
        />
      </div>

      {/* Main footer area */}
      <div style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-cream)' }}>
        {/* Subtle Persian geometric pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23c4a94d' stroke-width='0.5'/%3E%3Cpath d='M30 10L50 30L30 50L10 30z' fill='none' stroke='%23c4a94d' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-10">
          {/* Upper section */}
          <div className="pt-20 md:pt-24 pb-16 md:pb-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-16">
              {/* Brand Column - takes more space */}
              <motion.div
                className="md:col-span-5 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div>
                  <h3
                    className="font-display text-2xl md:text-3xl tracking-tight"
                    style={{ color: 'var(--color-cream)' }}
                  >
                    {campConfig.name}
                  </h3>
                  <div
                    className="mt-4 w-10 h-[1px]"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-gold-muted), transparent)',
                    }}
                    aria-hidden="true"
                  />
                </div>

                <p
                  className="font-body text-sm max-w-xs leading-[1.8]"
                  style={{ color: 'rgba(var(--color-cream-rgb), 0.65)' }}
                >
                  {footer?.tagline || campConfig.tagline}
                </p>

                {/* Social links as styled horizontal badges */}
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow Camp Alborz on ${link.label} (opens in new tab)`}
                        className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] tracking-[0.08em] uppercase rounded-sm transition-all duration-300"
                        style={{
                          border: '1px solid rgba(var(--color-cream-rgb), 0.12)',
                          color: 'rgba(var(--color-cream-rgb), 0.6)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(var(--color-cream-rgb), 0.25)';
                          e.currentTarget.style.color = 'var(--color-cream)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(var(--color-cream-rgb), 0.12)';
                          e.currentTarget.style.color = 'rgba(var(--color-cream-rgb), 0.6)';
                        }}
                      >
                        {link.label}
                        <ArrowUpRight
                          className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Email */}
                {campConfig.email && (
                  <a
                    href={`mailto:${campConfig.email}`}
                    aria-label={`Send email to ${campConfig.email}`}
                    className="group inline-flex items-center gap-2 text-sm transition-colors duration-300 pt-1"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.55)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-gold-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(var(--color-cream-rgb), 0.55)';
                    }}
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{campConfig.email}</span>
                  </a>
                )}
              </motion.div>

              {/* Navigation Columns */}
              {navSections.map((section, sectionIdx) => (
                <motion.div
                  key={section.title}
                  className="md:col-span-2 space-y-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.1 + sectionIdx * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <h4
                    className="text-[11px] tracking-[0.25em] uppercase font-medium"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.4)' }}
                  >
                    {section.title}
                  </h4>
                  <nav
                    aria-label={`${section.title} links`}
                    className="space-y-0"
                  >
                    <ul className="space-y-0">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="group relative block py-2 text-sm transition-all duration-300 focus:outline-none focus-visible:text-gold rounded-sm"
                            style={{ color: 'rgba(var(--color-cream-rgb), 0.65)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--color-cream)';
                              e.currentTarget.style.paddingLeft = '8px';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'rgba(var(--color-cream-rgb), 0.65)';
                              e.currentTarget.style.paddingLeft = '0px';
                            }}
                          >
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0 group-hover:w-1 h-1 rounded-full transition-all duration-300"
                              style={{ backgroundColor: 'var(--color-gold-muted)' }}
                              aria-hidden="true"
                            />
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </motion.div>
              ))}

              {/* Non-profit info column */}
              <motion.div
                className="md:col-span-3 space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h4
                  className="text-[11px] tracking-[0.25em] uppercase font-medium"
                  style={{ color: 'rgba(var(--color-cream-rgb), 0.4)' }}
                >
                  Organization
                </h4>

                <div className="space-y-4">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.55)' }}
                  >
                    {campConfig.taxStatus} non-profit organization dedicated to community, art, and cultural exchange.
                  </p>

                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-sm text-[11px] tracking-[0.1em] uppercase"
                    style={{
                      border: '1px solid rgba(var(--color-cream-rgb), 0.08)',
                      color: 'rgba(var(--color-cream-rgb), 0.45)',
                    }}
                  >
                    <Heart className="h-3 w-3" aria-hidden="true" />
                    Tax-deductible donations
                  </div>

                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: 'rgba(var(--color-cream-rgb), 0.35)' }}
                  >
                    Your contributions help fund our art installations, cultural programs, and community events on the playa and beyond.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative divider */}
          <FooterDivider />

          {/* Bottom Bar */}
          <div className="py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p
                className="text-[11px] tracking-[0.04em]"
                style={{ color: 'rgba(var(--color-cream-rgb), 0.35)' }}
              >
                &copy; {currentYear} {footer?.copyright || campConfig.name}. All rights reserved.
              </p>

              <div className="flex items-center gap-6">
                <p
                  className="text-[11px] tracking-[0.12em] uppercase flex items-center gap-2"
                  style={{ color: 'rgba(var(--color-cream-rgb), 0.3)' }}
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-gold-muted)', opacity: 0.4 }}
                    aria-hidden="true"
                  />
                  Black Rock City, Nevada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
