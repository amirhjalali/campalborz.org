'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { useAdminSeason } from '../../contexts/AdminSeasonContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface DashboardData {
  totalMembers: number;
  confirmed: number;
  maybe: number;
  interested: number;
  waitlisted: number;
  cancelled: number;
  duesCollectedPercent: number;
  pendingApplications: number;
  unpaidDuesCount: number;
  recentPayments: {
    id: string;
    paidAt: string;
    memberName: string;
    amount: number;
    method: string;
  }[];
  season: {
    name: string;
    year: number;
  } | null;
}

const placeholderData: DashboardData = {
  totalMembers: 0,
  confirmed: 0,
  maybe: 0,
  interested: 0,
  waitlisted: 0,
  cancelled: 0,
  duesCollectedPercent: 0,
  pendingApplications: 0,
  unpaidDuesCount: 0,
  recentPayments: [],
  season: null,
};

const statusBarColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  maybe: 'bg-amber-500',
  interested: 'bg-blue-500',
  waitlisted: 'bg-orange-500',
  cancelled: 'bg-gray-400',
};

export default function AdminDashboardPage() {
  const { selectedSeasonId } = useAdminSeason();
  const [data, setData] = useState<DashboardData>(placeholderData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params: Record<string, string | undefined> = {};
      if (selectedSeasonId) params.seasonId = selectedSeasonId;
      const input = encodeURIComponent(JSON.stringify(params));
      const res = await fetch(
        `${API_BASE_URL}/api/trpc/dashboard.getAdminDashboard?input=${input}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      const result = json.result?.data;
      if (result) {
        const statusMap = result.membersByStatus || {};
        setData({
          totalMembers: result.totalActiveMembers || 0,
          confirmed: statusMap.CONFIRMED || 0,
          maybe: statusMap.MAYBE || 0,
          interested: statusMap.INTERESTED || 0,
          waitlisted: statusMap.WAITLISTED || 0,
          cancelled: statusMap.CANCELLED || 0,
          duesCollectedPercent: 0,
          pendingApplications: 0,
          unpaidDuesCount: 0,
          recentPayments: result.recentPayments || [],
          season: result.season ? { name: result.season.name, year: result.season.year } : null,
        });
      }
      setError(null);
    } catch {
      setError('Unable to connect to the server. Showing placeholder data.');
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statusBreakdown = [
    { label: 'Confirmed', key: 'confirmed', count: data.confirmed },
    { label: 'Maybe', key: 'maybe', count: data.maybe },
    { label: 'Interested', key: 'interested', count: data.interested },
    { label: 'Waitlisted', key: 'waitlisted', count: data.waitlisted },
    { label: 'Cancelled', key: 'cancelled', count: data.cancelled },
  ];

  const maxCount = Math.max(...statusBreakdown.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-display-thin text-3xl text-ink">Dashboard</h1>
        <p className="text-body-relaxed text-sm text-ink-soft mt-1">
          {data.season ? data.season.name : 'Current Season'}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
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
              index={0}
            />
            <StatCard
              icon={UserCheck}
              label="Confirmed"
              value={data.confirmed}
              subtext={data.totalMembers > 0 ? `${Math.round((data.confirmed / data.totalMembers) * 100)}% of total` : undefined}
              index={1}
            />
            <StatCard
              icon={DollarSign}
              label="Dues Collected"
              value={`${data.duesCollectedPercent}%`}
              index={2}
            />
            <StatCard
              icon={FileText}
              label="Pending Applications"
              value={data.pendingApplications}
              index={3}
            />
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="luxury-card p-6">
              <h2 className="text-display-thin text-xl text-ink mb-5">
                Member Status Breakdown
              </h2>
              <div className="space-y-4">
                {statusBreakdown.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{item.label}</span>
                      <span className="text-ink-soft">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-tan/20 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${statusBarColors[item.key]}`}
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="luxury-card p-6">
              <h2 className="text-display-thin text-xl text-ink mb-5">
                Pending Actions
              </h2>
              <div className="space-y-4">
                <Link
                  href="/admin/applications"
                  className="flex items-center justify-between rounded-xl border border-tan/30 p-4 hover:bg-cream transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        Pending Applications
                      </p>
                      <p className="text-xs text-ink-soft">
                        {data.pendingApplications} application{data.pendingApplications !== 1 ? 's' : ''} awaiting review
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-soft group-hover:text-gold transition-colors" />
                </Link>

                <Link
                  href="/admin/members"
                  className="flex items-center justify-between rounded-xl border border-tan/30 p-4 hover:bg-cream transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        Unpaid Dues
                      </p>
                      <p className="text-xs text-ink-soft">
                        {data.unpaidDuesCount} member{data.unpaidDuesCount !== 1 ? 's' : ''} with outstanding dues
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-soft group-hover:text-gold transition-colors" />
                </Link>
              </div>
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
              <p className="text-sm text-ink-soft text-center py-8">
                No recent payments to display.
              </p>
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
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
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
                        <td className="py-3 px-2 font-medium text-ink">
                          {payment.memberName}
                        </td>
                        <td className="py-3 px-2 text-ink">
                          {(payment.amount / 100).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                        <td className="py-3 px-2 text-ink-soft">
                          {payment.method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
