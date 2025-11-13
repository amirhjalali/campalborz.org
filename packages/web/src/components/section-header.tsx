'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DecorativeDivider from './decorative-divider';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: 'sage' | 'tan' | 'transparent';
  decorated?: boolean;
  icon?: React.ReactNode;
  centered?: boolean;
  dividerColor?: 'gold' | 'sage' | 'tan';
}

/**
 * SectionHeader Component
 *
 * Creates elegant section headers with decorative frames and borders.
 * Based on the Alborz_Guides_25.pdf style guide section header frames.
 *
 * Features:
 * - Rounded rectangle backgrounds in sage green or tan
 * - Decorative borders with geometric patterns
 * - Centered text with generous padding
 * - Optional icons and subtitles
 *
 * @example
 * <SectionHeader
 *   title="MISSION STATEMENT"
 *   subtitle="Our Purpose & Vision"
 *   bgColor="sage"
 *   decorated={true}
 * />
 */
export default function SectionHeader({
  title,
  subtitle,
  bgColor = 'sage',
  decorated = true,
  icon,
  centered = true,
  dividerColor = 'gold'
}: SectionHeaderProps) {
  const bgColorClasses = {
    sage: 'bg-sage text-tan-light',
    tan: 'bg-tan text-sage-dark',
    transparent: 'bg-transparent text-sage-dark',
  };

  const borderColorClasses = {
    sage: 'border-sage-light',
    tan: 'border-tan-dark',
    transparent: 'border-gold',
  };

  return (
    <div className={`w-full ${centered ? 'flex flex-col items-center' : ''}`}>
      {decorated && <DecorativeDivider variant="ornate" color={dividerColor} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`
          relative
          ${bgColorClasses[bgColor]}
          ${decorated ? `border-2 ${borderColorClasses[bgColor]}` : ''}
          rounded-2xl
          px-8 md:px-16 py-6 md:py-8
          ${centered ? 'text-center' : ''}
          max-w-4xl
          shadow-lg
        `}
      >
        {/* Decorative corner elements */}
        {decorated && (
          <>
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold -translate-x-1 -translate-y-1 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold translate-x-1 -translate-y-1 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold -translate-x-1 translate-y-1 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold translate-x-1 translate-y-1 rounded-br-lg" />
          </>
        )}

        {/* Icon */}
        {icon && (
          <div className="mb-4 flex justify-center">
            <div className="text-4xl opacity-80">
              {icon}
            </div>
          </div>
        )}

        {/* Title - Refined and elegant */}
        <h2 className="font-display text-2xl md:text-4xl font-semibold tracking-wide uppercase">
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-accent text-lg md:text-xl mt-3 italic font-normal">
            {subtitle}
          </p>
        )}
      </motion.div>

      {decorated && <DecorativeDivider variant="ornate" color={dividerColor} />}
    </div>
  );
}
