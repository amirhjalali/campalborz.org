'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CTAButton {
  label: string;
  href: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
}

interface FramedCTAProps {
  kicker?: string;
  heading: string;
  description: string;
  primary: CTAButton;
  secondary?: CTAButton;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function FramedCTA({
  kicker,
  heading,
  description,
  primary,
  secondary,
}: FramedCTAProps) {
  const prefersReducedMotion = useReducedMotion();

  function renderButton(button: CTAButton) {
    const className = button.variant === 'secondary' ? 'cta-secondary' : 'cta-primary cta-shimmer';

    return (
      <Link key={button.label} href={button.href} className={className}>
        {button.icon}
        {button.label}
        {button.variant !== 'secondary' && <ArrowRight size={18} aria-hidden="true" />}
      </Link>
    );
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: easeOutExpo }}
      className="section-base section-contained"
    >
      <div className="frame-panel space-y-8 text-center relative overflow-hidden">
        {/* Decorative corner accents */}
        <div
          className="absolute top-4 left-4 w-8 h-8 border-t border-l pointer-events-none"
          style={{ borderColor: 'var(--color-gold-muted)', opacity: 0.4 }}
          aria-hidden="true"
        />
        <div
          className="absolute top-4 right-4 w-8 h-8 border-t border-r pointer-events-none"
          style={{ borderColor: 'var(--color-gold-muted)', opacity: 0.4 }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 left-4 w-8 h-8 border-b border-l pointer-events-none"
          style={{ borderColor: 'var(--color-gold-muted)', opacity: 0.4 }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 right-4 w-8 h-8 border-b border-r pointer-events-none"
          style={{ borderColor: 'var(--color-gold-muted)', opacity: 0.4 }}
          aria-hidden="true"
        />

        {kicker && (
          <motion.p
            className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: easeOutExpo }}
          >
            {kicker}
          </motion.p>
        )}

        <motion.h2
          className="text-display-thin text-3xl md:text-4xl"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25, ease: easeOutExpo }}
        >
          {heading}
        </motion.h2>

        <motion.p
          className="text-body-relaxed text-base md:text-lg text-ink-soft/95 max-w-3xl mx-auto"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35, ease: easeOutExpo }}
        >
          {description}
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 pt-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45, ease: easeOutExpo }}
        >
          {renderButton(primary)}
          {secondary && renderButton({ ...secondary, variant: 'secondary' })}
        </motion.div>
      </div>
    </motion.section>
  );
}
