'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '../../../components/reveal';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Mountain, Wrench } from 'lucide-react';
import { useRef } from 'react';

export default function DamavandPage() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero Section with Parallax and Mountain Silhouette */}
      <section ref={heroRef} className="relative min-h-hero-sm overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: backgroundY }}
        >
          <Image
            src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg"
            alt="DAMAVAND art car on the playa at Burning Man, named after Mt. Damavand in the Alborz range"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIDBAAFERIGEyExQXH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AxXS9Ks6lqMdWGeSNZFZjJxBKgAnz+5t9LoFfQ4BVhtTzxqSFeQgFx9yScYyLZwBXJM//2Q=="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute inset-0 opacity-90" style={{ background: 'linear-gradient(to top, var(--color-cream), transparent, transparent)' }} />
        </motion.div>

        <div className="absolute inset-0 pattern-persian opacity-15 z-[1]" />
        <div className="mountain-silhouette z-[2]" />

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
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Art
            </Link>
          </motion.div>

          <motion.p
            className="text-eyebrow mb-6"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            ART CAR 002
          </motion.p>
          <motion.h1
            className="text-optical-h1 tracking-tight text-white drop-shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            DAMAVAND
          </motion.h1>
          <motion.p
            className="font-accent text-xl md:text-2xl italic text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Named after the highest peak in the Alborz range -- our first art car, our home on the move
          </motion.p>

          <motion.div
            className="ornate-divider mt-8"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'brightness(1.5)' }}
          />
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-eyebrow mb-8">
                THE STORY
              </p>
              <div className="font-editorial text-lg leading-relaxed space-y-6" style={{ color: 'var(--color-ink-soft)' }}>
                <p>
                  Damavand is the name of the largest peak in the Alborz mountain range. For us, Damavand is our first Art Car. It is our home away from home and our way to take the Alborz spirit on the move. In 2022 Damavand made its debut appearance on the playa.
                </p>
                <blockquote className="font-accent text-xl md:text-2xl italic border-l-2 pl-6 py-2 my-8 text-left" style={{ color: 'var(--color-ink)', borderColor: 'rgba(184,150,12,0.4)' }}>
                  Our home away from home -- our way to take the Alborz spirit on the move.
                </blockquote>
                <p>
                  That was a difficult year given the supply chain issues as well as so many natural and man-made challenges. The custom speakers made their first appearance in the dust. In 2023 we built resiliency into Damavand, continuing our tradition on Saturday night despite the rough conditions. In 2024 we had V3 of Damavand with a top made out of more mountainous materials.
                </p>
              </div>

              <div className="ornate-divider" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Evolution Timeline */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">
                EVOLUTION
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Three Generations
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                year: '2022',
                version: 'V1',
                title: 'The Debut',
                description: 'Damavand made its first appearance on the playa with custom speakers cutting through the dust.',
              },
              {
                year: '2023',
                version: 'V2',
                title: 'Built for Resilience',
                description: 'We reinforced Damavand to handle the toughest playa conditions, continuing our Saturday night tradition.',
              },
              {
                year: '2024',
                version: 'V3',
                title: 'Mountain Top',
                description: 'A new top made from mountainous materials gave Damavand its most striking silhouette yet.',
              },
            ].map((era, index) => (
              <Reveal key={era.year} delay={index * 0.12} direction={index === 0 ? 'left' : index === 2 ? 'right' : 'up'}>
                <div className="luxury-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display text-xs" style={{ backgroundColor: 'var(--color-gold)' }}>
                      {era.version}
                    </div>
                    <span className="text-caption" style={{ color: 'var(--color-gold)' }}>{era.year}</span>
                  </div>
                  <h3 className="text-display-thin text-xl mb-3">{era.title}</h3>
                  <p className="text-body-relaxed text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                    {era.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* Specifications */}
      <section className="section-contrast py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-10">
              <p className="text-eyebrow" style={{ color: 'var(--color-gold-muted)' }}>
                DETAILS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--color-cream)' }}>
                Specifications
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: 'Debut', value: '2022' },
              { icon: MapPin, label: 'Home', value: 'Black Rock City' },
              { icon: Mountain, label: 'Namesake', value: 'Mt. Damavand' },
              { icon: Wrench, label: 'Iterations', value: '3 Versions' },
            ].map((spec, index) => (
              <Reveal key={spec.label} delay={index * 0.1}>
                <div className="text-center py-3">
                  <spec.icon className="h-4 w-4 mx-auto mb-2" style={{ color: 'var(--color-gold-muted)' }} />
                  <p className="text-caption text-[10px] mb-0.5" style={{ color: 'rgba(250,247,240,0.6)' }}>{spec.label}</p>
                  <p className="text-display-thin text-base" style={{ color: 'var(--color-cream)' }}>{spec.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 md:py-32">
        <div className="section-contained">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <p className="text-eyebrow">
                ON THE PLAYA
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl tracking-tight">
                Gallery
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="image-frame image-grain image-hover-zoom relative aspect-[21/9]">
              <Image
                src="/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg"
                alt="DAMAVAND art car at Camp Alborz on the playa"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="ornate-divider" />

      {/* The Mountain Connection */}
      <Reveal>
        <section className="py-24 md:py-32 relative" style={{ backgroundColor: 'var(--color-cream-warm)' }}>
          <div className="section-contained">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-eyebrow mb-8">
                THE NAMESAKE
              </p>
              <div className="blockquote-elegant">
                <p className="font-accent text-xl md:text-2xl italic leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                  Mt. Damavand stands at 5,610 meters -- the highest volcano in Asia and the tallest peak in the Alborz mountain range. It is a symbol of resistance and resilience in Persian mythology.
                </p>
              </div>
              <div className="ornate-divider mt-8" />
              <p className="text-body-relaxed mt-8" style={{ color: 'var(--color-ink-soft)' }}>
                Just as the mountain endures, our art car carries the spirit of the Alborz out onto the open playa -- moving, gathering people, and creating moments together.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* CTA Section */}
      <Reveal>
        <section className="py-24 md:py-32">
          <div className="section-contained">
            <div className="frame-panel text-center space-y-6">
              <p className="text-eyebrow">GET INVOLVED</p>
              <h2 className="text-display-thin text-2xl md:text-3xl">
                Help Build the Next Generation
              </h2>
              <p className="text-body-relaxed text-base max-w-2xl mx-auto" style={{ color: 'var(--color-ink-soft)' }}>
                Damavand needs builders, welders, painters, and supporters every season.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/donate" className="cta-primary">
                  <span>Support the Build</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/art/homa" className="cta-secondary">
                  <span>Meet HOMA</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
