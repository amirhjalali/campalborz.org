'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { ArrowRight } from 'lucide-react';
import { useContentConfig, useCampConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';

export default function AboutPage() {
  const { about } = useContentConfig();
  const campConfig = useCampConfig();

  // Fallback in case about config is not defined
  if (!about) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>About page configuration not found</p>
        </main>
      </>
    );
  }

  const MountainIcon = getIcon('mountain');
  const AwardIcon = getIcon('award');
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
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-burnt-sienna mb-6">
                {about.title}
              </h1>
              <p className="text-xl text-desert-night max-w-3xl mx-auto">
                {about.subtitle}
              </p>
            </div>
            
            {/* Mountain Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center mt-8"
            >
              <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-full">
                <MountainIcon className="h-12 w-12 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-midnight-light rounded-2xl p-8 md:p-12 shadow-lg"
            >
              <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-6">
                {about.mission.title}
              </h2>
              {about.mission.paragraphs.map((paragraph, index) => (
                <p key={index} className={`text-lg text-neutral-700 dark:text-neutral-300 ${index < about.mission.paragraphs.length - 1 ? 'mb-4' : ''}`}>
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-neutral-50 dark:bg-midnight-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                Our Values
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {about.values.map((value, index) => {
                const ValueIcon = getIcon(value.icon);
                const gradient = value.gradient || 'from-primary to-secondary';

                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative bg-white dark:bg-midnight rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-4`}>
                      <ValueIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                15+ years of magic in the desert
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary to-secondary" />
              
              {/* Milestones */}
              <div className="space-y-12">
                {about.timeline.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center`}
                  >
                    <div className="flex-1" />
                    <div className="w-4 h-4 bg-primary rounded-full relative z-10" />
                    <div className="flex-1">
                      <div className={`bg-white dark:bg-midnight-light rounded-lg p-4 shadow-lg ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                        <div className="text-primary font-bold mb-1">{milestone.year}</div>
                        <div className="text-neutral-700 dark:text-neutral-300">{milestone.event}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-neutral-50 dark:bg-midnight-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                Our Leadership
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                The passionate people who make {campConfig.name} possible
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {about.team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-midnight rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4" />
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-primary dark:text-primary-light mb-3">{member.role}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 501(c)(3) Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12"
            >
              <div className="flex items-center mb-6">
                <AwardIcon className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">
                  {about.nonprofit.title}
                </h2>
              </div>
              <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6">
                {about.nonprofit.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {about.nonprofit.cta.donate}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-midnight text-neutral-900 dark:text-white font-semibold rounded-lg border-2 border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  {about.nonprofit.cta.join}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}