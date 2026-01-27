'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LuxuryCardProps {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  accent?: 'gold' | 'sage';
  href?: string;
  children?: ReactNode;
}

export function LuxuryCard({
  title,
  description,
  eyebrow,
  icon,
  accent = 'gold',
  href,
  children,
}: LuxuryCardProps) {
  const content = (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'luxury-card relative overflow-hidden',
        accent === 'sage' && 'bg-sage-50'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none',
          accent === 'gold' ? 'gold-shimmer' : 'pattern-gold-overlay',
          'hover:opacity-100'
        )}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        {eyebrow && (
          <p className="text-xs tracking-[0.4em] text-ink-soft/80 uppercase">
            {eyebrow}
          </p>
        )}

        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/70 text-ink-soft">
            {icon}
          </div>
        )}

        <h3 className="text-display-thin text-2xl text-ink">{title}</h3>

        {description && (
          <p className="text-body-relaxed text-sm text-ink-soft">{description}</p>
        )}

        {children}
      </div>
    </motion.article>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline text-inherit">
        {content}
      </Link>
    );
  }

  return content;
}
