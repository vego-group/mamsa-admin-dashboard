import * as mock from '@/lib/mock';
import type {
  AdminProfile,
  AdminSession,
  ApprovalDetail,
  ApprovalListParams,
  ApprovalRequest,
  ApprovalStats,
  Booking,
  BookingDetail,
  BookingListParams,
  BookingStats,
  Cancellation,
  CancellationListParams,
  CancellationStats,
  DashboardSummary,
  HighRiskPartner,
  ID,
  NotificationItem,
  Paginated,
  Partner,
  PartnerDetail,
  PartnerListParams,
  PartnerStats,
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
} from '@/types';
import { USE_MOCK, request } from './client';
import { endpoints } from './endpoints';

type Ok = { ok: true };

export const authApi = {
  requestOtp: (phone: string) =>
    USE_MOCK
      ? mock.mockAuth.requestOtp(phone)
      : request<Ok>(endpoints.auth.requestOtp, { method: 'POST', body: { phone } }),

  verifyOtp: (phone: string, code: string) =>
    USE_MOCK
      ? mock.mockAuth.verifyOtp(phone, code)
      : request<{ ok: true; admin: AdminProfile }>(endpoints.auth.verifyOtp, {
          method: 'POST',
          body: { phone, code },
        }),

  me: () => (USE_MOCK ? mock.mockAuth.me() : request<AdminProfile>(endpoints.auth.me)),

  logout: () =>
    USE_MOCK ? mock.mockAuth.logout() : request<Ok>(endpoints.auth.logout, { method: 'POST' }),
};

export const profileApi = {
  get: () => (USE_MOCK ? mock.mockProfile.get() : request<AdminProfile>(endpoints.profile.get)),

  update: (patch: Partial<AdminProfile>) =>
    USE_MOCK
      ? mock.mockProfile.update(patch)
      : request<AdminProfile>(endpoints.profile.update, { method: 'PATCH', body: patch }),

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

export const approvalsApi = {
  list: (params?: ApprovalListParams) =>
    USE_MOCK
      ? mock.mockApprovals.list(params)
      : request<Paginated<ApprovalRequest>>(endpoints.approvals.list, { params: params as never }),

  stats: () =>
    USE_MOCK ? mock.mockApprovals.stats() : request<ApprovalStats>(endpoints.approvals.stats),

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
