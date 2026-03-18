'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { StatCard } from '../../../components/shared/StatCard';
import { SearchInput } from '../../../components/shared/SearchInput';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { useAdminSeason } from '../../../contexts/AdminSeasonContext';

// ---------------------------------------------------------------------------
// API Helpers (following adminApi.ts patterns)
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function trpcQuery<T>(
  path: string,
  input?: Record<string, unknown>,
): Promise<T> {
  const qs = input ? `?input=${encodeURIComponent(JSON.stringify(input))}` : '';
  const res = await fetch(`${API_BASE_URL}/api/trpc/${path}${qs}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${path} (${res.status}) ${text}`);
  }
  const json = await res.json();
  return json.result?.data as T;
}

async function trpcMutation<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api/trpc/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mutation failed: ${path} (${res.status}) ${text}`);
  }
  const json = await res.json();
  return json.result?.data as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Volunteer {
  assignmentId: string;
  memberId: string;
  memberName: string;
  playaName?: string;
  status: string;
  seasonMemberId?: string;
  email?: string;
}

interface Shift {
  id: string;
  seasonId: string;
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  maxVolunteers: number | null;
  location?: string;
  volunteerCount: number;
  isFull: boolean;
  volunteers: Volunteer[];
  createdAt: string;
}

interface SeasonMemberOption {
  id: string;
  memberId: string;
  member: {
    id: string;
    name: string;
    email: string;
    playaName?: string;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const ASSIGNMENT_STATUSES = ['ASSIGNED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW'] as const;

const assignmentStatusColors: Record<string, string> = {
  ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
  COMPLETED: 'bg-sage/10 text-sage border-sage/20',
  NO_SHOW: 'bg-red-100 text-red-700 border-red-200',
};

const assignmentStatusLabels: Record<string, string> = {
  ASSIGNED: 'Assigned',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShiftsPage() {
  const { selectedSeasonId, selectedSeason } = useAdminSeason();

  // Shift list state
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [page, setPage] = useState(0);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    maxVolunteers: '',
    location: '',
  });

  // Detail panel state
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Assign volunteer state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [availableMembers, setAvailableMembers] = useState<SeasonMemberOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);

  // Status editing
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Delete confirm
  const [deleteConfirmShift, setDeleteConfirmShift] = useState<Shift | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Remove volunteer confirm
  const [removeConfirm, setRemoveConfirm] = useState<{ assignmentId: string; name: string } | null>(null);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  const loadShifts = useCallback(async () => {
    try {
      setLoading(true);
      const input: Record<string, unknown> = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
      if (selectedSeasonId) input.seasonId = selectedSeasonId;
      if (search) input.search = search;
      if (showUpcomingOnly) input.upcoming = true;

      const result = await trpcQuery<{ events: Shift[]; total: number }>(
        'events.list',
        input,
      );
      setShifts(result.events || []);
      setTotalCount(result.total || 0);
      setError(null);
    } catch {
      setError('Unable to load shifts. The server may not be running.');
      setShifts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId, search, showUpcomingOnly, page]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  useEffect(() => {
    setPage(0);
  }, [search, showUpcomingOnly]);

  // Close status dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setEditingAssignmentId(null);
      }
    }
    if (editingAssignmentId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingAssignmentId]);

  // -------------------------------------------------------------------------
  // Create Shift
  // -------------------------------------------------------------------------

  const handleCreateShift = async () => {
    if (!formData.name || !formData.date || !formData.startTime || !formData.endTime) return;
    if (!selectedSeasonId) {
      setCreateError('No season selected. Please select a season first.');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      await trpcMutation('events.create', {
        seasonId: selectedSeasonId,
        name: formData.name,
        description: formData.description || undefined,
        date: new Date(formData.date).toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxVolunteers: formData.maxVolunteers ? parseInt(formData.maxVolunteers, 10) : null,
        location: formData.location || undefined,
      });

      setShowCreateModal(false);
      setFormData({ name: '', description: '', date: '', startTime: '', endTime: '', maxVolunteers: '', location: '' });
      loadShifts();
    } catch {
      setCreateError('Failed to create shift. Please check your input and try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete Shift
  // -------------------------------------------------------------------------

  const handleDeleteShift = async () => {
    if (!deleteConfirmShift) return;
    try {
      setDeleteLoading(true);
      await trpcMutation('events.delete', { id: deleteConfirmShift.id });
      setDeleteConfirmShift(null);
      if (selectedShift?.id === deleteConfirmShift.id) {
        setSelectedShift(null);
      }
      loadShifts();
    } catch {
      // silently fail; user can retry
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Shift Detail
  // -------------------------------------------------------------------------

  const openShiftDetail = async (shift: Shift) => {
    try {
      setDetailLoading(true);
      setSelectedShift(shift);

      const detail = await trpcQuery<Shift>('events.getById', { id: shift.id });
      setSelectedShift(detail);
    } catch {
      // Fall back to list-level data
    } finally {
      setDetailLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Assign Volunteer
  // -------------------------------------------------------------------------

  const openAssignModal = async () => {
    setShowAssignModal(true);
    setAssignSearch('');
    await loadAvailableMembers('');
  };

  const loadAvailableMembers = async (searchTerm: string) => {
    try {
      setMembersLoading(true);
      const input: Record<string, unknown> = { limit: 50, offset: 0 };
      if (selectedSeasonId) input.seasonId = selectedSeasonId;
      if (searchTerm) input.search = searchTerm;

      const result = await trpcQuery<{ seasonMembers: SeasonMemberOption[] }>(
        'seasonMembers.list',
        input,
      );

      // Filter out members already assigned to this shift
      const assignedMemberIds = new Set(
        selectedShift?.volunteers.map((v) => v.memberId) || [],
      );
      const available = (result.seasonMembers || []).filter(
        (sm) => !assignedMemberIds.has(sm.member.id),
      );
      setAvailableMembers(available);
    } catch {
      setAvailableMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAssignVolunteer = async (seasonMemberId: string) => {
    if (!selectedShift) return;
    try {
      setAssignLoading(seasonMemberId);
      await trpcMutation('events.assignVolunteer', {
        shiftId: selectedShift.id,
        seasonMemberId,
      });

      // Refresh detail
      const detail = await trpcQuery<Shift>('events.getById', { id: selectedShift.id });
      setSelectedShift(detail);

      // Remove from available list
      setAvailableMembers((prev) => prev.filter((m) => m.id !== seasonMemberId));

      // Refresh list counts
      loadShifts();
    } catch {
      // silently fail
    } finally {
      setAssignLoading(null);
    }
  };

  // -------------------------------------------------------------------------
  // Remove Volunteer
  // -------------------------------------------------------------------------

  const handleRemoveVolunteer = async () => {
    if (!removeConfirm || !selectedShift) return;
    try {
      await trpcMutation('events.removeVolunteer', {
        assignmentId: removeConfirm.assignmentId,
      });
      setRemoveConfirm(null);

      // Refresh detail
      const detail = await trpcQuery<Shift>('events.getById', { id: selectedShift.id });
      setSelectedShift(detail);
      loadShifts();
    } catch {
      // silently fail
    }
  };

  // -------------------------------------------------------------------------
  // Update Assignment Status
  // -------------------------------------------------------------------------

  const handleUpdateAssignmentStatus = async (assignmentId: string, status: string) => {
    if (!selectedShift) return;
    try {
      await trpcMutation('events.updateAssignmentStatus', {
        assignmentId,
        status,
      });

      // Update local state
      setSelectedShift((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          volunteers: prev.volunteers.map((v) =>
            v.assignmentId === assignmentId ? { ...v, status } : v,
          ),
        };
      });
      setEditingAssignmentId(null);
    } catch {
      // silently fail
    }
  };

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  const totalSlotsFilled = shifts.reduce((acc, s) => acc + s.volunteerCount, 0);
  const totalMaxSlots = shifts.reduce((acc, s) => acc + (s.maxVolunteers || 0), 0);
  const upcomingCount = shifts.filter(
    (s) => new Date(s.date) >= new Date(new Date().toDateString()),
  ).length;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const isShiftPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toDateString());
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-thin text-3xl text-ink">Shifts</h1>
          <p className="text-body-relaxed text-sm text-ink-soft mt-1">
            Manage volunteer shifts and assignments
            {selectedSeason ? ` for ${selectedSeason.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadShifts()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="cta-primary text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <span><Plus className="h-4 w-4" /></span>
            <span>Create Shift</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          label="Total Shifts"
          value={totalCount}
          subtext={selectedSeason ? `In ${selectedSeason.name}` : undefined}
          index={0}
        />
        <StatCard
          icon={Users}
          label="Slots Filled"
          value={totalSlotsFilled}
          subtext={totalMaxSlots > 0 ? `of ${totalMaxSlots} total slots` : 'No max set'}
          index={1}
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={upcomingCount}
          subtext={upcomingCount === 1 ? 'shift remaining' : 'shifts remaining'}
          index={2}
        />
        <StatCard
          icon={CheckCircle2}
          label="Fill Rate"
          value={totalMaxSlots > 0 ? `${Math.round((totalSlotsFilled / totalMaxSlots) * 100)}%` : 'N/A'}
          subtext={totalMaxSlots > 0 ? `${totalSlotsFilled}/${totalMaxSlots} volunteers` : 'No capacity set'}
          index={3}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, description, or location..."
          />
        </div>
        <button
          onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            showUpcomingOnly
              ? 'bg-sage text-white border-sage'
              : 'border-tan/40 text-ink-soft hover:bg-cream'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Upcoming Only
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
          <button
            onClick={() => loadShifts()}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area: List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shift List */}
        <div className={`${selectedShift ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
              <p className="text-sm text-ink-soft">Loading shifts...</p>
            </div>
          ) : shifts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Shifts Found"
              description={
                search || showUpcomingOnly
                  ? 'No shifts match your current filters. Try adjusting your search.'
                  : 'No shifts have been created for this season yet.'
              }
              action={
                search || showUpcomingOnly
                  ? {
                      label: 'Clear Filters',
                      onClick: () => {
                        setSearch('');
                        setShowUpcomingOnly(false);
                      },
                    }
                  : {
                      label: 'Create First Shift',
                      onClick: () => setShowCreateModal(true),
                    }
              }
            />
          ) : (
            <div className="space-y-3">
              {shifts.map((shift, idx) => {
                const isPast = isShiftPast(shift.date);
                const isSelected = selectedShift?.id === shift.id;

                return (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    onClick={() => openShiftDetail(shift)}
                    className={`luxury-card p-4 cursor-pointer group ${
                      isSelected ? 'ring-2 ring-gold' : ''
                    } ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-ink truncate">
                            {shift.name}
                          </h3>
                          {isPast && (
                            <span className="inline-flex items-center rounded-full bg-ink-soft/10 px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                              Past
                            </span>
                          )}
                          {shift.isFull && !isPast && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              Full
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(shift.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </span>
                          {shift.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {shift.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3.5 w-3.5 text-ink-soft" />
                            <span className="font-medium text-ink tabular-nums">
                              {shift.volunteerCount}
                            </span>
                            {shift.maxVolunteers && (
                              <span className="text-ink-soft">/{shift.maxVolunteers}</span>
                            )}
                          </div>
                          {shift.maxVolunteers && (
                            <div className="w-16 h-1.5 rounded-full bg-tan/20 overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  shift.isFull ? 'bg-amber-500' : 'bg-sage'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (shift.volunteerCount / shift.maxVolunteers) * 100,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Eye className="h-4 w-4 text-ink-soft/30 group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {totalCount > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-ink-soft">
                    {page * PAGE_SIZE + 1}&ndash;{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
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
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedShift && (
            <motion.div
              key={selectedShift.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="luxury-card p-6 space-y-5">
                {/* Detail Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-display-thin text-xl text-ink">
                      {selectedShift.name}
                    </h2>
                    {selectedShift.description && (
                      <p className="text-body-relaxed text-sm text-ink-soft mt-1">
                        {selectedShift.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirmShift(selectedShift)}
                      className="p-2 rounded-lg text-ink-soft hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete shift"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedShift(null)}
                      className="p-2 rounded-lg hover:bg-cream transition-colors"
                    >
                      <X className="h-4 w-4 text-ink-soft" />
                    </button>
                  </div>
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span className="text-ink">{formatDate(selectedShift.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gold" />
                    <span className="text-ink">
                      {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}
                    </span>
                  </div>
                  {selectedShift.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gold" />
                      <span className="text-ink">{selectedShift.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gold" />
                    <span className="text-ink">
                      {selectedShift.volunteerCount}
                      {selectedShift.maxVolunteers ? ` / ${selectedShift.maxVolunteers}` : ''} volunteers
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                {selectedShift.maxVolunteers && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-ink-soft mb-1.5">
                      <span>Capacity</span>
                      <span className="tabular-nums">
                        {Math.round(
                          (selectedShift.volunteerCount / selectedShift.maxVolunteers) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-tan/20 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (selectedShift.volunteerCount / selectedShift.maxVolunteers) * 100,
                            100,
                          )}%`,
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          selectedShift.isFull ? 'bg-amber-500' : 'bg-sage'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Volunteers Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-display-thin text-sm text-ink-soft uppercase tracking-wider">
                      Assigned Volunteers ({selectedShift.volunteers.length})
                    </h3>
                    <button
                      onClick={openAssignModal}
                      disabled={selectedShift.isFull}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sage text-white hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign
                    </button>
                  </div>

                  {detailLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 text-gold animate-spin" />
                    </div>
                  ) : selectedShift.volunteers.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-tan/30 rounded-xl">
                      <Users className="h-8 w-8 text-ink-soft/30 mx-auto mb-2" />
                      <p className="text-sm text-ink-soft">No volunteers assigned yet.</p>
                      <button
                        onClick={openAssignModal}
                        className="mt-3 text-xs font-medium text-gold hover:text-gold/80 transition-colors"
                      >
                        Assign a volunteer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedShift.volunteers.map((vol) => (
                        <div
                          key={vol.assignmentId}
                          className="flex items-center justify-between rounded-xl border border-tan/30 p-3 hover:bg-cream/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-sage">
                                {vol.memberName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ink truncate">
                                {vol.memberName}
                              </p>
                              {vol.playaName && (
                                <p className="text-xs text-ink-soft truncate">
                                  &ldquo;{vol.playaName}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Editable status badge */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setEditingAssignmentId(
                                    editingAssignmentId === vol.assignmentId
                                      ? null
                                      : vol.assignmentId,
                                  )
                                }
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                                  assignmentStatusColors[vol.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                                title="Click to change status"
                              >
                                {assignmentStatusLabels[vol.status] || vol.status}
                              </button>

                              {editingAssignmentId === vol.assignmentId && (
                                <div
                                  ref={statusDropdownRef}
                                  className="absolute z-20 top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-tan/30 py-1 min-w-[130px]"
                                >
                                  {ASSIGNMENT_STATUSES.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() =>
                                        handleUpdateAssignmentStatus(vol.assignmentId, s)
                                      }
                                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-cream transition-colors flex items-center gap-2 ${
                                        vol.status === s ? 'bg-sage/5 font-semibold' : ''
                                      }`}
                                    >
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full ${
                                          assignmentStatusColors[s]?.split(' ')[0] || 'bg-gray-300'
                                        }`}
                                      />
                                      {assignmentStatusLabels[s]}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() =>
                                setRemoveConfirm({
                                  assignmentId: vol.assignmentId,
                                  name: vol.memberName,
                                })
                              }
                              className="p-1 rounded text-ink-soft/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove volunteer"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================ */}
      {/* Create Shift Modal                                               */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative luxury-card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-display-thin text-xl text-ink">
                  Create Shift
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-cream transition-colors"
                >
                  <X className="h-5 w-5 text-ink-soft" />
                </button>
              </div>

              {createError && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">{createError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    Shift Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kitchen Setup, Gate Shift A"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this shift involves..."
                    className="form-input min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Max Volunteers</label>
                    <input
                      type="number"
                      value={formData.maxVolunteers}
                      onChange={(e) =>
                        setFormData({ ...formData, maxVolunteers: e.target.value })
                      }
                      placeholder="Leave empty for unlimited"
                      min="1"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Kitchen, Front Gate"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-ink-soft border border-tan/40 hover:bg-cream transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateShift}
                    disabled={
                      createLoading ||
                      !formData.name ||
                      !formData.date ||
                      !formData.startTime ||
                      !formData.endTime
                    }
                    className="px-4 py-2.5 rounded-lg text-sm font-medium bg-sage text-white hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Shift
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* Assign Volunteer Modal                                           */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showAssignModal && selectedShift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative luxury-card p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-display-thin text-lg text-ink">
                  Assign Volunteer
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 rounded-lg hover:bg-cream transition-colors"
                >
                  <X className="h-5 w-5 text-ink-soft" />
                </button>
              </div>

              <p className="text-body-relaxed text-xs text-ink-soft mb-3">
                Assign a season member to &ldquo;{selectedShift.name}&rdquo;
              </p>

              <div className="mb-3">
                <SearchInput
                  value={assignSearch}
                  onChange={(val) => {
                    setAssignSearch(val);
                    loadAvailableMembers(val);
                  }}
                  placeholder="Search members..."
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 min-h-[200px]">
                {membersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 text-gold animate-spin" />
                  </div>
                ) : availableMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-ink-soft">
                      {assignSearch
                        ? 'No matching members found.'
                        : 'All members are already assigned.'}
                    </p>
                  </div>
                ) : (
                  availableMembers.map((sm) => (
                    <div
                      key={sm.id}
                      className="flex items-center justify-between rounded-xl border border-tan/30 p-3 hover:bg-cream transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink truncate">
                          {sm.member.name}
                        </p>
                        <p className="text-xs text-ink-soft truncate">
                          {sm.member.email}
                          {sm.member.playaName ? ` \u00B7 "${sm.member.playaName}"` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignVolunteer(sm.id)}
                        disabled={assignLoading === sm.id}
                        className="ml-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sage text-white hover:bg-sage/90 disabled:opacity-50 transition-colors shrink-0"
                      >
                        {assignLoading === sm.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserPlus className="h-3 w-3" />
                        )}
                        Assign
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* Delete Confirm Dialog                                            */}
      {/* ================================================================ */}
      <ConfirmDialog
        open={!!deleteConfirmShift}
        onClose={() => setDeleteConfirmShift(null)}
        onConfirm={handleDeleteShift}
        title="Delete Shift"
        message={`Are you sure you want to delete "${deleteConfirmShift?.name}"? This will also remove all volunteer assignments. This action cannot be undone.`}
        confirmLabel={deleteLoading ? 'Deleting...' : 'Delete Shift'}
        variant="danger"
      />

      {/* ================================================================ */}
      {/* Remove Volunteer Confirm Dialog                                  */}
      {/* ================================================================ */}
      <ConfirmDialog
        open={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleRemoveVolunteer}
        title="Remove Volunteer"
        message={`Are you sure you want to remove ${removeConfirm?.name} from this shift?`}
        confirmLabel="Remove"
        variant="warning"
      />
    </div>
  );
}
