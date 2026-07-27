/**
 * Every backend path in one place.
 *
 * Endpoints are root-mounted on the API host — there is no /api/v1 prefix.
 * Paths marked TODO are not yet confirmed against the admin contract; the shape is
 * kept so Phase 4 is a fill-in rather than a refactor.
 */
export const endpoints = {
  auth: {
    requestOtp: '/admin/auth/request-otp', // TODO confirm
    verifyOtp: '/admin/auth/verify-otp', // TODO confirm
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
    invite: '/admin/users/invite', // TODO confirm

    detail: (id: string) => `/admin/users/${id}`,
    status: (id: string) => `/admin/users/${id}/status`,
    remove: (id: string) => `/admin/users/${id}`,
  },
  partners: {
    list: '/admin/partners',
    stats: '/admin/partners/stats',
    invite: '/admin/partners/invite', // TODO confirm
    detail: (id: string) => `/admin/partners/${id}`,
    approve: (id: string) => `/admin/partners/${id}/approve`,
    reject: (id: string) => `/admin/partners/${id}/reject`,
    suspend: (id: string) => `/admin/partners/${id}/suspend`,
    verify: (id: string) => `/admin/partners/${id}/verify`, // TODO confirm
    revokeVerification: (id: string) => `/admin/partners/${id}/revoke-verification`,
    verifyDocument: (partnerId: string, documentId: string) =>
      `/admin/partners/${partnerId}/documents/${documentId}/verify`,
  },
  units: {
    list: '/admin/units',
    stats: '/admin/units/stats',
    create: '/admin/units', // TODO confirm
    detail: (id: string) => `/admin/units/${id}`,
    unpublish: (id: string) => `/admin/units/${id}/unpublish`, // TODO confirm
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
    retryRefund: (id: string) => `/admin/cancellations/${id}/retry-refund`, // TODO confirm
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
