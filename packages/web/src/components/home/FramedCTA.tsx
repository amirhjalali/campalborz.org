'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
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

export function FramedCTA({
  kicker,
  heading,
  description,
  primary,
  secondary,
}: FramedCTAProps) {
  const renderButton = (button: CTAButton, index: number) => {
    const content = (
      <>
        {button.icon}
        {button.label}
        {button.variant === 'primary' && <ArrowRight size={18} />}
      </>
    );

    const className =
      button.variant === 'secondary' ? 'cta-secondary' : 'cta-primary';

    return (
      <Link key={`${button.label}-${index}`} href={button.href} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <section className="section-base section-contained">
      <div className="frame-panel space-y-8 text-center">
        {kicker && (
          <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/70">
            {kicker}
          </p>
        )}

        <h2 className="text-display-thin text-3xl md:text-4xl">{heading}</h2>
        <p className="text-body-relaxed text-base md:text-lg text-ink-soft/95 max-w-3xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {renderButton(primary, 0)}
          {secondary && renderButton({ ...secondary, variant: 'secondary' }, 1)}
        </div>
      </div>
    </section>
  );
}

