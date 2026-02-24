'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Send,
  RefreshCw,
  Search,
} from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EmptyState } from '../../../components/shared/EmptyState';
import {
  fetchApplications,
  reviewApplication,
  type Application,
} from '../../../lib/adminApi';

type FilterStatus = 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';

const filterButtons: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'WAITLISTED', label: 'Waitlisted' },
];

const experienceLabels: Record<string, string> = {
  FIRST_TIMER: 'First Timer',
  BEEN_BEFORE: 'Been Before',
  VETERAN: 'Veteran',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchApplications({
        status: filter !== 'all' ? filter : undefined,
        limit: 100,
        offset: 0,
      });
      setApplications(result.applications);
      setTotalCount(result.total);
      setError(null);
    } catch {
      setError('Unable to load applications. The server may not be running.');
      setApplications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReview = async (applicationId: string, decision: 'ACCEPTED' | 'REJECTED' | 'WAITLISTED') => {
    try {
      setReviewLoading(applicationId);

      await reviewApplication(applicationId, decision, reviewNotes[applicationId]);

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: decision, reviewNotes: reviewNotes[applicationId] || app.reviewNotes }
            : app
        )
      );

      const decisionLabel = decision.charAt(0) + decision.slice(1).toLowerCase();

      if (decision === 'ACCEPTED') {
        showNotification(
          `Application accepted. You can now send an invite from the Members page.`,
          'success',
        );
      } else {
        showNotification(`Application ${decisionLabel.toLowerCase()} successfully.`, 'success');
      }
    } catch {
      showNotification('Failed to submit review. Please try again.', 'error');
    } finally {
      setReviewLoading(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Client-side search filter (name, email, playa name)
  const filtered = applications.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      (a.playaName && a.playaName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-display-thin text-3xl text-ink">Applications</h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-soft">
            {totalCount} total application{totalCount !== 1 ? 's' : ''}
          </p>
          <button
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-3 ${
              notification.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar: Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === btn.id
                  ? 'bg-sage text-white'
                  : 'bg-white border border-tan/40 text-ink-soft hover:bg-cream'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
          <button
            onClick={loadApplications}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-ink-soft">Loading applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Applications"
          description={
            searchTerm
              ? `No applications match "${searchTerm}".`
              : filter !== 'all'
                ? `No ${filter.toLowerCase()} applications found.`
                : 'No applications have been submitted yet.'
          }
          action={
            filter !== 'all' || searchTerm
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setFilter('all');
                    setSearchTerm('');
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Experience</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {filtered.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              className="luxury-card p-0 overflow-hidden"
            >
              {/* Row */}
              <button
                onClick={() => toggleExpand(app.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-4 py-3 hover:bg-sage/[0.03] transition-colors"
              >
                <div className="col-span-2 text-sm text-ink-soft">
                  {new Date(app.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-ink">{app.name}</p>
                  {app.playaName && (
                    <p className="text-xs text-ink-soft">&ldquo;{app.playaName}&rdquo;</p>
                  )}
                </div>
                <div className="col-span-3 text-sm text-ink-soft truncate">
                  {app.email}
                </div>
                <div className="col-span-2 text-sm text-ink-soft">
                  {experienceLabels[app.experience] || app.experience}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={app.status} variant="application" />
                </div>
                <div className="col-span-1 flex justify-end">
                  {expandedId === app.id ? (
                    <ChevronUp className="h-4 w-4 text-ink-soft" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ink-soft" />
                  )}
                </div>
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expandedId === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-tan/30 px-4 py-5 space-y-5">
                      {/* Application Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailField label="Phone" value={app.phone} />
                        <DetailField label="Playa Name" value={app.playaName} />
                        <DetailField label="Referred By" value={app.referredBy} />
                        <DetailField
                          label="Experience"
                          value={experienceLabels[app.experience] || app.experience}
                        />
                        <DetailField label="Housing Preference" value={app.housingPreference} />
                        <DetailField label="Dietary Restrictions" value={app.dietaryRestrictions} />
                        <DetailField label="Emergency Contact" value={app.emergencyContactName} />
                        <DetailField label="Emergency Phone" value={app.emergencyContactPhone} />
                      </div>

                      {app.interests && (
                        <DetailField label="Interests" value={app.interests} fullWidth />
                      )}
                      {app.contribution && (
                        <DetailField label="What They Can Contribute" value={app.contribution} fullWidth />
                      )}
                      {app.message && (
                        <DetailField label="Message" value={app.message} fullWidth />
                      )}

                      {/* Existing Review Notes */}
                      {app.reviewNotes && app.status !== 'PENDING' && (
                        <div className="rounded-xl bg-cream border border-tan/20 p-4">
                          <p className="text-xs font-medium text-ink-soft uppercase tracking-wider mb-1">
                            Review Notes
                          </p>
                          <p className="text-sm text-ink">{app.reviewNotes}</p>
                          {app.reviewedBy && (
                            <p className="text-xs text-ink-soft mt-2">
                              Reviewed by: {app.reviewedBy}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Review Section */}
                      {app.status === 'PENDING' && (
                        <div className="border-t border-tan/30 pt-5 space-y-4">
                          <h4 className="text-sm font-medium text-ink flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gold" />
                            Review Application
                          </h4>
                          <div>
                            <label className="form-label">Review Notes</label>
                            <textarea
                              value={reviewNotes[app.id] || ''}
                              onChange={(e) =>
                                setReviewNotes((prev) => ({
                                  ...prev,
                                  [app.id]: e.target.value,
                                }))
                              }
                              rows={2}
                              className="form-input"
                              placeholder="Optional notes about this application..."
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleReview(app.id, 'ACCEPTED')}
                              disabled={reviewLoading === app.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {reviewLoading === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleReview(app.id, 'WAITLISTED')}
                              disabled={reviewLoading === app.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {reviewLoading === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              Waitlist
                            </button>
                            <button
                              onClick={() => handleReview(app.id, 'REJECTED')}
                              disabled={reviewLoading === app.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-ink-soft text-white hover:bg-ink disabled:opacity-50 transition-colors"
                            >
                              {reviewLoading === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Post-accept: Send Invite hint */}
                      {app.status === 'ACCEPTED' && (
                        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                          <Send className="h-5 w-5 text-green-500 shrink-0" />
                          <p className="text-sm text-green-700">
                            This application has been accepted. You can send an invite from the{' '}
                            <a
                              href="/admin/members"
                              className="font-medium underline hover:no-underline"
                            >
                              Members page
                            </a>
                            .
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-xs font-medium text-ink-soft uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
