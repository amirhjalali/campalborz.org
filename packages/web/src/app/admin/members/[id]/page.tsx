'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  UserX,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface MemberData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  playaName?: string;
  gender?: string;
  role: string;
  isActive: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRestrictions?: string;
  notes?: string;
}

interface SeasonMemberData {
  id: string;
  status: string;
  housingType?: string;
  housingSize?: string;
  gridPower: string;
  arrivalDate?: string;
  departureDate?: string;
  buildCrew: boolean;
  strikeCrew: boolean;
  specialRequests?: string;
  payments: PaymentData[];
}

interface PaymentData {
  id: string;
  type: string;
  amount: number;
  method: string;
  paidAt: string;
  notes?: string;
}

type Tab = 'season' | 'payments' | 'profile';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<MemberData | null>(null);
  const [seasonMember, setSeasonMember] = useState<SeasonMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('season');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable season fields
  const [editStatus, setEditStatus] = useState('');
  const [editHousingType, setEditHousingType] = useState('');
  const [editHousingSize, setEditHousingSize] = useState('');
  const [editGridPower, setEditGridPower] = useState('');
  const [editArrival, setEditArrival] = useState('');
  const [editDeparture, setEditDeparture] = useState('');
  const [editBuildCrew, setEditBuildCrew] = useState(false);
  const [editStrikeCrew, setEditStrikeCrew] = useState(false);
  const [editSpecialRequests, setEditSpecialRequests] = useState('');

  // Editable profile fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlayaName, setEditPlayaName] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editDietary, setEditDietary] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Confirm dialogs
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState('');

  // Record payment
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentType, setPaymentType] = useState('DUES');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VENMO');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch member
      const memberInput = encodeURIComponent(JSON.stringify({ id: memberId }));
      const memberRes = await fetch(
        `${API_BASE_URL}/api/trpc/members.getById?input=${memberInput}`,
        { headers }
      );
      if (!memberRes.ok) throw new Error('Failed to load member');
      const memberJson = await memberRes.json();
      const memberData = memberJson.result?.data;

      if (memberData) {
        setMember(memberData);
        setEditName(memberData.name || '');
        setEditEmail(memberData.email || '');
        setEditPhone(memberData.phone || '');
        setEditPlayaName(memberData.playaName || '');
        setEditGender(memberData.gender || '');
        setEditEmergencyName(memberData.emergencyContactName || '');
        setEditEmergencyPhone(memberData.emergencyContactPhone || '');
        setEditDietary(memberData.dietaryRestrictions || '');
        setEditNotes(memberData.notes || '');
      }

      // Fetch season member data
      const smInput = encodeURIComponent(JSON.stringify({ memberId }));
      const smRes = await fetch(
        `${API_BASE_URL}/api/trpc/seasonMembers.list?input=${smInput}`,
        { headers }
      );
      if (smRes.ok) {
        const smJson = await smRes.json();
        const smResult = smJson.result?.data;
        const smData = smResult?.items?.[0] || smResult;
        if (smData && smData.id) {
          setSeasonMember(smData);
          setEditStatus(smData.status || '');
          setEditHousingType(smData.housingType || '');
          setEditHousingSize(smData.housingSize || '');
          setEditGridPower(smData.gridPower || 'NONE');
          setEditArrival(smData.arrivalDate ? smData.arrivalDate.split('T')[0] : '');
          setEditDeparture(smData.departureDate ? smData.departureDate.split('T')[0] : '');
          setEditBuildCrew(smData.buildCrew || false);
          setEditStrikeCrew(smData.strikeCrew || false);
          setEditSpecialRequests(smData.specialRequests || '');
        }
      }

      setError(null);
    } catch {
      setError('Unable to load member details. The server may not be running.');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const showSaveNotification = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const saveSeasonData = async () => {
    if (!seasonMember) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      // Update status
      await fetch(`${API_BASE_URL}/api/trpc/seasonMembers.updateStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          seasonMemberId: seasonMember.id,
          status: editStatus,
        }),
      });

      // Update housing
      await fetch(`${API_BASE_URL}/api/trpc/seasonMembers.updateHousing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          seasonMemberId: seasonMember.id,
          housingType: editHousingType || null,
          housingSize: editHousingSize || null,
          gridPower: editGridPower,
          arrivalDate: editArrival || null,
          departureDate: editDeparture || null,
          buildCrew: editBuildCrew,
          strikeCrew: editStrikeCrew,
          specialRequests: editSpecialRequests || null,
        }),
      });

      showSaveNotification('Season data saved successfully.');
    } catch {
      showSaveNotification('Failed to save season data.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfileData = async () => {
    if (!member) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/trpc/members.update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: member.id,
          name: editName,
          email: editEmail,
          phone: editPhone || null,
          playaName: editPlayaName || null,
          gender: editGender || null,
          emergencyContactName: editEmergencyName || null,
          emergencyContactPhone: editEmergencyPhone || null,
          dietaryRestrictions: editDietary || null,
          notes: editNotes || null,
        }),
      });
      showSaveNotification('Profile saved successfully.');
    } catch {
      showSaveNotification('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async () => {
    if (!member || !pendingRole) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/trpc/members.updateRole`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: member.id, role: pendingRole }),
      });
      setMember({ ...member, role: pendingRole });
      showSaveNotification('Role updated successfully.');
    } catch {
      showSaveNotification('Failed to update role.');
    }
  };

  const handleDeactivate = async () => {
    if (!member) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/trpc/members.deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: member.id }),
      });
      setMember({ ...member, isActive: false });
      showSaveNotification('Member deactivated.');
    } catch {
      showSaveNotification('Failed to deactivate member.');
    }
  };

  const handleRecordPayment = async () => {
    if (!seasonMember || !paymentAmount) return;
    try {
      setRecordingPayment(true);
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/trpc/payments.record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          seasonMemberId: seasonMember.id,
          type: paymentType,
          amount: Math.round(parseFloat(paymentAmount) * 100),
          method: paymentMethod,
          notes: paymentNotes || null,
        }),
      });
      setShowRecordPayment(false);
      setPaymentAmount('');
      setPaymentNotes('');
      showSaveNotification('Payment recorded successfully.');
      fetchMember(); // Refresh data
    } catch {
      showSaveNotification('Failed to record payment.');
    } finally {
      setRecordingPayment(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'season', label: 'Season', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-display-thin text-xl text-[#2C2416] mb-2">Member Not Found</h2>
        <p className="text-body-relaxed text-sm text-[#4F4434] mb-6">
          {error || 'The member could not be loaded.'}
        </p>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#D4AF37] hover:text-[#C79E2F]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Back Link */}
      <Link
        href="/admin/members"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4F4434] hover:text-[#D4AF37] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Link>

      {/* Save Notification */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`rounded-xl border px-4 py-3 text-sm ${
            saveMessage.includes('Failed')
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      {/* Header */}
      <div className="luxury-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4A5D5A]/10 border border-[#4A5D5A]/20">
              <User className="h-7 w-7 text-[#4A5D5A]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-display-thin text-2xl text-[#2C2416]">
                  {member.name}
                </h1>
                <span className="inline-flex items-center rounded-md bg-[#4A5D5A]/10 px-2 py-0.5 text-xs font-medium text-[#4A5D5A]">
                  {member.role}
                </span>
                {!member.isActive && (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                    Inactive
                  </span>
                )}
              </div>
              {member.playaName && (
                <p className="text-sm text-[#4F4434]">
                  &ldquo;{member.playaName}&rdquo;
                </p>
              )}
              <p className="text-sm text-[#4F4434]">{member.email}</p>
              {member.phone && (
                <p className="text-xs text-[#4F4434]">{member.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPendingRole(member.role === 'ADMIN' ? 'MEMBER' : member.role === 'MANAGER' ? 'ADMIN' : 'MANAGER');
                setShowRoleDialog(true);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-[#D4C4A8]/40 text-[#4F4434] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5"
            >
              <Shield className="h-4 w-4" />
              Change Role
            </button>
            {member.isActive && (
              <button
                onClick={() => setShowDeactivateDialog(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <UserX className="h-4 w-4" />
                Deactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-[#D4C4A8]/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#4F4434] hover:text-[#2C2416] hover:border-[#D4C4A8]/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'season' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="luxury-card p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-display-thin text-lg text-[#2C2416]">
              Season Enrollment
            </h2>
            {seasonMember && (
              <StatusBadge status={seasonMember.status} variant="season" />
            )}
          </div>

          {!seasonMember ? (
            <p className="text-sm text-[#4F4434] py-4">
              This member is not enrolled in the current season.
            </p>
          ) : (
            <>
              {/* Status */}
              <div>
                <label className="form-label">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="form-input w-full max-w-xs"
                >
                  <option value="INTERESTED">Interested</option>
                  <option value="MAYBE">Maybe</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="WAITLISTED">Waitlisted</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Housing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Housing Type</label>
                  <select
                    value={editHousingType}
                    onChange={(e) => setEditHousingType(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Not Set</option>
                    <option value="TENT">Tent</option>
                    <option value="SHIFTPOD">Shiftpod</option>
                    <option value="RV">RV</option>
                    <option value="TRAILER">Trailer</option>
                    <option value="DORM">Dorm</option>
                    <option value="SHARED">Shared</option>
                    <option value="HEXAYURT">Hexayurt</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Housing Size</label>
                  <input
                    type="text"
                    value={editHousingSize}
                    onChange={(e) => setEditHousingSize(e.target.value)}
                    placeholder='e.g. "10x12", "25ft"'
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Grid Power</label>
                  <select
                    value={editGridPower}
                    onChange={(e) => setEditGridPower(e.target.value)}
                    className="form-input"
                  >
                    <option value="NONE">None</option>
                    <option value="AMP_30">30 Amp</option>
                    <option value="AMP_50">50 Amp</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Arrival Date</label>
                  <input
                    type="date"
                    value={editArrival}
                    onChange={(e) => setEditArrival(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Departure Date</label>
                  <input
                    type="date"
                    value={editDeparture}
                    onChange={(e) => setEditDeparture(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Crew */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editBuildCrew}
                    onChange={(e) => setEditBuildCrew(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D4C4A8] text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm font-medium text-[#2C2416]">Build Crew</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editStrikeCrew}
                    onChange={(e) => setEditStrikeCrew(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D4C4A8] text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm font-medium text-[#2C2416]">Strike Crew</span>
                </label>
              </div>

              {/* Special Requests */}
              <div>
                <label className="form-label">Special Requests</label>
                <textarea
                  value={editSpecialRequests}
                  onChange={(e) => setEditSpecialRequests(e.target.value)}
                  rows={3}
                  className="form-input"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button
                  onClick={saveSeasonData}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#4A5D5A] text-white hover:bg-[#3B4A48] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Season Data
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {activeTab === 'payments' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="luxury-card p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-display-thin text-lg text-[#2C2416]">
              Payment History
            </h2>
            <button
              onClick={() => setShowRecordPayment(!showRecordPayment)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[#4A5D5A] text-white hover:bg-[#3B4A48] transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Record Payment
            </button>
          </div>

          {/* Record Payment Form */}
          {showRecordPayment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-[#D4C4A8]/30 rounded-xl p-4 space-y-4"
            >
              <h3 className="text-sm font-medium text-[#2C2416]">New Payment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="form-input"
                  >
                    <option value="DUES">Dues</option>
                    <option value="GRID">Grid</option>
                    <option value="FOOD">Food</option>
                    <option value="DONATION">Donation</option>
                    <option value="RV_VOUCHER">RV Voucher</option>
                    <option value="BEER_FUND">Beer Fund</option>
                    <option value="TENT">Tent</option>
                    <option value="TICKET">Ticket</option>
                    <option value="STRIKE_DONATION">Strike Donation</option>
                    <option value="FUNDRAISING">Fundraising</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-input"
                  >
                    <option value="VENMO">Venmo</option>
                    <option value="ZELLE">Zelle</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="GIVEBUTTER">Givebutter</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Notes</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRecordPayment(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[#4F4434] border border-[#D4C4A8]/40 hover:bg-[#FAF7F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={recordingPayment || !paymentAmount}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#4A5D5A] text-white hover:bg-[#3B4A48] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {recordingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
                  Record
                </button>
              </div>
            </motion.div>
          )}

          {/* Payments Table */}
          {(!seasonMember?.payments || seasonMember.payments.length === 0) ? (
            <p className="text-sm text-[#4F4434] text-center py-8">
              No payments recorded for this member.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#4A5D5A]/10">
                    <th className="text-left py-3 px-2 text-xs font-medium text-[#4F4434] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-[#4F4434] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-[#4F4434] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-[#4F4434] uppercase tracking-wider">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {seasonMember.payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-[#4A5D5A]/5 hover:bg-[#4A5D5A]/[0.03] transition-colors"
                    >
                      <td className="py-3 px-2 text-[#4F4434]">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-[#2C2416] font-medium">
                        {payment.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-2 text-[#2C2416]">
                        {(payment.amount / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                      <td className="py-3 px-2 text-[#4F4434]">
                        {payment.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="luxury-card p-6 space-y-6"
        >
          <h2 className="text-display-thin text-lg text-[#2C2416]">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone number"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Playa Name</label>
              <input
                type="text"
                value={editPlayaName}
                onChange={(e) => setEditPlayaName(e.target.value)}
                placeholder="Playa name"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value)}
                className="form-input"
              >
                <option value="">Not specified</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="NON_BINARY">Non-binary</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#D4C4A8]/30 pt-6">
            <h3 className="text-sm font-medium text-[#2C2416] mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  value={editEmergencyName}
                  onChange={(e) => setEditEmergencyName(e.target.value)}
                  placeholder="Emergency contact name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  placeholder="Emergency contact phone"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Dietary Restrictions</label>
            <input
              type="text"
              value={editDietary}
              onChange={(e) => setEditDietary(e.target.value)}
              placeholder="Any dietary restrictions"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Admin Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              className="form-input"
              placeholder="Internal notes about this member..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveProfileData}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#4A5D5A] text-white hover:bg-[#3B4A48] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
          </div>
        </motion.div>
      )}

      {/* Change Role Dialog */}
      <ConfirmDialog
        open={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        onConfirm={handleChangeRole}
        title="Change Member Role"
        message={`Are you sure you want to change ${member.name}'s role to ${pendingRole}? This will affect their access permissions.`}
        confirmLabel={`Set as ${pendingRole}`}
        variant="warning"
      />

      {/* Deactivate Dialog */}
      <ConfirmDialog
        open={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Member"
        message={`Are you sure you want to deactivate ${member.name}? They will no longer be able to access the member portal. This action can be reversed.`}
        confirmLabel="Deactivate"
        variant="danger"
      />
    </motion.div>
  );
}
