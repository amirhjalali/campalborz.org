'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  FileText,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  Clock,
  UserPlus,
  Calendar,
  Megaphone,
  BarChart3,
} from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAdminSeason } from '../../contexts/AdminSeasonContext';
import {
  fetchDashboardData,
  type DashboardData,
  type RecentApplication,
} from '../../lib/adminApi';

const statusBarColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  maybe: 'bg-amber-500',
  interested: 'bg-blue-500',
  waitlisted: 'bg-orange-500',
  cancelled: 'bg-gray-400',
};

const experienceLabels: Record<string, string> = {
  FIRST_TIMER: 'First Timer',
  BEEN_BEFORE: 'Been Before',
  VETERAN: 'Veteran',
};

const placeholderData: DashboardData = {
  totalMembers: 0,
  confirmed: 0,
  maybe: 0,
  interested: 0,
  waitlisted: 0,
  cancelled: 0,
  totalCollected: 0,
  totalPayments: 0,
  pendingApplications: 0,
  duesProgress: { collected: 0, expected: 0, confirmedMembers: 0, percent: 0 },
  recentPayments: [],
  recentApplications: [],
  season: null,
};

export default function AdminDashboardPage() {
  const { selectedSeasonId } = useAdminSeason();
  const [data, setData] = useState<DashboardData>(placeholderData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await fetchDashboardData(selectedSeasonId || undefined);
      setData(result);
      setError(null);
    } catch {
      setError('Unable to connect to the server. Showing placeholder data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statusBreakdown = [
    { label: 'Confirmed', key: 'confirmed', count: data.confirmed },
    { label: 'Maybe', key: 'maybe', count: data.maybe },
    { label: 'Interested', key: 'interested', count: data.interested },
    { label: 'Waitlisted', key: 'waitlisted', count: data.waitlisted },
    { label: 'Cancelled', key: 'cancelled', count: data.cancelled },
  ];

  const maxCount = Math.max(...statusBreakdown.map((s) => s.count), 1);
  const enrolledCount = data.confirmed + data.maybe + data.interested + data.waitlisted;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-thin text-3xl text-ink">Dashboard</h1>
          <p className="text-body-relaxed text-sm text-ink-soft mt-1">
            {data.season ? `${data.season.name} Overview` : 'Current Season'}
          </p>
        </div>
        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-ink-soft">Loading dashboard data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Total Members"
              value={data.totalMembers}
              subtext={enrolledCount > 0 ? `${enrolledCount} enrolled this season` : undefined}
              index={0}
            />
            <StatCard
              icon={UserCheck}
              label="Confirmed"
              value={data.confirmed}
              subtext={
                data.totalMembers > 0
                  ? `${Math.round((data.confirmed / enrolledCount || 0) * 100)}% of enrolled`
                  : undefined
              }
              index={1}
            />
            <StatCard
              icon={TrendingUp}
              label="Dues Collected"
              value={`${data.duesProgress.percent}%`}
              subtext={
                data.duesProgress.expected > 0
                  ? `$${(data.duesProgress.collected / 100).toLocaleString()} of $${(data.duesProgress.expected / 100).toLocaleString()}`
                  : 'No dues data yet'
              }
              index={2}
            />
            <StatCard
              icon={FileText}
              label="Pending Applications"
              value={data.pendingApplications}
              subtext={data.pendingApplications > 0 ? 'Awaiting review' : 'All caught up'}
              index={3}
            />
          </div>

          {/* Three-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown */}
            <div className="luxury-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-display-thin text-lg text-ink">
                  Status Breakdown
                </h2>
                <Link
                  href="/admin/members"
                  className="text-xs font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3.5">
                {statusBreakdown.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{item.label}</span>
                      <span className="text-ink-soft tabular-nums">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-tan/20 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / maxCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className={`h-full rounded-full ${statusBarColors[item.key]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total enrolled */}
              <div className="mt-5 pt-4 border-t border-tan/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">Total Enrolled</span>
                  <span className="text-ink font-semibold tabular-nums">{enrolledCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="luxury-card p-6 lg:col-span-1">
              <h2 className="text-display-thin text-lg text-ink mb-5">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <QuickActionLink
                  href="/admin/applications"
                  icon={FileText}
                  label="Review Applications"
                  description={
                    data.pendingApplications > 0
                      ? `${data.pendingApplications} pending`
                      : 'No pending applications'
                  }
                  highlight={data.pendingApplications > 0}
                />
                <QuickActionLink
                  href="/admin/members"
                  icon={UserPlus}
                  label="Manage Members"
                  description={`${data.totalMembers} total members`}
                />
                <QuickActionLink
                  href="/admin/season"
                  icon={Calendar}
                  label="Season Settings"
                  description={data.season?.name || 'Configure season'}
                />
                <QuickActionLink
                  href="/admin/payments"
                  icon={BarChart3}
                  label="Payment Reports"
                  description={
                    data.totalPayments > 0
                      ? `${data.totalPayments} payments recorded`
                      : 'No payments yet'
                  }
                />
                <QuickActionLink
                  href="/admin/announcements"
                  icon={Megaphone}
                  label="Announcements"
                  description="Send updates to members"
                />
              </div>
            </div>

            {/* Recent Applications */}
            <div className="luxury-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-display-thin text-lg text-ink">
                  Recent Applications
                </h2>
                <Link
                  href="/admin/applications"
                  className="text-xs font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {data.recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-ink-soft/30 mx-auto mb-3" />
                  <p className="text-sm text-ink-soft">
                    No pending applications.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentApplications.map((app: RecentApplication) => (
                    <Link
                      key={app.id}
                      href="/admin/applications"
                      className="flex items-center justify-between rounded-xl border border-tan/30 p-3 hover:bg-cream transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink truncate">
                          {app.name}
                        </p>
                        <p className="text-xs text-ink-soft truncate">
                          {experienceLabels[app.experience] || app.experience}
                          {' \u00B7 '}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={app.status} variant="application" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="luxury-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-display-thin text-xl text-ink">
                Recent Payments
              </h2>
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.recentPayments.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No Payments Yet"
                description="No payments have been recorded for the current season."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sage/10">
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Member
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider hidden sm:table-cell">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider hidden md:table-cell">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-sage/5 hover:bg-sage/[0.03] transition-colors"
                      >
                        <td className="py-3 px-2 text-ink-soft">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-medium text-ink">{payment.memberName}</p>
                          {payment.playaName && (
                            <p className="text-xs text-ink-soft">&ldquo;{payment.playaName}&rdquo;</p>
                          )}
                        </td>
                        <td className="py-3 px-2 text-ink-soft hidden sm:table-cell">
                          <span className="inline-flex items-center rounded-md bg-sage/5 px-2 py-0.5 text-xs font-medium text-sage">
                            {payment.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-ink font-medium tabular-nums">
                          {(payment.amount / 100).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                        <td className="py-3 px-2 text-ink-soft hidden md:table-cell">
                          {payment.method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Summary Footer */}
            {data.totalCollected > 0 && (
              <div className="mt-4 pt-4 border-t border-sage/10 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">
                    {(data.totalCollected / 100).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>{' '}
                  total collected from {data.totalPayments} payment{data.totalPayments !== 1 ? 's' : ''}
                </p>
                <Link
                  href="/admin/payments"
                  className="text-sm font-medium text-gold hover:text-gold/80 transition-colors"
                >
                  View full report
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action Link Component
// ---------------------------------------------------------------------------

function QuickActionLink({
  href,
  icon: Icon,
  label,
  description,
  highlight = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-tan/30 p-3.5 hover:bg-cream transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            highlight
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-sage/5 border border-sage/10'
          }`}
        >
          <Icon
            className={`h-4 w-4 ${highlight ? 'text-amber-600' : 'text-sage'}`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{label}</p>
          <p className="text-xs text-ink-soft truncate">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-ink-soft group-hover:text-gold transition-colors shrink-0 ml-2" />
    </Link>
  );
}
