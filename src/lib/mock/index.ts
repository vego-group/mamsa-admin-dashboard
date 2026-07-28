import {
  ACCOUNT_STATUS,
  BOOKING_STATUS,
  CANCELLED_BY,
  PARTNER_STATUS,
  PARTNER_TYPE,
  REFUND_STATUS,
  UNIT_STATUS,
} from '@/lib/constants';
import { splitForUnit } from '@/lib/utils/format';
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
import * as seed from './seed';
import { delay, matches, paginate, sortBy } from './utils';

/* ------------------------------------------------------------------ auth */

export const mockAuth = {
  requestOtp: (phone: string) => delay({ ok: true as const, phone }),
  verifyOtp: (phone: string, code: string) => {
    if (code !== '111222') {
      return delay(Promise.reject(new Error('OTP_INVALID'))) as Promise<never>;
    }
    return delay({ ok: true as const, admin: seed.adminProfile });
  },
  me: () => delay(seed.adminProfile),
  logout: () => delay({ ok: true as const }),
};

/* --------------------------------------------------------------- profile */

export const mockProfile = {
  get: () => delay(seed.adminProfile),
  update: (patch: Partial<AdminProfile>) => delay({ ...seed.adminProfile, ...patch }),
  sessions: (): Promise<AdminSession[]> => delay(seed.adminSessions),
  revokeSession: (id: ID) => delay({ ok: true as const, id }),
};

/* ----------------------------------------------------------------- users */

export const mockUsers = {
  list: (params?: UserListParams): Promise<Paginated<User>> => {
    let items = [...seed.users];
    if (params?.status && params.status !== 'all') {
      items = items.filter((u) => u.status === params.status);
    }
    if (params?.city && params.city !== 'all') {
      items = items.filter((u) => u.city === params.city);
    }
    items = items.filter((u) => matches([u.name, u.email, u.phone, u.code, u.city], params?.search));
    items = sortBy(items, params?.sortBy as keyof User | undefined, params?.sortDir ?? 'desc');
    return delay(paginate(items, params));
  },

  stats: (): Promise<UserStats> => {
    const by = (status: User['status']) => seed.users.filter((u) => u.status === status).length;
    return delay({
      total: seed.users.length,
      active: by(ACCOUNT_STATUS.ACTIVE),
      pendingActivation: by(ACCOUNT_STATUS.PENDING_ACTIVATION),
      disabled: by(ACCOUNT_STATUS.DISABLED),
      avgSpend: Math.round(
        seed.users.reduce((sum, u) => sum + u.totalSpent, 0) / (seed.users.length || 1),
      ),
    });
  },

  get: (id: ID): Promise<UserDetail> => {
    const user = seed.users.find((u) => u.id === id);
    if (!user) return Promise.reject(new Error('NOT_FOUND'));
    return delay(seed.userDetail(user));
  },

  setStatus: (id: ID, status: User['status']) => delay({ ok: true as const, id, status }),
  remove: (id: ID) => delay({ ok: true as const, id }),
  invite: (phone: string, name?: string) => delay({ ok: true as const, phone, name }),
};

/* -------------------------------------------------------------- partners */

export const mockPartners = {
  list: (params?: PartnerListParams): Promise<Paginated<Partner>> => {
    let items = [...seed.partners];
    if (params?.type && params.type !== 'all') items = items.filter((p) => p.type === params.type);
    if (params?.status && params.status !== 'all') {
      items = items.filter((p) => p.status === params.status);
    }
    items = items.filter((p) => matches([p.name, p.code, p.email, p.phone, p.city], params?.search));

    items = sortBy(items, params?.sortBy as keyof Partner | undefined, params?.sortDir ?? 'desc');

    return delay(paginate(items, params));
  },

  stats: (): Promise<PartnerStats> =>
    delay({
      total: seed.partners.length,
      individuals: seed.partners.filter((p) => p.type === PARTNER_TYPE.INDIVIDUAL).length,
      companies: seed.partners.filter((p) => p.type === PARTNER_TYPE.COMPANY).length,
      active: seed.partners.filter((p) => p.status === PARTNER_STATUS.ACTIVE).length,
      pending: seed.partners.filter((p) => p.status === PARTNER_STATUS.PENDING).length,
      verified: seed.partners.filter((p) => p.verified).length,
      highRisk: seed.partners.filter((p) => p.flagged).length,
      totalRevenue: seed.partners.reduce((sum, p) => sum + p.revenue, 0),
    }),

  get: (id: ID): Promise<PartnerDetail> => {
    const partner = seed.partners.find((p) => p.id === id);
    if (!partner) return Promise.reject(new Error('NOT_FOUND'));
    return delay(seed.partnerDetail(partner));
  },

  approve: (id: ID) => delay({ ok: true as const, id }),
  reject: (id: ID, reason: string) => delay({ ok: true as const, id, reason }),
  suspend: (id: ID, reason: string) => delay({ ok: true as const, id, reason }),
  verify: (id: ID) => delay({ ok: true as const, id }),
  revokeVerification: (id: ID) => delay({ ok: true as const, id }),
  invite: (phone: string, type: Partner['type'], name?: string) =>
    delay({ ok: true as const, phone, type, name }),
  verifyDocument: (partnerId: ID, documentId: ID) =>
    delay({ ok: true as const, partnerId, documentId }),
};

/* ----------------------------------------------------------------- units */

export const mockUnits = {
  list: (params?: UnitListParams): Promise<Paginated<Unit>> => {
    let items = [...seed.units];
    if (params?.status && params.status !== 'all') items = items.filter((u) => u.status === params.status);
    if (params?.type && params.type !== 'all') items = items.filter((u) => u.type === params.type);
    if (params?.city && params.city !== 'all') items = items.filter((u) => u.city === params.city);
    if (params?.partnerId && params.partnerId !== 'all') {
      items = items.filter((u) => u.partnerId === params.partnerId);
    }
    items = items.filter((u) => matches([u.name, u.code, u.partnerName, u.city], params?.search));
    return delay(paginate(items, params));
  },

  stats: (): Promise<UnitStats> => {
    const approved = seed.units.filter((u) => u.status === UNIT_STATUS.APPROVED);
    return delay({
      total: seed.units.length,
      approved: approved.length,
      pendingReview: seed.units.filter((u) => u.status === UNIT_STATUS.PENDING_REVIEW).length,
      // Occupancy only means something for a unit that can take bookings.
      avgOccupancy: Math.round(
        approved.reduce((sum, u) => sum + u.occupancyRate, 0) / (approved.length || 1),
      ),
      totalRevenue: seed.units.reduce((sum, u) => sum + u.revenue, 0),
    });
  },

  get: (id: ID): Promise<UnitDetail> => {
    const unit = seed.units.find((u) => u.id === id);
    if (!unit) return Promise.reject(new Error('NOT_FOUND'));
    return delay(seed.unitDetail(unit));
  },

  unpublish: (id: ID, reason: string) => delay({ ok: true as const, id, reason }),
  create: (draft: UnitDraft) => delay({ ok: true as const, ...draft }),
};

/* ------------------------------------------------------------- approvals */

export const mockApprovals = {
  list: (params?: ApprovalListParams): Promise<Paginated<ApprovalRequest>> => {
    let items = [...seed.approvalRequests];
    if (params?.requestType && params.requestType !== 'all') {
      items = items.filter((r) => r.requestType === params.requestType);
    }
    if (params?.partnerType && params.partnerType !== 'all') {
      items = items.filter((r) => r.partnerType === params.partnerType);
    }
    items = items.filter((r) => matches([r.code, r.unitName, r.partnerName, r.city], params?.search));
    // Oldest first so the SLA clock is respected.
    items.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    return delay(paginate(items, params));
  },

  stats: (): Promise<ApprovalStats> =>
    delay({
      pendingReview: seed.platformTotals.pendingApprovals,
      approvedToday: 12,
      rejectedToday: 3,
      avgReviewHours: 4.2,
    }),

  get: (id: ID): Promise<ApprovalDetail> => {
    const request = seed.approvalRequests.find((r) => r.id === id);
    if (!request) return Promise.reject(new Error('NOT_FOUND'));
    const unit = seed.units.find((u) => u.id === request.unitId)!;
    const partner = seed.partners.find((p) => p.id === request.partnerId)!;
    return delay({
      ...request,
      unit: seed.unitDetail(unit),
      partnerVerified: partner.verified,
      partnerRating: partner.rating,
    });
  },

  approve: (id: ID) => delay({ ok: true as const, id }),
  reject: (id: ID, reason: string, notes?: string) =>
    delay({ ok: true as const, id, reason, notes }),
};

/* -------------------------------------------------------------- bookings */

export const mockBookings = {
  list: (params?: BookingListParams): Promise<Paginated<Booking>> => {
    let items = [...seed.bookings];
    if (params?.status && params.status !== 'all') items = items.filter((b) => b.status === params.status);
    if (params?.city && params.city !== 'all') items = items.filter((b) => b.unitCity === params.city);
    if (params?.partnerId && params.partnerId !== 'all') {
      items = items.filter((b) => b.partnerId === params.partnerId);
    }
    if (params?.unitId && params.unitId !== 'all') items = items.filter((b) => b.unitId === params.unitId);
    if (params?.userId && params.userId !== 'all') items = items.filter((b) => b.guestId === params.userId);
    if (params?.from) items = items.filter((b) => b.checkIn >= params.from!);
    if (params?.to) items = items.filter((b) => b.checkOut <= params.to!);
    items = items.filter((b) =>
      matches([b.code, b.guestName, b.guestPhone, b.unitName, b.partnerName], params?.search),
    );
    if (params?.sortBy) {
      items = sortBy(items, params.sortBy as keyof Booking, params.sortDir ?? 'desc');
    } else {
      // Newest booking first unless a column is explicitly sorted.
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return delay(paginate(items, params));
  },

  counts: () => {
    const by = (status: Booking['status']) => seed.bookings.filter((b) => b.status === status).length;
    return delay({
      all: seed.bookings.length,
      [BOOKING_STATUS.PENDING_PAYMENT]: by(BOOKING_STATUS.PENDING_PAYMENT),
      [BOOKING_STATUS.CONFIRMED]: by(BOOKING_STATUS.CONFIRMED),
      [BOOKING_STATUS.COMPLETED]: by(BOOKING_STATUS.COMPLETED),
      [BOOKING_STATUS.CANCELLED]: by(BOOKING_STATUS.CANCELLED),
    });
  },

  stats: (): Promise<BookingStats> => {
    const totalRevenue = seed.bookings.reduce((sum, b) => sum + b.total, 0);
    const commission = seed.bookings.reduce((sum, b) => sum + b.commission, 0);
    return delay({
      totalRevenue,
      commission,
      avgBookingValue: Math.round(totalRevenue / (seed.bookings.length || 1)),
    });
  },

  get: (id: ID): Promise<BookingDetail> => {
    const booking = seed.bookings.find((b) => b.id === id);
    if (!booking) return Promise.reject(new Error('NOT_FOUND'));
    return delay(seed.bookingDetail(booking));
  },
};

/* --------------------------------------------------------- cancellations */

export const mockCancellations = {
  list: (params?: CancellationListParams): Promise<Paginated<Cancellation>> => {
    let items = [...seed.cancellations];
    if (params?.cancelledBy && params.cancelledBy !== 'all') {
      items = items.filter((c) => c.cancelledBy === params.cancelledBy);
    }
    if (params?.refundStatus && params.refundStatus !== 'all') {
      items = items.filter((c) => c.refundStatus === params.refundStatus);
    }
    if (params?.partnerId && params.partnerId !== 'all') {
      items = items.filter((c) => c.partnerId === params.partnerId);
    }
    items = items.filter((c) => matches([c.id, c.bookingCode, c.guestName, c.unitName], params?.search));
    items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return delay(paginate(items, params));
  },

  stats: (): Promise<CancellationStats> =>
    delay({
      total: seed.cancellations.length,
      byGuest: seed.cancellations.filter((c) => c.cancelledBy === CANCELLED_BY.GUEST).length,
      byHost: seed.cancellations.filter((c) => c.cancelledBy === CANCELLED_BY.HOST).length,
      totalRefunds: seed.cancellations.reduce((sum, c) => sum + c.refundAmount, 0),
      financialImpact: Math.abs(seed.cancellations.reduce((sum, c) => sum + c.impact, 0)),
      hostCancellations: seed.cancellations.filter((c) => c.cancelledBy === CANCELLED_BY.HOST).length,
      refundBreakdown: {
        [REFUND_STATUS.REFUNDED]: seed.cancellations.filter((c) => c.refundStatus === REFUND_STATUS.REFUNDED).length,
        [REFUND_STATUS.PARTIAL]: seed.cancellations.filter((c) => c.refundStatus === REFUND_STATUS.PARTIAL).length,
        [REFUND_STATUS.NONE]: seed.cancellations.filter((c) => c.refundStatus === REFUND_STATUS.NONE).length,
        [REFUND_STATUS.FAILED]: seed.cancellations.filter((c) => c.refundStatus === REFUND_STATUS.FAILED).length,
      },
      trend: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, index) => ({
        label,
        guest: [12, 9, 15, 11, 18, 14][index],
        host: [4, 6, 8, 3, 5, 9][index],
      })),
    }),

  highRisk: (): Promise<HighRiskPartner[]> =>
    delay(
      seed.partners
        .filter((p) => p.flagged)
        .map((p) => ({
          partnerId: p.id,
          name: p.name,
          city: p.city,
          type: p.type,
          cancellations: p.cancellations12m,
          rate: p.cancellationRate,
        }))
        .sort((a, b) => b.cancellations - a.cancellations),
    ),

  retryRefund: (id: ID) => delay({ ok: true as const, id }),
};

/* -------------------------------------------------------------- dashboard */

export const mockDashboard = {
  summary: (): Promise<DashboardSummary> =>
    delay({
      totalUsers: seed.platformTotals.users,
      platformCommission: seed.platformTotals.platformCommission,
      totalBookings: seed.platformTotals.bookings,
      activePartners: seed.platformTotals.activePartners,
      pendingRequests: seed.platformTotals.pendingApprovals,
      monthlyGrowth: seed.platformTotals.monthlyGrowth,
      avgBookingValue: seed.avgBookingValue,
      deltas: {
        totalUsers: seed.platformTotals.deltas.users,
        platformCommission: seed.platformTotals.deltas.platformCommission,
        totalBookings: seed.platformTotals.deltas.bookings,
        activePartners: seed.platformTotals.deltas.activePartners,
      },
      revenueSeries: seed.revenueSeries,
      bookingStatusSlices: [...seed.bookingStatusSlices],
      revenueByCity: seed.revenueByCity,
      weeklyBookings: seed.weeklyBookings,
      // Newest first — the dashboard shows what just landed, the Approvals screen
      // orders by SLA instead.
      latestPendingRequests: [...seed.approvalRequests].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
      recentHostCancellations: seed.cancellations
        .filter((c) => c.cancelledBy === CANCELLED_BY.HOST)
        .slice(0, 4),
    }),
};

/* ---------------------------------------------------------------- reports */

export const mockReports = {
  summary: (range: ReportRange = '1y'): Promise<ReportsSummary> => {
    const months = range === '6m' ? 6 : 12;
    const revenueSeries = seed.revenueSeries.slice(-months);
    const totalRevenue = revenueSeries.reduce((sum, p) => sum + p.revenue, 0);
    const totalCommission = revenueSeries.reduce((sum, p) => sum + p.commission, 0);
    const bookingVolume = seed.bookingVolume.slice(-months);
    const totalBookings = bookingVolume.reduce((sum, p) => sum + p.value, 0);
    const occupancySeries = seed.occupancySeries.slice(-months);

    return delay({
      totalRevenue,
      totalCommission,
      totalBookings,
      avgMonthlyRevenue: Math.round(totalRevenue / (revenueSeries.length || 1)),
      revenueSeries,
      revenueByCity: seed.revenueByCity,
      bookingStatusSlices: [...seed.bookingStatusSlices],
      bookingVolume,
      occupancySeries,
      occupancyAverage: Math.round(
        occupancySeries.reduce((sum, p) => sum + p.value, 0) / (occupancySeries.length || 1),
      ),
      topPartners: [...seed.partners]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          partnerId: p.id,
          name: p.name,
          city: p.city,
          units: p.unitsCount,
          bookings: p.bookingsCount,
          revenue: p.revenue,
          commission: splitForUnit(p.revenue, false).commission,
        })),
    });
  },
};

/* ---------------------------------------------------------- notifications */

export const mockNotifications = {
  list: (): Promise<NotificationItem[]> => delay(seed.notifications),
  unreadCount: () => delay(seed.notifications.filter((n) => !n.read).length),
  markAllRead: () => delay({ ok: true as const }),
  markRead: (id: ID) => delay({ ok: true as const, id }),
};
