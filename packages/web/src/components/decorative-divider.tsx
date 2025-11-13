'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DecorativeDividerProps {
  variant?: 'simple' | 'ornate' | 'double';
  color?: 'gold' | 'sage' | 'tan';
  animate?: boolean;
}

/**
 * DecorativeDivider Component
 *
 * Creates elegant horizontal dividers with Persian-inspired ornamental patterns.
 * Based on the Alborz_Guides_25.pdf style guide decorative elements.
 *
 * Pattern: ◇═══════════════════════◇◇◇◇◇═══════════════════════◇
 *
 * @example
 * <DecorativeDivider variant="ornate" color="gold" />
 */
export default function DecorativeDivider({
  variant = 'simple',
  color = 'gold',
  animate = true
}: DecorativeDividerProps) {
  const colorClasses = {
    gold: 'text-antique-gold',
    sage: 'text-sage',
    tan: 'text-tan',
  };

  const MotionDiv = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, scaleX: 0 },
    whileInView: { opacity: 1, scaleX: 1 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: 'easeOut' }
  } : {};

  if (variant === 'simple') {
    return (
      <MotionDiv
        className={`flex items-center justify-center my-8 ${colorClasses[color]}`}
        {...animationProps}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
      </MotionDiv>
    );
  }

  if (variant === 'double') {
    return (
      <MotionDiv
        className={`flex flex-col items-center justify-center my-8 gap-2 ${colorClasses[color]}`}
        {...animationProps}
      >
        <div className="w-full flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-current opacity-30" />
          <span className="mx-4 text-xl">◇</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-current to-current opacity-30" />
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-current opacity-30" />
          <span className="mx-4 text-xl">◇</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-current to-current opacity-30" />
        </div>
      </MotionDiv>
    );
  }

  // Ornate variant - matches PDF style guide pattern
  return (
    <MotionDiv
      className={`flex items-center justify-center my-12 ${colorClasses[color]}`}
      {...animationProps}
    >
      {/* Left line */}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-current opacity-30" />

      {/* Left diamond */}
      <span className="mx-3 text-xl opacity-70">◇</span>

      {/* Center decorative section */}
      <div className="flex items-center gap-1 px-4">
        <span className="text-lg opacity-60">◇</span>
        <span className="text-base opacity-50">◇</span>
        <span className="text-sm opacity-40">◇</span>
        <span className="text-base opacity-50">◇</span>
        <span className="text-lg opacity-60">◇</span>
      </div>

      {/* Right diamond */}
      <span className="mx-3 text-xl opacity-70">◇</span>

      {/* Right line */}
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-current to-current opacity-30" />
    </MotionDiv>
  );
}
