import type {
  AccountStatus,
  BookingStatus,
  CancellationPolicyName,
  CancelledBy,
  DocumentStatus,
  NotificationCategory,
  PartnerStatus,
  PartnerType,
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

export interface AdminProfile {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: 'superadmin';
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
  status: PartnerStatus;
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
