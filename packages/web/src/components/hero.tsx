'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Tent, Heart } from 'lucide-react';
import { useContentConfig } from '../hooks/useConfig';

export function Hero() {
  const { hero } = useContentConfig();
  const { scrollY } = useScroll();

  // Parallax effects
  const yPattern = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Light cream/beige background - Style Guide compliant */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-white via-tan-50 to-tan-100" />

      {/* Subtle Persian geometric pattern overlay - refined elegance */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ y: yPattern }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A5D5A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </motion.div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-tan-200/20" />
      
      {/* Content - CENTERED, ELEGANT, LUXURIOUS */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo/Title - Elegant and refined */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-sage-dark tracking-tight leading-tight mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {hero.title}
          </motion.h1>

          {/* Tagline with gold decorative lines - Style Guide pattern */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-24 md:w-32" />
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-sage font-light tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.2em' }}
            >
              {hero.subtitle}
            </motion.p>
            <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-24 md:w-32" />
          </div>

          {/* Description - Centered, elegant */}
          <motion.p
            className="text-lg md:text-xl text-sage-dark max-w-3xl mx-auto mb-12 leading-relaxed font-body font-normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {hero.description}
          </motion.p>

          {/* CTA Buttons - Refined gold and sage */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={hero.cta.primary.link}
                className="inline-flex items-center justify-center px-10 py-5 text-lg bg-gold text-white font-display font-semibold rounded-lg hover:bg-gold-dark transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Tent className="mr-3 h-5 w-5" />
                {hero.cta.primary.text}
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={hero.cta.secondary.link}
                className="inline-flex items-center justify-center px-10 py-5 text-lg bg-sage text-tan-light font-display font-semibold rounded-lg hover:bg-sage-dark transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Heart className="mr-3 h-5 w-5" />
                {hero.cta.secondary.text}
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator - Style Guide colors */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="flex flex-col items-center text-sage/60">
            <span className="text-sm mb-2 font-body">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-sage/30 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-sage/60 rounded-full mt-2" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}