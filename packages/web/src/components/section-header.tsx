'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import DecorativeDivider from './decorative-divider';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: 'sage' | 'tan' | 'transparent';
  decorated?: boolean;
  icon?: ReactNode;
  centered?: boolean;
  dividerColor?: 'gold' | 'sage' | 'tan';
}

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
        initial={{ y: 14 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pill-header"
      >
        {/* Icon */}
        {icon && (
          <span className="mr-3 text-2xl opacity-80">
            {icon}
          </span>
        )}

        <span>{title}</span>
      </motion.div>

      {/* Subtitle below pill */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-accent text-lg md:text-xl mt-4 italic font-normal text-ink-soft text-center"
        >
          {subtitle}
        </motion.p>
      )}

      {decorated && <DecorativeDivider variant="ornate" color={dividerColor} />}
    </div>
  );
}
