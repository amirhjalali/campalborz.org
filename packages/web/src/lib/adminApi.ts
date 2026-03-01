/**
 * Admin API Service
 *
 * Centralizes all admin-related API calls to the tRPC backend.
 * Each function handles authentication, error mapping, and response parsing.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    throw new ApiError(`Request failed: ${path}`, res.status, text);
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
    throw new ApiError(`Mutation failed: ${path}`, res.status, text);
  }
  const json = await res.json();
  return json.result?.data as T;
}

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardData {
  totalMembers: number;
  confirmed: number;
  maybe: number;
  interested: number;
  waitlisted: number;
  cancelled: number;
  totalCollected: number;
  totalPayments: number;
  pendingApplications: number;
  duesProgress: {
    collected: number;
    expected: number;
    confirmedMembers: number;
    percent: number;
  };
  recentPayments: RecentPayment[];
  recentApplications: RecentApplication[];
  season: { id: string; name: string; year: number } | null;
}

export interface RecentPayment {
  id: string;
  paidAt: string;
  memberName: string;
  playaName?: string;
  amount: number;
  type: string;
  method: string;
}

export interface RecentApplication {
  id: string;
  name: string;
  email: string;
  playaName?: string;
  experience: string;
  status: string;
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  playaName?: string;
  referredBy?: string;
  experience: string;
  interests?: string;
  contribution?: string;
  dietaryRestrictions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  housingPreference?: string;
  message?: string;
  status: string;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface ApplicationListResult {
  applications: Application[];
  total: number;
}

export interface SeasonMember {
  id: string;
  status: string;
  memberId: string;
  housingType?: string;
  member: {
    id: string;
    name: string;
    email: string;
    playaName?: string;
    role: string;
  };
}

export interface SeasonMemberListResult {
  seasonMembers: SeasonMember[];
  total: number;
}

export interface MemberData {
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
  seasonMembers?: Array<{
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
    season: { id: string; year: number; name: string; isActive: boolean };
    payments: PaymentData[];
  }>;
}

export interface PaymentData {
  id: string;
  type: string;
  amount: number;
  method: string;
  paidAt: string;
  notes?: string;
  recordedBy?: string;
}

export interface InviteResult {
  member: { id: string; email: string; name: string };
  inviteToken: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function fetchDashboardData(seasonId?: string): Promise<DashboardData> {
  // Phase 1: Fetch dashboard core + applications in parallel
  const params: Record<string, unknown> = {};
  if (seasonId) params.seasonId = seasonId;

  const [dashboardRaw, applicationsRaw] = await Promise.all([
    trpcQuery<{
      season: { id: string; name: string; year: number } | null;
      totalActiveMembers: number;
      membersByStatus: Record<string, number>;
      housingBreakdown: Record<string, number>;
      financial: { totalCollected: number; totalPayments: number };
      recentPayments: RecentPayment[];
    }>('dashboard.getAdminDashboard', params),

    trpcQuery<{ applications: Application[]; total: number }>(
      'applications.list',
      { status: 'PENDING', limit: 5, offset: 0 },
    ).catch(() => ({ applications: [] as Application[], total: 0 })),
  ]);

  // Phase 2: Use resolved season ID for payment summary
  const resolvedSeasonId = seasonId || dashboardRaw.season?.id;
  let paymentSummaryRaw: {
    totalCollected: number;
    totalPayments: number;
    duesProgress: { collected: number; expected: number; confirmedMembers: number };
  } | null = null;

  if (resolvedSeasonId) {
    paymentSummaryRaw = await trpcQuery<typeof paymentSummaryRaw>(
      'payments.getSummary',
      { seasonId: resolvedSeasonId },
    ).catch(() => null);
  }

  const statusMap = dashboardRaw.membersByStatus || {};
  const financial = dashboardRaw.financial || { totalCollected: 0, totalPayments: 0 };

  // Calculate dues progress
  let duesProgress = { collected: 0, expected: 0, confirmedMembers: 0, percent: 0 };
  if (paymentSummaryRaw?.duesProgress) {
    const dp = paymentSummaryRaw.duesProgress;
    duesProgress = {
      collected: dp.collected,
      expected: dp.expected,
      confirmedMembers: dp.confirmedMembers,
      percent: dp.expected > 0 ? Math.round((dp.collected / dp.expected) * 100) : 0,
    };
  }

  return {
    totalMembers: dashboardRaw.totalActiveMembers || 0,
    confirmed: statusMap.CONFIRMED || 0,
    maybe: statusMap.MAYBE || 0,
    interested: statusMap.INTERESTED || 0,
    waitlisted: statusMap.WAITLISTED || 0,
    cancelled: statusMap.CANCELLED || 0,
    totalCollected: financial.totalCollected,
    totalPayments: financial.totalPayments,
    pendingApplications: applicationsRaw.total,
    duesProgress,
    recentPayments: dashboardRaw.recentPayments || [],
    recentApplications: applicationsRaw.applications.slice(0, 5),
    season: dashboardRaw.season
      ? { id: dashboardRaw.season.id, name: dashboardRaw.season.name, year: dashboardRaw.season.year }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export async function fetchApplications(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ApplicationListResult> {
  const input: Record<string, unknown> = {};
  if (params?.status && params.status !== 'all') input.status = params.status;
  if (params?.limit) input.limit = params.limit;
  if (params?.offset) input.offset = params.offset;

  const result = await trpcQuery<{ applications: Application[]; total: number }>(
    'applications.list',
    input,
  );

  return {
    applications: result.applications || [],
    total: result.total || 0,
  };
}

export async function reviewApplication(
  applicationId: string,
  status: 'ACCEPTED' | 'REJECTED' | 'WAITLISTED',
  reviewNotes?: string,
): Promise<Application> {
  return trpcMutation<Application>('applications.review', {
    applicationId,
    status,
    reviewNotes: reviewNotes || undefined,
  });
}

// ---------------------------------------------------------------------------
// Members (Season Members)
// ---------------------------------------------------------------------------

export async function fetchSeasonMembers(params?: {
  seasonId?: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<SeasonMemberListResult> {
  const input: Record<string, unknown> = {};
  if (params?.seasonId) input.seasonId = params.seasonId;
  if (params?.search) input.search = params.search;
  if (params?.status && params.status !== 'all') input.status = params.status;
  if (params?.limit) input.limit = params.limit;
  if (params?.offset !== undefined) input.offset = params.offset;

  const result = await trpcQuery<{ seasonMembers: SeasonMember[]; total: number }>(
    'seasonMembers.list',
    input,
  );

  return {
    seasonMembers: result.seasonMembers || [],
    total: result.total || 0,
  };
}

// ---------------------------------------------------------------------------
// Member Detail
// ---------------------------------------------------------------------------

export async function fetchMemberById(id: string): Promise<MemberData> {
  return trpcQuery<MemberData>('members.getById', { id });
}

export async function updateMemberProfile(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string | null;
    playaName: string | null;
    gender: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    dietaryRestrictions: string | null;
    notes: string | null;
  }>,
): Promise<MemberData> {
  return trpcMutation<MemberData>('members.adminUpdate', { id, ...data });
}

export async function updateMemberRole(
  memberId: string,
  role: 'ADMIN' | 'MANAGER' | 'MEMBER',
): Promise<unknown> {
  return trpcMutation('members.updateRole', { memberId, role });
}

export async function deactivateMember(memberId: string): Promise<unknown> {
  return trpcMutation('members.deactivate', { memberId });
}

export async function inviteMember(
  email: string,
  name: string,
): Promise<InviteResult> {
  return trpcMutation<InviteResult>('members.invite', { email, name });
}

// ---------------------------------------------------------------------------
// Season Members (update)
// ---------------------------------------------------------------------------

export async function updateSeasonMemberStatus(
  id: string,
  status: string,
): Promise<unknown> {
  return trpcMutation('seasonMembers.updateStatus', { id, status });
}

export async function updateSeasonMemberHousing(
  id: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  return trpcMutation('seasonMembers.updateHousing', { id, ...data });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function recordPayment(data: {
  seasonMemberId: string;
  type: string;
  amount: number;
  method: string;
  paidAt: string;
  notes?: string;
}): Promise<unknown> {
  return trpcMutation('payments.create', data);
}
