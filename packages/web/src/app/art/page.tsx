'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { Palette, Flame, Sparkles, Users, Calendar, MapPin, Eye, ArrowRight } from 'lucide-react';

const featuredInstallations = [
  {
    id: 1,
    title: 'HOMA Fire Sculpture',
    year: '2023',
    artist: 'Camp Alborz Collective',
    description: 'A 20-foot tall interactive fire sculpture representing the sacred Persian fire altar, featuring programmable LED patterns that respond to music and movement.',
    location: '7:30 & Esplanade',
    participants: '15 artists',
    impact: 'Visited by 5,000+ burners',
    gradient: 'from-persian-purple to-desert-gold',
  },
  {
    id: 2,
    title: 'DAMAVAND Project',
    year: '2022',
    artist: 'International Collaboration',
    description: 'An immersive installation inspired by Mount Damavand, featuring mirrors and light to create an infinite mountain range experience.',
    location: 'Camp Alborz',
    participants: '8 artists',
    impact: 'Featured in Burning Man Journal',
    gradient: 'from-desert-gold to-saffron',
  },
  {
    id: 3,
    title: 'Persian Garden Oasis',
    year: '2024',
    artist: 'Community Build',
    description: 'A living art piece featuring traditional Persian garden elements with interactive water features and aromatic plants.',
    location: 'In Development',
    participants: '12 artists',
    impact: 'Coming to BM 2024',
    gradient: 'from-persian-violet to-pink-500',
  },
];

const artCategories = [
  {
    name: 'Fire Art',
    count: 8,
    icon: Flame,
    gradient: 'from-orange-500 to-red-600',
  },
  {
    name: 'Interactive',
    count: 12,
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Cultural Heritage',
    count: 15,
    icon: Palette,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Community',
    count: 20,
    icon: Users,
    gradient: 'from-green-500 to-emerald-600',
  },
];

export default function ArtPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-midnight-dark dark:to-midnight">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-persian-purple/10 via-transparent to-desert-gold/10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-900 dark:text-white mb-6">
              Art & Culture
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Where Persian artistic heritage meets radical self-expression, creating transformative experiences through collaborative art
            </p>
          </motion.div>
        </section>

        {/* Art Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {artCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white dark:bg-midnight-light rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${category.gradient} mb-4`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-3xl font-bold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent">
                    {category.count}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Projects</p>
                </motion.div>
              ))}
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
              {featuredInstallations.map((installation, index) => (
                <motion.div
                  key={installation.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group relative bg-white dark:bg-midnight rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${installation.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                          {installation.title}
                        </h3>
                        <p className="text-persian-purple dark:text-persian-light font-semibold mb-4">
                          {installation.artist} • {installation.year}
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                          {installation.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <MapPin className="h-4 w-4 mr-2 text-persian-purple" />
                            {installation.location}
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Users className="h-4 w-4 mr-2 text-persian-purple" />
                            {installation.participants}
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Eye className="h-4 w-4 mr-2 text-persian-purple" />
                            {installation.impact}
                          </div>
                        </div>
                      </div>
                      <div className={`h-1 lg:h-auto lg:w-1 bg-gradient-to-b ${installation.gradient}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

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
                    <div className="w-10 h-10 bg-gradient-to-br from-persian-purple to-persian-violet text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h4 className="ml-3 font-semibold text-neutral-900 dark:text-white">{phase.phase}</h4>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2 ml-13">{phase.description}</p>
                  <div className="flex items-center text-persian-purple dark:text-persian-light ml-13">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{phase.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-persian-purple/10 via-transparent to-desert-gold/10">
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
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-persian-purple to-persian-violet text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Join Our Artists
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-midnight text-neutral-900 dark:text-white font-semibold rounded-lg border-2 border-persian-purple hover:bg-persian-purple/10 transition-all duration-300"
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