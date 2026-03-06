'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  AlertCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Ticket,
  MessageSquare,
  FileCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Copy,
  Check,
  List,
  ArrowRight,
  Users,
} from 'lucide-react';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { useAdminSeason } from '../../../contexts/AdminSeasonContext';
import {
  fetchActionItems,
  sendMassEmail,
  generateEmailList,
  type ActionItems,
  type ActionItemMember,
  type SendMassEmailResult,
  type EmailListResult,
} from '../../../lib/adminApi';

// ---------------------------------------------------------------------------
// Filter options shared between Mass Email and Email List sections
// ---------------------------------------------------------------------------

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Members' },
  { value: 'confirmed', label: 'Confirmed Members' },
  { value: 'unpaid_dues', label: 'Unpaid Dues' },
  { value: 'build_crew', label: 'Build Crew' },
  { value: 'strike_crew', label: 'Strike Crew' },
  { value: 'not_on_whatsapp', label: 'Not on WhatsApp' },
  { value: 'no_preapproval', label: 'No Pre-Approval Form' },
  { value: 'no_ticket', label: 'No Ticket' },
  { value: 'custom', label: 'Custom Email List' },
];

// ---------------------------------------------------------------------------
// Action Item Card definitions
// ---------------------------------------------------------------------------

interface ActionCardDef {
  key: keyof Omit<ActionItems, 'pendingApplications'>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

const ACTION_CARDS: ActionCardDef[] = [
  { key: 'unpaidDues', label: 'Unpaid Dues', icon: DollarSign },
  { key: 'noTicket', label: 'No Ticket', icon: Ticket },
  { key: 'notOnWhatsapp', label: 'Not on WhatsApp', icon: MessageSquare },
  { key: 'noPreApproval', label: 'No Pre-Approval Form', icon: FileCheck },
];

// ---------------------------------------------------------------------------
// Placeholder
// ---------------------------------------------------------------------------

const placeholderActionItems: ActionItems = {
  unpaidDues: { count: 0, members: [] },
  noTicket: { count: 0, members: [] },
  notOnWhatsapp: { count: 0, members: [] },
  noPreApproval: { count: 0, members: [] },
  pendingApplications: { count: 0 },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CommunicationsPage() {
  const { selectedSeasonId } = useAdminSeason();

  // Action Items state
  const [actionItems, setActionItems] = useState<ActionItems>(placeholderActionItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Mass Email state
  const [emailFilter, setEmailFilter] = useState('all');
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [emailResult, setEmailResult] = useState<SendMassEmailResult | null>(null);

  // Email List state
  const [listFilter, setListFilter] = useState('all');
  const [listCustomEmails, setListCustomEmails] = useState('');
  const [generatingList, setGeneratingList] = useState(false);
  const [emailList, setEmailList] = useState<EmailListResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Load action items
  // ---------------------------------------------------------------------------

  const loadActionItems = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchActionItems(selectedSeasonId || undefined);
      setActionItems(result);
      setError(null);
    } catch {
      setError('Unable to load action items. The server may not be running.');
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    loadActionItems();
  }, [loadActionItems]);

  // ---------------------------------------------------------------------------
  // Update preview count when email filter changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (emailFilter === 'custom') {
      const lines = customEmails
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      setPreviewCount(lines.length);
      return;
    }
    // Map filter to action item counts
    const filterCountMap: Record<string, number> = {
      all: (actionItems.unpaidDues.count + actionItems.noTicket.count + actionItems.notOnWhatsapp.count + actionItems.noPreApproval.count) || 0,
      confirmed: 0, // We don't have this count from action items
      unpaid_dues: actionItems.unpaidDues.count,
      build_crew: 0,
      strike_crew: 0,
      not_on_whatsapp: actionItems.notOnWhatsapp.count,
      no_preapproval: actionItems.noPreApproval.count,
      no_ticket: actionItems.noTicket.count,
    };
    setPreviewCount(filterCountMap[emailFilter] ?? null);
  }, [emailFilter, customEmails, actionItems]);

  // ---------------------------------------------------------------------------
  // Send mass email
  // ---------------------------------------------------------------------------

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      setEmailResult(null);
      const result = await sendMassEmail({
        seasonId: selectedSeasonId || undefined,
        filter: emailFilter,
        customEmails:
          emailFilter === 'custom'
            ? customEmails
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)
            : undefined,
        subject,
        body,
      });
      setEmailResult(result);
    } catch {
      setEmailResult({ sent: 0, failed: 1, errors: ['Failed to send email. Please try again.'] });
    } finally {
      setSendingEmail(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Generate email list
  // ---------------------------------------------------------------------------

  const handleGenerateList = async () => {
    try {
      setGeneratingList(true);
      setEmailList(null);
      const result = await generateEmailList({
        seasonId: selectedSeasonId || undefined,
        filter: listFilter,
        customEmails:
          listFilter === 'custom'
            ? listCustomEmails
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)
            : undefined,
      });
      setEmailList(result);
    } catch {
      setEmailList({ emails: [], count: 0 });
    } finally {
      setGeneratingList(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Clipboard
  // ---------------------------------------------------------------------------

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-thin text-3xl text-ink">Communications</h1>
          <p className="text-body-relaxed text-sm text-ink-soft mt-1">
            Action items, mass email, and email list tools
          </p>
        </div>
        <button
          onClick={() => loadActionItems()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-tan/40 text-ink-soft hover:bg-cream disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
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
            onClick={() => loadActionItems()}
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
          <p className="text-sm text-ink-soft">Loading action items...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ================================================================= */}
          {/* ACTION ITEMS SECTION                                              */}
          {/* ================================================================= */}
          <section>
            <h2 className="text-display-thin text-xl text-ink mb-4">Action Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Standard action cards */}
              {ACTION_CARDS.map((card) => {
                const data = actionItems[card.key];
                const isExpanded = expandedCard === card.key;
                const Icon = card.icon;
                const hasItems = data.count > 0;

                return (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`luxury-card overflow-hidden ${
                      hasItems ? 'border-amber-200' : ''
                    }`}
                  >
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : card.key)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            hasItems
                              ? 'bg-amber-50 border border-amber-200'
                              : 'bg-sage/5 border border-sage/10'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              hasItems ? 'text-amber-600' : 'text-sage'
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-semibold tabular-nums ${
                              hasItems ? 'text-amber-700' : 'text-ink'
                            }`}
                          >
                            {data.count}
                          </p>
                          <p className="text-sm text-ink-soft">{card.label}</p>
                        </div>
                      </div>
                      {hasItems && (
                        isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-ink-soft" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-ink-soft" />
                        )
                      )}
                    </button>

                    {/* Expandable member list */}
                    <AnimatePresence>
                      {isExpanded && hasItems && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-tan/20 px-5 py-3 max-h-60 overflow-y-auto space-y-2">
                            {(data as { count: number; members: ActionItemMember[] }).members.map(
                              (member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between py-1.5 text-sm"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-ink truncate">
                                      {member.name}
                                    </p>
                                    <p className="text-xs text-ink-soft truncate">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Pending Applications card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`luxury-card overflow-hidden ${
                  actionItems.pendingApplications.count > 0 ? 'border-amber-200' : ''
                }`}
              >
                <Link
                  href="/admin/applications"
                  className="w-full p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        actionItems.pendingApplications.count > 0
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-sage/5 border border-sage/10'
                      }`}
                    >
                      <FileText
                        className={`h-5 w-5 ${
                          actionItems.pendingApplications.count > 0
                            ? 'text-amber-600'
                            : 'text-sage'
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-semibold tabular-nums ${
                          actionItems.pendingApplications.count > 0
                            ? 'text-amber-700'
                            : 'text-ink'
                        }`}
                      >
                        {actionItems.pendingApplications.count}
                      </p>
                      <p className="text-sm text-ink-soft">Pending Applications</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-ink-soft" />
                </Link>
              </motion.div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* MASS EMAIL SECTION                                                */}
          {/* ================================================================= */}
          <section className="luxury-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/5 border border-sage/10">
                <Mail className="h-5 w-5 text-sage" />
              </div>
              <div>
                <h2 className="text-display-thin text-xl text-ink">Mass Email</h2>
                <p className="text-xs text-ink-soft">
                  Send branded emails to filtered member groups
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Recipient Filter */}
              <div>
                <label className="form-label">Recipient Filter</label>
                <select
                  value={emailFilter}
                  onChange={(e) => {
                    setEmailFilter(e.target.value);
                    setEmailResult(null);
                  }}
                  className="form-input w-full sm:w-auto sm:min-w-[240px]"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom emails textarea */}
              <AnimatePresence>
                {emailFilter === 'custom' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="form-label">Custom Email Addresses (one per line)</label>
                    <textarea
                      value={customEmails}
                      onChange={(e) => setCustomEmails(e.target.value)}
                      placeholder={"alice@example.com\nbob@example.com"}
                      rows={5}
                      className="form-input w-full font-mono text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject */}
              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="form-input w-full"
                />
              </div>

              {/* Body */}
              <div>
                <label className="form-label">Body (plain text)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter email body. This will be formatted with camp branding on the server."
                  rows={8}
                  className="form-input w-full"
                />
              </div>

              {/* Preview count & Send */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-ink-soft" />
                  <p className="text-sm text-ink-soft">
                    {previewCount !== null ? (
                      <>
                        This will send to{' '}
                        <span className="font-semibold text-ink tabular-nums">
                          {previewCount}
                        </span>{' '}
                        member{previewCount !== 1 ? 's' : ''}
                      </>
                    ) : (
                      'Select a filter to see recipient count'
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setShowSendConfirm(true)}
                  disabled={
                    sendingEmail || !subject.trim() || !body.trim() || previewCount === 0
                  }
                  className="cta-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>

              {/* Send Result */}
              {emailResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border px-4 py-3 ${
                    emailResult.failed > 0
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      emailResult.failed > 0 ? 'text-amber-700' : 'text-green-700'
                    }`}
                  >
                    Sent {emailResult.sent}, Failed {emailResult.failed}
                  </p>
                  {emailResult.errors && emailResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {emailResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-amber-600">
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </div>
          </section>

          {/* Confirm Send Dialog */}
          <ConfirmDialog
            open={showSendConfirm}
            onClose={() => setShowSendConfirm(false)}
            onConfirm={handleSendEmail}
            title="Send Mass Email"
            message={`This will send an email to ${previewCount ?? 0} member${(previewCount ?? 0) !== 1 ? 's' : ''}. Are you sure you want to proceed?`}
            confirmLabel="Send Email"
            variant="warning"
          />

          {/* ================================================================= */}
          {/* EMAIL LIST GENERATOR                                              */}
          {/* ================================================================= */}
          <section className="luxury-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/5 border border-sage/10">
                <List className="h-5 w-5 text-sage" />
              </div>
              <div>
                <h2 className="text-display-thin text-xl text-ink">Email List Generator</h2>
                <p className="text-xs text-ink-soft">
                  Generate and copy email lists by filter
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Filter */}
              <div>
                <label className="form-label">Filter</label>
                <select
                  value={listFilter}
                  onChange={(e) => {
                    setListFilter(e.target.value);
                    setEmailList(null);
                  }}
                  className="form-input w-full sm:w-auto sm:min-w-[240px]"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom emails for list filter */}
              <AnimatePresence>
                {listFilter === 'custom' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="form-label">Custom Email Addresses (one per line)</label>
                    <textarea
                      value={listCustomEmails}
                      onChange={(e) => setListCustomEmails(e.target.value)}
                      placeholder={"alice@example.com\nbob@example.com"}
                      rows={5}
                      className="form-input w-full font-mono text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate button */}
              <button
                onClick={handleGenerateList}
                disabled={generatingList}
                className="cta-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingList ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <List className="h-4 w-4" />
                )}
                {generatingList ? 'Generating...' : 'Generate List'}
              </button>

              {/* Results */}
              {emailList && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-ink-soft">
                      <span className="font-semibold text-ink tabular-nums">
                        {emailList.count}
                      </span>{' '}
                      email{emailList.count !== 1 ? 's' : ''} found
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopy(
                            emailList.emails.map((e) => e.email).join('\n'),
                            'emails',
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-tan/40 text-ink-soft hover:bg-cream transition-colors"
                      >
                        {copied === 'emails' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        Copy All
                      </button>
                      <button
                        onClick={() =>
                          handleCopy(
                            ['Name,Email', ...emailList.emails.map((e) => `${e.name},${e.email}`)].join(
                              '\n',
                            ),
                            'csv',
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-tan/40 text-ink-soft hover:bg-cream transition-colors"
                      >
                        {copied === 'csv' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        Copy as CSV
                      </button>
                    </div>
                  </div>

                  {/* Scrollable email list */}
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-tan/20 divide-y divide-tan/10">
                    {emailList.emails.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-ink-soft">No emails found for this filter.</p>
                      </div>
                    ) : (
                      emailList.emails.map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-cream/50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink truncate">
                              {entry.name}
                            </p>
                            <p className="text-xs text-ink-soft truncate">{entry.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
