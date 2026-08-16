import {
  ACCOUNT_STATUS,
  BOOKING_STATUS,
  CANCELLED_BY,
  PARTNER_STATUS,
  PARTNER_TYPE,
  PAYOUT_MIN_BALANCE,
  PAYOUT_STATUS,
  REFUND_STATUS,
  UNIT_STATUS,
} from '@/lib/constants';
import { ApiError } from '@/lib/api/client';
import { splitForUnit, splitPrice } from '@/lib/utils/format';
import { resolveIneligibleReason } from '@/lib/wallets/eligibility';
import type {
  AdminProfile,
  AdminSession,
  ApprovalDetail,
  ApprovalListParams,
  ApprovalRequest,
  ApprovalStatsRange,
  ApprovalStatsResponse,
  BankDetails,
  CursorPage,
  Booking,
  BookingDetail,
  BookingListParams,
  BookingStats,
  Cancellation,
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
  PayoutPage,
  PayoutListParams,
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
  WalletIneligibleReason,
  WalletListParams,
  WalletStats,
} from '@/types';
import * as seed from './seed';
import { BASE_NOW, delay, matches, paginate, sortBy } from './utils';

/* ------------------------------------------------------------------ auth */

/**
 * The mock has no SMS gateway and nothing to verify a code against, so any six-digit
 * code signs in. It deliberately holds **no fixed value**: a literal here once matched
 * the backend's staging code, which is how that code came to be published. A mock must
 * never carry a string that could be mistaken for — or reused as — a real credential.
 */
const MOCK_OTP_PATTERN = /^\d{6}$/;
/**
 * The mock has to remember who signed in, or a page reload would silently hand the
 * session back to the superadmin and the role split would be untestable.
 */
const MOCK_SESSION_KEY = 'mamsa-mock-admin';

function readMockSession(): AdminProfile | null {
  if (typeof window === 'undefined') return null;
  const id = window.localStorage.getItem(MOCK_SESSION_KEY);
  return seed.admins.find((admin) => admin.id === id) ?? null;
}

function writeMockSession(admin: AdminProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MOCK_SESSION_KEY, admin.id);
}

function clearMockSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MOCK_SESSION_KEY);
}

function unauthenticated(): Promise<never> {
  return delay(
    Promise.reject(new ApiError('يجب تسجيل الدخول للمتابعة', 401, 'UNAUTHENTICATED')),
  ) as Promise<never>;
}

export const mockAuth = {
  requestOtp: (phone: string) => delay({ ok: true as const, phone }),

  // Any valid Saudi number still signs in, as the README documents — the seeded phones
  // are what select a specific role. +966500000002 is the finance account.
  verifyOtp: (phone: string, code: string) => {
    if (!MOCK_OTP_PATTERN.test(code)) {
      return delay(
        Promise.reject(new ApiError('الرمز غير صحيح', 422, 'OTP_INVALID')),
      ) as Promise<never>;
    }

    const admin = seed.admins.find((candidate) => candidate.phone === phone) ?? seed.adminProfile;
    writeMockSession(admin);
    return delay({ ok: true as const, admin });
  },

  me: () => {
    const admin = readMockSession();
    return admin ? delay(admin) : unauthenticated();
  },

  logout: () => {
    clearMockSession();
    return delay({ ok: true as const });
  },
};

/* --------------------------------------------------------------- profile */

export const mockProfile = {
  get: () => {
    const admin = readMockSession();
    return admin ? delay(admin) : unauthenticated();
  },
  update: (patch: Partial<AdminProfile>) =>
    delay({ ...(readMockSession() ?? seed.adminProfile), ...patch }),
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

  /** Lifts a suspension and clears the stored reason in the same call. */
  reactivate: (id: ID) => delay({ ok: true as const, id }),
  reject: (id: ID, reason: string) => delay({ ok: true as const, id, reason }),
  suspend: (id: ID, reason: string) => delay({ ok: true as const, id, reason }),
  verify: (id: ID) => delay({ ok: true as const, id }),
  revokeVerification: (id: ID) => delay({ ok: true as const, id }),
  invite: (phone: string, type: Partner['type'], name?: string) =>
    delay({ ok: true as const, phone, type, name }),
  verifyDocument: (partnerId: ID, documentId: ID) =>
    delay({ ok: true as const, partnerId, documentId }),
};

/* --------------------------------------------------------------- wallets */

/** Newest first: a ledger is read from the most recent movement backwards. */
function ledgerOf(partnerId: ID): PartnerLedgerEntry[] {
  return [...(ledgerStore[partnerId] ?? [])].reverse();
}

export const mockWallets = {
  list: (params?: WalletListParams): Promise<Paginated<PartnerWallet>> => {
    let items = [...walletStore];

    if (params?.type && params.type !== 'all') {
      items = items.filter((wallet) => wallet.partnerType === params.type);
    }
    if (params?.eligibility && params.eligibility !== 'all') {
      const wantEligible = params.eligibility === 'eligible';
      items = items.filter((wallet) => wallet.payoutEligible === wantEligible);
    }
    if (typeof params?.minBalance === 'number') {
      items = items.filter((wallet) => wallet.availableBalance >= params.minBalance!);
    }
    if (typeof params?.maxBalance === 'number') {
      items = items.filter((wallet) => wallet.availableBalance <= params.maxBalance!);
    }

    items = items.filter((wallet) => matches([wallet.partnerName], params?.q ?? params?.search));

    // `sort` accepts a leading '-' for descending, matching the documented param.
    const sortKey = params?.sort?.replace(/^-/, '') ?? params?.sortBy;
    const sortDir = params?.sort?.startsWith('-') ? 'desc' : (params?.sortDir ?? 'desc');
    items = sortBy(items, sortKey as keyof PartnerWallet | undefined, sortDir);

    return delay(paginate(items, params));
  },

  stats: (): Promise<WalletStats> => {
    const eligible = walletStore.filter((wallet) => wallet.payoutEligible);
    const countReason = (reason: WalletIneligibleReason) =>
      walletStore.filter((wallet) => wallet.ineligibleReason === reason).length;

    return delay({
      totalAvailable: round2(walletStore.reduce((sum, w) => sum + w.availableBalance, 0)),
      totalPending: round2(walletStore.reduce((sum, w) => sum + w.pendingBalance, 0)),
      eligibleCount: eligible.length,
      eligibleAmount: round2(eligible.reduce((sum, w) => sum + w.availableBalance, 0)),
      belowMinimumCount: countReason('below_minimum'),
      bankUnverifiedCount: countReason('bank_unverified'),
      bankMissingCount: countReason('bank_missing'),
      negativeBalanceCount: countReason('negative_balance'),
      alreadyPaidCount: countReason('already_paid_this_month'),
      suspendedCount: countReason('partner_suspended'),
      // Payable on balance with no unpaid finished stay to attach the money to. The mock
      // has no such partner, but the count must exist or the row does not partition.
      nothingPayableCount: 0,
      partnersCount: walletStore.length,
      currency: 'SAR',
      minimumPayout: PAYOUT_MIN_BALANCE,
    });
  },

  get: (partnerId: ID): Promise<PartnerWalletDetail> => {
    const wallet = walletStore.find((item) => item.partnerId === partnerId);
    if (!wallet) {
      return delay(
        Promise.reject(new ApiError('المحفظة غير موجودة', 404, 'NOT_FOUND')),
      ) as Promise<never>;
    }

    return delay({
      ...wallet,
      bankDetails: seed.bankDetailsByPartner[partnerId] ?? null,
      recentLedger: ledgerOf(partnerId).slice(0, 5),
      recentPayouts: payoutStore
        .filter((payout) => payout.partnerId === partnerId)
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, 5),
    });
  },

  ledger: (partnerId: ID, params?: LedgerListParams): Promise<CursorPage<PartnerLedgerEntry>> => {
    let items = ledgerOf(partnerId);

    if (params?.type && params.type !== 'all') {
      items = items.filter((row) => row.type === params.type);
    }
    if (params?.from) {
      const from = new Date(params.from).getTime();
      items = items.filter((row) => new Date(row.createdAt).getTime() >= from);
    }
    if (params?.to) {
      const to = new Date(params.to).getTime();
      items = items.filter((row) => new Date(row.createdAt).getTime() <= to);
    }

    // The cursor is the last row already seen; everything after it is the next page.
    if (params?.before) {
      const seen = items.findIndex((row) => row.id === params.before);
      if (seen >= 0) items = items.slice(seen + 1);
    }

    const limit = params?.limit ?? 10;
    const page = items.slice(0, limit);
    const hasMore = items.length > limit;

    return delay({
      items: page,
      hasMore,
      nextCursor: hasMore && page.length ? page[page.length - 1].id : null,
    });
  },

  adjust: (partnerId: ID, input: { amount: number; reason: string }) =>
    delay({ ok: true as const, partnerId, ...input }),

  bankDetails: (partnerId: ID): Promise<BankDetails | null> =>
    delay(seed.bankDetailsByPartner[partnerId] ?? null),

  verifyBank: (partnerId: ID) => delay({ ok: true as const, partnerId }),
  rejectBank: (partnerId: ID, reason: string) => delay({ ok: true as const, partnerId, reason }),
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/* --------------------------------------------------------------- payouts */

/**
 * Unlike every other mock in this file, the payout mock is **stateful**. Recording a
 * transfer has to actually move the balance, write the ledger row and remove the partner
 * from the eligible list, or none of the rules this feature exists to enforce —
 * once-per-month, duplicate references, reversal — can be exercised at all.
 *
 * Clock note: the whole seed is anchored to `BASE_NOW`, so "this month" here means the
 * seed's month, not the wall clock. Mixing the two would make the once-per-month rule
 * fire against a month no seeded payout lives in.
 */
const payoutStore: Payout[] = seed.payouts.map((payout) => ({ ...payout }));
const walletStore: PartnerWallet[] = seed.wallets.map((wallet) => ({ ...wallet }));
const ledgerStore: Record<string, PartnerLedgerEntry[]> = Object.fromEntries(
  Object.entries(seed.partnerLedgers).map(([id, rows]) => [id, rows.map((row) => ({ ...row }))]),
);
const coverageStore: Record<string, Booking[]> = { ...seed.payoutCoverage };

const nowIso = () => BASE_NOW.toISOString();
const currentPeriod = () => seed.riyadhPeriodMonth(nowIso());

function walletOf(partnerId: ID): PartnerWallet | undefined {
  return walletStore.find((wallet) => wallet.partnerId === partnerId);
}

function partnerOf(partnerId: ID): Partner | undefined {
  return seed.partners.find((partner) => partner.id === partnerId);
}

function paidPayoutIn(partnerId: ID, period: string): Payout | null {
  return (
    payoutStore.find(
      (payout) =>
        payout.partnerId === partnerId &&
        payout.status === PAYOUT_STATUS.PAID &&
        payout.periodMonth === period,
    ) ?? null
  );
}

/** Earning rows no payout has settled yet — what the next transfer will cover. */
function unsettledBookings(partnerId: ID): Booking[] {
  const covered = new Set(
    Object.values(coverageStore)
      .flat()
      .map((booking) => booking.id),
  );

  return (ledgerStore[partnerId] ?? [])
    .filter((row) => row.type === 'earning' && !covered.has(row.refId))
    .map((row) => seed.bookings.find((booking) => booking.id === row.refId))
    .filter((booking): booking is Booking => Boolean(booking));
}

/** Appends a row, recomputes the running balance, and re-derives the wallet. */
function appendLedgerRow(
  partnerId: ID,
  input: Pick<
    PartnerLedgerEntry,
    'type' | 'amount' | 'refType' | 'refId' | 'refCode' | 'description' | 'createdByAdminId'
  > & { createdAt?: string },
): void {
  const rows = (ledgerStore[partnerId] ??= []);
  const previous = rows.length ? rows[rows.length - 1].balanceAfter : 0;

  rows.push({
    ...input,
    id: `led_${partnerId}_${String(rows.length + 1).padStart(3, '0')}`,
    partnerId,
    balanceAfter: round2(previous + input.amount),
    createdAt: input.createdAt ?? nowIso(),
  });

  recomputeWallet(partnerId);
}

function recomputeWallet(partnerId: ID): void {
  const wallet = walletOf(partnerId);
  const partner = partnerOf(partnerId);
  if (!wallet || !partner) return;

  const rows = ledgerStore[partnerId] ?? [];
  const availableBalance = rows.length ? rows[rows.length - 1].balanceAfter : 0;
  const reversedBack = round2(
    rows
      .filter((row) => row.type === 'adjustment' && row.refType === 'payout')
      .reduce((sum, row) => sum + row.amount, 0),
  );

  wallet.availableBalance = availableBalance;
  wallet.lifetimeEarnings = round2(
    rows.filter((row) => row.type === 'earning').reduce((sum, row) => sum + row.amount, 0),
  );
  wallet.lifetimePaidOut = round2(
    rows.filter((row) => row.type === 'payout').reduce((sum, row) => sum + Math.abs(row.amount), 0) -
      reversedBack,
  );
  wallet.ineligibleReason = resolveIneligibleReason({
    partner,
    availableBalance,
    bankDetails: seed.bankDetailsByPartner[partnerId] ?? null,
  });
  wallet.payoutEligible = wallet.ineligibleReason === null;
  wallet.lastPayoutAt =
    payoutStore
      .filter((payout) => payout.partnerId === partnerId && payout.status === PAYOUT_STATUS.PAID)
      .sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime())
      .at(-1)?.paidAt ?? null;
  wallet.updatedAt = nowIso();
}

/**
 * The payout-cycle view of eligibility: the wallet's own reason, plus the one condition
 * that only exists at payout time — already settled for this month.
 */
function payoutBlocker(wallet: PartnerWallet): WalletIneligibleReason | null {
  if (wallet.ineligibleReason) return wallet.ineligibleReason;
  return paidPayoutIn(wallet.partnerId, currentPeriod()) ? 'already_paid_this_month' : null;
}

function toEligiblePartner(wallet: PartnerWallet): EligiblePartner {
  const bank = seed.bankDetailsByPartner[wallet.partnerId];
  const lastPaid = payoutStore
    .filter((p) => p.partnerId === wallet.partnerId && p.status === PAYOUT_STATUS.PAID)
    .sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime())
    .at(-1);

  return {
    partnerId: wallet.partnerId,
    partnerName: wallet.partnerName,
    partnerType: wallet.partnerType,
    amount: wallet.availableBalance,
    bookingsCount: unsettledBookings(wallet.partnerId).length,
    iban: bank?.iban ?? '',
    bankName: bank?.bankName ?? null,
    accountHolderName: bank?.accountHolderName ?? wallet.partnerName,
    lastPaidAt: lastPaid?.paidAt ?? null,
    lastPaidPeriod: lastPaid?.periodMonth ?? null,
  };
}


function failNotEligible(reason: WalletIneligibleReason): Promise<never> {
  const code = reason === 'already_paid_this_month' ? 'ALREADY_PAID_THIS_MONTH' : 'NOT_ELIGIBLE';
  return delay(
    Promise.reject(new ApiError(`الشريك غير مؤهّل للتحويل: ${reason}`, 409, code)),
  ) as Promise<never>;
}

export const mockPayouts = {
  listEligible: (): Promise<EligiblePartner[]> =>
    delay(
      walletStore
        .filter((wallet) => payoutBlocker(wallet) === null)
        .sort((a, b) => b.availableBalance - a.availableBalance)
        .map(toEligiblePartner),
    ),

  listIneligible: (): Promise<IneligiblePartner[]> =>
    delay(
      walletStore
        .flatMap((wallet) => {
          const reason = payoutBlocker(wallet);
          if (!reason) return [];

          const paidThisMonth = paidPayoutIn(wallet.partnerId, currentPeriod());
          return [
            {
              partnerId: wallet.partnerId,
              partnerName: wallet.partnerName,
              partnerType: wallet.partnerType,
              availableBalance: wallet.availableBalance,
              reason,
              shortfall:
                reason === 'below_minimum'
                  ? round2(PAYOUT_MIN_BALANCE - wallet.availableBalance)
                  : null,
              paidThisMonthReference: paidThisMonth?.reference ?? null,
            } satisfies IneligiblePartner,
          ];
        })
        .sort((a, b) => b.availableBalance - a.availableBalance),
    ),

  /**
   * `totalAmount` covers the whole filter rather than the page, and excludes reversed
   * rows — that money came back. `items` still contains them, so the list and the total
   * deliberately answer different questions.
   */
  list: (params?: PayoutListParams): Promise<PayoutPage> => {
    let items = [...payoutStore];

    if (params?.status && params.status !== 'all') {
      items = items.filter((payout) => payout.status === params.status);
    }
    if (params?.periodMonth && params.periodMonth !== 'all') {
      items = items.filter((payout) => payout.periodMonth === params.periodMonth);
    }
    if (params?.partnerId) items = items.filter((p) => p.partnerId === params.partnerId);

    items = items.filter((payout) =>
      matches([payout.reference, payout.partnerName, payout.bankReference], params?.search),
    );
    items.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

    const settled = items.filter((payout) => payout.status === PAYOUT_STATUS.PAID);

    return delay({
      ...paginate(items, params),
      totalAmount: round2(settled.reduce((sum, payout) => sum + payout.amount, 0)),
      totalBookingsCount: settled.reduce((sum, payout) => sum + payout.bookingsCount, 0),
    });
  },

  /**
   * The amount and the IBAN are taken from the wallet at call time. Anything the caller
   * sent for either is ignored on purpose — a tampered or buggy client must not be able
   * to change what gets paid.
   */
  record: (input: RecordPayoutInput & { amount?: never; iban?: never }) => {
    const wallet = walletOf(input.partnerId);
    const partner = partnerOf(input.partnerId);
    if (!wallet || !partner) {
      return delay(
        Promise.reject(new ApiError('الشريك غير موجود', 404, 'NOT_FOUND')),
      ) as Promise<never>;
    }

    const blocker = payoutBlocker(wallet);
    if (blocker) return failNotEligible(blocker);

    const reference = input.bankReference.trim();
    if (payoutStore.some((payout) => payout.bankReference === reference)) {
      return delay(
        Promise.reject(
          new ApiError('هذا المرجع البنكي مستخدم في حوالة أخرى', 409, 'DUPLICATE_BANK_REFERENCE'),
        ),
      ) as Promise<never>;
    }

    const paidAt = input.paidAt ?? nowIso();
    if (new Date(paidAt).getTime() > BASE_NOW.getTime()) {
      return delay(
        Promise.reject(new ApiError('تاريخ التحويل لا يمكن أن يكون في المستقبل', 422, 'VALIDATION_ERROR')),
      ) as Promise<never>;
    }

    const period = seed.riyadhPeriodMonth(paidAt);
    if (paidPayoutIn(input.partnerId, period)) {
      return failNotEligible('already_paid_this_month');
    }

    const bank = seed.bankDetailsByPartner[input.partnerId];
    const covered = unsettledBookings(input.partnerId);
    const amount = wallet.availableBalance;
    const id = `pay_${String(payoutStore.length + 1).padStart(3, '0')}`;

    const payout: Payout = {
      id,
      reference: `PYT-${period.replace('-', '')}-${String(payoutStore.length + 1).padStart(3, '0')}`,
      partnerId: partner.id,
      partnerName: partner.name,
      periodMonth: period,
      amount,
      bookingsCount: covered.length,
      currency: 'SAR',
      status: PAYOUT_STATUS.PAID,
      paidAt,
      bankReference: reference,
      // Frozen at record time: the row must show where the money went, not where the
      // partner's account points today.
      ibanMasked: bank ? `••••${bank.iban.slice(-4)}` : '••••',
      bankName: bank?.bankName ?? null,
      note: input.note?.trim() || null,
      reversedAt: null,
      reversalReason: null,
    };

    payoutStore.push(payout);
    coverageStore[id] = covered;

    appendLedgerRow(partner.id, {
      type: 'payout',
      amount: -amount,
      refType: 'payout',
      refId: id,
      refCode: payout.reference,
      description: `حوالة صادرة ${payout.reference}`,
      createdAt: paidAt,
      createdByAdminId: seed.financeAdminProfile.id,
    });

    return delay({ ok: true as const, payoutId: id, reference: payout.reference });
  },
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

/** Inclusive lower bound of a stats range. `today` means the calendar day, not 24h. */
function approvalRangeStart(range: ApprovalStatsRange): Date {
  const start = new Date(BASE_NOW);
  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    return start;
  }
  start.setDate(start.getDate() - (range === '7d' ? 7 : 30));
  return start;
}

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

  /**
   * `pendingReview` is queue depth, so it ignores the range — the other three describe
   * decisions taken inside it.
   */
  stats: (range: ApprovalStatsRange = 'today'): Promise<ApprovalStatsResponse> => {
    const decided = seed.approvalDecisions.filter(
      (decision) => new Date(decision.at).getTime() >= approvalRangeStart(range).getTime(),
    );
    const reviewHours = decided.reduce((sum, decision) => sum + decision.reviewHours, 0);

    return delay({
      pendingReview: seed.platformTotals.pendingApprovals,
      approved: decided.filter((decision) => decision.approved).length,
      rejected: decided.filter((decision) => !decision.approved).length,
      // null, not 0 — an empty window has no average, and 0 would read as "instant".
      avgReviewHours: decided.length ? Math.round((reviewHours / decided.length) * 10) / 10 : null,
      avgReviewSample: decided.length,
      range,
    });
  },

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
      // The seeded series are gross (VAT-inclusive), so the split comes off the total.
      totalVat: round2(
        seed.revenueSeries.reduce((sum, point) => sum + splitPrice(point.revenue).vat, 0),
      ),
      netRevenue: round2(
        seed.revenueSeries.reduce((sum, point) => sum + splitPrice(point.revenue).netBase, 0),
      ),
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

    const netRevenue = round2(
      revenueSeries.reduce((sum, point) => sum + splitPrice(point.revenue).netBase, 0),
    );
    // Derived by subtraction, exactly as the admin endpoint derives it (`total − taxes`),
    // so `netRevenue + vatCollected === totalRevenue` holds to the halala instead of
    // drifting a cent from two independently rounded sums.
    const vatCollected = round2(totalRevenue - netRevenue);
    const paidPayouts = payoutStore.filter((payout) => payout.status === PAYOUT_STATUS.PAID);

    return delay({
      totalRevenue,
      totalCommission,
      netRevenue,
      // `vatCollected`, not `vat` — this mock stands in for /ADMIN/reports/summary, and
      // the two report endpoints have genuinely different vocabularies. `fees` and
      // `netProfit` belong to the partner endpoint and are deliberately absent here.
      vatCollected,
      // What the partners keep out of the net base, after the platform's commission.
      partnersShare: round2(netRevenue - totalCommission),
      payoutsPaid: round2(paidPayouts.reduce((sum, payout) => sum + payout.amount, 0)),
      // Owed and sitting in wallets — money the platform still holds.
      payoutsPending: round2(
        walletStore.reduce((sum, wallet) => sum + Math.max(0, wallet.availableBalance), 0),
      ),
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
