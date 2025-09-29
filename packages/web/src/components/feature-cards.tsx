'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tent, Palette, Users, Calendar, Heart, Globe, ArrowRight } from 'lucide-react';

const features = [
  {
    title: 'Experience Burning Man',
    description: 'Join us in Black Rock City for an unforgettable week of art, community, and radical self-expression.',
    icon: Tent,
    href: '/experience/burning-man',
    gradient: 'from-burnt-sienna to-antique-gold',
    image: '/images/burning-man-camp.jpg',
  },
  {
    title: 'Discover Persian Art',
    description: 'Explore our rich cultural heritage through traditional crafts, music, poetry, and contemporary art.',
    icon: Palette,
    href: '/art',
    gradient: 'from-desert-gold to-saffron',
    image: '/images/persian-art.jpg',
  },
  {
    title: 'Build Community',
    description: 'Connect with amazing people from around the world who share our values of hospitality and creativity.',
    icon: Users,
    href: '/community',
    gradient: 'from-antique-gold to-sunrise-coral',
    image: '/images/community.jpg',
  },
  {
    title: 'Year-Round Events',
    description: 'From fundraisers to cultural celebrations, we gather throughout the year to strengthen our bonds.',
    icon: Calendar,
    href: '/events',
    gradient: 'from-saffron to-desert-orange',
    image: '/images/events.jpg',
  },
  {
    title: 'Support Our Mission',
    description: 'Help us create transformative experiences and support arts education in underserved communities.',
    icon: Heart,
    href: '/donate',
    gradient: 'from-sunrise-coral to-burnt-sienna',
    image: '/images/support.jpg',
  },
  {
    title: 'Global Network',
    description: 'Be part of an international community that spans continents and cultures.',
    icon: Globe,
    href: '/about/global',
    gradient: 'from-desert-orange to-antique-gold',
    image: '/images/global.jpg',
  },
];

export function FeatureCards() {
  return (
    <section className="py-24 bg-warm-white">
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
            Discover Camp Alborz
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Explore the many facets of our community and find your place in our story
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Card content */}
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-desert-night mb-3 group-hover:text-burnt-sienna transition-colors">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      {feature.description}
                    </p>
                    
                    {/* Link with arrow */}
                    <div className="flex items-center text-burnt-sienna font-semibold">
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                  
                  {/* Bottom border gradient */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}