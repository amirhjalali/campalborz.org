'use client';

import { motion } from 'framer-motion';
import { useContentConfig } from '../hooks/useConfig';
import { getIcon } from '../lib/icons';

export function Stats() {
  const { stats } = useContentConfig();
  return (
    <section className="py-24 bg-desert-sand/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-desert-night/70 max-w-2xl mx-auto font-body">
            Building bridges between cultures, creating art, and fostering community for over a decade
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = getIcon(stat.icon);
            const color = stat.color || 'from-primary to-secondary';

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              >
                <div className="group relative bg-warm-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(160,82,45,0.08),0_8px_40px_rgba(212,175,55,0.06)] border border-dust-khaki/20 backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(160,82,45,0.12),0_12px_50px_rgba(212,175,55,0.08)] hover:border-antique-gold/40 transition-all duration-500 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${color} mb-4`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>

                  {/* Value */}
                  <div className="mb-2">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  {stat.description && (
                    <p className="text-sm text-desert-night/70 font-body">
                      {stat.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-desert-night/70 mb-6 font-body">
            Want to be part of our story?
          </p>
          <a
            href="/join"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-burnt-sienna via-antique-gold to-burnt-sienna text-warm-white font-bold rounded-xl shadow-[0_4px_15px_rgba(160,82,45,0.4),0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_25px_rgba(160,82,45,0.5),0_0_40px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Join Our Community
          </a>
        </motion.div>
      </div>
    </section>
  );
}