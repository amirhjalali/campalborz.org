'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * LazyMotion provider that loads only the domAnimation feature bundle.
 * This reduces the initial JS bundle size by ~50% compared to importing
 * the full framer-motion library.
 *
 * All child components should use `m` instead of `motion` for animations.
 * Components using `motion` directly will still work but won't benefit
 * from the reduced bundle.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
