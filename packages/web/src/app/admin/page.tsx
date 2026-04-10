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
  DollarSign,
  FileCheck,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { useAdminSeason } from '../../contexts/AdminSeasonContext';
import {
  fetchDashboardData,
  fetchActionItems,
  type DashboardData,
  type RecentApplication,
  type ActionItems,
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
  const [actionItems, setActionItems] = useState<ActionItems | null>(null);
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

      const [result, actionResult] = await Promise.all([
        fetchDashboardData(selectedSeasonId || undefined),
        fetchActionItems(selectedSeasonId || undefined).catch(() => null),
      ]);
      setData(result);
      setActionItems(actionResult);
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

  // Build action items alerts (only show where count > 0)
  const alertCards = actionItems
    ? [
        {
          key: 'unpaidDues',
          count: actionItems.unpaidDues.count,
          label: 'Unpaid Dues',
          icon: DollarSign,
          href: '/admin/communications',
        },
        {
          key: 'noPreApproval',
          count: actionItems.noPreApproval.count,
          label: 'No Pre-Approval',
          icon: FileCheck,
          href: '/admin/communications',
        },
        {
          key: 'pendingApps',
          count: actionItems.pendingApplications.count,
          label: 'Pending Apps',
          icon: FileText,
          href: '/admin/applications',
        },
        {
          key: 'notOnWhatsApp',
          count: actionItems.notOnWhatsApp.count,
          label: 'Not on WhatsApp',
          icon: MessageSquare,
          href: '/admin/communications',
        },
      ].filter((c) => c.count > 0)
    : [];

  // Season timeline phases
  const timelinePhases = [
    { key: 'soi', label: 'SOI' },
    { key: 'ticketing', label: 'Ticketing' },
    { key: 'dues', label: 'Dues' },
    { key: 'build', label: 'Build' },
    { key: 'burn', label: 'BURN' },
    { key: 'strike', label: 'Strike' },
    { key: 'postPlaya', label: 'Post-Playa' },
  ];

  // Determine current phase from season dates (simple heuristic)
  const getCurrentPhase = (): string | null => {
    if (!data.season) return null;
    const season = data.season as { id: string; name: string; year: number; [key: string]: unknown };
    const now = new Date();
    // If the season object has date fields, use them; otherwise return null
    const burnStart = season.burnStartDate ? new Date(season.burnStartDate as string) : null;
    const burnEnd = season.burnEndDate ? new Date(season.burnEndDate as string) : null;
    const buildStart = season.buildStartDate ? new Date(season.buildStartDate as string) : null;
    const strikeEnd = season.strikeEndDate ? new Date(season.strikeEndDate as string) : null;

    if (burnEnd && now > burnEnd) {
      if (strikeEnd && now <= strikeEnd) return 'strike';
      if (strikeEnd && now > strikeEnd) return 'postPlaya';
      return 'postPlaya';
    }
    if (burnStart && now >= burnStart) return 'burn';
    if (buildStart && now >= buildStart) return 'build';
    // Before build, estimate based on season year
    const seasonYear = data.season.year;
    const month = now.getMonth(); // 0-indexed
    if (now.getFullYear() === seasonYear || (now.getFullYear() === seasonYear - 1 && month >= 9)) {
      if (month >= 6) return 'dues'; // July onwards
      if (month >= 3) return 'ticketing'; // April onwards
      return 'soi'; // Jan-March
    }
    return null;
  };

  const currentPhase = getCurrentPhase();

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
          {/* Action Items Bar */}
          {alertCards.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
              {alertCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.key}
                    href={card.href}
                    className="flex-shrink-0"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 hover:bg-amber-100 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 border border-amber-300">
                        <Icon className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-semibold text-amber-700 tabular-nums">
                          {card.count}
                        </span>
                        <span className="text-sm text-amber-600 whitespace-nowrap">
                          {card.label}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-amber-400 group-hover:text-amber-600 transition-colors ml-1" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

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

          {/* Season Timeline */}
          <div className="luxury-card p-5">
            <h2 className="text-display-thin text-sm text-ink-soft uppercase tracking-wider mb-4">
              Season Timeline
            </h2>
            <div className="relative flex items-center justify-between">
              {/* Connecting line */}
              <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-tan/30" />
              <div
                className="absolute top-3.5 left-4 h-0.5 bg-sage transition-all duration-500"
                style={{
                  width: currentPhase
                    ? `${(timelinePhases.findIndex((p) => p.key === currentPhase) / (timelinePhases.length - 1)) * 100}%`
                    : '0%',
                }}
              />

              {timelinePhases.map((phase) => {
                const isCurrent = phase.key === currentPhase;
                const phaseIdx = timelinePhases.findIndex((p) => p.key === phase.key);
                const currentIdx = currentPhase
                  ? timelinePhases.findIndex((p) => p.key === currentPhase)
                  : -1;
                const isPast = currentIdx >= 0 && phaseIdx < currentIdx;

                return (
                  <div
                    key={phase.key}
                    className="relative flex flex-col items-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: isCurrent ? 1.2 : 1 }}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-sage border-sage shadow-md shadow-sage/30'
                          : isPast
                            ? 'bg-sage/80 border-sage/80'
                            : 'bg-white border-tan/40'
                      }`}
                    >
                      {(isCurrent || isPast) && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrent ? 'bg-white' : 'bg-white/70'
                          }`}
                        />
                      )}
                    </motion.div>
                    <span
                      className={`mt-2 text-xs whitespace-nowrap ${
                        isCurrent
                          ? 'font-semibold text-sage'
                          : isPast
                            ? 'text-ink-soft'
                            : 'text-ink-soft/50'
                      }`}
                    >
                      {phase.label}
                    </span>
                  </div>
                );
              })}
            </div>
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
                  href="/admin/communications"
                  icon={Mail}
                  label="Communications"
                  description={
                    alertCards.length > 0
                      ? `${alertCards.length} action item${alertCards.length !== 1 ? 's' : ''} need attention`
                      : 'Email & action items'
                  }
                  highlight={alertCards.length > 0}
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
