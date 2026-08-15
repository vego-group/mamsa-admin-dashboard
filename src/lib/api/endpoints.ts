/**
 * Every backend path in one place.
 *
 * Endpoints are root-mounted on the API host — there is no /api/v1 prefix.
 * Confirmed against the live backend per BACKEND_SPEC.md / the integration guide
 * (89 backend tests green, §9 acceptance checklist passed).
 */
export const endpoints = {
  auth: {
    requestOtp: '/admin/auth/request-otp',
    verifyOtp: '/admin/auth/verify-otp',
    me: '/admin/me',
    logout: '/admin/auth/logout',
  },
  profile: {
    get: '/admin/profile',
    update: '/admin/profile',
    sessions: '/admin/profile/sessions',
    revokeSession: (id: string) => `/admin/profile/sessions/${id}`,
  },
  dashboard: {
    summary: '/admin/dashboard/summary',
  },
  users: {
    list: '/admin/users',
    stats: '/admin/users/stats',
    invite: '/admin/users/invite',

    detail: (id: string) => `/admin/users/${id}`,
    status: (id: string) => `/admin/users/${id}/status`,
    remove: (id: string) => `/admin/users/${id}`,
  },
  partners: {
    list: '/admin/partners',
    stats: '/admin/partners/stats',
    invite: '/admin/partners/invite',
    detail: (id: string) => `/admin/partners/${id}`,
    approve: (id: string) => `/admin/partners/${id}/approve`,
    reject: (id: string) => `/admin/partners/${id}/reject`,
    suspend: (id: string) => `/admin/partners/${id}/suspend`,
    verify: (id: string) => `/admin/partners/${id}/verify`,
    revokeVerification: (id: string) => `/admin/partners/${id}/revoke-verification`,
    verifyDocument: (partnerId: string, documentId: string) =>
      `/admin/partners/${partnerId}/documents/${documentId}/verify`,
    bankDetails: (id: string) => `/admin/partners/${id}/bank-details`,
    verifyBank: (id: string) => `/admin/partners/${id}/bank-details/verify`,
    rejectBank: (id: string) => `/admin/partners/${id}/bank-details/reject`,
  },
  wallets: {
    list: '/admin/wallets',
    stats: '/admin/wallets/stats',
    detail: (partnerId: string) => `/admin/wallets/${partnerId}`,
    // `/ledger`, not `/transactions` — the backend stubs are already built under this path.
    ledger: (partnerId: string) => `/admin/wallets/${partnerId}/ledger`,
    adjust: (partnerId: string) => `/admin/wallets/${partnerId}/adjust`,
  },
  payouts: {
    eligible: '/admin/payouts/eligible',
    ineligible: '/admin/payouts/ineligible',
    list: '/admin/payouts',
    stats: '/admin/payouts/stats',
    detail: (id: string) => `/admin/payouts/${id}`,
    record: '/admin/payouts/record',
    reverse: (id: string) => `/admin/payouts/${id}/reverse`,
    resendNotification: (id: string) => `/admin/payouts/${id}/resend-notification`,
    manual: '/admin/payouts/manual',
    exportCsv: '/admin/payouts/export.csv',
  },
  units: {
    list: '/admin/units',
    stats: '/admin/units/stats',
    create: '/admin/units',
    detail: (id: string) => `/admin/units/${id}`,
    unpublish: (id: string) => `/admin/units/${id}/unpublish`,
  },
  approvals: {
    list: '/admin/approvals',
    stats: '/admin/approvals/stats',
    detail: (id: string) => `/admin/approvals/${id}`,
    approve: (id: string) => `/admin/approvals/${id}/approve`,
    reject: (id: string) => `/admin/approvals/${id}/reject`,
  },
  bookings: {
    list: '/admin/bookings',
    counts: '/admin/bookings/counts',
    stats: '/admin/bookings/stats',
    detail: (id: string) => `/admin/bookings/${id}`,
  },
  cancellations: {
    list: '/admin/cancellations',
    stats: '/admin/cancellations/stats',
    highRisk: '/admin/cancellations/high-risk-partners',
    retryRefund: (id: string) => `/admin/cancellations/${id}/retry-refund`,
  },
  reports: {
    summary: '/admin/reports/summary',
    exportCsv: '/admin/reports/export.csv',
    exportPdf: '/admin/reports/export.pdf',
  },
  notifications: {
    list: '/admin/notifications',
    unreadCount: '/admin/notifications/unread-count',
    markAllRead: '/admin/notifications/read-all',
    markRead: (id: string) => `/admin/notifications/${id}/read`,
  },
} as const;
