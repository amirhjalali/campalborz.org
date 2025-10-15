'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Tent, Heart } from 'lucide-react';
import { useContentConfig } from '../hooks/useConfig';

export function Hero() {
  const { hero } = useContentConfig();
  const { scrollY } = useScroll();

  // Parallax effects
  const yBackground = useTransform(scrollY, [0, 500], [0, 150]);
  const yPattern = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background with parallax */}
      <motion.div
        className="absolute inset-0 bg-gradient-hero animate-gradient-x"
        style={{ y: yBackground }}
      />

      {/* Persian pattern overlay with parallax */}
      <motion.div
        className="absolute inset-0 bg-persian-pattern opacity-10 animate-float-pattern"
        style={{ y: yPattern }}
      />

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
            <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent w-24 md:w-32" />
            <motion.p
              className="text-2xl md:text-3xl lg:text-4xl text-desert-sand font-light tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {hero.subtitle}
            </motion.p>
            <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent w-24 md:w-32" />
          </div>

          {/* Description */}
          <motion.p
            className="text-xl md:text-2xl text-desert-night max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {hero.description}
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={hero.cta.primary.link}
                className="inline-flex items-center justify-center px-10 py-5 text-lg bg-burnt-sienna text-warm-white font-bold rounded-xl hover:bg-antique-gold hover:text-desert-night transition-all duration-300 shadow-2xl hover:shadow-3xl group"
              >
                <Tent className="mr-3 h-6 w-6" />
                {hero.cta.primary.text}
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={hero.cta.secondary.link}
                className="inline-flex items-center justify-center px-10 py-5 text-lg bg-transparent text-burnt-sienna font-bold rounded-xl border-3 border-burnt-sienna hover:bg-burnt-sienna hover:text-warm-white transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-2xl group"
              >
                <Heart className="mr-3 h-6 w-6" />
                {hero.cta.secondary.text}
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
              </Link>
            </motion.div>
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