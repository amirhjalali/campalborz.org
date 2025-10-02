'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Tent, Heart } from 'lucide-react';
import { useContentConfig } from '../hooks/useConfig';

export function Hero() {
  const { hero } = useContentConfig();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero animate-gradient-x" />
      
      {/* Persian pattern overlay */}
      <div className="absolute inset-0 bg-persian-pattern opacity-10 animate-float-pattern" />
      
      {/* Gradient mesh for depth */}
      <div className="absolute inset-0 hero-gradient-mesh opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo/Title */}
          <motion.h1
            className="text-5xl md:text-7xl font-display font-bold text-burnt-sienna mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {hero.title}
          </motion.h1>

          {/* Tagline with decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-saffron to-transparent w-24" />
            <motion.p
              className="text-xl md:text-2xl text-desert-sand font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {hero.subtitle}
            </motion.p>
            <div className="h-px bg-gradient-to-r from-transparent via-saffron to-transparent w-24" />
          </div>

          {/* Description */}
          <motion.p
            className="text-lg text-desert-night max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {hero.description}
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href={hero.cta.primary.link}
              className="inline-flex items-center justify-center px-8 py-4 bg-burnt-sienna text-warm-white font-semibold rounded-lg hover:bg-antique-gold hover:text-desert-night transition-all duration-300 hover:scale-105 shadow-xl group"
            >
              <Tent className="mr-2 h-5 w-5" />
              {hero.cta.primary.text}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={hero.cta.secondary.link}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-burnt-sienna font-semibold rounded-lg border-2 border-burnt-sienna/50 hover:bg-burnt-sienna/10 hover:border-burnt-sienna transition-all duration-300 backdrop-blur-sm group"
            >
              <Heart className="mr-2 h-5 w-5" />
              {hero.cta.secondary.text}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="flex flex-col items-center text-desert-night/60">
            <span className="text-sm mb-2">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}