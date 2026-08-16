import {
  ACCOUNT_STATUS,
  BOOKING_STATUS,
  CANCELLATION_POLICY,
  CANCELLED_BY,
  DOCUMENT_STATUS,
  NOTIFICATION_CATEGORY,
  PARTNER_STATUS,
  PARTNER_TYPE,
  PAYMENT_STATUS,
  REFUND_STATUS,
  PAYOUT_STATUS,
  PAYOUT_TIMEZONE,
  type PayoutStatus,
  REQUEST_TYPE,
  ROLE_PERMISSIONS,
  UNIT_STATUS,
  UNIT_TYPE,
} from '@/lib/constants';
import {
  nightsBetween,
  splitCommission,
  splitForUnit,
  splitPrice,
  splitPriceForUnit,
} from '@/lib/utils/format';
import { resolveIneligibleReason } from '@/lib/wallets/eligibility';
import type {
  AdminProfile,
  AdminSession,
  ApprovalRequest,
  BankDetails,
  Booking,
  BookingDetail,
  Cancellation,
  NotificationItem,
  Partner,
  PartnerDetail,
  PartnerDocument,
  PartnerLedgerEntry,
  PartnerWallet,
  Payout,
  PolicySnapshot,
  Unit,
  UnitDetail,
  User,
  UserDetail,
} from '@/types';
import { BASE_NOW, daysAgo, daysAhead, seeded } from './utils';

/** One resolved review, as the mock stats endpoint counts them. */
export interface ApprovalDecision {
  at: string;
  approved: boolean;
  reviewHours: number;
}

/* ------------------------------------------------------------------ admin */

export const adminProfile: AdminProfile = {
  id: 'adm_1',
  name: 'Super Admin',
  email: 'admin@mamsa.sa',
  phone: '+966500000000',
  role: 'superadmin',
  permissions: [...ROLE_PERMISSIONS.superadmin],
  verified: true,
  memberSince: '2023-01-15T00:00:00.000Z',
  totalReviews: 284,
  actionsToday: 12,
  preferredLocale: 'ar',
};

/** Second admin account so the role split is exercisable in mock mode. */
export const financeAdminProfile: AdminProfile = {
  id: 'adm_2',
  name: 'سارة القحطاني',
  email: 'finance@mamsa.sa',
  phone: '+966500000002',
  role: 'finance',
  permissions: [...ROLE_PERMISSIONS.finance],
  verified: true,
  memberSince: '2024-03-04T00:00:00.000Z',
  totalReviews: 0,
  actionsToday: 6,
  preferredLocale: 'ar',
};

/** Sign-in directory for the mock. Any six-digit code signs in — see mockAuth. */
export const admins: AdminProfile[] = [adminProfile, financeAdminProfile];

export const adminSessions: AdminSession[] = [
  {
    id: 'ses_1',
    device: 'MacBook Pro',
    browser: 'Chrome',
    city: 'Riyadh',
    current: true,
    lastActiveAt: daysAgo(0),
  },
  {
    id: 'ses_2',
    device: 'iPhone 15',
    browser: 'Safari',
    city: 'Jeddah',
    current: false,
    lastActiveAt: daysAgo(1),
  },
];

/* ------------------------------------------------------------------ users */

export const users: User[] = [
  ['USR-001', 'أحمد محمد الغامدي', 'ahmed.ghamdi@mail.com', '+966572413911', 'Riyadh', 14, 18450, 1230, ACCOUNT_STATUS.ACTIVE, true],
  ['USR-002', 'سارة عبدالله القحطاني', 'sara.qahtani@mail.com', '+966597014667', 'Jeddah', 8, 9820, 1160, ACCOUNT_STATUS.ACTIVE, false],
  ['USR-003', 'محمد علي الزهراني', 'moh.zahrani@mail.com', '+966578575113', 'Makkah', 22, 31200, 1290, ACCOUNT_STATUS.ACTIVE, true],
  ['USR-004', 'فاطمة حسن العتيبي', null, '+966563840862', 'Madinah', 5, 4750, 1105, ACCOUNT_STATUS.DISABLED, false],
  ['USR-005', 'عبدالرحمن خالد السهلي', 'ar.sahli@mail.com', '+966502845094', 'Dammam', 3, 2890, 1020, ACCOUNT_STATUS.ACTIVE, false],
  ['USR-006', 'نورة سعد الدوسري', 'noura.dosari@mail.com', '+966594601565', 'Riyadh', 1, 1250, 560, ACCOUNT_STATUS.ACTIVE, false],
  ['USR-007', 'خالد إبراهيم الشمري', 'khalid.shamri@mail.com', '+966558441502', 'Jeddah', 31, 47800, 1610, ACCOUNT_STATUS.ACTIVE, true],
  ['USR-008', 'ريم عمر البقمي', 'reem.baqami@mail.com', '+966505751536', 'Riyadh', 0, 0, 540, ACCOUNT_STATUS.DISABLED, false],
  ['USR-009', 'سلطان فهد الحربي', 'sultan.harbi@mail.com', '+966551230098', 'Khobar', 6, 7300, 700, ACCOUNT_STATUS.ACTIVE, false],
  ['USR-010', 'منى صالح العنزي', null, '+966547788221', 'Abha', 2, 1980, 300, ACCOUNT_STATUS.ACTIVE, false],
  ['USR-011', 'ياسر ناصر المطيري', 'yasser.mutairi@mail.com', '+966533445566', 'Taif', 9, 11400, 880, ACCOUNT_STATUS.ACTIVE, true],
  ['USR-012', 'هدى عبدالعزيز الزهراني', 'huda.zahrani@mail.com', '+966566778899', 'Madinah', 4, 5120, 420, ACCOUNT_STATUS.ACTIVE, false],
].map(
  ([code, name, email, phone, city, bookingsCount, totalSpent, joinedDays, status, hasActiveBookings]) => ({
    id: String(code).toLowerCase().replace('-', '_'),
    code: code as string,
    name: name as string,
    email: email as string | null,
    phone: phone as string,
    city: city as string,
    bookingsCount: bookingsCount as number,
    totalSpent: totalSpent as number,
    joinedAt: daysAgo(joinedDays as number),
    status: status as User['status'],
    hasActiveBookings: hasActiveBookings as boolean,
  }),
);

export function userDetail(user: User): UserDetail {
  // Milestones are offsets from the day this account joined — a fixed date would put
  // "first booking" before "account created" for anyone who signed up recently.
  const joinedDaysAgo = Math.round(
    (BASE_NOW.getTime() - new Date(user.joinedAt).getTime()) / 86_400_000,
  );
  const after = (days: number) => daysAgo(Math.max(0, joinedDaysAgo - days));

  return {
    ...user,
    avgBookingValue: user.bookingsCount ? Math.round(user.totalSpent / user.bookingsCount) : 0,
    activity: [
      { id: 'a1', label: 'Account created', at: user.joinedAt },
      ...(user.bookingsCount ? [{ id: 'a2', label: 'First booking made', at: after(34) }] : []),
      { id: 'a3', label: 'Profile completed', at: after(35) },
    ],
  };
}

/* --------------------------------------------------------------- partners */

interface PartnerSeed {
  code: string;
  name: string;
  type: Partner['type'];
  city: string;
  units: number;
  bookings: number;
  revenue: number;
  rating: number;
  verified: boolean;
  status: Partner['status'];
  cancellations: number;
  flagged: boolean;
}

const partnerSeeds: PartnerSeed[] = [
  { code: 'PTR-001', name: 'عبدالله محمد الفيصل', type: PARTNER_TYPE.INDIVIDUAL, city: 'Riyadh', units: 8, bookings: 312, revenue: 487000, rating: 4.8, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 3, flagged: false },
  { code: 'PTR-002', name: 'شركة الأفق العقارية', type: PARTNER_TYPE.COMPANY, city: 'Jeddah', units: 45, bookings: 1247, revenue: 1900000, rating: 4.6, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 11, flagged: false },
  { code: 'PTR-003', name: 'محمد سالم الغريب', type: PARTNER_TYPE.INDIVIDUAL, city: 'Makkah', units: 3, bookings: 87, revenue: 124000, rating: 4.2, verified: false, status: PARTNER_STATUS.PENDING, cancellations: 1, flagged: false },
  { code: 'PTR-004', name: 'مجموعة النخيل للضيافة', type: PARTNER_TYPE.COMPANY, city: 'Madinah', units: 22, bookings: 634, revenue: 892000, rating: 4.7, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 6, flagged: false },
  { code: 'PTR-005', name: 'فهد ناصر العنزي', type: PARTNER_TYPE.INDIVIDUAL, city: 'Dammam', units: 5, bookings: 143, revenue: 198000, rating: 4.5, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 5, flagged: true },
  { code: 'PTR-006', name: 'شركة بيوت الجزيرة', type: PARTNER_TYPE.COMPANY, city: 'Riyadh', units: 67, bookings: 2134, revenue: 3400000, rating: 4.9, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 18, flagged: false },
  { code: 'PTR-007', name: 'سلمى جمال الحكمي', type: PARTNER_TYPE.INDIVIDUAL, city: 'Jeddah', units: 2, bookings: 41, revenue: 62000, rating: 3.9, verified: true, status: PARTNER_STATUS.SUSPENDED, cancellations: 7, flagged: true },
  { code: 'PTR-008', name: 'مؤسسة الواحة للإيجار', type: PARTNER_TYPE.COMPANY, city: 'Riyadh', units: 18, bookings: 489, revenue: 734000, rating: 4.4, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 9, flagged: false },
  { code: 'PTR-009', name: 'سعد عبدالكريم الجهني', type: PARTNER_TYPE.INDIVIDUAL, city: 'Madinah', units: 4, bookings: 112, revenue: 143000, rating: 3.7, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 22, flagged: true },
  { code: 'PTR-010', name: 'شركة الدرة العقارية', type: PARTNER_TYPE.COMPANY, city: 'Khobar', units: 12, bookings: 268, revenue: 402000, rating: 4.3, verified: false, status: PARTNER_STATUS.PENDING, cancellations: 2, flagged: false },
  // PTR-011..014 exist to give the payout cycle enough payable partners to be realistic:
  // six eligible at once, plus one already paid for the current month.
  { code: 'PTR-011', name: 'شركة رمال الشرق', type: PARTNER_TYPE.COMPANY, city: 'Dammam', units: 9, bookings: 214, revenue: 318000, rating: 4.6, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 4, flagged: false },
  { code: 'PTR-012', name: 'نورة سعد الدوسري', type: PARTNER_TYPE.INDIVIDUAL, city: 'Riyadh', units: 6, bookings: 176, revenue: 241000, rating: 4.7, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 3, flagged: false },
  { code: 'PTR-013', name: 'مجموعة سدير للإسكان', type: PARTNER_TYPE.COMPANY, city: 'Riyadh', units: 15, bookings: 402, revenue: 613000, rating: 4.5, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 8, flagged: false },
  { code: 'PTR-014', name: 'خالد يوسف الحربي', type: PARTNER_TYPE.INDIVIDUAL, city: 'Jeddah', units: 4, bookings: 121, revenue: 167000, rating: 4.4, verified: true, status: PARTNER_STATUS.ACTIVE, cancellations: 2, flagged: false },
];

export const partners: Partner[] = partnerSeeds.map((seed, index) => ({
  id: seed.code.toLowerCase().replace('-', '_'),
  code: seed.code,
  name: seed.name,
  type: seed.type,
  city: seed.city,
  email: `partner${index + 1}@mamsa-partners.sa`,
  phone: `+9665${String(51234567 + index * 111).padStart(8, '0')}`,
  joinedAt: daysAgo(1200 - index * 90),
  unitsCount: seed.units,
  bookingsCount: seed.bookings,
  revenue: seed.revenue,
  rating: seed.rating,
  verified: seed.verified,
  status: seed.status,
  cancellations12m: seed.cancellations,
  cancellationRate: seed.bookings ? Number(((seed.cancellations / seed.bookings) * 100).toFixed(1)) : 0,
  flagged: seed.flagged,
  // Mirrors the backend: suspension is `users.is_active === false`, and the four-state
  // status string is derived from it plus `partner_details.status`.
  isActive: seed.status !== PARTNER_STATUS.SUSPENDED,
}));

function documentsFor(partner: Partner): PartnerDocument[] {
  const pending = partner.status === PARTNER_STATUS.PENDING;
  const state = pending ? DOCUMENT_STATUS.PENDING_REVIEW : DOCUMENT_STATUS.VERIFIED;

  if (partner.type === PARTNER_TYPE.INDIVIDUAL) {
    return [
      { id: `${partner.id}_nid`, kind: 'national_id', label: 'National ID', value: '1010101010', fileUrl: null, status: state },
      { id: `${partner.id}_permit_no`, kind: 'tourism_permit', label: 'Tourism Permit', value: '73101915', fileUrl: '/mock/permit.pdf', status: state },
    ];
  }

  return [
    { id: `${partner.id}_cr`, kind: 'commercial_registration', label: 'Commercial Registration', value: '2050123456', fileUrl: null, status: state },
    { id: `${partner.id}_iban`, kind: 'iban', label: 'IBAN', value: 'SA0380000000608010167519', fileUrl: null, status: state },
    { id: `${partner.id}_auth`, kind: 'authorization_letter', label: 'Authorization Letter', value: null, fileUrl: '/mock/authorization.pdf', status: state },
    { id: `${partner.id}_vat`, kind: 'vat_certificate', label: 'VAT Certificate', value: null, fileUrl: '/mock/vat.pdf', status: state },
    { id: `${partner.id}_lic`, kind: 'operator_license', label: 'Operator License', value: null, fileUrl: '/mock/license.pdf', status: state },
  ];
}

export function partnerDetail(partner: Partner): PartnerDetail {
  const documents = documentsFor(partner);
  const { commission, partnerShare } = splitForUnit(partner.revenue, false);
  const isCompany = partner.type === PARTNER_TYPE.COMPANY;

  return {
    ...partner,
    nationalId: isCompany ? null : '1010101010',
    tourismPermitNo: isCompany ? null : '73101915',
    crNumber: isCompany ? '2050123456' : null,
    iban: isCompany ? 'SA0380000000608010167519' : null,
    documents,
    documentsComplete: documents.every((d) => d.status === DOCUMENT_STATUS.VERIFIED),
    commissionPaid: commission,
    partnerEarning: partnerShare,
    avgPerBooking: partner.bookingsCount ? Math.round(partner.revenue / partner.bookingsCount) : 0,
    rejectionReason: null,
  };
}

/* ------------------------------------------------------------------ units */

/**
 * A pool rather than one photo: a grid of identical thumbnails hides real layout
 * problems (truncation, aspect ratios, badge contrast) that only show on varied art.
 */
const UNIT_IMAGES = [
  'photo-1613977257363-707ba9348227',
  'photo-1568605114967-8130f3a36994',
  'photo-1512917774080-9991f1c4c750',
  'photo-1600585154340-be6161a56a0c',
  'photo-1502672260266-1c1ef2d93688',
  'photo-1493809842364-78817add7ffb',
  'photo-1449844908441-8829872d2607',
  'photo-1518780664697-55e3ad937233',
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=60`);

const unitImage = (index: number) => UNIT_IMAGES[index % UNIT_IMAGES.length];

interface UnitSeed {
  code: string;
  name: string;
  partnerIndex: number;
  city: string;
  district: string;
  type: Unit['type'];
  status: Unit['status'];
  price: number;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  size: number;
  rating: number;
  reviews: number;
  occupancy: number;
  revenue: number;
  bookings: number;
  mamsaOwned?: boolean;
  rejectionReason?: string;
}

const unitSeeds: UnitSeed[] = [
  { code: 'UNT-001', name: 'شقة فاخرة — حي العليا', partnerIndex: 0, city: 'Riyadh', district: 'Al Olaya', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 850, bedrooms: 3, bathrooms: 2, capacity: 6, size: 180, rating: 4.9, reviews: 124, occupancy: 78, revenue: 182000, bookings: 96 },
  { code: 'UNT-002', name: 'فيلا مع مسبح خاص', partnerIndex: 0, city: 'Riyadh', district: 'Al Nakheel', type: UNIT_TYPE.VILLA, status: UNIT_STATUS.APPROVED, price: 2200, bedrooms: 5, bathrooms: 4, capacity: 10, size: 450, rating: 4.8, reviews: 87, occupancy: 64, revenue: 312000, bookings: 71 },
  { code: 'UNT-003', name: 'شاليه بحري — أبحر', partnerIndex: 1, city: 'Jeddah', district: 'Obhur', type: UNIT_TYPE.CHALET, status: UNIT_STATUS.APPROVED, price: 1400, bedrooms: 4, bathrooms: 3, capacity: 8, size: 320, rating: 4.7, reviews: 213, occupancy: 82, revenue: 428000, bookings: 154 },
  { code: 'UNT-004', name: 'شقة قريبة من الحرم المكي', partnerIndex: 2, city: 'Makkah', district: 'Ajyad', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 620, bedrooms: 2, bathrooms: 2, capacity: 5, size: 110, rating: 4.6, reviews: 341, occupancy: 91, revenue: 198000, bookings: 188 },
  { code: 'UNT-005', name: 'بنتهاوس كورنيش الدمام', partnerIndex: 7, city: 'Dammam', district: 'Corniche', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 1800, bedrooms: 4, bathrooms: 3, capacity: 8, size: 260, rating: 4.5, reviews: 56, occupancy: 58, revenue: 143000, bookings: 48 },
  { code: 'UNT-006', name: 'ستوديو حديث — المدينة', partnerIndex: 3, city: 'Madinah', district: 'Quba', type: UNIT_TYPE.STUDIO, status: UNIT_STATUS.PENDING_REVIEW, price: 380, bedrooms: 1, bathrooms: 1, capacity: 2, size: 45, rating: 4.2, reviews: 29, occupancy: 45, revenue: 47000, bookings: 61 },
  { code: 'UNT-007', name: 'مزرعة الفخامة — الخرج', partnerIndex: 5, city: 'Riyadh', district: 'Al Kharj Road', type: UNIT_TYPE.VILLA, status: UNIT_STATUS.APPROVED, price: 4500, bedrooms: 6, bathrooms: 5, capacity: 20, size: 900, rating: 4.7, reviews: 48, occupancy: 43, revenue: 267000, bookings: 32 },
  { code: 'UNT-008', name: 'شقة المصيف — أبها', partnerIndex: 6, city: 'Abha', district: 'Al Sadd', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.REJECTED, price: 520, bedrooms: 2, bathrooms: 2, capacity: 4, size: 95, rating: 3.8, reviews: 14, occupancy: 31, revenue: 28000, bookings: 19, rejectionReason: 'تصريح منتهي الصلاحية' },
  { code: 'UNT-009', name: 'فيلا الأندلس — الرياض', partnerIndex: 0, city: 'Riyadh', district: 'Al Nakheel', type: UNIT_TYPE.VILLA, status: UNIT_STATUS.PENDING_REVIEW, price: 2200, bedrooms: 5, bathrooms: 4, capacity: 10, size: 450, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  { code: 'UNT-010', name: 'مجمع شقق النسيم', partnerIndex: 9, city: 'Khobar', district: 'Al Naseem', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.PENDING_REVIEW, price: 700, bedrooms: 3, bathrooms: 2, capacity: 6, size: 150, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  { code: 'UNT-011', name: 'شاليه بانوراما — أبها', partnerIndex: 8, city: 'Abha', district: 'Al Suda', type: UNIT_TYPE.CHALET, status: UNIT_STATUS.PENDING_REVIEW, price: 1100, bedrooms: 3, bathrooms: 2, capacity: 8, size: 210, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  { code: 'UNT-012', name: 'فندق بوتيك المدينة القديمة', partnerIndex: 1, city: 'Jeddah', district: 'Al Balad', type: UNIT_TYPE.HOTEL_ROOM, status: UNIT_STATUS.PENDING_REVIEW, price: 900, bedrooms: 1, bathrooms: 1, capacity: 3, size: 60, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  { code: 'UNT-013', name: 'مزرعة الأمل — الطائف', partnerIndex: 4, city: 'Taif', district: 'Al Hada', type: UNIT_TYPE.VILLA, status: UNIT_STATUS.PENDING_REVIEW, price: 1600, bedrooms: 4, bathrooms: 3, capacity: 12, size: 600, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  { code: 'UNT-014', name: 'شقة ممسى التجريبية — العليا', partnerIndex: 0, city: 'Riyadh', district: 'Al Olaya', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 950, bedrooms: 2, bathrooms: 2, capacity: 4, size: 120, rating: 4.6, reviews: 33, occupancy: 69, revenue: 88000, bookings: 40, mamsaOwned: true },
  { code: 'UNT-015', name: 'استوديو المطار — جدة', partnerIndex: 1, city: 'Jeddah', district: 'Al Naeem', type: UNIT_TYPE.STUDIO, status: UNIT_STATUS.DRAFT, price: 330, bedrooms: 1, bathrooms: 1, capacity: 2, size: 40, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  { code: 'UNT-016', name: 'شقة الروضة — الرياض', partnerIndex: 5, city: 'Riyadh', district: 'Al Rawdah', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 780, bedrooms: 3, bathrooms: 2, capacity: 6, size: 160, rating: 4.4, reviews: 71, occupancy: 66, revenue: 121000, bookings: 55 },
  { code: 'UNT-017', name: 'شاليه الشاطئ — الخبر', partnerIndex: 7, city: 'Khobar', district: 'Half Moon', type: UNIT_TYPE.CHALET, status: UNIT_STATUS.APPROVED, price: 1500, bedrooms: 4, bathrooms: 3, capacity: 10, size: 340, rating: 4.5, reviews: 62, occupancy: 71, revenue: 176000, bookings: 58 },
  { code: 'UNT-018', name: 'شقة السلامة — جدة', partnerIndex: 1, city: 'Jeddah', district: 'Al Salamah', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.REJECTED, price: 640, bedrooms: 2, bathrooms: 1, capacity: 4, size: 105, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0, rejectionReason: 'الصور غير واضحة ولا تعكس حالة الوحدة' },
  { code: 'UNT-019', name: 'فيلا قرطبة — الرياض', partnerIndex: 5, city: 'Riyadh', district: 'Qurtubah', type: UNIT_TYPE.VILLA, status: UNIT_STATUS.APPROVED, price: 3200, bedrooms: 6, bathrooms: 5, capacity: 14, size: 700, rating: 4.8, reviews: 44, occupancy: 61, revenue: 289000, bookings: 37 },
  { code: 'UNT-020', name: 'شقة طيبة — المدينة', partnerIndex: 3, city: 'Madinah', district: 'Taibah', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.DRAFT, price: 450, bedrooms: 2, bathrooms: 1, capacity: 4, size: 90, rating: 0, reviews: 0, occupancy: 0, revenue: 0, bookings: 0 },
  // One unit each for PTR-011..014 so their payout history has real stays behind it.
  { code: 'UNT-021', name: 'شاليه رمال — الدمام', partnerIndex: 10, city: 'Dammam', district: 'Corniche', type: UNIT_TYPE.CHALET, status: UNIT_STATUS.APPROVED, price: 1250, bedrooms: 3, bathrooms: 2, capacity: 8, size: 240, rating: 4.6, reviews: 51, occupancy: 68, revenue: 154000, bookings: 49 },
  { code: 'UNT-022', name: 'شقة الياسمين — الرياض', partnerIndex: 11, city: 'Riyadh', district: 'Al Yasmin', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 720, bedrooms: 2, bathrooms: 2, capacity: 5, size: 130, rating: 4.7, reviews: 88, occupancy: 74, revenue: 132000, bookings: 63 },
  { code: 'UNT-023', name: 'فيلا سدير — الرياض', partnerIndex: 12, city: 'Riyadh', district: 'Sudair', type: UNIT_TYPE.VILLA, status: UNIT_STATUS.APPROVED, price: 2400, bedrooms: 5, bathrooms: 4, capacity: 12, size: 520, rating: 4.5, reviews: 39, occupancy: 59, revenue: 287000, bookings: 41 },
  { code: 'UNT-024', name: 'شقة الشاطئ — جدة', partnerIndex: 13, city: 'Jeddah', district: 'Al Shatea', type: UNIT_TYPE.APARTMENT, status: UNIT_STATUS.APPROVED, price: 890, bedrooms: 2, bathrooms: 2, capacity: 4, size: 115, rating: 4.4, reviews: 47, occupancy: 63, revenue: 118000, bookings: 38 },
];

export const units: Unit[] = unitSeeds.map((seed, index) => {
  const partner = partners[seed.partnerIndex];
  return {
    id: seed.code.toLowerCase().replace('-', '_'),
    code: seed.code,
    name: seed.name,
    partnerId: partner.id,
    partnerName: partner.name,
    city: seed.city,
    district: seed.district,
    type: seed.type,
    status: seed.status,
    pricePerNight: seed.price,
    bedrooms: seed.bedrooms,
    bathrooms: seed.bathrooms,
    capacity: seed.capacity,
    sizeSqm: seed.size,
    rating: seed.rating,
    reviewsCount: seed.reviews,
    occupancyRate: seed.occupancy,
    revenue: seed.revenue,
    bookingsCount: seed.bookings,
    // Some listings genuinely have no photography, and on the deployed data most do not.
    // Seeding a few nulls keeps the "no photo" branches on the real path in development
    // instead of only firing in production, which is how the last null defect survived.
    coverImage: index % 5 === 3 ? null : unitImage(index),
    mamsaOwned: seed.mamsaOwned ?? false,
    rejectionReason: seed.rejectionReason ?? null,
    approvedAt: seed.status === UNIT_STATUS.APPROVED ? daysAgo(120) : null,
  };
});

const AMENITIES = ['WiFi', 'تكييف', 'موقف سيارات', 'أمن 24 ساعة', 'دخول ذاتي', 'خدمة تنظيف', 'مسبح'];

export function unitDetail(unit: Unit): UnitDetail {
  return {
    ...unit,
    description:
      'وحدة مؤثثة بالكامل بأعلى مستوى من التجهيزات، تقع في موقع مميز وقريبة من الخدمات الرئيسية.',
    // Cover first, then four more so the gallery arrows have somewhere to go. A unit with
    // no cover has no photography at all — never a one-element array of a stand-in, which
    // is what let a reviewer tick "photos reviewed" on an empty listing.
    images: unit.coverImage
      ? [unit.coverImage, ...UNIT_IMAGES.filter((image) => image !== unit.coverImage).slice(0, 4)]
      : [],
    amenities: AMENITIES.slice(0, 5 + (unit.capacity % 3)),
    lat: 24.736828,
    lng: 46.654403,
    publicUrl: unit.status === UNIT_STATUS.APPROVED ? `https://mamsaa.com/units/${unit.code}` : null,
    tourismPermitNo: '73101915',
    permitFileUrl: '/mock/permit.pdf',
    ownerIdNumber: '1010101010',
  };
}

/* -------------------------------------------------------------- approvals */

const pendingUnits = units.filter((unit) => unit.status === UNIT_STATUS.PENDING_REVIEW);

export const approvalRequests: ApprovalRequest[] = pendingUnits.map((unit, index) => {
  const partner = partners.find((p) => p.id === unit.partnerId)!;
  const requestType =
    index === 1 ? REQUEST_TYPE.RESUBMISSION : index === 3 ? REQUEST_TYPE.REAPPROVAL : REQUEST_TYPE.NEW;

  return {
    id: `apr_${String(94 - index)}`,
    code: `APR-${String(94 - index)}`,
    unitId: unit.id,
    unitName: unit.name,
    unitType: unit.type,
    city: unit.city,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerType: partner.type,
    submittedAt: daysAgo(index, index * 9),
    requestType,
    coverImage: unit.coverImage,
    previousRejection:
      requestType === REQUEST_TYPE.RESUBMISSION
        ? { reason: 'تصريح منتهي الصلاحية', at: daysAgo(12) }
        : null,
  };
});

/**
 * Decisions the review queue has already produced. The counters are derived from this
 * dated log rather than frozen at three numbers, which is what lets the range switch
 * actually move them — and keeps `avgReviewHours` scoped to the same window.
 */
const decisionRandom = seeded(4207);

export const approvalDecisions: ApprovalDecision[] = Array.from({ length: 46 }, () => {
  const daysBack = Math.floor(decisionRandom() * 30);
  // Capped below BASE_NOW's hour so a same-day decision stays inside the same day.
  const hoursBack = Math.floor(decisionRandom() * 9);

  return {
    at: daysAgo(daysBack, hoursBack),
    approved: decisionRandom() > 0.22,
    reviewHours: Math.round((2 + decisionRandom() * 26) * 10) / 10,
  };
});

/* --------------------------------------------------------------- policies */

/** Presets are expressed in DAYS before check-in, matching the platform rules. */
export const POLICY_PRESETS: Record<PolicySnapshot['name'], PolicySnapshot['tiers']> = {
  [CANCELLATION_POLICY.FLEXIBLE]: [
    { label: '7+ days before check-in', refundPercent: 100 },
    { label: '3–7 days before check-in', refundPercent: 75 },
    { label: 'Under 3 days before check-in', refundPercent: 50 },
    { label: 'After check-in', refundPercent: 0 },
  ],
  [CANCELLATION_POLICY.MODERATE]: [
    { label: '7+ days before check-in', refundPercent: 100 },
    { label: '3–7 days before check-in', refundPercent: 50 },
    { label: 'Under 3 days before check-in', refundPercent: 25 },
    { label: 'After check-in', refundPercent: 0 },
  ],
  [CANCELLATION_POLICY.STRICT]: [
    { label: '7+ days before check-in', refundPercent: 75 },
    { label: '3–7 days before check-in', refundPercent: 25 },
    { label: 'Under 3 days before check-in', refundPercent: 0 },
    { label: 'After check-in', refundPercent: 0 },
  ],
};

function snapshotFor(name: PolicySnapshot['name'], capturedAt: string): PolicySnapshot {
  return { name, capturedAt, tiers: POLICY_PRESETS[name] };
}

/* --------------------------------------------------------------- bookings */

interface BookingSeed {
  code: string;
  userIndex: number;
  unitIndex: number;
  checkInOffset: number;
  nights: number;
  guests: number;
  status: Booking['status'];
  paymentStatus: Booking['paymentStatus'];
  method: string;
  policy: PolicySnapshot['name'];
}

const bookingSeeds: BookingSeed[] = [
  { code: 'BKG-8841', userIndex: 0, unitIndex: 0, checkInOffset: -12, nights: 3, guests: 4, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8840', userIndex: 1, unitIndex: 1, checkInOffset: 7, nights: 4, guests: 8, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Mada', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8839', userIndex: 2, unitIndex: 2, checkInOffset: 14, nights: 2, guests: 6, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Apple Pay', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8838', userIndex: 3, unitIndex: 3, checkInOffset: 9, nights: 5, guests: 4, status: BOOKING_STATUS.PENDING_PAYMENT, paymentStatus: PAYMENT_STATUS.PENDING, method: 'Bank Transfer', policy: CANCELLATION_POLICY.STRICT },
  { code: 'BKG-8837', userIndex: 6, unitIndex: 5, checkInOffset: -20, nights: 2, guests: 2, status: BOOKING_STATUS.CANCELLED, paymentStatus: PAYMENT_STATUS.REFUNDED, method: 'Credit Card', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8836', userIndex: 4, unitIndex: 4, checkInOffset: -35, nights: 3, guests: 6, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Mada', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8835', userIndex: 5, unitIndex: 6, checkInOffset: 21, nights: 2, guests: 12, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.STRICT },
  { code: 'BKG-8834', userIndex: 8, unitIndex: 13, checkInOffset: -5, nights: 4, guests: 4, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Apple Pay', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8833', userIndex: 10, unitIndex: 15, checkInOffset: 3, nights: 2, guests: 5, status: BOOKING_STATUS.PENDING_PAYMENT, paymentStatus: PAYMENT_STATUS.PENDING, method: 'Mada', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8832', userIndex: 11, unitIndex: 16, checkInOffset: -50, nights: 3, guests: 8, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8831', userIndex: 0, unitIndex: 18, checkInOffset: 30, nights: 5, guests: 10, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Mada', policy: CANCELLATION_POLICY.STRICT },
  { code: 'BKG-8830', userIndex: 2, unitIndex: 2, checkInOffset: -70, nights: 6, guests: 8, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8829', userIndex: 7, unitIndex: 0, checkInOffset: 5, nights: 1, guests: 2, status: BOOKING_STATUS.PENDING_PAYMENT, paymentStatus: PAYMENT_STATUS.PENDING, method: 'Bank Transfer', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8828', userIndex: 9, unitIndex: 3, checkInOffset: -15, nights: 2, guests: 3, status: BOOKING_STATUS.CANCELLED, paymentStatus: PAYMENT_STATUS.REFUNDED, method: 'Mada', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8827', userIndex: 1, unitIndex: 4, checkInOffset: -90, nights: 4, guests: 6, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8826', userIndex: 6, unitIndex: 6, checkInOffset: 45, nights: 3, guests: 16, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Apple Pay', policy: CANCELLATION_POLICY.STRICT },
  { code: 'BKG-8825', userIndex: 4, unitIndex: 16, checkInOffset: -25, nights: 2, guests: 4, status: BOOKING_STATUS.CANCELLED, paymentStatus: PAYMENT_STATUS.REFUNDED, method: 'Credit Card', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8824', userIndex: 10, unitIndex: 18, checkInOffset: -110, nights: 5, guests: 12, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Mada', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8823', userIndex: 8, unitIndex: 1, checkInOffset: 60, nights: 7, guests: 9, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8822', userIndex: 11, unitIndex: 5, checkInOffset: -8, nights: 2, guests: 2, status: BOOKING_STATUS.CANCELLED, paymentStatus: PAYMENT_STATUS.FAILED, method: 'Mada', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8821', userIndex: 5, unitIndex: 13, checkInOffset: -140, nights: 3, guests: 4, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8820', userIndex: 3, unitIndex: 15, checkInOffset: 12, nights: 4, guests: 6, status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Apple Pay', policy: CANCELLATION_POLICY.STRICT },
  { code: 'BKG-8819', userIndex: 7, unitIndex: 2, checkInOffset: -60, nights: 2, guests: 5, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Mada', policy: CANCELLATION_POLICY.MODERATE },
  { code: 'BKG-8818', userIndex: 9, unitIndex: 0, checkInOffset: 2, nights: 1, guests: 2, status: BOOKING_STATUS.PENDING_PAYMENT, paymentStatus: PAYMENT_STATUS.PENDING, method: 'Bank Transfer', policy: CANCELLATION_POLICY.FLEXIBLE },
  { code: 'BKG-8817', userIndex: 2, unitIndex: 4, checkInOffset: -180, nights: 3, guests: 7, status: BOOKING_STATUS.COMPLETED, paymentStatus: PAYMENT_STATUS.PAID, method: 'Credit Card', policy: CANCELLATION_POLICY.MODERATE },
];

const operationalBookings: Booking[] = bookingSeeds.map((seed, index) => {
  const user = users[seed.userIndex];
  const unit = units[seed.unitIndex];
  const partner = partners.find((p) => p.id === unit.partnerId)!;
  const checkIn = seed.checkInOffset >= 0 ? daysAhead(seed.checkInOffset) : daysAgo(-seed.checkInOffset);
  const checkOut = new Date(new Date(checkIn).getTime() + seed.nights * 86_400_000).toISOString();
  const total = unit.pricePerNight * seed.nights;
  // Commission is 2% of the net base, never of the gross — the platform cannot take a
  // cut of VAT collected for ZATCA. See the transitional note in README.md.
  const { netBase, vat, commission, partnerShare } = splitPriceForUnit(total, unit.mamsaOwned);

  return {
    id: seed.code.toLowerCase().replace('-', '_'),
    code: seed.code,
    guestId: user.id,
    guestName: user.name,
    guestPhone: user.phone,
    unitId: unit.id,
    unitName: unit.name,
    unitCity: unit.city,
    partnerId: partner.id,
    partnerName: partner.name,
    checkIn,
    checkOut,
    nights: nightsBetween(checkIn, checkOut),
    guests: seed.guests,
    total,
    netBase,
    vat,
    commission,
    partnerShare,
    nightlyRate: unit.pricePerNight,
    paymentMethod: seed.method,
    paymentStatus: seed.paymentStatus,
    moyasarRef:
      seed.paymentStatus === PAYMENT_STATUS.PENDING ? null : `pay_QK${41200 + index}Xz9`,
    status: seed.status,
    createdAt: daysAgo(Math.abs(seed.checkInOffset) + 6),
    mamsaOwned: unit.mamsaOwned,
  };
});

/**
 * Completed stays that back the payout history. Without them the payout screens would
 * show amounts no booking can account for — the exact thing that teaches an accountant
 * to stop trusting the number and reconcile by hand.
 *
 * Generated rather than hand-written because the volume (a few stays per partner per
 * month, across four months) is mechanical; the interesting part is that every one is a
 * real, openable booking.
 */
interface HistorySpec {
  partnerId: string;
  unitCode: string;
  /** Months back from BASE_NOW. 0 is the current month — those stay unpaid. */
  monthsBack: number;
  stays: number;
  nights: number;
}

const HISTORY_SPECS: HistorySpec[] = [
  ['ptr_001', 'UNT-001'],
  ['ptr_006', 'UNT-007'],
  ['ptr_008', 'UNT-005'],
  ['ptr_011', 'UNT-021'],
  ['ptr_012', 'UNT-022'],
].flatMap(([partnerId, unitCode]) =>
  [1, 2, 3].map((monthsBack) => ({
    partnerId,
    unitCode,
    monthsBack,
    stays: monthsBack === 2 ? 2 : 1,
    nights: 2 + (monthsBack % 3),
  })),
);

/** Current-month earnings — unpaid, so these are what make a partner payable today. */
const CURRENT_SPECS: HistorySpec[] = [
  // PTR-014 also has last month's stays, which its current-month payout settles. That
  // combination — payable balance, but already settled for the cycle — is the only way
  // `already_paid_this_month` can be demonstrated.
  { partnerId: 'ptr_014', unitCode: 'UNT-024', monthsBack: 1, stays: 2, nights: 2 },
  { partnerId: 'ptr_011', unitCode: 'UNT-021', monthsBack: 0, stays: 2, nights: 3 },
  { partnerId: 'ptr_012', unitCode: 'UNT-022', monthsBack: 0, stays: 2, nights: 4 },
  { partnerId: 'ptr_013', unitCode: 'UNT-023', monthsBack: 0, stays: 1, nights: 3 },
  { partnerId: 'ptr_014', unitCode: 'UNT-024', monthsBack: 0, stays: 2, nights: 3 },
];

function monthAnchor(monthsBack: number, day: number): Date {
  const date = new Date(BASE_NOW);
  date.setDate(1);
  date.setMonth(date.getMonth() - monthsBack);
  date.setDate(day);
  return date;
}

const historyBookings: Booking[] = [...HISTORY_SPECS, ...CURRENT_SPECS].flatMap((spec, specIndex) =>
  Array.from({ length: spec.stays }, (_, stayIndex) => {
    const unit = units.find((item) => item.code === spec.unitCode)!;
    const partner = partners.find((item) => item.id === spec.partnerId)!;
    const guest = users[(specIndex + stayIndex) % users.length];

    const checkIn = monthAnchor(spec.monthsBack, 3 + stayIndex * 9);
    const checkOut = new Date(checkIn.getTime() + spec.nights * 86_400_000);
    const total = unit.pricePerNight * spec.nights;
    const { netBase, vat, commission, partnerShare } = splitPriceForUnit(total, unit.mamsaOwned);
    const code = `BKG-9${String(specIndex * 10 + stayIndex).padStart(3, '0')}`;

    return {
      id: code.toLowerCase().replace('-', '_'),
      code,
      guestId: guest.id,
      guestName: guest.name,
      guestPhone: guest.phone,
      unitId: unit.id,
      unitName: unit.name,
      unitCity: unit.city,
      partnerId: partner.id,
      partnerName: partner.name,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      nights: spec.nights,
      guests: 2 + (stayIndex % 4),
      total,
      netBase,
      vat,
      commission,
      partnerShare,
      nightlyRate: unit.pricePerNight,
      paymentMethod: stayIndex % 2 === 0 ? 'Mada' : 'Credit Card',
      paymentStatus: PAYMENT_STATUS.PAID,
      moyasarRef: `pay_HS${70000 + specIndex * 17 + stayIndex}Xz9`,
      status: BOOKING_STATUS.COMPLETED,
      createdAt: new Date(checkIn.getTime() - 6 * 86_400_000).toISOString(),
      mamsaOwned: unit.mamsaOwned,
    } satisfies Booking;
  }),
);

export const bookings: Booking[] = [...operationalBookings, ...historyBookings];

export function bookingDetail(booking: Booking): BookingDetail {
  // Generated history bookings have no hand-written seed row; they all froze the
  // moderate policy, which is the platform default.
  const seed = bookingSeeds.find((s) => s.code === booking.code);
  const policy = seed?.policy ?? CANCELLATION_POLICY.MODERATE;
  const timeline: BookingDetail['timeline'] = [
    { id: 't1', label: 'Created', at: booking.createdAt, state: 'done' },
  ];

  if (booking.status === BOOKING_STATUS.PENDING_PAYMENT) {
    timeline.push({ id: 't2', label: 'Awaiting payment', at: booking.createdAt, state: 'current' });
  } else {
    timeline.push({ id: 't2', label: 'Paid', at: booking.createdAt, state: 'done' });
    timeline.push({ id: 't3', label: 'Confirmed', at: booking.createdAt, state: 'done' });

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      timeline.push({ id: 't4', label: 'Completed', at: booking.checkOut, state: 'done' });
    } else if (booking.status === BOOKING_STATUS.CANCELLED) {
      timeline.push({ id: 't4', label: 'Cancelled', at: booking.checkOut, state: 'cancelled' });
    } else {
      timeline.push({ id: 't4', label: 'Check-in', at: booking.checkIn, state: 'current' });
    }
  }

  return {
    ...booking,
    policySnapshot: snapshotFor(policy, booking.createdAt),
    timeline,
  };
}

/* ---------------------------------------------------------- cancellations */

interface CancellationSeed {
  id: string;
  bookingCode: string;
  by: Cancellation['cancelledBy'];
  refundPercent: number;
  refundStatus: Cancellation['refundStatus'];
  reason: string;
  daysBack: number;
}

const cancellationSeeds: CancellationSeed[] = [
  { id: 'CXL-001', bookingCode: 'BKG-8837', by: CANCELLED_BY.GUEST, refundPercent: 100, refundStatus: REFUND_STATUS.REFUNDED, reason: 'تغيّر في خطط السفر', daysBack: 20 },
  { id: 'CXL-002', bookingCode: 'BKG-8828', by: CANCELLED_BY.HOST, refundPercent: 100, refundStatus: REFUND_STATUS.REFUNDED, reason: 'صيانة طارئة في الوحدة', daysBack: 15 },
  { id: 'CXL-003', bookingCode: 'BKG-8825', by: CANCELLED_BY.GUEST, refundPercent: 0, refundStatus: REFUND_STATUS.NONE, reason: 'إلغاء بعد موعد الدخول', daysBack: 25 },
  { id: 'CXL-004', bookingCode: 'BKG-8822', by: CANCELLED_BY.HOST, refundPercent: 100, refundStatus: REFUND_STATUS.FAILED, reason: 'ازدواج في الحجز', daysBack: 8 },
  { id: 'CXL-005', bookingCode: 'BKG-8830', by: CANCELLED_BY.GUEST, refundPercent: 50, refundStatus: REFUND_STATUS.PARTIAL, reason: 'تقليص مدة الإقامة', daysBack: 40 },
  { id: 'CXL-006', bookingCode: 'BKG-8819', by: CANCELLED_BY.HOST, refundPercent: 100, refundStatus: REFUND_STATUS.REFUNDED, reason: 'عطل في التكييف', daysBack: 55 },
  // Guest refunds must land on a tier of the booking's frozen snapshot — BKG-8817
  // froze the MODERATE policy, whose tiers are 100/50/25/0.
  { id: 'CXL-007', bookingCode: 'BKG-8817', by: CANCELLED_BY.GUEST, refundPercent: 50, refundStatus: REFUND_STATUS.PARTIAL, reason: 'ظروف عائلية', daysBack: 90 },
  { id: 'CXL-008', bookingCode: 'BKG-8821', by: CANCELLED_BY.HOST, refundPercent: 100, refundStatus: REFUND_STATUS.REFUNDED, reason: 'الوحدة غير جاهزة', daysBack: 120 },
];

export const cancellations: Cancellation[] = cancellationSeeds.map((seed) => {
  const booking = bookings.find((b) => b.code === seed.bookingCode)!;
  const refundAmount = Math.round(booking.total * (seed.refundPercent / 100));

  /**
   * Host cancellations always refund the guest in full: the partner forfeits their
   * 98% and Mamsa forfeits its 2%. The platform's own loss is its commission.
   */
  const impact =
    seed.by === CANCELLED_BY.HOST
      ? -booking.commission
      : -Math.round(booking.commission * (seed.refundPercent / 100));

  return {
    id: seed.id,
    bookingId: booking.id,
    bookingCode: booking.code,
    guestName: booking.guestName,
    cancelledBy: seed.by,
    unitName: booking.unitName,
    partnerId: booking.partnerId,
    partnerName: booking.partnerName,
    at: daysAgo(seed.daysBack),
    reason: seed.reason,
    bookingTotal: booking.total,
    refundAmount,
    impact,
    refundStatus: seed.refundStatus,
    mamsaOwned: booking.mamsaOwned,
  };
});

/* --------------------------------------------------------- notifications */

export const notifications: NotificationItem[] = [
  { id: 'ntf_1', category: NOTIFICATION_CATEGORY.APPROVAL, title: 'طلب موافقة جديد', body: 'عبدالله محمد الفيصل قدّم طلب موافقة على فيلا الأندلس في الرياض', at: daysAgo(0, 2), read: false, entity: { type: 'approval', id: 'apr_94' } },
  { id: 'ntf_2', category: NOTIFICATION_CATEGORY.BOOKING, title: 'حجز جديد #BKG-8841', body: 'تم تأكيد حجز جديد بقيمة 2,550 SAR في شقة فاخرة — حي العليا', at: daysAgo(0, 4), read: false, entity: { type: 'booking', id: 'bkg_8841' } },
  { id: 'ntf_3', category: NOTIFICATION_CATEGORY.CANCELLATION, title: 'إلغاء من المضيف', body: 'فهد ناصر العنزي ألغى حجز #BKG-8822 بسبب ازدواج في الحجز', at: daysAgo(0, 8), read: false, entity: { type: 'cancellation', id: 'CXL-004' } },
  { id: 'ntf_4', category: NOTIFICATION_CATEGORY.PARTNER, title: 'شريك جديد بانتظار التحقق', body: 'محمد سالم الغريب سجّل كشريك فردي ويحتاج مراجعة المستندات', at: daysAgo(0, 11), read: false, entity: { type: 'partner', id: 'ptr_003' } },
  { id: 'ntf_5', category: NOTIFICATION_CATEGORY.SYSTEM, title: 'تحذير: معدل إلغاء مرتفع', body: 'سعد عبدالكريم الجهني تجاوز حد معدل الإلغاء المسموح (22 إلغاء)', at: daysAgo(1, 3), read: true, entity: { type: 'partner', id: 'ptr_009' } },
  { id: 'ntf_6', category: NOTIFICATION_CATEGORY.REFUND, title: 'فشل استرداد — #CXL-004', body: 'تعذّر تنفيذ الاسترداد عبر Moyasar، يلزم إعادة المحاولة', at: daysAgo(1, 6), read: true, entity: { type: 'cancellation', id: 'CXL-004' } },
  { id: 'ntf_7', category: NOTIFICATION_CATEGORY.APPROVAL, title: 'إعادة تقديم وحدة مرفوضة', body: 'شاليه بانوراما — أبها أُعيد تقديمه بعد الرفض ويحتاج مراجعة', at: daysAgo(2), read: true, entity: { type: 'approval', id: 'apr_93' } },
  { id: 'ntf_8', category: NOTIFICATION_CATEGORY.BOOKING, title: 'اكتمل حجز #BKG-8834', body: 'تم إكمال الحجز بنجاح في شقة ممسى التجريبية — العليا', at: daysAgo(3), read: true, entity: { type: 'booking', id: 'bkg_8834' } },
  { id: 'ntf_9', category: NOTIFICATION_CATEGORY.SYSTEM, title: 'تقرير الإيرادات الشهري جاهز', body: 'تقرير الشهر متاح للتصدير والمراجعة', at: daysAgo(4), read: true, entity: { type: 'report', id: 'rep_monthly' } },
  { id: 'ntf_10', category: NOTIFICATION_CATEGORY.REFUND, title: 'استرداد معالج — #CXL-002', body: 'تم استرداد 1,240 SAR بنجاح للضيف', at: daysAgo(5), read: true, entity: { type: 'cancellation', id: 'CXL-002' } },
];

/* ---------------------------------------------------------------- series */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE_BY_MONTH = [
  310_000, 285_000, 402_000, 448_000, 512_000, 604_000, 698_000, 512_000, 430_000, 398_000, 465_000, 862_000,
];

export const revenueSeries = MONTHS.map((label, index) => {
  const revenue = REVENUE_BY_MONTH[index];
  return { label, revenue, commission: splitForUnit(revenue, false).commission };
});

export const bookingVolume = MONTHS.map((label, index) => ({
  label,
  value: [820, 760, 1010, 1170, 1350, 1610, 1830, 1270, 1090, 1030, 1220, 2280][index],
}));

export const occupancySeries = MONTHS.map((label, index) => ({
  label,
  value: [62, 58, 71, 76, 84, 89, 91, 79, 71, 69, 75, 88][index],
}));

export const revenueByCity = [
  { label: 'Riyadh', value: 1_880_000 },
  { label: 'Jeddah', value: 1_120_000 },
  { label: 'Makkah', value: 940_000 },
  { label: 'Madinah', value: 610_000 },
  { label: 'Dammam', value: 340_000 },
];

export const weeklyBookings = [
  { label: 'Sun', value: 138 },
  { label: 'Mon', value: 96 },
  { label: 'Tue', value: 112 },
  { label: 'Wed', value: 131 },
  { label: 'Thu', value: 184 },
  { label: 'Fri', value: 252 },
  { label: 'Sat', value: 208 },
];

/* ------------------------------------------------------- platform counters */

/**
 * Live platform-wide figures.
 *
 * The lists above are a working sample — `units`, `partners` and `approvalRequests`
 * only materialise the handful of rows a reviewer touches today, so their lengths are
 * not the platform's real totals. Anything the dashboard reports as a headline count
 * comes from here instead. The series above stay a twelve-month window.
 */
export const bookingStatusSlices = [
  { status: BOOKING_STATUS.COMPLETED, count: 6_842 },
  { status: BOOKING_STATUS.CONFIRMED, count: 3_210 },
  { status: BOOKING_STATUS.PENDING_PAYMENT, count: 1_492 },
  { status: BOOKING_STATUS.CANCELLED, count: 1_303 },
] as const;

/** Lifetime gross booking value. Commission is never stated independently of it. */
const LIFETIME_GBV = 24_350_000;

export const platformTotals = {
  users: 38_492,
  bookings: bookingStatusSlices.reduce((sum, slice) => sum + slice.count, 0),
  activePartners: 1_847,
  pendingApprovals: 94,
  /** Always the 2% split — never a free-standing number. */
  platformCommission: splitCommission(LIFETIME_GBV).commission,
  monthlyGrowth: 18.4,
  deltas: {
    users: 24.8,
    platformCommission: 21.2,
    bookings: 15.3,
    activePartners: 12.6,
  },
};

export const avgBookingValue = Math.round(LIFETIME_GBV / platformTotals.bookings);

/* --------------------------------------------------------------- wallets */

/**
 * Wallets are DERIVED from the seeded bookings, never invented, so every figure on the
 * wallets screen reconciles against a booking the operator can open. The ledger is built
 * first and the balance falls out of it — that ordering is what makes
 * `Σ ledger amounts === availableBalance` true by construction rather than by luck.
 *
 * **Mamsa-owned bookings produce no rows at all** — not rows of zero. A Mamsa-owned unit
 * is stored against the admin who created it, so crediting one would accrue a phantom
 * partner balance for that admin. `UNT-014` is Mamsa-owned and sits under PTR-001, which
 * makes PTR-001 the case that proves the exclusion works.
 */

/** Obviously fictional, and shaped like a real Saudi IBAN: SA + 22 digits. */
function mockIban(index: number): string {
  return `SA${String(30 + index).padStart(2, '0')}8000000060801016${String(7519 + index).padStart(4, '0')}`;
}

/**
 * Which partner demonstrates which ineligibility reason. Every reason in the union has a
 * seeded partner, so no reason can silently collapse into another when the precedence in
 * `resolveIneligibleReason` changes — the ordering bug this table exists to catch.
 *
 * | Partner | State | Reason |
 * |---|---|---|
 * | PTR-001 | active, verified bank, ≥ 2,000 | *(eligible)* |
 * | PTR-002 | paid out in full, then refunded | `negative_balance` |
 * | PTR-003 | pending, no bank account | `bank_missing` |
 * | PTR-004 | active, verified bank, 0 | `below_minimum` |
 * | PTR-005 | active, verified bank, 0 | `below_minimum` |
 * | PTR-006 | active, verified bank, ≥ 2,000 | *(eligible)* |
 * | PTR-007 | suspended, verified bank | `partner_suspended` |
 * | PTR-008 | active, verified bank, ≥ 2,000 | *(eligible)* |
 * | PTR-009 | active, unverified bank | `bank_unverified` |
 * | PTR-010 | **pending, verified bank** | `not_approved` |
 *
 * PTR-010 is the `not_approved` fixture: its bank details are clean, so nothing above it
 * in the precedence can mask it, and it is *pending* rather than suspended — the two must
 * never report the same thing. PTR-009 is the `bank_unverified` fixture for the same
 * reason: active, so only the bank state can be blocking it.
 */
const BANK_STATE: Record<string, 'missing' | 'unverified'> = {
  ptr_003: 'missing',
  ptr_009: 'unverified',
};

export const bankDetailsByPartner: Record<string, BankDetails | null> = Object.fromEntries(
  partners.map((partner, index) => {
    const state = BANK_STATE[partner.id];
    if (state === 'missing') return [partner.id, null];

    const verified = state !== 'unverified';
    return [
      partner.id,
      {
        iban: mockIban(index),
        accountHolderName: partner.name,
        bankName: index % 2 === 0 ? 'مصرف الراجحي' : 'البنك الأهلي السعودي',
        verified,
        verifiedAt: verified ? daysAgo(200 - index * 5) : null,
        // Alternating on purpose: `verifiedBy` is null on records that predate the field,
        // so both the named and the unnamed rendering get exercised in mock mode.
        verifiedBy: verified && index % 2 === 0 ? 'محمد أشرف' : null,
        rejectionReason: null,
        updatedAt: daysAgo(210 - index * 5),
      } satisfies BankDetails,
    ];
  }),
);

/** Earning-bearing bookings: completed, and never on a Mamsa-owned unit. */
function earningBookingsFor(partnerId: string): Booking[] {
  return bookings
    .filter(
      (booking) =>
        booking.partnerId === partnerId &&
        booking.status === BOOKING_STATUS.COMPLETED &&
        !booking.mamsaOwned,
    )
    .sort((a, b) => new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime());
}

function shareOf(booking: Booking): number {
  return splitPrice(booking.total).partnerShare;
}

/**
 * One payout per partner per calendar month, covering exactly the stays that completed
 * in that month. Coverage is selected by the booking's own `checkOut` month rather than
 * by a count, so a booking can never be paid twice and every payout's lines sum to its
 * amount — the invariant the payout drawer's reconciliation warning exists to catch.
 *
 * Which months are deliberately left unpaid is what makes a partner payable today.
 */
interface PayoutGroup {
  partnerId: string;
  /** The month whose stays this payout covers. */
  monthsBack: number;
  /** When it was recorded, if different from the month it covers. */
  paidMonthsBack?: number;
  status?: PayoutStatus;
  isManual?: boolean;
}

const PAYOUT_GROUPS: PayoutGroup[] = [
  // Months 2–3 settled; month 1 and the current stay are what keep them payable.
  { partnerId: 'ptr_001', monthsBack: 2 },
  { partnerId: 'ptr_001', monthsBack: 3 },
  // Month 3 was recorded off-cycle by a superadmin.
  { partnerId: 'ptr_006', monthsBack: 2 },
  { partnerId: 'ptr_006', monthsBack: 3, isManual: true },
  { partnerId: 'ptr_008', monthsBack: 1 },
  { partnerId: 'ptr_008', monthsBack: 2 },
  { partnerId: 'ptr_008', monthsBack: 3 },
  { partnerId: 'ptr_011', monthsBack: 1 },
  { partnerId: 'ptr_011', monthsBack: 2 },
  { partnerId: 'ptr_011', monthsBack: 3 },
  { partnerId: 'ptr_012', monthsBack: 1 },
  { partnerId: 'ptr_012', monthsBack: 2 },
  // The transfer bounced and was unwound — its compensating row is written below.
  { partnerId: 'ptr_012', monthsBack: 3, status: PAYOUT_STATUS.REVERSED },
  // Paid out in full, then a guest refund clawed money back → negative balance.
  { partnerId: 'ptr_002', monthsBack: 2 },
  // Recorded THIS month, so this partner is payable but already settled for the cycle.
  { partnerId: 'ptr_014', monthsBack: 1, paidMonthsBack: 0 },
];

function periodOf(monthsBack: number): string {
  return riyadhPeriodMonth(monthAnchor(monthsBack, 15).toISOString());
}

function bookingsCompletedIn(partnerId: string, monthsBack: number): Booking[] {
  const period = periodOf(monthsBack);
  return earningBookingsFor(partnerId).filter(
    (booking) => riyadhPeriodMonth(booking.checkOut) === period,
  );
}

/** payoutId → the bookings it settled, so PayoutDetail can show lines that add up. */
export const payoutCoverage: Record<string, Booking[]> = {};

export const payouts: Payout[] = PAYOUT_GROUPS.flatMap((group, index) => {
  const partner = partners.find((p) => p.id === group.partnerId)!;
  const covered = bookingsCompletedIn(group.partnerId, group.monthsBack);
  if (covered.length === 0) return [];

  const amount = round2(covered.reduce((sum, booking) => sum + shareOf(booking), 0));
  const bank = bankDetailsByPartner[partner.id];
  const paidAt = monthAnchor(group.paidMonthsBack ?? group.monthsBack, 26).toISOString();
  const status = group.status ?? PAYOUT_STATUS.PAID;
  const reversed = status === PAYOUT_STATUS.REVERSED;
  const id = `pay_${String(index + 1).padStart(3, '0')}`;

  payoutCoverage[id] = covered;

  return [
    {
      id,
      reference: `PYT-${periodOf(group.monthsBack).replace('-', '')}-${String(index + 1).padStart(3, '0')}`,
      partnerId: partner.id,
      partnerName: partner.name,
      periodMonth: riyadhPeriodMonth(paidAt),
      amount,
      bookingsCount: covered.length,
      currency: 'SAR',
      status,
      paidAt,
      bankReference: `FT${24500 + index * 137}SA`,
      // Masked even on the admin surface — a payout row identifies its destination
      // without carrying a full IBAN into a list, a CSV export and a browser cache.
      ibanMasked: bank ? `••••${bank.iban.slice(-4)}` : '••••',
      bankName: bank?.bankName ?? null,
      note: group.isManual ? 'دفعة استثنائية خارج الدورة الشهرية' : null,
      reversedAt: reversed ? monthAnchor(group.monthsBack, 28).toISOString() : null,
      reversalReason: reversed ? 'ارتد التحويل من البنك لعدم تطابق اسم صاحب الحساب' : null,
    } satisfies Payout,
  ];
});

/**
 * Clawbacks: a guest refund on a booking whose share was already credited. PTR-002 was
 * paid out in full and then refunded, which is exactly how a real negative balance
 * arises — and the only way to render the negative path honestly.
 */
const REVERSAL_SEEDS: Array<{ bookingCode: string; refundPercent: number; daysBack: number }> = [
  { bookingCode: 'BKG-8830', refundPercent: 50, daysBack: 40 },
];

const ADJUSTMENT_SEEDS: Array<{
  partnerId: string;
  amount: number;
  description: string;
  daysBack: number;
}> = [
  {
    partnerId: 'ptr_008',
    amount: 150,
    description: 'تسوية يدوية لفرق تقريب في حجز سابق',
    daysBack: 20,
  },
];

interface LedgerEvent {
  partnerId: string;
  type: PartnerLedgerEntry['type'];
  amount: number;
  refType: PartnerLedgerEntry['refType'];
  refId: string;
  refCode: string;
  description: string;
  createdAt: string;
  createdByAdminId: string | null;
}

function ledgerEvents(): LedgerEvent[] {
  const events: LedgerEvent[] = [];

  for (const partner of partners) {
    for (const booking of earningBookingsFor(partner.id)) {
      events.push({
        partnerId: partner.id,
        type: 'earning',
        amount: shareOf(booking),
        refType: 'booking',
        refId: booking.id,
        refCode: booking.code,
        description: `حصة الشريك من حجز ${booking.code}`,
        createdAt: booking.checkOut,
        createdByAdminId: null,
      });
    }
  }

  for (const payout of payouts) {
    events.push({
      partnerId: payout.partnerId,
      type: 'payout',
      amount: -payout.amount,
      refType: 'payout',
      refId: payout.id,
      refCode: payout.reference,
      description: `حوالة صادرة ${payout.reference}`,
      createdAt: payout.paidAt,
      createdByAdminId: financeAdminProfile.id,
    });

    // A reversal never edits or deletes the original debit — it writes a compensating
    // credit beside it, so the history of what happened stays readable.
    if (payout.status === PAYOUT_STATUS.REVERSED && payout.reversedAt) {
      events.push({
        partnerId: payout.partnerId,
        type: 'adjustment',
        amount: payout.amount,
        refType: 'payout',
        refId: payout.id,
        refCode: payout.reference,
        description: `عكس الحوالة ${payout.reference}`,
        createdAt: payout.reversedAt,
        createdByAdminId: adminProfile.id,
      });
    }
  }

  for (const seed of REVERSAL_SEEDS) {
    const booking = bookings.find((b) => b.code === seed.bookingCode)!;
    events.push({
      partnerId: booking.partnerId,
      type: 'refund_reversal',
      amount: -round2(shareOf(booking) * (seed.refundPercent / 100)),
      refType: 'booking',
      refId: booking.id,
      refCode: booking.code,
      description: `استرجاع حصة الشريك بعد استرداد ${seed.refundPercent}% من حجز ${booking.code}`,
      createdAt: daysAgo(seed.daysBack),
      createdByAdminId: null,
    });
  }

  for (const seed of ADJUSTMENT_SEEDS) {
    events.push({
      partnerId: seed.partnerId,
      type: 'adjustment',
      amount: seed.amount,
      refType: 'manual',
      refId: `adj_${seed.partnerId}`,
      refCode: 'ADJ-0001',
      description: seed.description,
      createdAt: daysAgo(seed.daysBack),
      createdByAdminId: adminProfile.id,
    });
  }

  return events;
}

/** Chronological per partner, with a running `balanceAfter` on every row. */
export const partnerLedgers: Record<string, PartnerLedgerEntry[]> = (() => {
  const byPartner: Record<string, PartnerLedgerEntry[]> = {};

  for (const partner of partners) {
    const events = ledgerEvents()
      .filter((event) => event.partnerId === partner.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let running = 0;
    byPartner[partner.id] = events.map((event, index) => {
      running = round2(running + event.amount);
      return {
        id: `led_${partner.id}_${String(index + 1).padStart(3, '0')}`,
        partnerId: partner.id,
        type: event.type,
        amount: event.amount,
        balanceAfter: running,
        refType: event.refType,
        refId: event.refId,
        refCode: event.refCode,
        description: event.description,
        createdAt: event.createdAt,
        createdByAdminId: event.createdByAdminId,
      } satisfies PartnerLedgerEntry;
    });
  }

  return byPartner;
})();

export const wallets: PartnerWallet[] = partners.map((partner) => {
  const ledger = partnerLedgers[partner.id];
  const availableBalance = ledger.length ? ledger[ledger.length - 1].balanceAfter : 0;

  const lifetimeEarnings = round2(
    ledger.filter((row) => row.type === 'earning').reduce((sum, row) => sum + row.amount, 0),
  );
  // A reversed payout is money that came back, so it does not count as paid out. Its
  // compensating credit carries refType 'payout', which is what nets it off here.
  const reversedBack = round2(
    ledger
      .filter((row) => row.type === 'adjustment' && row.refType === 'payout')
      .reduce((sum, row) => sum + row.amount, 0),
  );
  const lifetimePaidOut = round2(
    ledger
      .filter((row) => row.type === 'payout')
      .reduce((sum, row) => sum + Math.abs(row.amount), 0) - reversedBack,
  );

  const pendingBalance = round2(
    bookings
      .filter(
        (booking) =>
          booking.partnerId === partner.id &&
          !booking.mamsaOwned &&
          (booking.status === BOOKING_STATUS.PENDING_PAYMENT ||
            booking.status === BOOKING_STATUS.CONFIRMED),
      )
      .reduce((sum, booking) => sum + shareOf(booking), 0),
  );

  const bankDetails = bankDetailsByPartner[partner.id];
  const ineligibleReason = resolveIneligibleReason({ partner, availableBalance, bankDetails });
  const lastPayout = payouts.filter((p) => p.partnerId === partner.id).at(-1) ?? null;

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    partnerType: partner.type,
    availableBalance,
    pendingBalance,
    lifetimeEarnings,
    lifetimePaidOut,
    currency: 'SAR',
    bankVerified: bankDetails?.verified ?? false,
    payoutEligible: ineligibleReason === null,
    ineligibleReason,
    lastPayoutAt: lastPayout?.paidAt ?? null,
    updatedAt: daysAgo(0),
  } satisfies PartnerWallet;
});

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** 'YYYY-MM' in Riyadh time — payout periods are Gregorian calendar months there. */
export function riyadhPeriodMonth(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PAYOUT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date(iso));

  const year = parts.find((part) => part.type === 'year')!.value;
  const month = parts.find((part) => part.type === 'month')!.value;
  return `${year}-${month}`;
}
