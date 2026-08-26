import type {
  AccountStatus,
  Amenity,
  ApprovalPartnerType,
  BookingStatus,
  CancellationPolicyName,
  CancelledBy,
  DocumentStatus,
  NotificationCategory,
  PartnerStatus,
  PartnerType,
  PayoutStatus,
  PaymentStatus,
  RefundStatus,
  RequestType,
  UnitStatus,
  UnitType,
} from '@/lib/constants';

export type ID = string;
/** ISO-8601 string. Formatting to DD/MM/YYYY happens at render time only. */
export type ISODate = string;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  /**
   * The sort the API **actually applied**, echoed back. `null` means the requested
   * `sortBy` was not recognised and the default order was returned; absent means the
   * endpoint predates the echo (or is the mock) and cannot tell us either way.
   *
   * Read it through `appliedSort()` rather than directly — an unrecognised sort is
   * otherwise indistinguishable from one that worked.
   */
  sortBy?: string | null;
  sortDir?: 'asc' | 'desc' | null;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/* ---------------------------------------------------------------- admin */

export type AdminRole = 'superadmin' | 'finance';

/**
 * A capability, never a role. Components ask "can this admin do X?" so that adding
 * a role is a change to ROLE_PERMISSIONS alone and never a change to a component.
 */
export type Permission =
  | 'dashboard.view'
  | 'users.view'
  | 'users.manage'
  | 'partners.view'
  | 'partners.manage'
  | 'units.view'
  | 'units.manage'
  | 'approvals.view'
  | 'approvals.manage'
  | 'bookings.view'
  | 'cancellations.view'
  | 'cancellations.manage'
  | 'wallets.view'
  | 'wallets.adjust'
  | 'payouts.view'
  | 'payouts.execute'
  | 'payouts.reverse'
  | 'payouts.manage'
  | 'reports.financial'
  | 'reports.operational'
  | 'notifications.view'
  | 'profile.view';

export interface AdminProfile {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  /** Authoritative grant list. Resolved from ROLE_PERMISSIONS when the API omits it. */
  permissions: Permission[];
  verified: boolean;
  memberSince: ISODate;
  totalReviews: number;
  actionsToday: number;
  preferredLocale: 'ar' | 'en';
}

export interface AdminSession {
  id: ID;
  device: string;
  browser: string;
  city: string;
  current: boolean;
  lastActiveAt: ISODate;
}

/* ----------------------------------------------------------------- users */

export interface User {
  id: ID;
  code: string;
  name: string;
  email: string | null;
  phone: string;
  city: string;
  bookingsCount: number;
  totalSpent: number;
  joinedAt: ISODate;
  status: AccountStatus;
  hasActiveBookings: boolean;
}

export interface UserActivity {
  id: ID;
  label: string;
  at: ISODate;
}

export interface UserDetail extends User {
  avgBookingValue: number;
  activity: UserActivity[];
}

export interface UserListParams extends ListParams {
  status?: AccountStatus | 'all';
  city?: string | 'all';
}

export interface UserStats {
  total: number;
  active: number;
  pendingActivation: number;
  disabled: number;
  /** Lifetime spend averaged over every registered user, not only bookers. */
  avgSpend: number;
}

/* -------------------------------------------------------------- partners */

export interface PartnerDocument {
  id: ID;
  kind:
    | 'national_id'
    | 'tourism_permit'
    | 'commercial_registration'
    | 'iban'
    | 'authorization_letter'
    | 'vat_certificate'
    | 'operator_license';
  label: string;
  fileUrl: string | null;
  value: string | null;
  status: DocumentStatus;
}

export interface Partner {
  id: ID;
  code: string;
  name: string;
  type: PartnerType;
  city: string;
  email: string;
  phone: string;
  joinedAt: ISODate;
  unitsCount: number;
  bookingsCount: number;
  revenue: number;
  rating: number;
  verified: boolean;
  /** Server-derived from `partner_details.status` + `users.is_active`. */
  status: PartnerStatus;
  /**
   * The account-level flag behind the derived status. Suspension is `isActive === false`,
   * not a status value — payout eligibility must check both. See `canReceivePayouts`.
   */
  isActive: boolean;
  cancellations12m: number;
  cancellationRate: number;
  flagged: boolean;
}

export interface PartnerDetail extends Partner {
  nationalId: string | null;
  tourismPermitNo: string | null;
  crNumber: string | null;
  iban: string | null;
  documents: PartnerDocument[];
  documentsComplete: boolean;
  commissionPaid: number;
  partnerEarning: number;
  avgPerBooking: number;
  rejectionReason: string | null;
  /**
   * Why the partner was suspended. Recorded on every suspension since the endpoint was
   * written, and surfaced nowhere until now — which left an admin opening a suspended
   * profile unable to see the one thing they opened it for.
   *
   * `POST /admin/partners/{id}/reactivate` clears it; `PATCH /admin/users/{id}/status`
   * does not, which is why reactivating from the users screen leaves a stale reason.
   */
  suspensionReason?: string | null;
}

export interface PartnerListParams extends ListParams {
  type?: PartnerType | 'all';
  status?: PartnerStatus | 'all';
}

export interface PartnerStats {
  total: number;
  individuals: number;
  companies: number;
  active: number;
  pending: number;
  verified: number;
  /** Partners flagged for a cancellation rate the platform will not absorb. */
  highRisk: number;
  totalRevenue: number;
}

/* --------------------------------------------------------------- wallets */

export type PartnerLedgerEntryType = 'earning' | 'payout' | 'refund_reversal' | 'adjustment';

export type WalletIneligibleReason =
  | 'below_minimum'
  | 'bank_unverified'
  | 'bank_missing'
  | 'not_approved'
  | 'partner_suspended'
  | 'negative_balance'
  /**
   * A payout-cycle fact, not a wallet fact: the partner is otherwise payable but has
   * already been paid for the current Riyadh month. It is never stored on
   * `PartnerWallet.ineligibleReason` — only `listIneligiblePartners` computes it.
   */
  | 'already_paid_this_month';

export interface BankDetails {
  /** FULL iban — admin surface only. The partner's own app only ever sees `••••7519`. */
  iban: string;
  accountHolderName: string;
  /** Derived from the IBAN's SAMA bank code; `null` for an unrecognised one. */
  bankName: string | null;
  verified: boolean;
  verifiedAt: ISODate | null;
  /**
   * Which admin approved this destination. `null` on records that predate the field.
   *
   * It exists because a disputed transfer has to be able to name who approved where the
   * money went — so it is shown, not just stored.
   */
  verifiedBy: string | null;
  rejectionReason: string | null;
  updatedAt: ISODate | null;
}

export interface PartnerWallet {
  partnerId: ID;
  partnerName: string;
  partnerType: PartnerType;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  lifetimePaidOut: number;
  currency: 'SAR';
  bankVerified: boolean;
  payoutEligible: boolean;
  ineligibleReason: WalletIneligibleReason | null;
  lastPayoutAt: ISODate | null;
  updatedAt: ISODate;
}

/**
 * One row of a partner's money history. `amount` is signed: credits positive, debits
 * negative, so the ledger sums to the balance and never needs a separate direction flag.
 */
export interface PartnerLedgerEntry {
  id: ID;
  partnerId: ID;
  type: PartnerLedgerEntryType;
  amount: number;
  balanceAfter: number;
  refType: 'booking' | 'payout' | 'manual';
  refId: ID;
  refCode: string;
  description: string;
  createdAt: ISODate;
  createdByAdminId: ID | null;
}

export interface PartnerWalletDetail extends PartnerWallet {
  bankDetails: BankDetails | null;
  /**
   * `recentLedger`, not `recentTransactions` — verified against the deployed staging
   * stub. The prompt's name predates the WalletTransaction → PartnerLedgerEntry rename.
   */
  recentLedger: PartnerLedgerEntry[];
  recentPayouts: Payout[];
}

/**
 * `GET /admin/wallets/stats`. Computed by the same eligibility service as
 * `/admin/payouts/ineligible`, and `eligibleAmount` by the same `payable()` the run pays
 * from — so these tiles cannot disagree with the payout screen.
 *
 * **The eight counts partition the partner base exactly:**
 *
 *     eligibleCount + belowMinimumCount + bankUnverifiedCount + bankMissingCount
 *       + negativeBalanceCount + alreadyPaidCount + suspendedCount
 *       + nothingPayableCount === partnersCount
 *
 * That is why the last three exist. Without them the row does not sum, and a row of
 * counts that does not add up to the total is one an accountant stops trusting on sight.
 */
export interface WalletStats {
  totalAvailable: number;
  totalPending: number;
  eligibleCount: number;
  eligibleAmount: number;
  belowMinimumCount: number;
  bankUnverifiedCount: number;
  bankMissingCount: number;
  negativeBalanceCount: number;
  /** Done for the cycle — a success state, never styled as a problem. */
  alreadyPaidCount: number;
  suspendedCount: number;
  /**
   * Payable on balance, but with no unpaid finished stay to attach the money to.
   *
   * `/admin/payouts/eligible` drops these, so the tiles must too — counting them as
   * eligible would promise a row the run will never list.
   */
  nothingPayableCount: number;
  partnersCount: number;
  currency: 'SAR';
  minimumPayout: number;
}

export type WalletEligibilityFilter = 'eligible' | 'ineligible' | 'all';

export interface WalletListParams extends ListParams {
  q?: string;
  type?: PartnerType | 'all';
  eligibility?: WalletEligibilityFilter;
  minBalance?: number;
  maxBalance?: number;
  sort?: string;
}

/**
 * The ledger is cursor-paginated, not page/pageSize like every list endpoint — verified
 * against the staging stub, which returns `{ items, hasMore, nextCursor }` and takes
 * `?limit=&before=`. A ledger only ever grows at the head, so a page number would drift
 * under the reader as new rows land.
 */
export interface CursorPage<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface LedgerListParams {
  limit?: number;
  /** The previous response's `nextCursor`. */
  before?: string;
  type?: PartnerLedgerEntryType | 'all';
  from?: ISODate;
  to?: ISODate;
}

/* --------------------------------------------------------------- payouts */

/**
 * Declared here because `PartnerWalletDetail.recentPayouts` needs it. The payout
 * screens, endpoints and mutation rules belong to Phase 3.
 */
/**
 * A recorded transfer. One shape, served identically by `GET /admin/payouts` and by
 * `recentPayouts` on the wallet detail — the backend builds both from the same function,
 * so a single renderer covers both surfaces.
 */
export interface Payout {
  id: ID;
  reference: string;
  partnerId: ID;
  partnerName: string;
  /** The month **earned**, not the month paid. Label it or it reads as a bug. */
  periodMonth: string;
  amount: number;
  bookingsCount: number;
  currency: 'SAR';
  /** Only two states exist. A payout is recorded *after* the money moved. */
  status: PayoutStatus;
  paidAt: ISODate;
  /** The bank's own reference — what an accountant quotes on a support ticket. */
  bankReference: string;
  /**
   * `••••7519`. Masked even here: a payout record needs to identify its destination when
   * a payment is disputed, which the last four digits do without carrying a full IBAN
   * into a list, a CSV export and a browser cache.
   */
  ibanMasked: string;
  bankName: string | null;
  note: string | null;
  /**
   * Reversal detail. Absent from the documented row shape but rendered where present —
   * a reversal is written by an operator command, never by this app, so the data can
   * arrive without anything here having caused it.
   */
  reversedAt?: ISODate | null;
  reversalReason?: string | null;
}

/**
 * `GET /admin/payouts`. The two totals cover the **whole filter, not the page** — closing
 * a month is the only reason this endpoint exists, and a per-page total would be a trap.
 *
 * `totalAmount` excludes reversed rows because that money came back; `items` still
 * contains them. The list and the total answer different questions on purpose.
 */
export interface PayoutPage extends Paginated<Payout> {
  totalAmount: number;
  totalBookingsCount: number;
}

export interface EligiblePartner {
  partnerId: ID;
  partnerName: string;
  partnerType: PartnerType;
  /** Server-computed. Display only — the client never sends this back. */
  amount: number;
  bookingsCount: number;
  iban: string;
  bankName: string | null;
  accountHolderName: string;
  lastPaidAt: ISODate | null;
  lastPaidPeriod: string | null;
}

export interface IneligiblePartner {
  partnerId: ID;
  partnerName: string;
  partnerType: PartnerType;
  availableBalance: number;
  reason: WalletIneligibleReason;
  /** `below_minimum` only — how far short of the floor they are. */
  shortfall: number | null;
  paidThisMonthReference: string | null;
}

export interface PayoutBookingLine {
  bookingId: ID;
  bookingCode: string;
  unitName: string;
  checkOut: ISODate;
  gross: number;
  netBase: number;
  commission: number;
  partnerShare: number;
}

export interface PayoutTimelineEvent {
  at: ISODate;
  event: 'recorded' | 'notified' | 'notification_failed' | 'reversed';
  actor: string;
  detail: string | null;
}

export interface PayoutDetail extends Payout {
  bookings: PayoutBookingLine[];
  timeline: PayoutTimelineEvent[];
}

export interface PayoutStats {
  eligibleCount: number;
  eligibleAmount: number;
  paidThisMonthCount: number;
  paidThisMonthAmount: number;
  ineligibleCount: number;
  reversedCount: number;
  lifetimePaidAmount: number;
  /** 'YYYY-MM' in Riyadh time. */
  currentPeriodMonth: string;
}

export interface PayoutListParams extends ListParams {
  /**
   * `YYYY-MM`. A malformed value is a `422`, not an empty list — `2026-7` matching
   * nothing would render as "we paid nobody in July", and a wrong answer to a
   * reconciliation question is worse than an error.
   */
  periodMonth?: string;
  partnerId?: ID;
  status?: PayoutStatus | 'all';
  /** `paidAt` (default, descending), `amount` or `periodMonth`. */
  sortBy?: 'paidAt' | 'amount' | 'periodMonth';
}

export interface RecordPayoutInput {
  partnerId: ID;
  bankReference: string;
  paidAt?: ISODate;
  note?: string;
}

/* ----------------------------------------------------------------- units */

export interface Unit {
  id: ID;
  code: string;
  name: string;
  partnerId: ID;
  partnerName: string;
  city: string;
  district: string;
  type: UnitType;
  status: UnitStatus;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  sizeSqm: number;
  rating: number;
  reviewsCount: number;
  occupancyRate: number;
  revenue: number;
  bookingsCount: number;
  /** `null` when the unit has no photography of its own — never a stand-in image. */
  coverImage: string | null;
  mamsaOwned: boolean;
  rejectionReason: string | null;
  approvedAt: ISODate | null;
}

export interface UnitPhoto {
  /**
   * The upload id — the value that goes back in `photoFileIds`, which is what makes an
   * edit a merge rather than a replace.
   *
   * `null` for a row written before the upload flow existed: it has no re-sendable
   * identity and cannot survive a `photoFileIds` edit. Zero such rows exist on either
   * server, so this is a guard, not a live case.
   */
  id: string | null;
  url: string;
  isCover: boolean;
}

export interface UnitDetail extends Unit {
  /**
   * `null` on a unit whose description was cleared — a `PATCH` sending `null` stores
   * `null`, and the read side returns what was stored. Was typed as a plain `string`
   * back when clearing was impossible; every reader already guarded it defensively, and
   * this makes the guard the type's idea rather than each reader's.
   */
  description: string | null;
  /** Display-only URLs. `photos` is the one to send back. */
  images: string[];
  photos: UnitPhoto[];
  /** Stored Arabic labels — for reading. `amenityKeys` is what the write side takes. */
  amenities: string[];
  amenityKeys: Amenity[];
  lat: number;
  lng: number;
  address: string | null;
  /** `null` when it was never set; the server seeds it from `bedrooms` at create. */
  beds: number | null;
  /** `HH:mm`, the same format the write side takes. */
  checkIn: string | null;
  checkOut: string | null;
  /**
   * Never null. A unit that never chose one inherits the platform default, and this
   * reports **what the engine would actually apply** — so `moderate` means either
   * "explicitly moderate" or "never chose". Those are deliberately indistinguishable:
   * a reviewer needs the policy that will be enforced, not how it was arrived at.
   */
  cancellationPolicy: CancellationPolicyName;
  /** The stable slug. Match a dropdown on this, never on the reworded label. */
  cityKey: string | null;
  publicUrl: string | null;
  tourismPermitNo: string | null;
  /** Display URL — cannot be sent back. `tourismLicenseFileId` is the writable id. */
  permitFileUrl: string | null;
  tourismLicenseFileId: string | null;
  ownerIdNumber: string | null;
}

export interface UnitListParams extends ListParams {
  status?: UnitStatus | 'all';
  type?: UnitType | 'all';
  city?: string | 'all';
  partnerId?: ID | 'all';
}

export interface UnitStats {
  total: number;
  /** An approved unit is a published unit — the platform has no third state. */
  approved: number;
  pendingReview: number;
  avgOccupancy: number;
  totalRevenue: number;
}

/**
 * The nine fields `POST /admin/units` requires. Everything a complete listing also needs
 * is optional at create and enforced at **submit** — that split is what lets an admin
 * save a draft with photos but no permit yet.
 */
export interface UnitDraft {
  name: string;
  type: UnitType;
  city: string;
  district: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  sizeSqm: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

/** Optional at create; several of these become required at submit. */
export interface UnitDraftExtras {
  /** 1–20. Defaults from `bedrooms` server-side when omitted. */
  beds?: number;
  description?: string;
  amenities?: Amenity[];
  cancellationPolicy?: CancellationPolicyName;
  /** `HH:mm`, 24-hour. */
  checkIn?: string;
  checkOut?: string;
  lat?: number;
  lng?: number;
  address?: string;
  tourismLicenseNumber?: string;
  tourismLicenseFileId?: string;
  /** Ordered, and authoritative: the full set replaces whatever the unit had. */
  photoFileIds?: string[];
  /** Must be one of `photoFileIds`. */
  coverFileId?: string;
}

/** What `POST /admin/units` receives. */
export type UnitCreateBody = UnitDraft & UnitDraftExtras;

/**
 * The optional fields a `PATCH` may clear by sending `null`.
 *
 * These three and no others. The backend documented `null` for exactly this set (reply
 * 2026-08-26 §5) and said nothing about the rest, and a `null` a validator does not
 * expect is a `422` on the last step of a five-step form — the same class of guess that
 * put a fictional `max:500` in this console for a month.
 */
export type ClearableUnitField = 'description' | 'address' | 'tourismLicenseNumber';

/**
 * What `PATCH /admin/units/{id}` receives — only the fields that actually changed.
 *
 * An absent key means "unchanged", which is why clearing a field needs a value at all:
 * `undefined` disappears in `JSON.stringify` and arrives as no key. `null` is the one
 * spelling that says "empty this". (`""` also works server-side — Laravel's
 * `ConvertEmptyStringsToNull` runs before validation — but `null` says what it means.)
 */
export type UnitPatchBody = Partial<Omit<UnitCreateBody, ClearableUnitField>> & {
  [K in ClearableUnitField]?: UnitCreateBody[K] | null;
};

export type UploadKind = 'unit_photo' | 'license_pdf';

export interface UploadedFile {
  fileId: ID;
  fileName: string;
}

export interface City {
  /** What to send. Sending a label works too, but the key cannot be misspelled. */
  key: string;
  en: string;
  ar: string;
}

/* ------------------------------------------------------------- approvals */

export interface PreviousRejection {
  reason: string;
  at: ISODate;
}

export interface ApprovalRequest {
  id: ID;
  code: string;
  unitId: ID;
  unitName: string;
  unitType: UnitType;
  city: string;
  partnerId: ID;
  /**
   * `"ممسى"` on the platform's own listings. It used to be the creating admin's personal
   * name, which made a staff member look like an applicant in the review queue.
   */
  partnerName: string;
  partnerType: ApprovalPartnerType;
  /** The platform owns this unit — there is no applicant and no revenue split. */
  mamsaOwned?: boolean;
  submittedAt: ISODate;
  requestType: RequestType;
  previousRejection: PreviousRejection | null;
  /**
   * The unit's cover photo. Optional because the deployed list endpoint does not send
   * it yet — the queue falls back to a typed placeholder rather than a broken image.
   */
  coverImage?: string | null;
}

export interface ApprovalDetail extends ApprovalRequest {
  unit: UnitDetail;
  partnerVerified: boolean;
  partnerRating: number;
}

/** The window the approval decision counters are measured over. */
export type ApprovalStatsRange = 'today' | '7d' | '30d';

/**
 * What `/admin/approvals/stats` may put on the wire. `approvedToday`/`rejectedToday`
 * are the legacy today-only keys the deployed API still answers with; `approved`/
 * `rejected` + an echoed `range` are the range-aware shape. Normalised into
 * `ApprovalStats` before any component sees it.
 */
export interface ApprovalStatsResponse {
  pendingReview: number;
  approved?: number;
  rejected?: number;
  approvedToday?: number;
  rejectedToday?: number;
  /** `null` when no decision in the range has a measurable submission time. */
  avgReviewHours: number | null;
  /** Decisions the average was actually computed over; `0` whenever the average is null. */
  avgReviewSample?: number;
  range?: ApprovalStatsRange;
}

export interface ApprovalStats {
  pendingReview: number;
  /** Decisions taken inside the requested range. */
  approved: number;
  rejected: number;
  /**
   * Mean hours from submission to decision, or `null` for "no sample".
   *
   * `null` and `0` are different answers and must never collapse into each other: `0`
   * means decisions are landing within minutes, `null` means nothing has been measured.
   * Rendering `null` as a duration produces "< 1h" — a healthy-looking figure standing in
   * for the absence of data, which is worse than showing nothing.
   */
  avgReviewHours: number | null;
  /**
   * How many decisions the average covers. It can be smaller than `approved + rejected`,
   * because a decision with no recorded submission time cannot be measured — which is
   * what makes "6 approved" and "no average" true at the same time. `null` only when the
   * API predates the field.
   */
  avgReviewSample: number | null;
  /**
   * False when the API answered in the legacy today-only shape, i.e. it ignored the
   * `range` we asked for. The page hides the range switch in that case rather than
   * label today's numbers as a month's.
   */
  rangeSupported: boolean;
}

export interface ApprovalListParams extends ListParams {
  requestType?: RequestType | 'all';
  partnerType?: PartnerType | 'all';
}

/* -------------------------------------------------------------- bookings */

export interface PolicyTier {
  label: string;
  refundPercent: number;
}

/** Frozen at payment time. Never re-read from the unit's live policy. */
export interface PolicySnapshot {
  name: CancellationPolicyName;
  capturedAt: ISODate;
  tiers: PolicyTier[];
}

export interface TimelineEvent {
  id: ID;
  label: string;
  at: ISODate;
  state: 'done' | 'current' | 'cancelled';
}

export interface Booking {
  id: ID;
  code: string;
  guestId: ID;
  guestName: string;
  guestPhone: string;
  unitId: ID;
  unitName: string;
  unitCity: string;
  partnerId: ID;
  partnerName: string;
  checkIn: ISODate;
  checkOut: ISODate;
  nights: number;
  guests: number;
  total: number;
  /**
   * `total` is VAT-inclusive and decomposes into `netBase` + `vat`.
   *
   * `commission` and `partnerShare` are **netBase-based** here and after the backend's
   * VAT refactor: commission is 2% of `netBase`, and the three parts sum to `total`.
   * On the **live API today** they are still gross-based (2%/98% of `total`, per
   * BACKEND_SPEC §5.8), which the backend's phase 2 replaces. Mock mode represents the
   * target state; expect the two to disagree until that ships.
   */
  netBase: number;
  vat: number;
  commission: number;
  partnerShare: number;
  nightlyRate: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  moyasarRef: string | null;
  status: BookingStatus;
  createdAt: ISODate;
  mamsaOwned: boolean;
}

export interface BookingDetail extends Booking {
  policySnapshot: PolicySnapshot;
  timeline: TimelineEvent[];
}

export interface BookingStats {
  totalRevenue: number;
  commission: number;
  avgBookingValue: number;
}

export interface BookingListParams extends ListParams {
  status?: BookingStatus | 'all';
  city?: string | 'all';
  partnerId?: ID | 'all';
  unitId?: ID | 'all';
  userId?: ID | 'all';
  from?: ISODate;
  to?: ISODate;
}

/* --------------------------------------------------------- cancellations */

export interface Cancellation {
  id: ID;
  bookingId: ID;
  bookingCode: string;
  guestName: string;
  cancelledBy: CancelledBy;
  unitName: string;
  partnerId: ID;
  partnerName: string;
  at: ISODate;
  reason: string;
  bookingTotal: number;
  refundAmount: number;
  /** Negative — what the platform lost on this cancellation. */
  impact: number;
  refundStatus: RefundStatus;
  mamsaOwned: boolean;
}

export interface CancellationListParams extends ListParams {
  cancelledBy?: CancelledBy | 'all';
  refundStatus?: RefundStatus | 'all';
  partnerId?: ID | 'all';
}

export interface CancellationTrendPoint {
  label: string;
  guest: number;
  host: number;
}

export interface CancellationStats {
  total: number;
  byGuest: number;
  byHost: number;
  totalRefunds: number;
  /** Positive figure of what the platform lost — the sign lives in the UI. */
  financialImpact: number;
  hostCancellations: number;
  refundBreakdown: Record<RefundStatus, number>;
  trend: CancellationTrendPoint[];
}

export interface HighRiskPartner {
  partnerId: ID;
  name: string;
  city: string;
  type: PartnerType;
  cancellations: number;
  rate: number;
}

/* --------------------------------------------------- dashboard & reports */

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface DualSeriesPoint {
  label: string;
  revenue: number;
  commission: number;
}

export interface StatusSlice {
  status: BookingStatus;
  count: number;
}

export interface DashboardSummary {
  totalUsers: number;
  platformCommission: number;
  /**
   * VAT collected on behalf of ZATCA. Reported separately and never folded into a
   * revenue figure — it was never the platform's money.
   */
  totalVat: number;
  /** Gross takings less VAT. This is the number the revenue KPIs show. */
  netRevenue: number;
  totalBookings: number;
  activePartners: number;
  pendingRequests: number;
  monthlyGrowth: number;
  avgBookingValue: number;
  deltas: {
    totalUsers: number;
    platformCommission: number;
    totalBookings: number;
    activePartners: number;
  };
  revenueSeries: DualSeriesPoint[];
  bookingStatusSlices: StatusSlice[];
  revenueByCity: SeriesPoint[];
  weeklyBookings: SeriesPoint[];
  latestPendingRequests: ApprovalRequest[];
  recentHostCancellations: Cancellation[];
}

export interface ReportsSummary {
  totalRevenue: number;
  totalCommission: number;
  /**
   * Financial block — **optional on purpose**. Any of these can be absent at runtime and
   * the UI must render an empty state rather than a zero. A zero here reads as "no VAT
   * was collected", which is a different and much worse claim than "not reported yet".
   *
   * ⚠️ **Two endpoints, two vocabularies.** `/admin/reports/summary` (ours) and
   * `/reports/summary` (partner dashboard) share a path suffix and agree on almost
   * nothing else:
   *
   * | | admin (ours) | partner |
   * |---|---|---|
   * | gross | `totalRevenue` | `grossRevenue` |
   * | VAT | `vatCollected` | `vat` |
   * | commission | `totalCommission` | `commission` |
   * | fees | `fees` *(since 2026-08-16)* | `fees` |
   * | partner money | — absent | `netProfit` |
   *
   * This distinction was documented here, then deleted on a backend correction that
   * turned out to describe the *partner* endpoint — and the deletion was wrong. It is
   * restored, with the table, because the next person to "tidy" it needs the evidence.
   * `normalizeReportsSummary` accepts both sets so neither reading can blank a tile.
   */
  netRevenue?: number;
  /**
   * VAT held for ZATCA. **`vatCollected` on this endpoint** — `vat` is the partner
   * dashboard's name for it and is accepted only as a fallback.
   */
  vatCollected?: number;
  /**
   * Abolished service and cleaning fees, carried by pre-conversion bookings only.
   *
   * Live on the admin endpoint since **2026-08-16**, when `/admin/reports/summary` moved
   * off `gross − taxes` and onto the frozen `subtotal` column — the last surface still on
   * the derived basis. `netRevenue` dropped by exactly this amount on legacy ranges
   * (32,056.00 on staging; production is a no-op, it has no revenue bookings yet).
   *
   * `0` on every modern range, and the line is **hidden when zero or absent**. It exists
   * because without it `netRevenue + vatCollected` does not reach `totalRevenue` on a
   * legacy range, and a reader closing that gap with tax alone infers a ~19.6% VAT rate.
   */
  fees?: number;
  /**
   * What the partners are owed out of the net base, after the platform's commission.
   *
   * ⚠️ The partner endpoint calls this **`netProfit`**, and on an admin screen that name
   * would be a 49× overstatement of what Mamsa earned — it is `SUM(partner_share)`, money
   * owed *to* partners. Absent from the admin payload today; normalised onto this name if
   * it ever appears, so the label on screen stays honest either way.
   */
  partnersShare?: number;
  /** Mock-only so far; no backend ships these yet. */
  payoutsPaid?: number;
  payoutsPending?: number;
  totalBookings: number;
  avgMonthlyRevenue: number;
  revenueSeries: DualSeriesPoint[];
  revenueByCity: SeriesPoint[];
  bookingStatusSlices: StatusSlice[];
  bookingVolume: SeriesPoint[];
  occupancySeries: SeriesPoint[];
  occupancyAverage: number;
  topPartners: Array<{
    partnerId: ID;
    name: string;
    city: string;
    units: number;
    bookings: number;
    revenue: number;
    commission: number;
  }>;
}

/**
 * What `/admin/reports/summary` puts on the wire, plus the partner endpoint's names as
 * accepted fallbacks.
 *
 * The admin surface emits `totalRevenue` / `totalCommission` / `vatCollected` and has
 * always done so. The partner surface emits `grossRevenue` / `commission` / `vat` /
 * `fees` / `netProfit`. Accepting both costs one `??` per field and makes the screen
 * immune to a mix-up that has now happened twice in one review round — in both
 * directions.
 */
export interface ReportsSummaryResponse
  extends Omit<ReportsSummary, 'totalRevenue' | 'totalCommission'> {
  totalRevenue?: number;
  totalCommission?: number;
  /** Partner-endpoint name for `totalRevenue`. */
  grossRevenue?: number;
  /** Partner-endpoint name for `totalCommission`. */
  commission?: number;
  /** Partner-endpoint name for `vatCollected`. */
  vat?: number;
  /** ⚠️ Partner-endpoint name, and a misleading one — see `ReportsSummary.partnersShare`. */
  netProfit?: number;
}

export type ReportRange = '6m' | '1y' | 'all';

/* --------------------------------------------------------- notifications */

export interface NotificationItem {
  id: ID;
  category: NotificationCategory;
  title: string;
  body: string;
  at: ISODate;
  read: boolean;
  entity: { type: 'approval' | 'booking' | 'partner' | 'cancellation' | 'report'; id: ID } | null;
}
