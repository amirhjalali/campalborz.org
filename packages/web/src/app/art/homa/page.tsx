'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '../../../components/navigation';
import { ArrowLeft, ArrowRight, MapPin, Users, Calendar, Volume2, Zap } from 'lucide-react';
import { useRef } from 'react';

export default function HomaPage() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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
              src="/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg"
              alt="HOMA art car illuminated at night on the playa, inspired by the mythological Homa Bird"
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIDBAAFERIGEyExQXH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AxXS9Ks6lqMdWGeSNZFZjJxBKgAnz+5t9LoFfQ4BVhtTzxqSFeQgFx9yScYyLZwBXJM//2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-90" />
          </motion.div>

          <div className="absolute inset-0 pattern-persian opacity-15 z-[1]" />

          <motion.div
            className="relative z-10 section-contained text-center py-24"
            style={{ y: textY, opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/art"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Art
              </Link>
            </motion.div>

            <motion.p
              className="text-display-wide text-xs tracking-[0.5em] text-white/80 mb-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              ART CAR
            </motion.p>
            <motion.h1
              className="text-optical-h1 text-white drop-shadow-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
            >
              HOMA
            </motion.h1>
            <motion.p
              className="font-accent text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Risen from the ashes, inspired by the mythological Homa Bird
            </motion.p>

            <motion.div
              className="ornate-divider mt-8"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ filter: 'brightness(1.5)' }}
            />
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 text-center mb-8">
                THE STORY
              </p>
              <div className="font-editorial text-lg text-ink-soft leading-relaxed space-y-6">
                <p className="drop-cap">
                  Homa is the latest Art Car at Camp Alborz. Taking cue from the spirit of the mythological Homa Bird, it is a beautiful beast that has risen from the ashes of its previous life as a competitive racing mud truck. As fate would have it, 2023 was the right year to show up to the playa with a mud truck!
                </p>
                <p>
                  For 2024 the team cooked up some special vocal chords, worthy of this beast. The Huma bird is a mythical bird of Persian legends and fables, and continuing as a common motif in Persian art and culture. Like the phoenix, it is said to never alight on the ground, and its shadow is said to be auspicious.
                </p>
              </div>

              <div className="ornate-divider" />
            </motion.div>
          </div>
        </section>

        {/* Specifications */}
        <section className="section-alt">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                SPECIFICATIONS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                The Beast
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Calendar, label: 'Debut', value: '2023', detail: 'Burning Man' },
                { icon: MapPin, label: 'Home', value: 'Black Rock City', detail: 'Nevada' },
                { icon: Volume2, label: 'Sound', value: 'Custom Built', detail: 'Playa-ready system' },
                { icon: Zap, label: 'Origin', value: 'Mud Truck', detail: 'Reborn as art' },
              ].map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="luxury-card text-center"
                >
                  <div className="inline-flex p-3 rounded-full bg-gold-500/15 border border-gold-500/25 mb-4">
                    <spec.icon className="h-5 w-5 text-gold-500" />
                  </div>
                  <p className="text-caption text-ink-soft/70 mb-1">{spec.label}</p>
                  <p className="text-display-thin text-lg mb-1">{spec.value}</p>
                  <p className="text-sm text-ink-soft/60">{spec.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Mythology */}
        <section className="section-contrast">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70 mb-8">
                THE MYTHOLOGY
              </p>
              <div className="blockquote-elegant">
                <p className="font-accent text-xl md:text-2xl text-tan-light/90 leading-relaxed">
                  The Huma bird is a mythical creature of Persian legends and fables, a common motif in Persian art and culture. Like the phoenix, it is said to never alight on the ground, and its shadow is said to be auspicious.
                </p>
              </div>
              <div className="ornate-divider mt-10" style={{ filter: 'brightness(1.3)' }} />
              <p className="text-body-relaxed text-tan-light/70 mt-8">
                In Persian mythology, it was believed that the Huma bird could never be caught, and that anyone who spotted its shadow would be blessed with great fortune.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Gallery */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80">
                ON THE PLAYA
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Gallery
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="image-frame image-grain relative aspect-[4/3] group"
              >
                <Image
                  src="/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg"
                  alt="HOMA art car illuminated with LED lights on the playa at night"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="image-frame image-grain relative aspect-[4/3] group"
              >
                <Image
                  src="/images/migrated/art/193f4a3f0015480546bb78faa7650751.jpg"
                  alt="Camp Alborz art installation on the playa"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-alt">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="frame-panel text-center space-y-8"
            >
              <h2 className="text-display-thin text-2xl md:text-3xl">
                Help HOMA Take Flight
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Whether you can weld, wire, paint, or just want to lend a hand at a build party, there is room on the crew. Your support keeps HOMA roaming the playa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/donate" className="cta-primary cta-shimmer">
                  Support the Build
                  <ArrowRight size={18} />
                </Link>
                <Link href="/art/damavand" className="cta-secondary">
                  Meet DAMAVAND
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
