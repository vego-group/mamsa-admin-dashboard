/**
 * Complaints mock — stateful, like the payout mock, because the feature is a state
 * machine (review → approve → execute → settle) with an idempotency store guarding the one
 * step that moves money. A stateless mock could not exercise any of §4 of the spec.
 *
 * Money is read off the seeded booking's frozen split — `total`, `vat`, `commission`,
 * `partnerShare`: stored values, exactly like the API's columns — and converted to
 * halalas. Nothing here multiplies by a commission rate. The UI renders the API's figures
 * as sent, and in mock mode this module *is* the API.
 *
 * Since the contract update of 2026-09-06 the backend refuses a second execution while a
 * refund is `pending` (or already `succeeded`) with `409 REFUND_IN_FLIGHT`, and so does
 * this mock — under a **new** key; a replay of the original key still answers with the
 * original result. The page's own gate (`refundGate`, §4.6) stays as the first layer, so
 * the click is never made; this is the second, so the request is refused if it is. In
 * the same update `maxRefundableHalalas` began subtracting in-flight money too.
 *
 * Like the rest of the seed this runs on the frozen clock (`BASE_NOW`, 2026-07-27).
 */
import { ApiError, VALIDATION_ERROR } from '@/lib/api/client';
import { formatHalalas } from '@/lib/complaints/money';
import { COMPLAINT_REFUND_STATUS, COMPLAINT_STATUS, type ComplaintStatus } from '@/lib/constants';
import type {
  ApproveComplaintInput,
  Booking,
  ComplaintDetail,
  ComplaintListParams,
  ComplaintRefund,
  ComplaintRow,
  Halalas,
  ID,
  Paginated,
  RefundComplaintInput,
  RefundComplaintResult,
  RejectComplaintInput,
} from '@/types';
import * as seed from './seed';
import { BASE_NOW, daysAgo, delay, matches, paginate } from './utils';

const toHalalas = (sar: number): Halalas => Math.round(sar * 100);

/** Stand-ins for signed attachment URLs: the seed's own photography, so the grid renders. */
const ATTACHMENT_POOL = [
  'photo-1502672260266-1c1ef2d93688',
  'photo-1493809842364-78817add7ffb',
  'photo-1449844908441-8829872d2607',
  'photo-1518780664697-55e3ad937233',
];

interface ComplaintRecord {
  id: number;
  bookingCode: string;
  status: ComplaintStatus;
  description: string;
  contactedPartner: boolean;
  internalNote: string | null;
  guestMessage: string | null;
  /** Indexes into ATTACHMENT_POOL. */
  attachments: number[];
  createdAt: string;
  reviewedAt: string | null;
  approvedRefundHalalas: Halalas | null;
  approvedAt: string | null;
  refunds: ComplaintRefund[];
}

interface RefundSeed {
  status: ComplaintRefund['status'];
  createdAt: string;
  failureReason?: string;
  moyasarRefundId?: string;
}

interface ComplaintSeed extends Omit<ComplaintRecord, 'refunds' | 'approvedRefundHalalas'> {
  /** SAR; converted to halalas once, when the store is built. */
  approvedSar?: number;
  refunds?: RefundSeed[];
}

/**
 * One row per state the screens have to render: the two pre-decision states, an
 * approved complaint with nothing in flight, one blocked on a pending refund, one whose
 * only attempt failed, a settled one with a failed attempt in its history, a rejection,
 * and a Mamsa-owned unit under review. Twelve rows so the list paginates.
 */
const COMPLAINT_SEEDS: ComplaintSeed[] = [
  {
    id: 1001,
    bookingCode: 'BKG-8841',
    status: COMPLAINT_STATUS.SUBMITTED,
    description:
      'الوحدة لم تكن نظيفة عند الوصول، والمكيف في غرفة النوم الرئيسية لا يعمل طوال الإقامة. تواصلت مع الشريك في اليوم الأول ووعد بإرسال فني ولم يحضر أحد.',
    contactedPartner: true,
    internalNote: null,
    guestMessage: null,
    attachments: [0, 1],
    createdAt: daysAgo(0, 5),
    reviewedAt: null,
    approvedAt: null,
  },
  {
    id: 1002,
    bookingCode: 'BKG-8836',
    status: COMPLAINT_STATUS.SUBMITTED,
    description:
      'عدد الأسرّة الفعلي أقل من المعلن في الإعلان (سريران بدل ثلاثة)، واضطررنا لشراء فراش إضافي.',
    contactedPartner: false,
    internalNote: null,
    guestMessage: null,
    attachments: [],
    createdAt: daysAgo(1, 2),
    reviewedAt: null,
    approvedAt: null,
  },
  {
    // Mamsa-owned unit: the refund runs, no partner wallet is debited.
    id: 1003,
    bookingCode: 'BKG-8834',
    status: COMPLAINT_STATUS.UNDER_REVIEW,
    description: 'انقطاع الماء الساخن في اليومين الأخيرين من الإقامة، ولم يُحل رغم التواصل.',
    contactedPartner: true,
    internalNote:
      'تم الاتصال بالضيف — الرواية متسقة. الوحدة مملوكة لممسى، فالتعويض يخصم من الإيراد لا من محفظة شريك.',
    guestMessage: null,
    attachments: [2],
    createdAt: daysAgo(2),
    reviewedAt: daysAgo(1, 4),
    approvedAt: null,
  },
  {
    id: 1004,
    bookingCode: 'BKG-8832',
    status: COMPLAINT_STATUS.APPROVED,
    description:
      'ضجيج أعمال بناء ملاصقة من الساعة السابعة صباحاً طوال الإقامة، ولم يُذكر ذلك في الإعلان.',
    contactedPartner: true,
    internalNote: 'الشريك أقرّ بوجود الأعمال. اعتُمد تعويض ليلة واحدة تقريباً.',
    guestMessage: 'تمت الموافقة على تعويض جزئي عن الإزعاج، وسيصلك خلال أيام العمل القادمة.',
    attachments: [1, 3],
    createdAt: daysAgo(3),
    reviewedAt: daysAgo(2, 6),
    approvedSar: 600,
    approvedAt: daysAgo(0, 20),
  },
  {
    // Executed, not settled: the state §4.6 exists for.
    id: 1005,
    bookingCode: 'BKG-8830',
    status: COMPLAINT_STATUS.APPROVED,
    description: 'المسبح كان خارج الخدمة طوال الإقامة رغم أنه السبب الرئيسي للحجز.',
    contactedPartner: true,
    internalNote: 'الشريك أكّد الصيانة. التعويض عن المرفق لا عن الإقامة كاملة.',
    guestMessage: 'تمت الموافقة على تعويض عن تعطّل المسبح.',
    attachments: [0],
    createdAt: daysAgo(5),
    reviewedAt: daysAgo(4, 3),
    approvedSar: 1200,
    approvedAt: daysAgo(2, 1),
    refunds: [{ status: COMPLAINT_REFUND_STATUS.PENDING, createdAt: daysAgo(0, 1) }],
  },
  {
    // The only attempt failed: retry is allowed, with a fresh key.
    id: 1006,
    bookingCode: 'BKG-8827',
    status: COMPLAINT_STATUS.APPROVED,
    description: 'الوحدة تختلف عن الصور: الأثاث قديم ومتهالك وبعض الأجهزة لا تعمل.',
    contactedPartner: false,
    internalNote: null,
    guestMessage: 'تمت الموافقة على تعويض جزئي.',
    attachments: [3, 2, 0],
    createdAt: daysAgo(6),
    reviewedAt: daysAgo(5, 2),
    approvedSar: 900,
    approvedAt: daysAgo(3, 5),
    refunds: [
      {
        status: COMPLAINT_REFUND_STATUS.FAILED,
        createdAt: daysAgo(1, 3),
        failureReason:
          'رفضت بوابة الدفع الطلب: المعاملة الأصلية غير قابلة للاسترداد حالياً (refund_not_allowed). أعد المحاولة لاحقاً.',
      },
    ],
  },
  {
    id: 1007,
    bookingCode: 'BKG-8824',
    status: COMPLAINT_STATUS.RESOLVED_REFUNDED,
    description: 'الكهرباء انقطعت ليلة كاملة ولم يوفر الشريك بديلاً.',
    contactedPartner: true,
    internalNote: 'المحاولة الأولى فشلت لخطأ مؤقت في البوابة؛ الثانية سُوّيت.',
    guestMessage: 'تمت الموافقة على تعويض عن ليلة الانقطاع.',
    attachments: [],
    createdAt: daysAgo(9),
    reviewedAt: daysAgo(8, 4),
    approvedSar: 2500,
    approvedAt: daysAgo(6, 2),
    refunds: [
      {
        status: COMPLAINT_REFUND_STATUS.FAILED,
        createdAt: daysAgo(4),
        failureReason: 'انتهت مهلة الاتصال ببوابة الدفع (gateway_timeout).',
      },
      {
        status: COMPLAINT_REFUND_STATUS.SUCCEEDED,
        createdAt: daysAgo(3, 20),
        moyasarRefundId: 'refund_2pq8LkX9mN3vR7tY',
      },
    ],
  },
  {
    id: 1008,
    bookingCode: 'BKG-8821',
    status: COMPLAINT_STATUS.RESOLVED_REJECTED,
    description: 'لم يعجبني موقع الوحدة، بعيدة عن الخدمات.',
    contactedPartner: false,
    internalNote: 'الموقع مطابق للخريطة في الإعلان. لا أساس للشكوى.',
    guestMessage:
      'بعد المراجعة تبيّن أن الموقع مطابق لما هو معلن على الخريطة، ولا يمكن قبول الشكوى.',
    attachments: [],
    createdAt: daysAgo(10),
    reviewedAt: daysAgo(9),
    approvedAt: null,
  },
  {
    id: 1009,
    bookingCode: 'BKG-8819',
    status: COMPLAINT_STATUS.SUBMITTED,
    description: 'وجدنا حشرات في المطبخ، والصور مرفقة.',
    contactedPartner: true,
    internalNote: null,
    guestMessage: null,
    attachments: [3],
    createdAt: daysAgo(0, 9),
    reviewedAt: null,
    approvedAt: null,
  },
  {
    id: 1010,
    bookingCode: 'BKG-8817',
    status: COMPLAINT_STATUS.UNDER_REVIEW,
    description: 'الشريك تأخر في تسليم المفاتيح ثلاث ساعات ولم يرد على الاتصالات.',
    contactedPartner: true,
    internalNote: 'الشريك لم يرد على اتصال الإدارة أيضاً.',
    guestMessage: null,
    attachments: [],
    createdAt: daysAgo(2, 6),
    reviewedAt: daysAgo(1, 1),
    approvedAt: null,
  },
  {
    id: 1011,
    bookingCode: 'BKG-9000',
    status: COMPLAINT_STATUS.SUBMITTED,
    description: 'الإنترنت لم يعمل طوال الإقامة رغم إدراجه ضمن المرافق.',
    contactedPartner: false,
    internalNote: null,
    guestMessage: null,
    attachments: [],
    createdAt: daysAgo(0, 1),
    reviewedAt: null,
    approvedAt: null,
  },
  {
    id: 1012,
    bookingCode: 'BKG-9010',
    status: COMPLAINT_STATUS.RESOLVED_REJECTED,
    description: 'أريد استرداداً لأن الطقس كان سيئاً.',
    contactedPartner: false,
    internalNote: 'سبب خارج نطاق الشكاوى.',
    guestMessage: 'الشكوى خارج نطاق الأمور التي تغطيها سياسة التعويض.',
    attachments: [],
    createdAt: daysAgo(14),
    reviewedAt: daysAgo(13),
    approvedAt: null,
  },
];

function bookingOf(code: string): Booking {
  const booking = seed.bookings.find((row) => row.code === code);
  if (!booking) throw new Error(`complaints seed: unknown booking ${code}`);
  return booking;
}

/**
 * The partner's part of a refund. A ratio of two **stored** figures — the frozen partner
 * share over the frozen gross — never a rate. The real backend derives this from the rate
 * frozen on the booking; the UI shows whichever number arrives and computes nothing.
 */
function partnerHalalasFor(booking: Booking, amountHalalas: Halalas): Halalas {
  if (booking.mamsaOwned) return 0;
  const gross = toHalalas(booking.total);
  return gross === 0 ? 0 : Math.round((amountHalalas * toHalalas(booking.partnerShare)) / gross);
}

let refundSequence = 5000;
let tick = 0;

/** The frozen clock, advanced a second per write so rows keep a stable order. */
const stamp = () => new Date(BASE_NOW.getTime() + (tick += 1) * 1000).toISOString();

function buildRecord(input: ComplaintSeed): ComplaintRecord {
  const { approvedSar, refunds, ...rest } = input;
  const booking = bookingOf(rest.bookingCode);
  const approved = approvedSar === undefined ? null : toHalalas(approvedSar);

  return {
    ...rest,
    approvedRefundHalalas: approved,
    refunds: (refunds ?? []).map((row) => ({
      id: (refundSequence += 1),
      status: row.status,
      amountHalalas: approved ?? 0,
      partnerHalalas: partnerHalalasFor(booking, approved ?? 0),
      failureReason: row.failureReason ?? null,
      moyasarRefundId:
        row.moyasarRefundId ??
        (row.status === COMPLAINT_REFUND_STATUS.FAILED ? null : `refund_mock${refundSequence}`),
      createdAt: row.createdAt,
    })),
  };
}

let store: ComplaintRecord[] = COMPLAINT_SEEDS.map(buildRecord);
const idempotency = new Map<string, { complaintId: number; result: RefundComplaintResult }>();

function findRecord(id: ID): ComplaintRecord | undefined {
  return store.find((record) => record.id === Number(id));
}

const sumWhere = (record: ComplaintRecord, status: ComplaintRefund['status']): Halalas =>
  record.refunds
    .filter((row) => row.status === status)
    .reduce((sum, row) => sum + row.amountHalalas, 0);

/** Settled money. */
const succeededHalalas = (record: ComplaintRecord): Halalas =>
  sumWhere(record, COMPLAINT_REFUND_STATUS.SUCCEEDED);

/** Money at the gateway, not settled yet. */
const pendingHalalas = (record: ComplaintRecord): Halalas =>
  sumWhere(record, COMPLAINT_REFUND_STATUS.PENDING);

/** Settled and in-flight money both come off the ceiling (contract of 2026-09-06). */
const maxRefundable = (record: ComplaintRecord): Halalas =>
  toHalalas(bookingOf(record.bookingCode).total) - succeededHalalas(record) - pendingHalalas(record);

/** The newest row whose money moved or is moving — what the backend's guard names. */
const refundInFlight = (record: ComplaintRecord): ComplaintRefund | undefined =>
  [...record.refunds]
    .reverse()
    .find(
      (row) =>
        row.status === COMPLAINT_REFUND_STATUS.PENDING ||
        row.status === COMPLAINT_REFUND_STATUS.SUCCEEDED,
    );

const moneyMoving = (record: ComplaintRecord): boolean => refundInFlight(record) !== undefined;

/** A fresh signature on every read, the way a real signed URL rotates. */
function signedUrl(index: number): string {
  const expires = Math.floor((BASE_NOW.getTime() + 15 * 60_000) / 1000);
  const signature = Math.random().toString(36).slice(2, 12);
  return `https://images.unsplash.com/${ATTACHMENT_POOL[index]}?auto=format&fit=crop&w=1200&q=60&exp=${expires}&sig=${signature}`;
}

const MAMSA_PARTNER_NAME = 'ممسى';

function toRow(record: ComplaintRecord): ComplaintRow {
  const booking = bookingOf(record.bookingCode);
  return {
    id: record.id,
    status: record.status,
    bookingCode: booking.code,
    unitName: booking.unitName,
    guestName: booking.guestName,
    partnerName: booking.mamsaOwned ? MAMSA_PARTNER_NAME : booking.partnerName,
    hasAttachments: record.attachments.length > 0,
    createdAt: record.createdAt,
  };
}

function toDetail(record: ComplaintRecord): ComplaintDetail {
  const booking = bookingOf(record.bookingCode);
  const partner = seed.partners.find((row) => row.id === booking.partnerId);
  const wallet = seed.wallets.find((row) => row.partnerId === booking.partnerId);
  const alreadyRefundedHalalas = succeededHalalas(record);
  const pendingRefundHalalas = pendingHalalas(record);

  return {
    complaint: {
      id: record.id,
      status: record.status,
      description: record.description,
      contactedPartner: record.contactedPartner,
      internalNote: record.internalNote,
      guestMessage: record.guestMessage,
      reviewedAt: record.reviewedAt,
      approvedRefundHalalas: record.approvedRefundHalalas,
      approvedAt: record.approvedAt,
      canAmendApproval: record.status === COMPLAINT_STATUS.APPROVED && !moneyMoving(record),
      createdAt: record.createdAt,
    },
    attachments: record.attachments.map((index) => ({ url: signedUrl(index), mime: 'image/jpeg' })),
    booking: {
      code: booking.code,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      grossHalalas: toHalalas(booking.total),
      vatHalalas: toHalalas(booking.vat),
      commissionHalalas: toHalalas(booking.commission),
      partnerShareHalalas: toHalalas(booking.partnerShare),
      alreadyRefundedHalalas,
      pendingRefundHalalas,
      maxRefundableHalalas: toHalalas(booking.total) - alreadyRefundedHalalas - pendingRefundHalalas,
      mamsaOwned: booking.mamsaOwned,
    },
    guest: { name: booking.guestName, phone: booking.guestPhone },
    partner: booking.mamsaOwned
      ? { name: MAMSA_PARTNER_NAME, phone: null, availableBalanceHalalas: 0 }
      : {
          name: partner?.name ?? null,
          phone: partner?.phone ?? null,
          availableBalanceHalalas: toHalalas(wallet?.availableBalance ?? 0),
        },
    unit: { id: Number.parseInt(booking.unitId.replace(/\D/g, ''), 10) || null, name: booking.unitName },
    refunds: record.refunds.map((row) => ({ ...row })),
  };
}

const fail = (error: ApiError) => delay(Promise.reject(error)) as Promise<never>;
const notFound = () => fail(new ApiError('الشكوى غير موجودة', 404, 'NOT_FOUND'));
const conflict = (message = 'لا يمكن تنفيذ هذا الإجراء في الحالة الحالية للشكوى') =>
  fail(new ApiError(message, 409, 'CONFLICT'));

function amountError(amount: unknown, max: Halalas): ApiError | null {
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    return new ApiError('المبلغ غير صالح', 422, VALIDATION_ERROR, null, {
      amountHalalas: 'المبلغ يجب أن يكون عدداً صحيحاً من الهللات أكبر من صفر',
    });
  }
  if (amount > max) {
    return new ApiError('المبلغ أكبر من المتاح للاسترداد', 422, 'AMOUNT_EXCEEDS_REFUNDABLE', null, {
      amountHalalas: `الحد الأقصى المتاح للاسترداد ${formatHalalas(max)}`,
    });
  }
  return null;
}

export const mockComplaints = {
  list: (params?: ComplaintListParams): Promise<Paginated<ComplaintRow>> => {
    let records = [...store];
    if (params?.status && params.status !== 'all') {
      records = records.filter((record) => record.status === params.status);
    }
    if (params?.search?.trim()) {
      // The documented scope: booking code, unit name, guest name, guest mobile.
      records = records.filter((record) => {
        const booking = bookingOf(record.bookingCode);
        return matches(
          [booking.code, booking.unitName, booking.guestName, booking.guestPhone],
          params.search,
        );
      });
    }
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return delay(paginate(records.map(toRow), params));
  },

  get: (id: ID): Promise<ComplaintDetail> => {
    const record = findRecord(id);
    return record ? delay(toDetail(record)) : notFound();
  },

  review: (id: ID) => {
    const record = findRecord(id);
    if (!record) return notFound();
    if (record.status !== COMPLAINT_STATUS.SUBMITTED) return conflict();

    record.status = COMPLAINT_STATUS.UNDER_REVIEW;
    record.reviewedAt = stamp();
    return delay({ ok: true as const });
  },

  approve: (id: ID, input: ApproveComplaintInput) => {
    const record = findRecord(id);
    if (!record) return notFound();
    if (record.status !== COMPLAINT_STATUS.UNDER_REVIEW) return conflict();

    const invalid = amountError(input.amountHalalas, maxRefundable(record));
    if (invalid) return fail(invalid);

    record.status = COMPLAINT_STATUS.APPROVED;
    record.approvedRefundHalalas = input.amountHalalas;
    record.approvedAt = stamp();
    record.guestMessage = input.guestMessage?.trim() || null;
    record.internalNote = input.internalNote?.trim() || record.internalNote;
    return delay({ ok: true as const });
  },

  amendApproval: (id: ID, amountHalalas: Halalas) => {
    const record = findRecord(id);
    if (!record) return notFound();
    if (record.status !== COMPLAINT_STATUS.APPROVED) return conflict();
    if (moneyMoving(record)) return conflict('لا يمكن تعديل المبلغ بعد بدء الاسترداد');

    const invalid = amountError(amountHalalas, maxRefundable(record));
    if (invalid) return fail(invalid);

    record.approvedRefundHalalas = amountHalalas;
    return delay({ ok: true as const });
  },

  refund: (id: ID, input: RefundComplaintInput): Promise<RefundComplaintResult> => {
    const record = findRecord(id);
    if (!record) return notFound();

    // A seen key answers with the original outcome — never a second refund.
    const seen = idempotency.get(input.idempotencyKey);
    if (seen) {
      if (seen.complaintId !== record.id) return conflict('مفتاح المحاولة مستخدم لشكوى أخرى');
      return delay({ ...seen.result, replayed: true as const });
    }

    // The backend's guard, mirrored: money already moving on this complaint refuses a
    // second execution outright, under a new key. Not an error the operator can act on —
    // the screen re-fetches and shows the attempt in flight instead.
    const inFlight = refundInFlight(record);
    if (inFlight) {
      return fail(
        new ApiError(
          'يوجد استرداد قيد التنفيذ على هذه الشكوى بالفعل',
          409,
          'REFUND_IN_FLIGHT',
          null,
          { refundId: String(inFlight.id) },
        ),
      );
    }

    if (record.status !== COMPLAINT_STATUS.APPROVED || record.approvedRefundHalalas === null) {
      return conflict();
    }
    if (input.amountHalalas !== record.approvedRefundHalalas) {
      return fail(
        new ApiError('المبلغ لا يطابق المبلغ المعتمد', 422, 'AMOUNT_NOT_APPROVED', null, {
          amountHalalas: `المبلغ المعتمد هو ${formatHalalas(record.approvedRefundHalalas)}`,
        }),
      );
    }

    const booking = bookingOf(record.bookingCode);
    const row: ComplaintRefund = {
      id: (refundSequence += 1),
      status: COMPLAINT_REFUND_STATUS.PENDING,
      amountHalalas: input.amountHalalas,
      partnerHalalas: partnerHalalasFor(booking, input.amountHalalas),
      failureReason: null,
      moyasarRefundId: `refund_${Math.random().toString(36).slice(2, 18)}`,
      createdAt: stamp(),
    };
    record.refunds.push(row);

    const result: RefundComplaintResult = { ok: true, refundId: row.id, status: 'pending' };
    idempotency.set(input.idempotencyKey, { complaintId: record.id, result });
    return delay(result);
  },

  reject: (id: ID, input: RejectComplaintInput) => {
    const record = findRecord(id);
    if (!record) return notFound();
    if (
      record.status !== COMPLAINT_STATUS.UNDER_REVIEW &&
      record.status !== COMPLAINT_STATUS.APPROVED
    ) {
      return conflict();
    }
    if (moneyMoving(record)) return conflict('لا يمكن رفض شكوى بدأ استردادها');
    if (!input.guestMessage?.trim()) {
      return fail(
        new ApiError('رسالة الضيف مطلوبة', 422, VALIDATION_ERROR, null, {
          guestMessage: 'اكتب الرسالة التي سيقرؤها الضيف',
        }),
      );
    }

    record.status = COMPLAINT_STATUS.RESOLVED_REJECTED;
    record.guestMessage = input.guestMessage.trim();
    record.internalNote = input.internalNote?.trim() || record.internalNote;
    return delay({ ok: true as const });
  },

  /**
   * Stands in for the webhook or the hourly settlement job. Not an endpoint — nothing in
   * the UI can call it, which is the point: the screen has to cope with a refund that
   * stays `pending` for as long as the gateway likes.
   */
  settle: (id: ID, outcome: 'succeeded' | 'failed', failureReason?: string) => {
    const record = findRecord(id);
    if (!record) return notFound();

    const pending = [...record.refunds]
      .reverse()
      .find((row) => row.status === COMPLAINT_REFUND_STATUS.PENDING);
    if (!pending) return conflict('لا يوجد استرداد معلّق لتسويته');

    if (outcome === 'failed') {
      pending.status = COMPLAINT_REFUND_STATUS.FAILED;
      pending.failureReason = failureReason ?? 'رفضت بوابة الدفع الطلب.';
      pending.moyasarRefundId = null;
    } else {
      pending.status = COMPLAINT_REFUND_STATUS.SUCCEEDED;
      record.status = COMPLAINT_STATUS.RESOLVED_REFUNDED;
    }
    return delay({ ok: true as const });
  },

  /** Test hook: back to the seed, idempotency store included. */
  reset: () => {
    store = COMPLAINT_SEEDS.map(buildRecord);
    idempotency.clear();
  },
};
