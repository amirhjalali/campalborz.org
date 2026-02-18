'use client';

import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
        <Icon className="h-7 w-7 text-[#D4AF37]" />
      </div>
      <h3 className="text-display-thin text-xl text-[#2C2416] mb-2">{title}</h3>
      <p className="text-body-relaxed text-sm text-[#4F4434] max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="cta-primary mt-6 text-sm px-6 py-2.5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
