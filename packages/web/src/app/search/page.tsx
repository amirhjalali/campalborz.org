'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, ArrowRight, Compass, Users, Palette, Calendar, Heart } from 'lucide-react';

const sitePages = [
  { title: 'About Camp Alborz', description: 'Our story, mission, and leadership team', href: '/about', icon: Compass, category: 'About' },
  { title: 'Art & Projects', description: 'HOMA, DAMAVAND, and our creative endeavors', href: '/art', icon: Palette, category: 'Art' },
  { title: 'HOMA Art Car', description: 'Our mythical phoenix sculpture and art car', href: '/art/homa', icon: Palette, category: 'Art' },
  { title: 'DAMAVAND Art Car', description: 'Our mountain-inspired art installation', href: '/art/damavand', icon: Palette, category: 'Art' },
  { title: 'Events', description: 'Upcoming gatherings, fundraisers, and community events', href: '/events', icon: Calendar, category: 'Events' },
  { title: 'Persian Culture', description: 'Traditions, poetry, and cultural heritage we celebrate', href: '/culture', icon: Heart, category: 'Culture' },
  { title: 'Join the Camp', description: 'Apply to become a member of Camp Alborz', href: '/apply', icon: Users, category: 'Membership' },
  { title: 'Donate', description: 'Support our art projects and camp operations', href: '/donate', icon: Heart, category: 'Support' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery.length > 0
    ? sitePages.filter(
        (page) =>
          page.title.toLowerCase().includes(normalizedQuery) ||
          page.description.toLowerCase().includes(normalizedQuery) ||
          page.category.toLowerCase().includes(normalizedQuery)
      )
    : [];

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }} className="min-h-screen">
      {/* Hero / Search */}
      <section className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 text-center">
          <p className="text-eyebrow mb-3">FIND YOUR WAY</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4" style={{ color: '#2C2416' }}>
            Search Camp Alborz
          </h1>
          <p className="text-body-relaxed text-lg max-w-3xl mx-auto mb-10" style={{ color: 'var(--color-ink-soft)' }}>
            Find pages, events, art projects, and everything about our community.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto" role="search" aria-label="Site search">
            <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10" style={{ color: 'var(--color-ink-faint)' }} aria-hidden="true" />
            <label htmlFor="site-search" className="sr-only">Search Camp Alborz</label>
            <input
              type="search"
              id="site-search"
              placeholder="Search pages, art, events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input w-full pl-14 pr-5 py-4 text-lg rounded-2xl"
              autoFocus
            />
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Search Results */}
      {normalizedQuery.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <h2 className="font-accent text-2xl md:text-3xl tracking-tight mb-8" style={{ color: '#2C2416' }}>
              {filtered.length > 0
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query.trim()}"`
                : 'No results found'}
            </h2>

            {filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((page) => {
                  const PageIcon = page.icon;
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="luxury-card flex items-start gap-5 group transition-all duration-200"
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)' }}>
                        <PageIcon className="h-5 w-5" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-accent text-lg tracking-tight" style={{ color: '#2C2416' }}>
                            {page.title}
                          </h3>
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" style={{ color: 'var(--color-ink-soft)' }} />
                        </div>
                        <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          {page.description}
                        </p>
                      </div>
                      <span className="text-eyebrow flex-shrink-0 hidden sm:block" style={{ fontSize: '10px' }}>
                        {page.category}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="frame-panel text-center py-12">
                <SearchIcon className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-ink-faint)' }} />
                <p className="text-body-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                  Try a different search term, or browse the pages below.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Browse All Pages */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="text-center mb-12">
            <p className="text-eyebrow mb-3">BROWSE</p>
            <h2 className="font-accent text-2xl md:text-3xl tracking-tight" style={{ color: '#2C2416' }}>
              Explore the Site
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sitePages.map((page) => {
              const PageIcon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="luxury-card text-center group transition-all duration-200"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="inline-flex p-3 rounded-xl mb-4 transition-colors" style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)' }}>
                    <PageIcon className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <h3 className="font-display text-base mb-1" style={{ color: '#2C2416' }}>
                    {page.title}
                  </h3>
                  <p className="text-body-relaxed text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                    {page.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
