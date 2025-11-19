'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { MapPin, Eye, ArrowRight, Users, Calendar } from 'lucide-react';
import { useContentConfig } from '../../hooks/useConfig';
import { getIcon } from '../../lib/icons';

export default function ArtPage() {
  const { art } = useContentConfig();

  if (!art) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <p>Art page configuration not found</p>
        </main>
      </>
    );
  }

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
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-burnt-sienna mb-6">
              {art.title}
            </h1>
            <p className="text-xl text-desert-night max-w-3xl mx-auto">
              {art.subtitle}
            </p>
          </motion.div>
        </section>

        {/* Art Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {art.categories.map((category, index) => {
                const CategoryIcon = getIcon(category.icon);
                const gradient = category.gradient || 'from-primary to-secondary';

                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className="group relative bg-white dark:bg-midnight-light rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                    <motion.div
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} mb-4`}
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CategoryIcon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
                      {category.count}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Projects</p>
                    <div className="flex items-center text-primary font-medium text-sm group-hover:text-secondary transition-colors">
                      <span>View Projects</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Installations */}
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
                Featured Installations
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Our signature artistic contributions to Black Rock City
              </p>
            </motion.div>

            <div className="space-y-8">
              {art.installations.map((installation, index) => {
                const gradient = installation.gradient || 'from-primary to-secondary';
                const detailUrl = installation.slug ? `/art/${installation.slug}` : null;

                return (
                <motion.div
                  key={installation.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="group relative bg-white dark:bg-midnight rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-8 transition-opacity duration-300`} />
                  <div className="p-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                          {detailUrl ? (
                            <Link href={detailUrl} className="hover:text-primary transition-colors">
                              {installation.title}
                            </Link>
                          ) : (
                            installation.title
                          )}
                        </h3>
                        <p className="text-primary dark:text-persian-light font-semibold mb-4">
                          {installation.artist} • {installation.year}
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                          {installation.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            {installation.location}
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            {installation.participants}
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Eye className="h-4 w-4 mr-2 text-primary" />
                            {installation.impact}
                          </div>
                        </div>
                        {detailUrl && (
                          <Link
                            href={detailUrl}
                            className="inline-flex items-center text-primary hover:text-secondary font-medium transition-colors"
                          >
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        )}
                      </div>
                      <div className={`h-1 lg:h-auto lg:w-1 bg-gradient-to-b ${gradient}`} />
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {art.collaborations && art.collaborations.length > 0 && (
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
                  Collaborations & Sponsored Projects
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  Art we’ve helped finance, transport, or host through the Camp Alborz network
                </p>
              </motion.div>
              <div className="grid gap-6 md:grid-cols-2">
                {art.collaborations.map((collaboration, index) => (
                  <motion.div
                    key={collaboration.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg border border-neutral-100 dark:border-neutral-800"
                  >
                    <p className="text-xs uppercase tracking-[0.4em] text-primary mb-2">
                      {collaboration.year || "Ongoing"}
                    </p>
                    <h3 className="text-2xl font-display font-semibold text-neutral-900 dark:text-white mb-3">
                      {collaboration.title}
                    </h3>
                    <p className="text-sm text-primary dark:text-persian-light font-semibold mb-3">
                      {collaboration.partners}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                      {collaboration.description}
                    </p>
                    {collaboration.link && (
                      <Link
                        href={collaboration.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-primary hover:text-secondary font-medium text-sm"
                      >
                        Learn more
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Art Process Timeline */}
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
                Our Creative Process
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                From concept to playa: How we bring art to life
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { phase: 'Ideation', time: 'Nov-Dec', description: 'Community brainstorming and concept development' },
                { phase: 'Design', time: 'Jan-Feb', description: 'Detailed planning and 3D modeling' },
                { phase: 'Fundraising', time: 'Feb-Mar', description: 'Securing materials and funding' },
                { phase: 'Build Season', time: 'Apr-Jul', description: 'Collaborative construction workshops' },
                { phase: 'Installation', time: 'August', description: 'Setting up on the playa' },
                { phase: 'Legacy', time: 'Sep-Oct', description: 'Documentation and future planning' },
              ].map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h4 className="ml-3 font-semibold text-neutral-900 dark:text-white">{phase.phase}</h4>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2 ml-13">{phase.description}</p>
                  <div className="flex items-center text-primary dark:text-persian-light ml-13">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{phase.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Create Art With Us
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
              Whether you're an experienced artist or just curious about creating, there's a place for you in our artistic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/join"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Join Our Artists
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-midnight text-neutral-900 dark:text-white font-semibold rounded-lg border-2 border-primary hover:bg-primary/10 transition-all duration-300"
              >
                Attend Art Build
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
