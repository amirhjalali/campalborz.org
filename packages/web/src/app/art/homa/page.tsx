'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../../components/navigation';
import { ArrowLeft, MapPin, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function HomaPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-hero animate-gradient-x">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <Link
              href="/art"
              className="inline-flex items-center text-primary hover:text-secondary mb-8 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Art
            </Link>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-burnt-sienna mb-6">
              HOMA Art Car
            </h1>
            <p className="text-xl text-desert-night max-w-3xl">
              The latest Art Car at Camp Alborz, inspired by the mythological Homa Bird
            </p>
          </motion.div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-midnight rounded-2xl p-8 shadow-lg"
            >
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                  Homa is the latest Art Car at Camp Alborz. Taking cue from the spirit of the mythological Homa Bird, it is a beautiful beast, that has risen from the ashes of its previous life as a competitive racing mud truck.
                </p>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                  As fate would have it, 2023 was the right year to show up to the playa with a mud truck! For 2024 the team is cooking up some special vocal chords, worthy of this beast.
                </p>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                  The Huma bird is a mythical bird of Persian legends and fables, and continuing as a common motif in Persian art and culture. Like the phoenix, it is said to never alight on the ground, and its shadow is said to be auspicious.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <span>2023 - Present</span>
                  </div>
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>Black Rock City</span>
                  </div>
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>Camp Alborz Team</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="py-16 bg-neutral-50 dark:bg-midnight-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-8 text-center">
              Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                '/images/migrated/homa/1d703783563f83a48077baddf1e5e4af.jpg',
                '/images/migrated/homa/3ad88bf19f50cd4964491e5ab3efd3cd.jpg',
                '/images/migrated/homa/a989ac400bf555e054cd071098a77114.jpg',
                '/images/migrated/homa/06c31b39a5b47d50c0580e6e51e64c58.jpg',
                '/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg',
                '/images/migrated/homa/435e2468508df066e91f8a16ecf57923.jpg',
              ].map((src, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-lg"
                >
                  <Image
                    src={src}
                    alt={`HOMA Art Car ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

