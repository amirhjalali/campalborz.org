'use client';

import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Globe, Flame, Heart } from 'lucide-react';

const stats = [
  {
    label: 'Years of Magic',
    value: '15+',
    icon: Flame,
    description: 'Creating unforgettable experiences',
    color: 'from-persian-purple to-persian-violet',
  },
  {
    label: 'Members Worldwide',
    value: '500+',
    icon: Users,
    description: 'A global community united',
    color: 'from-desert-gold to-saffron',
  },
  {
    label: 'Raised for Charity',
    value: '$50K',
    icon: DollarSign,
    description: 'Supporting arts and education',
    color: 'from-persian-violet to-pink-500',
  },
  {
    label: 'Events Per Year',
    value: '20+',
    icon: Calendar,
    description: 'Year-round gatherings',
    color: 'from-saffron to-desert-orange',
  },
  {
    label: 'Art Projects Funded',
    value: '5',
    icon: Heart,
    description: 'Major installations created',
    color: 'from-persian-purple to-desert-gold',
  },
  {
    label: 'Countries Reached',
    value: '12',
    icon: Globe,
    description: 'International community',
    color: 'from-desert-orange to-persian-violet',
  },
];

export function Stats() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-midnight-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-burnt-sienna mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Building bridges between cultures, creating art, and fostering community for over a decade
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="group relative bg-white dark:bg-midnight rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                
                {/* Value */}
                <div className="mb-2">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                </div>
                
                {/* Label */}
                <h3 className="text-lg font-semibold text-burnt-sienna mb-1">
                  {stat.label}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Want to be part of our story?
          </p>
          <a
            href="/join"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-burnt-sienna to-antique-gold text-warm-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Join Our Community
          </a>
        </motion.div>
      </div>
    </section>
  );
}