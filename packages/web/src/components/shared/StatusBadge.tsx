'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'season' | 'payment' | 'application';
}

const seasonColors: Record<string, { bg: string; text: string; dot: string }> = {
  CONFIRMED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  MAYBE: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  INTERESTED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  WAITLISTED: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const applicationColors: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  REVIEWED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  ACCEPTED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  WAITLISTED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

function formatStatusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function StatusBadge({ status, variant = 'season' }: StatusBadgeProps) {
  if (variant === 'payment') {
    const isPaid = status === 'true' || status === 'Paid';
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-red-500'}`}
        />
        {isPaid ? 'Paid' : 'Unpaid'}
      </span>
    );
  }

  const colorMap = variant === 'application' ? applicationColors : seasonColors;
  const colors = colorMap[status] || { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {formatStatusLabel(status)}
    </span>
  );
}
