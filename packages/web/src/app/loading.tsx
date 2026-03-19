export default function Loading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <div className="max-w-md w-full text-center">
        {/* Ornate divider with animated pulse */}
        <div className="ornate-divider animate-pulse mb-8">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: 'var(--color-gold-muted)' }}
          >
            <path
              d="M10 0L13.09 6.91L20 10L13.09 13.09L10 20L6.91 13.09L0 10L6.91 6.91L10 0Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>

        <h1
          className="font-display text-2xl mb-3 animate-pulse"
          style={{ color: 'var(--color-ink)' }}
        >
          Loading...
        </h1>

        <p
          className="font-body text-sm leading-relaxed"
          style={{ color: 'var(--color-ink-faint)' }}
        >
          Preparing your experience
        </p>
      </div>
    </main>
  );
}
