'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '../../../components/navigation';
import { ArrowLeft, ArrowRight, MapPin, Users, Calendar, Mountain, Wrench } from 'lucide-react';
import { useRef } from 'react';

export default function DamavandPage() {
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
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-90" />
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
              DAMAVAND
            </motion.h1>
            <motion.p
              className="font-accent text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Named after the highest peak in the Alborz range -- our first art car, our home on the move
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
                  Damavand is the name of the largest peak in the Alborz mountain range. For us, Damavand is our first Art Car. It is our home away from home and our way to take the Alborz spirit on the move. In 2022 Damavand made its debut appearance on the playa.
                </p>
                <p>
                  That was a difficult year given the supply chain issues as well as so many natural and man-made challenges. The custom speakers made their first appearance in the dust. In 2023 we built resiliency into Damavand, continuing our tradition on Saturday night despite the rough conditions. In 2024 we had V3 of Damavand with a top made out of more mountainous materials.
                </p>
              </div>

              <div className="ornate-divider" />
            </motion.div>
          </div>
        </section>

        {/* Evolution Timeline */}
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
                EVOLUTION
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl">
                Three Generations
              </h2>
            </motion.div>

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
                <motion.div
                  key={era.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="luxury-card"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-display text-xs">
                      {era.version}
                    </div>
                    <span className="text-caption text-gold-600">{era.year}</span>
                  </div>
                  <h3 className="text-display-thin text-xl mb-3">{era.title}</h3>
                  <p className="text-body-relaxed text-sm text-ink-soft">
                    {era.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="section-contrast">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 mb-14"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-tan-light/70">
                DETAILS
              </p>
              <h2 className="text-display-thin text-3xl md:text-4xl text-tan-light">
                Specifications
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Calendar, label: 'Debut', value: '2022' },
                { icon: MapPin, label: 'Home', value: 'Black Rock City' },
                { icon: Mountain, label: 'Namesake', value: 'Mt. Damavand' },
                { icon: Wrench, label: 'Iterations', value: '3 Versions' },
              ].map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex p-3 rounded-full bg-white/10 border border-white/15 mb-4">
                    <spec.icon className="h-5 w-5 text-gold-400" />
                  </div>
                  <p className="text-caption text-tan-light/60 mb-1">{spec.label}</p>
                  <p className="text-display-thin text-lg text-tan-light">{spec.value}</p>
                </motion.div>
              ))}
            </div>
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
              {[
                {
                  src: '/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg',
                  alt: 'DAMAVAND art car at Camp Alborz on the playa',
                },
                {
                  src: '/images/migrated/alborz/e4956d45216d473ca35c279237d61592.jpg',
                  alt: 'Camp Alborz community gathered around DAMAVAND',
                },
              ].map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="image-frame image-grain relative aspect-[4/3] group"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Mountain Connection */}
        <section className="section-alt relative">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-display-wide text-xs tracking-[0.5em] text-ink-soft/80 mb-8">
                THE NAMESAKE
              </p>
              <div className="blockquote-elegant">
                <p className="font-accent text-xl md:text-2xl text-ink leading-relaxed">
                  Mt. Damavand stands at 5,610 meters -- the highest volcano in Asia and the tallest peak in the Alborz mountain range. It is a symbol of resistance and resilience in Persian mythology.
                </p>
              </div>
              <div className="ornate-divider mt-8" />
              <p className="text-body-relaxed text-ink-soft mt-8">
                Just as the mountain endures, our art car carries the spirit of the Alborz out onto the open playa -- moving, gathering people, and creating moments together.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-base">
          <div className="section-contained">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="frame-panel text-center space-y-8"
            >
              <h2 className="text-display-thin text-2xl md:text-3xl">
                Keep DAMAVAND Rolling
              </h2>
              <p className="text-body-relaxed text-base text-ink-soft max-w-2xl mx-auto">
                Damavand needs builders, welders, painters, and supporters every season. Join us for a build party or contribute to the next evolution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/donate" className="cta-primary cta-shimmer">
                  Support the Build
                  <ArrowRight size={18} />
                </Link>
                <Link href="/art/homa" className="cta-secondary">
                  Meet HOMA
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
