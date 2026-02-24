'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Download,
} from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SearchInput } from '../../../components/shared/SearchInput';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useAdminSeason } from '../../../contexts/AdminSeasonContext';
import {
  fetchSeasonMembers,
  inviteMember,
  type SeasonMember,
} from '../../../lib/adminApi';

const PAGE_SIZE = 50;

type SortField = 'name' | 'email' | 'status' | 'role' | 'housing';
type SortDir = 'asc' | 'desc';

export default function MembersPage() {
  const router = useRouter();
  const { selectedSeasonId, selectedSeason } = useAdminSeason();
  const [members, setMembers] = useState<SeasonMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchSeasonMembers({
        seasonId: selectedSeasonId || undefined,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setMembers(result.seasonMembers);
      setTotalCount(result.total);
      setError(null);
    } catch {
      setError('Unable to load members. The server may not be running.');
      setMembers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, selectedSeasonId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Client-side sort (since server sort only supports member name ordering)
  const sortedMembers = [...members].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'name':
        cmp = a.member.name.localeCompare(b.member.name);
        break;
      case 'email':
        cmp = a.member.email.localeCompare(b.member.email);
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'role':
        cmp = a.member.role.localeCompare(b.member.role);
        break;
      case 'housing':
        cmp = (a.housingType || '').localeCompare(b.housingType || '');
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 inline ml-1" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 inline ml-1" />
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    try {
      setInviteLoading(true);
      setInviteError(null);

      const result = await inviteMember(inviteEmail, inviteName);
      setInviteResult(result.inviteToken || 'Invitation sent successfully.');
    } catch {
      setInviteError('Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    setShowInvite(false);
    setInviteEmail('');
    setInviteName('');
    setInviteResult(null);
    setInviteError(null);
    setCopied(false);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startItem = page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalCount);

  // Stats summary
  const statusCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-thin text-3xl text-ink">Members</h1>
          <p className="text-body-relaxed text-sm text-ink-soft mt-1">
            {totalCount} member{totalCount !== 1 ? 's' : ''}
            {selectedSeason ? ` in ${selectedSeason.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMembers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="cta-primary text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Status Summary Bar */}
      {totalCount > 0 && !loading && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-sage text-white'
                  : 'bg-white border border-tan/30 text-ink-soft hover:bg-cream'
              }`}
            >
              <StatusBadge status={status} variant="season" />
              <span className="tabular-nums">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or playa name..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input w-auto min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="MAYBE">Maybe</option>
          <option value="INTERESTED">Interested</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
          <button
            onClick={loadMembers}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-ink-soft">Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Members Found"
          description={
            search || statusFilter !== 'all'
              ? 'No members match your current filters. Try adjusting your search or filters.'
              : 'No members have been added to the current season yet.'
          }
          action={
            search || statusFilter !== 'all'
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearch('');
                    setStatusFilter('all');
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="luxury-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage/10 bg-cream/50">
                  <th
                    onClick={() => handleSort('name')}
                    className="text-left py-3 px-4 text-xs font-medium text-ink-soft uppercase tracking-wider cursor-pointer hover:text-ink select-none"
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="text-left py-3 px-4 text-xs font-medium text-ink-soft uppercase tracking-wider cursor-pointer hover:text-ink select-none hidden md:table-cell"
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="text-left py-3 px-4 text-xs font-medium text-ink-soft uppercase tracking-wider cursor-pointer hover:text-ink select-none"
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th
                    onClick={() => handleSort('role')}
                    className="text-left py-3 px-4 text-xs font-medium text-ink-soft uppercase tracking-wider cursor-pointer hover:text-ink select-none hidden lg:table-cell"
                  >
                    Role <SortIcon field="role" />
                  </th>
                  <th
                    onClick={() => handleSort('housing')}
                    className="text-left py-3 px-4 text-xs font-medium text-ink-soft uppercase tracking-wider cursor-pointer hover:text-ink select-none hidden lg:table-cell"
                  >
                    Housing <SortIcon field="housing" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((sm, idx) => (
                  <motion.tr
                    key={sm.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02, duration: 0.2 }}
                    onClick={() => router.push(`/admin/members/${sm.member.id}`)}
                    className="border-b border-sage/5 hover:bg-sage/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-ink">
                          {sm.member.name}
                        </p>
                        {sm.member.playaName && (
                          <p className="text-xs text-ink-soft">
                            &ldquo;{sm.member.playaName}&rdquo;
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-soft hidden md:table-cell">
                      {sm.member.email}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sm.status} variant="season" />
                    </td>
                    <td className="py-3 px-4 text-ink-soft hidden lg:table-cell">
                      <span className="inline-flex items-center rounded-md bg-sage/5 px-2 py-0.5 text-xs font-medium text-sage">
                        {sm.member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-soft hidden lg:table-cell">
                      {sm.housingType
                        ? sm.housingType.charAt(0) + sm.housingType.slice(1).toLowerCase()
                        : '\u2014'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-sage/10 px-4 py-3">
              <p className="text-sm text-ink-soft">
                {startItem}&ndash;{endItem} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-ink-soft tabular-nums">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeInviteModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative luxury-card p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-display-thin text-xl text-ink">
                  Invite Member
                </h2>
                <button
                  onClick={closeInviteModal}
                  className="p-1 rounded-lg hover:bg-cream transition-colors"
                >
                  <X className="h-5 w-5 text-ink-soft" />
                </button>
              </div>

              {inviteResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <p className="text-sm text-green-700">Invitation created successfully.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">Invite Token</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteResult}
                        readOnly
                        className="form-input flex-1 text-sm"
                      />
                      <button
                        onClick={() => handleCopy(inviteResult)}
                        className="px-3 py-2 rounded-lg border border-tan/40 hover:bg-cream transition-colors"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-ink-soft" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      closeInviteModal();
                      loadMembers();
                    }}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-sage text-white hover:bg-sage-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {inviteError && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-800">{inviteError}</p>
                    </div>
                  )}
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Enter full name"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="form-input"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={closeInviteModal}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-ink-soft border border-tan/40 hover:bg-cream transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInvite}
                      disabled={inviteLoading || !inviteEmail.trim() || !inviteName.trim()}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium bg-sage text-white hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {inviteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Send Invite
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
