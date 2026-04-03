'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, Calendar, Clock, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef, useState } from 'react';

export default function EventsPage() {
  const { events } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  if (!events) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-ink-soft)' }}>Events page configuration not found</p>
      </main>
    );
  }

  const eventTypes = ['all', ...Array.from(new Set(events.upcomingEvents.map((e) => e.type)))];
  const filteredEvents =
    activeFilter === 'all'
      ? events.upcomingEvents
      : events.upcomingEvents.filter((e) => e.type === activeFilter);

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-hero-sm overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(160deg, #1a1f1a 0%, #4A5D5A 30%, #2C2416 60%, #D4AF37 90%, #D4C4A8 100%)',
        }}
      >
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <Image
            src="/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.webp"
            alt="Camp Alborz community event at night on the playa with Persian geometric structures and colorful lights"
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 text-center py-24 max-w-[1200px] mx-auto px-5 md:px-10"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            GATHER WITH US
          </motion.p>
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {events.title}
          </motion.h1>
          <motion.p
            className="font-accent text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {events.subtitle}
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>
      </section>

      {/* Event Types -- Visual Category Cards */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">WHAT WE DO</p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: '#2C2416' }}>
                Event Categories
              </h2>
              <p className="font-accent text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Discover the diverse range of experiences we offer year-round
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.eventTypes.map((type, index) => {
              const TypeIcon = getIcon(type.icon);

              return (
                <Reveal key={type.name} delay={index * 0.1}>
                  <motion.div
                    className="luxury-card text-center group h-full relative overflow-hidden"
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Subtle decorative gradient on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(var(--color-gold-rgb), 0.08), transparent 70%)',
                      }}
                    />
                    <div className="relative z-10">
                      <div
                        className="inline-flex p-4 rounded-full mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                          border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                        }}
                      >
                        <TypeIcon className="h-7 w-7" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <h3 className="font-display text-lg mb-2" style={{ color: 'var(--color-ink)' }}>{type.name}</h3>
                      <p
                        className="inline-block px-3 py-0.5 rounded-full text-xs font-medium mb-3"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                          color: 'var(--color-gold)',
                        }}
                      >
                        {type.count} events yearly
                      </p>
                      <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                        {type.description}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events -- Timeline Layout */}
      <section className="section-contrast py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-4 mb-10">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>
                UPCOMING
              </p>
              <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Upcoming Events
              </h2>
              <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'rgba(var(--color-tan-50), 0.8)' }}>
                Join us for these upcoming gatherings and experiences
              </p>
            </div>
          </Reveal>

          {/* Filter pills */}
          <Reveal delay={0.15}>
            <div className="flex flex-wrap justify-center gap-2 mb-12" role="tablist" aria-label="Filter events by type">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  role="tab"
                  aria-selected={activeFilter === type}
                  onClick={() => setActiveFilter(type)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor:
                      activeFilter === type
                        ? 'var(--color-gold)'
                        : 'rgba(255, 255, 255, 0.08)',
                    color:
                      activeFilter === type
                        ? '#1a1a18'
                        : 'rgba(var(--color-tan-50), 0.8)',
                    border:
                      activeFilter === type
                        ? '1px solid var(--color-gold)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {type === 'all' ? 'All Events' : type}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical timeline line -- hidden on mobile */}
            <div
              className="hidden md:block absolute left-8 top-0 bottom-0 w-px"
              style={{ backgroundColor: 'rgba(var(--color-gold-rgb), 0.2)' }}
              aria-hidden="true"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                {filteredEvents.map((event, index) => {
                  const EventIcon = getIcon(event.icon);
                  const isExternalLink = event.linkUrl?.startsWith('http');
                  const isFeatured = event.type === 'Burning Man';

                  return (
                    <Reveal key={event.id} delay={index * 0.08}>
                      <div className="relative md:pl-20">
                        {/* Timeline dot */}
                        <div
                          className="hidden md:flex absolute left-5 top-6 w-7 h-7 rounded-full items-center justify-center z-10"
                          style={{
                            backgroundColor: isFeatured
                              ? 'var(--color-gold)'
                              : 'rgba(var(--color-gold-rgb), 0.2)',
                            border: '2px solid rgba(var(--color-gold-rgb), 0.4)',
                          }}
                          aria-hidden="true"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: isFeatured
                                ? '#1a1a18'
                                : 'var(--color-gold)',
                            }}
                          />
                        </div>

                        <motion.article
                          className={`rounded-2xl p-6 sm:p-8 group transition-all duration-300 ${
                            isFeatured ? 'ring-1' : ''
                          }`}
                          style={{
                            backgroundColor: isFeatured
                              ? 'rgba(var(--color-gold-rgb), 0.08)'
                              : 'rgba(255, 255, 255, 0.05)',
                            borderColor: isFeatured
                              ? 'rgba(var(--color-gold-rgb), 0.3)'
                              : 'rgba(255, 255, 255, 0.08)',
                            border: isFeatured
                              ? undefined
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: isFeatured
                              ? '0 0 0 2px rgba(var(--color-gold-rgb), 0.25)'
                              : undefined,
                          }}
                          whileHover={{
                            backgroundColor: isFeatured
                              ? 'rgba(184, 150, 12, 0.12)'
                              : 'rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {/* Featured badge */}
                          {isFeatured && (
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="h-4 w-4" style={{ color: 'var(--color-gold)' }} aria-hidden="true" />
                              <span
                                className="text-xs uppercase tracking-[0.15em] font-medium"
                                style={{ color: 'var(--color-gold)' }}
                              >
                                Featured Event
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                            {/* Date block */}
                            <div
                              className="flex-shrink-0 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 sm:w-20 sm:text-center sm:pt-1"
                            >
                              <div
                                className="flex sm:flex-col items-center gap-2 sm:gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl"
                                style={{
                                  backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                                  border: '1px solid rgba(var(--color-gold-rgb), 0.15)',
                                }}
                              >
                                <EventIcon className="h-5 w-5" style={{ color: 'var(--color-gold-muted)' }} />
                                <span
                                  className="text-xs uppercase tracking-wider font-medium"
                                  style={{ color: 'var(--color-gold-muted)' }}
                                >
                                  {event.type}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-display mb-3 ${isFeatured ? 'text-2xl' : 'text-xl'}`}
                                style={{ color: 'var(--color-cream)' }}
                              >
                                {event.title}
                              </h3>

                              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm mb-4" style={{ color: 'rgba(var(--color-tan-50), 0.7)' }}>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-gold-muted)', opacity: 0.7 }} aria-hidden="true" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-gold-muted)', opacity: 0.7 }} aria-hidden="true" />
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-gold-muted)', opacity: 0.7 }} aria-hidden="true" />
                                  <span>{event.location}</span>
                                </div>
                              </div>

                              <p className="font-accent text-sm leading-relaxed mb-4" style={{ color: 'rgba(var(--color-tan-50), 0.8)' }}>
                                {event.description}
                              </p>

                              {event.linkUrl && (
                                <Link
                                  href={event.linkUrl}
                                  target={isExternalLink ? '_blank' : undefined}
                                  rel={isExternalLink ? 'noreferrer' : undefined}
                                  className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 group/link rounded-full px-4 py-2"
                                  style={{
                                    color: 'var(--color-gold)',
                                    backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                                    border: '1px solid rgba(var(--color-gold-rgb), 0.2)',
                                  }}
                                >
                                  {event.linkText || 'View Details'}
                                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.article>
                      </div>
                    </Reveal>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <p className="font-accent text-lg" style={{ color: 'rgba(var(--color-tan-50), 0.6)' }}>
                  No events in this category right now. Check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Burning Man Schedule -- Refined Timeline Cards */}
      {events.burningManSchedule && events.burningManSchedule.length > 0 && (
        <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="mb-14 text-center">
                <p className="text-eyebrow mb-3">PLAYA SCHEDULE</p>
                <h2 className="font-accent text-3xl md:text-4xl tracking-tight" style={{ color: '#2C2416' }}>
                  Burning Man Schedule
                </h2>
                <p className="font-accent text-base mt-3 max-w-xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                  What a typical week at Camp Alborz looks like on the playa
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.burningManSchedule.map((day, dayIndex) => (
                <Reveal key={day.day} delay={dayIndex * 0.1}>
                  <div className="luxury-card h-full">
                    <h3
                      className="font-display text-xl mb-6 pb-4 flex items-center gap-3"
                      style={{ borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)', color: 'var(--color-ink)' }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                          color: 'var(--color-gold)',
                        }}
                        aria-hidden="true"
                      >
                        {dayIndex + 1}
                      </span>
                      {day.day}
                    </h3>
                    <div className="space-y-0">
                      {day.events.map((scheduleEvent, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="flex gap-4 group relative py-4 first:pt-0 last:pb-0"
                          style={{
                            borderBottom:
                              eventIndex < day.events.length - 1
                                ? '1px solid rgba(var(--color-line-rgb), 0.15)'
                                : 'none',
                          }}
                        >
                          {/* Time pill */}
                          <div
                            className="flex-shrink-0 w-[4.5rem] py-1 px-2 rounded-lg text-center text-xs font-medium self-start mt-0.5"
                            style={{
                              backgroundColor: 'rgba(var(--color-gold-rgb), 0.1)',
                              color: 'var(--color-gold)',
                            }}
                          >
                            {scheduleEvent.time}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-sm mb-1 transition-colors duration-200" style={{ color: 'var(--color-ink)' }}>
                              {scheduleEvent.title}
                            </h4>
                            <p className="font-accent text-xs leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                              {scheduleEvent.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Event Guidelines */}
      {events.guidelines && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="frame-panel">
                <div className="mb-10 text-center">
                  <p className="text-eyebrow mb-3">GOOD TO KNOW</p>
                  <h2 className="font-accent text-2xl md:text-3xl" style={{ color: '#2C2416' }}>
                    Event Guidelines
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="font-display text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                          color: 'var(--color-gold)',
                        }}
                        aria-hidden="true"
                      >
                        1
                      </span>
                      Before Attending
                    </h3>
                    <ul className="space-y-3" role="list">
                      {events.guidelines.beforeAttending.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-gold)' }}
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-display text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.12)',
                          color: 'var(--color-gold)',
                        }}
                        aria-hidden="true"
                      >
                        2
                      </span>
                      Community Values
                    </h3>
                    <ul className="space-y-3" role="list">
                      {events.guidelines.communityValues.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-gold)' }}
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {events.cta && (
        <section
          className="py-24 md:py-32 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1a1f1a 0%, #4A5D5A 40%, #2C2416 80%)',
          }}
        >
          <div className="absolute inset-0 pattern-persian opacity-10" aria-hidden="true" />
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10">
            <Reveal>
              <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
                <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>JOIN US</p>
                <h2 className="font-accent text-3xl md:text-4xl tracking-tight text-white">
                  {events.cta.title}
                </h2>
                <p className="text-body-relaxed text-base text-white/80">
                  {events.cta.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link href={events.cta.buttons.primary.link} className="cta-primary cta-shimmer inline-flex">
                    <span>{events.cta.buttons.primary.text}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  {events.cta.buttons.secondary && (
                    <Link
                      href={events.cta.buttons.secondary.link}
                      className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full transition-all duration-200"
                      style={{
                        color: 'var(--color-cream)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      <span>{events.cta.buttons.secondary.text}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
