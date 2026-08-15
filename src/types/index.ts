import type {
  AccountStatus,
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
  iban: string;
  accountHolderName: string;
  bankName: string | null;
  verified: boolean;
  verifiedAt: ISODate | null;
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

export interface WalletStats {
  totalAvailable: number;
  totalPending: number;
  eligibleCount: number;
  eligibleAmount: number;
  belowMinimumCount: number;
  bankUnverifiedCount: number;
  bankMissingCount: number;
  negativeBalanceCount: number;
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
export interface Payout {
  id: ID;
  reference: string;
  partnerId: ID;
  partnerName: string;
  partnerType: PartnerType;
  /** 'YYYY-MM', derived from paidAt in Riyadh time. */
  periodMonth: string;
  amount: number;
  bookingsCount: number;
  currency: 'SAR';
  iban: string;
  bankName: string | null;
  accountHolderName: string;
  status: PayoutStatus;
  paidAt: ISODate;
  recordedByAdminId: ID;
  recordedByAdminName: string;
  bankReference: string;
  note: string | null;
  reversedAt: ISODate | null;
  reversedByAdminId: ID | null;
  reversalReason: string | null;
  notifiedAt: ISODate | null;
  /** True for off-cycle payouts recorded by a superadmin. */
  isManual: boolean;
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
  q?: string;
  status?: PayoutStatus | 'all';
  periodMonth?: string;
  partnerId?: ID;
  from?: ISODate;
  to?: ISODate;
  sort?: string;
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
  coverImage: string;
  mamsaOwned: boolean;
  rejectionReason: string | null;
  approvedAt: ISODate | null;
}

export interface UnitDetail extends Unit {
  description: string;
  images: string[];
  amenities: string[];
  lat: number;
  lng: number;
  publicUrl: string | null;
  tourismPermitNo: string | null;
  permitFileUrl: string | null;
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

/** Fields an admin supplies when listing a Mamsa-owned unit directly. */
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
  partnerName: string;
  partnerType: PartnerType;
  submittedAt: ISODate;
  requestType: RequestType;
  previousRejection: PreviousRejection | null;
}

export interface ApprovalDetail extends ApprovalRequest {
  unit: UnitDetail;
  partnerVerified: boolean;
  partnerRating: number;
}

export interface ApprovalStats {
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  avgReviewHours: number;
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
   * Financial block — **optional on purpose**. Production still returns the old shape
   * until the coordinated cutover, so any of these can be absent at runtime and the UI
   * must render an empty state rather than a zero. A zero here reads as "no VAT was
   * collected", which is a different and much worse claim than "not reported yet".
   *
   * `netRevenue` and `vatCollected` ship from `/admin/reports/summary` (staging first);
   * the backend derives both as `total − taxes`, so the names and the
   * `netRevenue + vatCollected === totalRevenue` invariant survive the VAT-inclusive
   * flip with no rewiring here.
   *
   * The partner dashboard calls its equivalent field `vat`. Deliberately NOT normalised
   * — each surface follows its own contract section.
   *
   * `partnersShare` / `payoutsPaid` / `payoutsPending` are mock-only so far; no backend
   * ships them yet.
   */
  netRevenue?: number;
  vatCollected?: number;
  partnersShare?: number;
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
