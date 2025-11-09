'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../../components/navigation';
import { ArrowLeft, MapPin, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function DamavandPage() {
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
              DAMAVAND Art Car
            </h1>
            <p className="text-xl text-desert-night max-w-3xl">
              Our first Art Car, named after the largest peak in the Alborz mountain range
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
                  Damavand is the name of the largest peak in the Alborz mountain range. For us, Damavand is our first Art Car. It is our home away from home and our way to take the Alborz spirit on the move.
                </p>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                  In 2022 Damavand made its debut appearance on the playa. This was a difficult year given the supply chain issues as well as so many natural and man made challenges. The custom speakers made their first appearance in the dust.
                </p>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                  2023 was the year for building resiliency into Damavand. We were able to continue our tradition on Saturday night, despite the rough conditions.
                </p>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                  In 2024 we had V3 of Damavand with a top made out of more mountainous materials.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <span>2022 - Present</span>
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
                '/images/migrated/damavand/12eaa03f0f463a26064517d77ee3b879.jpg',
                '/images/migrated/damavand/03cb3d52aee72cf138162860ff95965f.jpg',
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
                    alt={`DAMAVAND Art Car ${index + 1}`}
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

