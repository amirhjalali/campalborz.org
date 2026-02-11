import Link from 'next/link';
import { Home, Search, Calendar, Heart } from 'lucide-react';

export default function NotFound() {
  const links = [
    { href: '/', icon: Home, label: 'Home', description: 'Start from the beginning' },
    { href: '/about', icon: Search, label: 'About Us', description: 'Learn about our camp' },
    { href: '/events', icon: Calendar, label: 'Events', description: "See what's happening" },
    { href: '/donate', icon: Heart, label: 'Donate', description: 'Support our community' },
  ];

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-display font-light text-sage/20">404</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-display-thin text-3xl md:text-4xl mb-4">
            Looks Like You&apos;ve Wandered Off the Playa
          </h2>
          <p className="text-body-relaxed text-lg text-ink-soft mb-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <p className="text-body-relaxed text-ink-soft/60">
            Don&apos;t worry, even the best explorers get lost sometimes.
          </p>
        </div>

        <div className="frame-panel mb-8">
          <h3 className="text-sm font-display tracking-widest uppercase text-ink-soft mb-4">
            Try one of these instead
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map(({ href, icon: Icon, label, description }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 border border-tan-300/50 rounded-xl hover:border-gold/70 hover:bg-gold/5 transition-all duration-300 group"
              >
                <Icon className="h-5 w-5 text-ink-soft/40 group-hover:text-gold transition-colors" />
                <div className="text-left">
                  <p className="font-medium text-sm text-ink group-hover:text-gold transition-colors">{label}</p>
                  <p className="text-xs text-ink-soft/60">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/" className="cta-primary text-sm">
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
          <Link href="/search" className="cta-secondary text-sm">
            <Search className="h-4 w-4" />
            Search Site
          </Link>
        </div>

        <p className="text-sm text-ink-soft/50 font-accent italic mb-12">
          &ldquo;Not all who wander are lost... but this page definitely is.&rdquo;
        </p>

        <div className="pt-8 border-t border-tan-300/30">
          <p className="text-sm text-ink-soft/60">
            Still can&apos;t find what you&apos;re looking for?{' '}
            <a
              href="mailto:info@campalborz.org"
              className="text-gold hover:text-gold-dark underline transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
