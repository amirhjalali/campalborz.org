'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '../../components/navigation';
import { Users, Heart, Shield, Star, Award, Calendar, ArrowRight, LogIn } from 'lucide-react';

const memberBenefits = [
  {
    icon: Shield,
    title: 'Priority Placement',
    description: 'Guaranteed spot at our camp during Burning Man',
    gradient: 'from-persian-purple to-persian-violet',
  },
  {
    icon: Heart,
    title: 'Year-Round Events',
    description: 'Access to exclusive gatherings and workshops',
    gradient: 'from-desert-gold to-saffron',
  },
  {
    icon: Award,
    title: 'Art Grants',
    description: 'Funding support for your creative projects',
    gradient: 'from-persian-violet to-pink-500',
  },
  {
    icon: Users,
    title: 'Global Network',
    description: 'Connect with members worldwide',
    gradient: 'from-saffron to-desert-orange',
  },
];

const memberSpotlight = [
  {
    name: 'Sarah Martinez',
    role: 'Art Lead',
    years: '5 years',
    contribution: 'Led the HOMA Fire Sculpture project',
    gradient: 'from-persian-purple to-desert-gold',
  },
  {
    name: 'Ali Rezaei',
    role: 'Kitchen Coordinator',
    years: '8 years',
    contribution: 'Feeds 100+ people daily at Burning Man',
    gradient: 'from-desert-gold to-saffron',
  },
  {
    name: 'Emma Chen',
    role: 'Build Lead',
    years: '3 years',
    contribution: 'Designed our iconic shade structure',
    gradient: 'from-persian-violet to-pink-500',
  },
];

export default function MembersPage() {
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
              Member Portal
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Join our global community of artists, builders, and dreamers creating magic in the desert and beyond
            </p>
          </motion.div>
        </section>

        {/* Login Section */}
        <section className="py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-midnight-light rounded-2xl p-8 shadow-lg"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-br from-persian-purple to-persian-violet rounded-full">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-6">
                Member Login
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-persian-purple focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-persian-purple focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-persian-purple to-persian-violet text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Not a member yet?{' '}
                  <Link href="/apply" className="text-persian-purple hover:underline">
                    Apply to join
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Member Benefits */}
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
                Member Benefits
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Exclusive perks for our camp family
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {memberBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white dark:bg-midnight rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${benefit.gradient} mb-4`}>
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Member Spotlight */}
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
                Member Spotlight
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Meet some of our amazing contributors
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {memberSpotlight.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.gradient}`} />
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-persian-purple dark:text-persian-light font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-3">
                    Member for {member.years}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {member.contribution}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 bg-gradient-to-br from-persian-purple/10 to-desert-gold/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '500+', label: 'Active Members', icon: Users },
                { value: '15', label: 'Countries', icon: Star },
                { value: '100+', label: 'Events Annually', icon: Calendar },
                { value: '$50K', label: 'Art Grants Given', icon: Award },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <stat.icon className="h-8 w-8 text-persian-purple mx-auto mb-3" />
                  <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Ready to Join Our Family?
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
              Become part of a community that celebrates creativity, culture, and connection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-persian-purple to-persian-violet text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-midnight text-neutral-900 dark:text-white font-semibold rounded-lg border-2 border-persian-purple hover:bg-persian-purple/10 transition-all duration-300"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}