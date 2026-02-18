'use client';

import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  index?: number;
}

export function StatCard({ icon: Icon, label, value, subtext, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="luxury-card p-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
          <Icon className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <p className="text-sm font-medium text-[#4F4434]">{label}</p>
      </div>
      <p className="text-display-thin text-3xl text-[#2C2416]">{value}</p>
      {subtext && (
        <p className="mt-1 text-xs text-[#4F4434]">{subtext}</p>
      )}
    </motion.div>
  );
}
