'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, CreditCard, User, Megaphone, Loader2, AlertCircle, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface Payment {
  id: string;
  amount: number;
  type: string;
  method: string;
  paidAt: string;
  note?: string | null;
}

interface SeasonStatus {
  id: string;
  status: string;
  housingType: string | null;
  buildCrew: boolean;
  strikeCrew: boolean;
  payments: Payment[];
  season: {
    id: string;
    year: number;
    name: string;
    duesAmount: number;
    startDate: string | null;
    endDate: string | null;
  };
}

const quickLinks = [
  {
    label: 'My Profile',
    href: '/portal/profile',
    icon: User,
    description: 'View and update your member profile',
  },
  {
    label: 'My Payments',
    href: '/portal/payments',
    icon: CreditCard,
    description: 'Track dues and payment history',
  },
  {
    label: 'Season Details',
    href: '/portal/season',
    icon: Calendar,
    description: 'View current season information',
  },
];

const statusLabels: Record<string, string> = {
  INTERESTED: 'Interested',
  MAYBE: 'Maybe',
  CONFIRMED: 'Confirmed',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
};

const statusColors: Record<string, string> = {
  INTERESTED: 'bg-blue-100 text-blue-800',
  MAYBE: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  WAITLISTED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function PortalDashboard() {
  const { user } = useAuth();
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSeasonStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/trpc/seasonMembers.getMySeasonStatus`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load season status');
      const json = await res.json();
      setSeasonStatus(json.result?.data ?? null);
    } catch {
      setError('Unable to load season data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeasonStatus();
  }, [loadSeasonStatus]);

  if (!user) return null;

  const totalPaid = seasonStatus?.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const duesAmount = seasonStatus?.season?.duesAmount ?? 0;
  const remaining = Math.max(0, duesAmount - totalPaid);
  const paidPercent = duesAmount > 0 ? Math.min(100, Math.round((totalPaid / duesAmount) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-display-thin text-3xl text-ink mb-2">
          Welcome back, {user.playaName || user.name}!
        </h1>
        <p className="text-body-relaxed text-ink-soft">
          Here is your Camp Alborz member dashboard.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
          <button
            onClick={loadSeasonStatus}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Season status card */}
      <div className="luxury-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-gold" />
          <div>
            <h2 className="text-display-thin text-xl text-ink">Season Status</h2>
            {seasonStatus?.season && (
              <p className="text-sm text-ink-soft">{seasonStatus.season.name}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-gold animate-spin" />
          </div>
        ) : seasonStatus ? (
          <div className="space-y-4">
            {/* Enrollment status */}
            <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-tan/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-sage" />
                <div>
                  <p className="text-sm font-medium text-ink">Enrollment Status</p>
                  <p className="text-xs text-ink-soft">Current season enrollment</p>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[seasonStatus.status] || 'bg-gray-100 text-gray-600'}`}>
                {statusLabels[seasonStatus.status] || seasonStatus.status}
              </span>
            </div>

            {/* Payment summary */}
            <div className="p-4 bg-cream rounded-xl border border-tan/30">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-sage" />
                <div>
                  <p className="text-sm font-medium text-ink">Payment Summary</p>
                  <p className="text-xs text-ink-soft">
                    {(totalPaid / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} paid
                    {duesAmount > 0 && (
                      <> of {(duesAmount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} dues</>
                    )}
                  </p>
                </div>
              </div>
              {duesAmount > 0 && (
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-tan/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${paidPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>{paidPercent}% paid</span>
                    {remaining > 0 && (
                      <span>
                        {(remaining / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} remaining
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Season dates */}
            {seasonStatus.season.startDate && (
              <div className="flex items-center gap-3 p-4 bg-cream rounded-xl border border-tan/30">
                <Clock className="h-5 w-5 text-sage" />
                <div>
                  <p className="text-sm font-medium text-ink">Season Dates</p>
                  <p className="text-xs text-ink-soft">
                    {new Date(seasonStatus.season.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    {seasonStatus.season.endDate && (
                      <> &ndash; {new Date(seasonStatus.season.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-cream rounded-xl border border-tan/30">
            <p className="text-body-relaxed text-sm text-ink-soft">
              You are not enrolled in the current season. Contact camp leadership if you believe this is an error.
            </p>
          </div>
        )}
      </div>

      {/* Quick links grid */}
      <div>
        <h2 className="text-display-thin text-xl text-ink mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="block">
                <div className="luxury-card p-5 group cursor-pointer hover:shadow-luxury-hover transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-gold" />
                    <h3 className="text-display-thin text-lg text-ink">{link.label}</h3>
                  </div>
                  <p className="text-body-relaxed text-sm text-ink-soft">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Announcements placeholder */}
      <div className="luxury-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Megaphone className="h-5 w-5 text-gold" />
          <h2 className="text-display-thin text-xl text-ink">Announcements</h2>
        </div>
        <div className="p-4 bg-cream rounded-xl border border-tan/30">
          <p className="text-body-relaxed text-sm text-ink-soft">
            No announcements at this time. Camp updates and important news will be posted here.
          </p>
        </div>
      </div>
    </div>
  );
}
