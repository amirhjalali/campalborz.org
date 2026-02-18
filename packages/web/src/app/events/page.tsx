'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
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
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">Events page configuration not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="bg-cream">
        {/* Hero Section with Parallax */}
        <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: backgroundY }}
          >
            <Image
              src="/images/migrated/events/6300ec6946cc0241c54b7982d2f32e89.jpg"
              alt="Camp Alborz community event with participants enjoying Persian cuisine and festivities"
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQH/8QAIBAAAgICAgIDAAAAAAAAAAAAAQIDEQAEBSESMRNBYf/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAGREAAwEBAQAAAAAAAAAAAAAAAAECAxEh/9oADAMBEQCEAPwCbt8Rw24hTf2mCPKhYswUfXX5jPIe+4mK8o+sYzpy0YqmH//Z"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-90" />
          </motion.div>

          <div className="absolute inset-0 pattern-persian opacity-20 z-[1]" />

          <motion.div
            className="relative z-10 section-contained text-center py-24"
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
        <section className="section-base section-contained">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
              Event Categories
            </h2>
            <p className="font-accent text-lg text-ink-soft max-w-2xl mx-auto">
              Discover the diverse range of experiences we offer year-round
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.eventTypes.map((type, index) => {
              const TypeIcon = getIcon(type.icon);

              return (
                <motion.div
                  key={type.name}
                  initial={{ y: 16, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 + (index > 2 ? 0.05 : 0), ease: [0.22, 1, 0.36, 1] }}
                  className="luxury-card text-center group"
                >
                  <div className="inline-flex p-4 rounded-full bg-gold-500/20 border border-gold-500/30 mb-6 transition-transform duration-300 group-hover:scale-110">
                    <TypeIcon className="h-7 w-7 text-gold-500" />
                  </div>
                  <h3 className="text-display-thin text-lg mb-2">{type.name}</h3>
                  <p className="text-caption text-gold-600 mb-3">
                    {type.count} events yearly
                  </p>
                  <p className="text-body-relaxed text-sm text-ink-soft">
                    {type.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="section-contrast">
          <div className="section-contained">
            <div className="text-center space-y-4 mb-14">
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                MARK YOUR CALENDAR
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight text-tan-light">
                Upcoming Events
              </h2>
              <p className="text-body-relaxed text-base text-tan-light/80 max-w-2xl mx-auto">
                Join us for these exciting upcoming gatherings
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events.upcomingEvents.map((event, index) => {
                const EventIcon = getIcon(event.icon);
                const isExternalLink = event.linkUrl?.startsWith('http');
                const isFeatured = index === 0;

                return (
                  <div
                    key={event.id}
                    className={`border rounded-2xl p-8 transition-all duration-300 hover:border-gold-500/30 ${
                      isFeatured
                        ? 'border-gold-500/25 bg-white/8 lg:col-span-2'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 p-4 rounded-full bg-gold-500/20 border border-gold-500/30">
                        <EventIcon className="h-6 w-6 text-gold-400" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="text-caption text-gold-400">
                            {event.type}
                          </span>
                          <h3 className={`text-display-thin text-tan-light mt-1 ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
                            {event.title}
                          </h3>
                        </div>

                        <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm text-tan-light/70`}>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gold-500/70" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gold-500/70" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gold-500/70" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <p className="font-accent text-sm text-tan-light/80">
                          {event.description}
                        </p>

                        {event.linkUrl && (
                          <Link
                            href={event.linkUrl}
                            target={isExternalLink ? '_blank' : undefined}
                            rel={isExternalLink ? 'noreferrer' : undefined}
                            className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors group"
                          >
                            {event.linkText || 'View Details'}
                            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Burning Man Schedule */}
        {events.burningManSchedule && events.burningManSchedule.length > 0 && (
          <section className="section-base">
            <div className="section-contained">
              <div className="mb-14">
                <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                  Burning Man Schedule
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {events.burningManSchedule.map((day, dayIndex) => (
                  <div
                    key={day.day}
                    className={dayIndex % 2 === 0 ? 'luxury-card' : 'py-6'}
                  >
                    <h3 className="text-display-thin text-xl mb-6 pb-4 border-b border-line/30">
                      {day.day}
                    </h3>
                    <div className="space-y-6">
                      {day.events.map((scheduleEvent, eventIndex) => (
                        <div key={eventIndex} className="flex gap-4">
                          <div className="flex-shrink-0 w-16 text-caption text-gold-600">
                            {scheduleEvent.time}
                          </div>
                          <div>
                            <h4 className="font-display text-sm text-ink mb-1">
                              {scheduleEvent.title}
                            </h4>
                            <p className="font-accent text-xs text-ink-soft">
                              {scheduleEvent.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Event Guidelines */}
        {events.guidelines && (
          <section className="section-alt">
            <div className="section-contained">
              <div className="frame-panel">
                <div className="mb-10">
                  <h2 className="text-display-thin text-2xl md:text-3xl">
                    Event Guidelines
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-display-thin text-lg mb-5">Before Attending</h3>
                    <ul className="space-y-3">
                      {events.guidelines.beforeAttending.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-body-relaxed text-sm text-ink-soft">
                          <span className="text-gold-500 mt-1">◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-display-thin text-lg mb-5">Community Values</h3>
                    <ul className="space-y-3">
                      {events.guidelines.communityValues.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-body-relaxed text-sm text-ink-soft">
                          <span className="text-gold-500 mt-1">◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {events.cta && (
          <section className="section-base">
            <div className="section-contained">
              <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
                <h2 className="text-display-thin text-2xl md:text-3xl">
                  {events.cta.title}
                </h2>
                <p className="text-body-relaxed text-base text-ink-soft">
                  {events.cta.description}
                </p>
                <Link href={events.cta.buttons.primary.link} className="cta-primary inline-flex">
                  {events.cta.buttons.primary.text}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
