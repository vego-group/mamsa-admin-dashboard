/**
 * WHAT THE DEPLOYED API ACTUALLY DOES — as opposed to what its parameters imply.
 *
 * Every value here exists because a query parameter is **accepted and silently
 * ignored**. Silence is the problem: a rejected parameter is visible, an ignored one
 * looks like a working control that found nothing. The UI reads these flags so it
 * never renders an affordance the backend will not honour.
 *
 * Source: backend reply `MAMSA-BACKEND-REPLY-open-items.md`, 2026-08-16, §9.2 / §9.4.
 * Each flag flips to `true` in the same commit the backend ships the column.
 */

/**
 * `sortBy` values the API accepts, per resource. An unrecognised value is **silently
 * ignored** and the default order is returned — never a 422 — so an unsupported sort
 * looks like a sort that ran and changed nothing.
 *
 * `bookings.commission` is the notable absence: it is a computed expression rather
 * than a column, so it can never be sorted server-side.
 */
export const SORTABLE_FIELDS = {
  users: ['name', 'bookingsCount', 'totalSpent', 'joinedAt'],
  partners: ['name', 'rating', 'revenue', 'unitsCount', 'bookingsCount', 'joinedAt'],
  units: ['name', 'pricePerNight', 'rating', 'occupancyRate', 'revenue', 'bookingsCount', 'createdAt'],
  bookings: ['total', 'checkIn', 'createdAt'],
  cancellations: ['at', 'bookingTotal'],
  approvals: ['submittedAt'],
  wallets: ['partnerName'],
  payouts: ['paidAt', 'amount', 'periodMonth'],
} as const;

/**
 * KYC kinds the backend stores as a **value, not a scan** — there is no column to hold
 * a file, so `fileUrl` is permanently `null` for them. Rendering the generic "No file
 * attached" empty state on these reads as a missing upload, when nothing is missing.
 *
 * `commercial_registration` is here under protest: a `cr_file` column is built and
 * tested on the backend and awaiting our go-ahead, so this list should shrink to `iban`
 * alone once it ships. Source: backend reply `MAMSA-BACKEND-REPLY-open-items.md` §1.2.
 *
 * ✅ **Go-ahead given 2026-08-17.** Do **not** remove `commercial_registration` here the
 * day the column ships — wait until a company partner can actually upload one.
 *
 * Removing it flips this document from a quiet grey "no file by design" to an amber
 * "not uploaded", which is a reviewer's finding. That is the right label only once the
 * finding is actionable; until the partner dashboard has the upload, it is an amber flag
 * on every company partner that nobody on either side can clear. The precondition is
 * therefore a partner-side upload, not a backend column:
 *
 *   POST /uploads/presign { kind: "company_doc" } → PUT bytes → PUT /me/company-docs
 *   { crFileId }
 *
 * and a card on the partner's account screen for companies whose `crFileId` is null —
 * the same three-part chain the national-ID scan needed.
 */
export const VALUE_ONLY_DOCUMENT_KINDS = ['commercial_registration', 'iban'] as const;

/**
 * Every list endpoint clamps `pageSize` to this, silently — `pageSize=5000` returns
 * 100 rows and echoes `pageSize: 100`. It rules out "fetch everything, then export"
 * as a client-side strategy, which is why every export button says *current page*.
 */
export const MAX_PAGE_SIZE = 100;
