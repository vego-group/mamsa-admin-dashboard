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
    /**
     * Lifts a suspension AND clears the stored reason — which is the reason it exists,
     * since `PATCH /admin/users/{id}/status` leaves a stale reason on the record.
     *
     * Only `approved + suspended → approved + active`. A `pending` partner is refused
     * with 409: an invited partner who never finished KYC is also inactive, and a general
     * "activate" would put them live without a review.
     */
    reactivate: (id: string) => `/admin/partners/${id}/reactivate`,
  },
  wallets: {
    list: '/admin/wallets',
    /**
     * Registered BEFORE `wallets/{partnerId}` server-side. It previously matched the
     * detail route with `partnerId = "stats"` and answered NOT_FOUND *after* auth — alive
     * to an unauthenticated probe, dead for a signed-in admin, silent in the console.
     */
    stats: '/admin/wallets/stats',
    detail: (partnerId: string) => `/admin/wallets/${partnerId}`,
    // `/ledger`, not `/transactions` — the backend stubs are already built under this path.
    ledger: (partnerId: string) => `/admin/wallets/${partnerId}/ledger`,
    /**
     * The bank account lives on the WALLET surface, not the partner one — verified
     * against staging, where `/admin/partners/{id}/bank-details/verify` is a 404 and
     * this path answers 405 to a GET (i.e. it exists, POST only).
     *
     * This is the switch that admits a partner into the payout run, so a wrong path
     * here is why nothing is ever payable.
     */
    verifyBank: (partnerId: string) => `/admin/wallets/${partnerId}/bank/verify`,
    rejectBank: (partnerId: string) => `/admin/wallets/${partnerId}/bank/reject`,
  },
  /**
   * Three endpoints, and only three. `/admin/payouts` (list), `/admin/payouts/stats`,
   * `/admin/payouts/{id}`, `/manual`, `/{id}/reverse` and `/{id}/resend-notification`
   * were built against Phase-3 stubs and are all 404 on staging and production.
   *
   * A reversal is an operator command (`php artisan payouts:reverse`), deliberately not
   * an endpoint — see MAMSA-FRONTEND-ADMIN-PAYOUTS-SCREEN §7.2.
   */
  payouts: {
    eligible: '/admin/payouts/eligible',
    ineligible: '/admin/payouts/ineligible',
    record: '/admin/payouts/record',
    /** Recorded transfers, for closing a month. There is still no `/{id}` detail route. */
    list: '/admin/payouts',
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
  /**
   * Summary only. `export.csv` and `export.pdf` were declared here and never called;
   * both are 404 on staging and production, confirmed by the backend on 2026-08-16.
   * Export is client-side over the loaded page until a server-side export exists.
   */
  reports: {
    summary: '/admin/reports/summary',
  },
  notifications: {
    list: '/admin/notifications',
    unreadCount: '/admin/notifications/unread-count',
    markAllRead: '/admin/notifications/read-all',
    markRead: (id: string) => `/admin/notifications/${id}/read`,
  },
} as const;
