'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <div className="max-w-md w-full text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{
            backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)',
            border: '1px solid rgba(var(--color-gold-rgb), 0.25)',
          }}
        >
          <svg
            className="h-8 w-8"
            style={{ color: 'var(--color-gold)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1
          className="font-display text-2xl mb-3"
          style={{ color: 'var(--color-ink)' }}
        >
          Something Went Wrong
        </h1>
        <p
          className="font-body text-sm mb-8 leading-relaxed"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          An unexpected error occurred. Please try again, and if the problem
          persists, contact us for assistance.
        </p>
        <button
          onClick={reset}
          className="cta-primary"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
