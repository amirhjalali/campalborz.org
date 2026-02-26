'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '../../components/reveal';
import { ArrowRight, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';
import { useRef } from 'react';

export default function EventsPage() {
  const { events } = useContentConfig();
  const heroRef = useRef<HTMLElement>(null);

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

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <Image
            src="/images/events_hero.webp"
            alt="Camp Alborz community event with participants enjoying Persian cuisine and festivities"
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
            placeholder="empty"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

        <motion.div
          className="relative z-10 text-center py-24 max-w-[1200px] mx-auto px-5 md:px-10"
          style={{ y: textY, opacity }}
        >
          <motion.p
            className="text-display-wide text-xs tracking-[0.5em] text-white/80 mb-6"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            GATHER WITH US
          </motion.p>
          <motion.h1
            className="text-display-thin text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {events.title}
          </motion.h1>
          <motion.p
            className="text-body-relaxed text-lg md:text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {events.subtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* Event Types */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-3 mb-14">
              <p className="text-eyebrow">UPCOMING EVENTS</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-ink)' }}>
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
                  <div className="luxury-card text-center group h-full">
                    <div
                      className="inline-flex p-4 rounded-full mb-6 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)',
                        border: '1px solid rgba(var(--color-gold-rgb), 0.25)',
                      }}
                    >
                      <TypeIcon className="h-7 w-7" style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <h3 className="font-display text-lg mb-2" style={{ color: 'var(--color-ink)' }}>{type.name}</h3>
                    <p className="text-caption mb-3" style={{ color: 'var(--color-gold)' }}>
                      {type.count} events yearly
                    </p>
                    <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                      {type.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-contrast py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>
                PLAYA SCHEDULE
              </p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Upcoming Events
              </h2>
              <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'rgba(var(--color-tan-50), 0.8)' }}>
                Join us for these exciting upcoming gatherings
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.upcomingEvents.map((event, index) => {
              const EventIcon = getIcon(event.icon);
              const isExternalLink = event.linkUrl?.startsWith('http');
              const isFeatured = index === 0;

              return (
                <Reveal key={event.id} delay={index * 0.1}>
                  <div
                    className={`luxury-card group transition-all duration-300 ${
                      isFeatured ? 'lg:col-span-2' : ''
                    }`}
                    style={{
                      backgroundColor: isFeatured ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isFeatured ? 'rgba(var(--color-gold-rgb), 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className="flex-shrink-0 p-4 rounded-full"
                        style={{
                          backgroundColor: 'rgba(var(--color-gold-rgb), 0.15)',
                          border: '1px solid rgba(var(--color-gold-rgb), 0.25)',
                        }}
                      >
                        <EventIcon className="h-6 w-6" style={{ color: 'var(--color-gold-muted)' }} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="text-caption" style={{ color: 'var(--color-gold-muted)' }}>
                            {event.type}
                          </span>
                          <h3
                            className={`font-display mt-1 ${isFeatured ? 'text-2xl' : 'text-xl'}`}
                            style={{ color: 'var(--color-cream)' }}
                          >
                            {event.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: 'rgba(var(--color-tan-50), 0.7)' }}>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" style={{ color: 'var(--color-gold-muted)', opacity: 0.7 }} aria-hidden="true" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4" style={{ color: 'var(--color-gold-muted)', opacity: 0.7 }} aria-hidden="true" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4" style={{ color: 'var(--color-gold-muted)', opacity: 0.7 }} aria-hidden="true" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <p className="font-accent text-sm" style={{ color: 'rgba(var(--color-tan-50), 0.8)' }}>
                          {event.description}
                        </p>

                        {event.linkUrl && (
                          <Link
                            href={event.linkUrl}
                            target={isExternalLink ? '_blank' : undefined}
                            rel={isExternalLink ? 'noreferrer' : undefined}
                            className="inline-flex items-center gap-2 text-sm transition-colors group/link"
                            style={{ color: 'var(--color-gold-muted)' }}
                          >
                            {event.linkText || 'View Details'}
                            <ExternalLink className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Burning Man Schedule */}
      {events.burningManSchedule && events.burningManSchedule.length > 0 && (
        <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="mb-14 text-center">
                <p className="text-eyebrow mb-3">PLAYA SCHEDULE</p>
                <h2 className="font-display text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-ink)' }}>
                  Burning Man Schedule
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.burningManSchedule.map((day, dayIndex) => (
                <Reveal key={day.day} delay={dayIndex * 0.1}>
                  <div className="luxury-card h-full">
                    <h3
                      className="font-display text-xl mb-6 pb-4"
                      style={{ borderBottom: '1px solid rgba(var(--color-line-rgb), 0.3)', color: 'var(--color-ink)' }}
                    >
                      {day.day}
                    </h3>
                    <div className="space-y-6">
                      {day.events.map((scheduleEvent, eventIndex) => (
                        <div key={eventIndex} className="flex gap-4">
                          <div className="flex-shrink-0 w-16 text-caption" style={{ color: 'var(--color-gold)' }}>
                            {scheduleEvent.time}
                          </div>
                          <div>
                            <h4 className="font-display text-sm mb-1" style={{ color: 'var(--color-ink)' }}>
                              {scheduleEvent.title}
                            </h4>
                            <p className="font-accent text-xs" style={{ color: 'var(--color-ink-soft)' }}>
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
                <div className="mb-10">
                  <h2 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--color-ink)' }}>
                    Event Guidelines
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="font-display text-lg mb-5" style={{ color: 'var(--color-ink)' }}>Before Attending</h3>
                    <ul className="space-y-3">
                      {events.guidelines.beforeAttending.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          <span className="mt-1" style={{ color: 'var(--color-gold)' }}>&#9670;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-display text-lg mb-5" style={{ color: 'var(--color-ink)' }}>Community Values</h3>
                    <ul className="space-y-3">
                      {events.guidelines.communityValues.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                          <span className="mt-1" style={{ color: 'var(--color-gold)' }}>&#9670;</span>
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

      {/* Config-driven CTA Section */}
      {events.cta && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
                <p className="text-eyebrow">JOIN US</p>
                <h2 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--color-ink)' }}>
                  {events.cta.title}
                </h2>
                <p className="text-body-relaxed text-base" style={{ color: 'var(--color-ink-soft)' }}>
                  {events.cta.description}
                </p>
                <Link href={events.cta.buttons.primary.link} className="cta-primary inline-flex">
                  <span>{events.cta.buttons.primary.text}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

    </main>
  );
}
