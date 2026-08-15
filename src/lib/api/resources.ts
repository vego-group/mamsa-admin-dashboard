import * as mock from '@/lib/mock';
import type {
  AdminProfile,
  AdminSession,
  ApprovalDetail,
  ApprovalListParams,
  ApprovalRequest,
  ApprovalStats,
  ApprovalStatsRange,
  ApprovalStatsResponse,
  BankDetails,
  Booking,
  BookingDetail,
  BookingListParams,
  BookingStats,
  Cancellation,
  CursorPage,
  CancellationListParams,
  CancellationStats,
  DashboardSummary,
  EligiblePartner,
  HighRiskPartner,
  IneligiblePartner,
  ID,
  LedgerListParams,
  NotificationItem,
  Paginated,
  Partner,
  PartnerDetail,
  PartnerLedgerEntry,
  PartnerListParams,
  PartnerStats,
  PartnerWallet,
  PartnerWalletDetail,
  Payout,
  PayoutDetail,
  PayoutListParams,
  PayoutStats,
  RecordPayoutInput,
  ReportRange,
  ReportsSummary,
  Unit,
  UnitDetail,
  UnitDraft,
  UnitListParams,
  UnitStats,
  User,
  UserDetail,
  UserListParams,
  UserStats,
  WalletListParams,
  WalletStats,
} from '@/types';
import {
  normalizeAdminProfile,
  type IncomingAdminProfile,
} from '@/lib/auth/permissions';
import { USE_MOCK, request } from './client';
import { endpoints } from './endpoints';

type Ok = { ok: true };

export const authApi = {
  requestOtp: (phone: string) =>
    USE_MOCK
      ? mock.mockAuth.requestOtp(phone)
      : request<Ok>(endpoints.auth.requestOtp, { method: 'POST', body: { phone } }),

  // The deployed API sends neither `permissions` nor a role beyond 'superadmin';
  // normalising here is what lets the rest of the app treat both as guaranteed.
  verifyOtp: (phone: string, code: string) =>
    USE_MOCK
      ? mock.mockAuth.verifyOtp(phone, code)
      : request<{ ok: true; admin: IncomingAdminProfile }>(endpoints.auth.verifyOtp, {
          method: 'POST',
          body: { phone, code },
        }).then((result) => ({ ...result, admin: normalizeAdminProfile(result.admin) })),

  me: () =>
    USE_MOCK
      ? mock.mockAuth.me()
      : request<IncomingAdminProfile>(endpoints.auth.me).then(normalizeAdminProfile),

  logout: () =>
    USE_MOCK ? mock.mockAuth.logout() : request<Ok>(endpoints.auth.logout, { method: 'POST' }),
};

export const profileApi = {
  get: () =>
    USE_MOCK
      ? mock.mockProfile.get()
      : request<IncomingAdminProfile>(endpoints.profile.get).then(normalizeAdminProfile),

  update: (patch: Partial<AdminProfile>) =>
    USE_MOCK
      ? mock.mockProfile.update(patch)
      : request<IncomingAdminProfile>(endpoints.profile.update, {
          method: 'PATCH',
          body: patch,
        }).then(normalizeAdminProfile),

  sessions: () =>
    USE_MOCK ? mock.mockProfile.sessions() : request<AdminSession[]>(endpoints.profile.sessions),

  revokeSession: (id: ID) =>
    USE_MOCK
      ? mock.mockProfile.revokeSession(id)
      : request<Ok>(endpoints.profile.revokeSession(id), { method: 'DELETE' }),
};

export const dashboardApi = {
  summary: () =>
    USE_MOCK
      ? mock.mockDashboard.summary()
      : request<DashboardSummary>(endpoints.dashboard.summary),
};

export const usersApi = {
  list: (params?: UserListParams) =>
    USE_MOCK
      ? mock.mockUsers.list(params)
      : request<Paginated<User>>(endpoints.users.list, { params: params as never }),

  stats: () =>
    USE_MOCK ? mock.mockUsers.stats() : request<UserStats>(endpoints.users.stats),

  get: (id: ID) =>
    USE_MOCK ? mock.mockUsers.get(id) : request<UserDetail>(endpoints.users.detail(id)),

  setStatus: (id: ID, status: User['status']) =>
    USE_MOCK
      ? mock.mockUsers.setStatus(id, status)
      : request<Ok>(endpoints.users.status(id), { method: 'PATCH', body: { status } }),

  remove: (id: ID) =>
    USE_MOCK
      ? mock.mockUsers.remove(id)
      : request<Ok>(endpoints.users.remove(id), { method: 'DELETE' }),

  /** OTP-only platform: an invite is an SMS to a mobile, never a password email. */
  invite: (phone: string, name?: string) =>
    USE_MOCK
      ? mock.mockUsers.invite(phone, name)
      : request<Ok>(endpoints.users.invite, { method: 'POST', body: { phone, name } }),
};

export const partnersApi = {
  list: (params?: PartnerListParams) =>
    USE_MOCK
      ? mock.mockPartners.list(params)
      : request<Paginated<Partner>>(endpoints.partners.list, { params: params as never }),

  stats: () =>
    USE_MOCK ? mock.mockPartners.stats() : request<PartnerStats>(endpoints.partners.stats),

  get: (id: ID) =>
    USE_MOCK ? mock.mockPartners.get(id) : request<PartnerDetail>(endpoints.partners.detail(id)),

  approve: (id: ID) =>
    USE_MOCK
      ? mock.mockPartners.approve(id)
      : request<Ok>(endpoints.partners.approve(id), { method: 'POST' }),

  reject: (id: ID, reason: string) =>
    USE_MOCK
      ? mock.mockPartners.reject(id, reason)
      : request<Ok>(endpoints.partners.reject(id), { method: 'POST', body: { reason } }),

  suspend: (id: ID, reason: string) =>
    USE_MOCK
      ? mock.mockPartners.suspend(id, reason)
      : request<Ok>(endpoints.partners.suspend(id), { method: 'POST', body: { reason } }),

  /** Grants the verified badge. Distinct from `approve`, which admits an applicant. */
  verify: (id: ID) =>
    USE_MOCK
      ? mock.mockPartners.verify(id)
      : request<Ok>(endpoints.partners.verify(id), { method: 'POST' }),

  revokeVerification: (id: ID) =>
    USE_MOCK
      ? mock.mockPartners.revokeVerification(id)
      : request<Ok>(endpoints.partners.revokeVerification(id), { method: 'POST' }),

  verifyDocument: (partnerId: ID, documentId: ID) =>
    USE_MOCK
      ? mock.mockPartners.verifyDocument(partnerId, documentId)
      : request<Ok>(endpoints.partners.verifyDocument(partnerId, documentId), { method: 'POST' }),

  bankDetails: (partnerId: ID) =>
    USE_MOCK
      ? mock.mockWallets.bankDetails(partnerId)
      : request<BankDetails | null>(endpoints.partners.bankDetails(partnerId)),

  verifyBank: (partnerId: ID) =>
    USE_MOCK
      ? mock.mockWallets.verifyBank(partnerId)
      : request<Ok>(endpoints.partners.verifyBank(partnerId), { method: 'POST' }),

  rejectBank: (partnerId: ID, reason: string) =>
    USE_MOCK
      ? mock.mockWallets.rejectBank(partnerId, reason)
      : request<Ok>(endpoints.partners.rejectBank(partnerId), {
          method: 'POST',
          body: { reason },
        }),

  /** Admin-initiated onboarding: an SMS invite, then the partner completes KYC. */
  invite: (phone: string, type: Partner['type'], name?: string) =>
    USE_MOCK
      ? mock.mockPartners.invite(phone, type, name)
      : request<Ok>(endpoints.partners.invite, { method: 'POST', body: { phone, type, name } }),
};

export const unitsApi = {
  list: (params?: UnitListParams) =>
    USE_MOCK
      ? mock.mockUnits.list(params)
      : request<Paginated<Unit>>(endpoints.units.list, { params: params as never }),

  stats: () => (USE_MOCK ? mock.mockUnits.stats() : request<UnitStats>(endpoints.units.stats)),

  get: (id: ID) =>
    USE_MOCK ? mock.mockUnits.get(id) : request<UnitDetail>(endpoints.units.detail(id)),

  unpublish: (id: ID, reason: string) =>
    USE_MOCK
      ? mock.mockUnits.unpublish(id, reason)
      : request<Ok>(endpoints.units.unpublish(id), { method: 'POST', body: { reason } }),

  /** Admin-listed units are Mamsa-owned and start as a draft, like a partner's. */
  create: (draft: UnitDraft) =>
    USE_MOCK
      ? mock.mockUnits.create(draft)
      : request<Ok>(endpoints.units.create, { method: 'POST', body: draft as never }),
};

/**
 * Collapses both stats shapes into one. A response that still carries the legacy
 * `approvedToday`/`rejectedToday` keys, and echoes no `range`, proves the API ignored
 * the range we asked for — so the numbers are today's and the page must say so.
 */
export function normalizeApprovalStats(raw: ApprovalStatsResponse): ApprovalStats {
  const ranged = raw.range !== undefined || raw.approved !== undefined || raw.rejected !== undefined;

  return {
    pendingReview: raw.pendingReview,
    approved: raw.approved ?? raw.approvedToday ?? 0,
    rejected: raw.rejected ?? raw.rejectedToday ?? 0,
    // `?? null`, never `?? 0`: a missing average is not a fast one.
    avgReviewHours: raw.avgReviewHours ?? null,
    // Absent means the API predates the field — distinct from a real sample of 0.
    avgReviewSample: raw.avgReviewSample ?? null,
    rangeSupported: ranged,
  };
}

export const approvalsApi = {
  list: (params?: ApprovalListParams) =>
    USE_MOCK
      ? mock.mockApprovals.list(params)
      : request<Paginated<ApprovalRequest>>(endpoints.approvals.list, { params: params as never }),

  stats: (range: ApprovalStatsRange = 'today') =>
    (USE_MOCK
      ? mock.mockApprovals.stats(range)
      : request<ApprovalStatsResponse>(endpoints.approvals.stats, { params: { range } })
    ).then(normalizeApprovalStats),

  get: (id: ID) =>
    USE_MOCK ? mock.mockApprovals.get(id) : request<ApprovalDetail>(endpoints.approvals.detail(id)),

  approve: (id: ID) =>
    USE_MOCK
      ? mock.mockApprovals.approve(id)
      : request<Ok>(endpoints.approvals.approve(id), { method: 'POST' }),

  reject: (id: ID, reason: string, notes?: string) =>
    USE_MOCK
      ? mock.mockApprovals.reject(id, reason, notes)
      : request<Ok>(endpoints.approvals.reject(id), { method: 'POST', body: { reason, notes } }),
};

export const bookingsApi = {
  list: (params?: BookingListParams) =>
    USE_MOCK
      ? mock.mockBookings.list(params)
      : request<Paginated<Booking>>(endpoints.bookings.list, { params: params as never }),

  counts: () =>
    USE_MOCK
      ? mock.mockBookings.counts()
      : request<Record<string, number>>(endpoints.bookings.counts),

  stats: () =>
    USE_MOCK ? mock.mockBookings.stats() : request<BookingStats>(endpoints.bookings.stats),

  get: (id: ID) =>
    USE_MOCK ? mock.mockBookings.get(id) : request<BookingDetail>(endpoints.bookings.detail(id)),
};

export const cancellationsApi = {
  list: (params?: CancellationListParams) =>
    USE_MOCK
      ? mock.mockCancellations.list(params)
      : request<Paginated<Cancellation>>(endpoints.cancellations.list, {
          params: params as never,
        }),

  stats: () =>
    USE_MOCK
      ? mock.mockCancellations.stats()
      : request<CancellationStats>(endpoints.cancellations.stats),

  highRisk: () =>
    USE_MOCK
      ? mock.mockCancellations.highRisk()
      : request<HighRiskPartner[]>(endpoints.cancellations.highRisk),

  retryRefund: (id: ID) =>
    USE_MOCK
      ? mock.mockCancellations.retryRefund(id)
      : request<Ok>(endpoints.cancellations.retryRefund(id), { method: 'POST' }),
};

export const reportsApi = {
  summary: (range: ReportRange = '1y') =>
    USE_MOCK
      ? mock.mockReports.summary(range)
      : request<ReportsSummary>(endpoints.reports.summary, { params: { range } }),
};

export const walletsApi = {
  list: (params?: WalletListParams) =>
    USE_MOCK
      ? mock.mockWallets.list(params)
      : request<Paginated<PartnerWallet>>(endpoints.wallets.list, { params: params as never }),

  stats: () => (USE_MOCK ? mock.mockWallets.stats() : request<WalletStats>(endpoints.wallets.stats)),

  get: (partnerId: ID) =>
    USE_MOCK
      ? mock.mockWallets.get(partnerId)
      : request<PartnerWalletDetail>(endpoints.wallets.detail(partnerId)),

  /** Cursor-paginated: pass the previous response's `nextCursor` as `before`. */
  ledger: (partnerId: ID, params?: LedgerListParams) =>
    USE_MOCK
      ? mock.mockWallets.ledger(partnerId, params)
      : request<CursorPage<PartnerLedgerEntry>>(endpoints.wallets.ledger(partnerId), {
          params: params as never,
        }),

  adjust: (partnerId: ID, input: { amount: number; reason: string }) =>
    USE_MOCK
      ? mock.mockWallets.adjust(partnerId, input)
      : request<Ok>(endpoints.wallets.adjust(partnerId), { method: 'POST', body: input }),
};

/**
 * Builds the `recordPayout` request body.
 *
 * Exported so a test can assert what goes on the wire. The amount and the IBAN are
 * **never** sent — not for convenience, not "for validation". Both are server-computed;
 * putting them in the body is what would let a future bug or a tampered client change
 * what actually gets paid.
 */
export function recordPayoutBody(input: RecordPayoutInput): Record<string, string> {
  const body: Record<string, string> = {
    partnerId: input.partnerId,
    bankReference: input.bankReference.trim(),
  };

  if (input.paidAt) body.paidAt = input.paidAt;
  const note = input.note?.trim();
  if (note) body.note = note;

  return body;
}

export const payoutsApi = {
  listEligible: () =>
    USE_MOCK
      ? mock.mockPayouts.listEligible()
      : request<EligiblePartner[]>(endpoints.payouts.eligible),

  listIneligible: () =>
    USE_MOCK
      ? mock.mockPayouts.listIneligible()
      : request<IneligiblePartner[]>(endpoints.payouts.ineligible),

  list: (params?: PayoutListParams) =>
    USE_MOCK
      ? mock.mockPayouts.list(params)
      : request<Paginated<Payout>>(endpoints.payouts.list, { params: params as never }),

  stats: () =>
    USE_MOCK ? mock.mockPayouts.stats() : request<PayoutStats>(endpoints.payouts.stats),

  get: (id: ID) =>
    USE_MOCK ? mock.mockPayouts.get(id) : request<PayoutDetail>(endpoints.payouts.detail(id)),

  /** Idempotency-Key guards the one action in this app that moves money on a retry. */
  record: (input: RecordPayoutInput) =>
    USE_MOCK
      ? mock.mockPayouts.record(input)
      : request<{ ok: true; payoutId: string; reference: string }>(endpoints.payouts.record, {
          method: 'POST',
          body: recordPayoutBody(input),
          headers: { 'Idempotency-Key': idempotencyKey() },
        }),

  reverse: (id: ID, input: { reason: string }) =>
    USE_MOCK
      ? mock.mockPayouts.reverse(id, input)
      : request<Ok>(endpoints.payouts.reverse(id), { method: 'POST', body: input }),

  resendNotification: (id: ID) =>
    USE_MOCK
      ? mock.mockPayouts.resendNotification(id)
      : request<Ok>(endpoints.payouts.resendNotification(id), { method: 'POST' }),

  createManual: (input: { partnerId: ID; amount: number; note: string; override?: boolean }) =>
    USE_MOCK
      ? mock.mockPayouts.createManual(input)
      : request<{ ok: true; payoutId: string }>(endpoints.payouts.manual, {
          method: 'POST',
          body: input,
        }),
};

function idempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const notificationsApi = {
  list: () =>
    USE_MOCK
      ? mock.mockNotifications.list()
      : request<NotificationItem[]>(endpoints.notifications.list),

  unreadCount: () =>
    USE_MOCK
      ? mock.mockNotifications.unreadCount()
      : request<number>(endpoints.notifications.unreadCount),

  markAllRead: () =>
    USE_MOCK
      ? mock.mockNotifications.markAllRead()
      : request<Ok>(endpoints.notifications.markAllRead, { method: 'POST' }),

  markRead: (id: ID) =>
    USE_MOCK
      ? mock.mockNotifications.markRead(id)
      : request<Ok>(endpoints.notifications.markRead(id), { method: 'POST' }),
};
