/**
 * Canonical status vocabularies.
 *
 * A booking is never "approved" and never merely "pending" — those belong to other
 * domains. A unit has no separate "published" state: an approved unit is live.
 */

export const BOOKING_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const UNIT_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type UnitStatus = (typeof UNIT_STATUS)[keyof typeof UNIT_STATUS];

export const PARTNER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;
export type PartnerStatus = (typeof PARTNER_STATUS)[keyof typeof PARTNER_STATUS];

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  PENDING_ACTIVATION: 'pending_activation',
} as const;
export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const REQUEST_TYPE = {
  NEW: 'new',
  RESUBMISSION: 'resubmission',
  REAPPROVAL: 'reapproval_after_edit',
} as const;
export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];

export const REFUND_STATUS = {
  REFUNDED: 'refunded',
  PARTIAL: 'partial',
  NONE: 'none',
  FAILED: 'failed',
} as const;
export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export const CANCELLED_BY = { GUEST: 'guest', HOST: 'host' } as const;
export type CancelledBy = (typeof CANCELLED_BY)[keyof typeof CANCELLED_BY];

export const DOCUMENT_STATUS = {
  PENDING_REVIEW: 'pending_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;
export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

/**
 * Three, and only three. `chalet` and `hotel_room` were listed here and are **rejected**
 * by the API with `422` on `fields.type` — the platform has never supported them.
 *
 * Their labels stay in the dictionaries so a legacy row, if one exists, still renders a
 * word rather than a raw slug. Nothing may offer them as a choice.
 */
export const UNIT_TYPE = {
  APARTMENT: 'apartment',
  STUDIO: 'studio',
  VILLA: 'villa',
} as const;
export type UnitType = (typeof UNIT_TYPE)[keyof typeof UNIT_TYPE];

export const PARTNER_TYPE = { INDIVIDUAL: 'individual', COMPANY: 'company' } as const;
export type PartnerType = (typeof PARTNER_TYPE)[keyof typeof PARTNER_TYPE];

/**
 * What an approval row's owner can be. Mamsa's own listings arrive as `mamsa` — a third
 * value that is deliberately **not** in `PARTNER_TYPE`: the platform is not a partner,
 * has no wallet and no KYC, and must never appear in a partner filter or payout run.
 */
export type ApprovalPartnerType = PartnerType | 'mamsa';

export const CANCELLATION_POLICY = {
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
} as const;
export type CancellationPolicyName =
  (typeof CANCELLATION_POLICY)[keyof typeof CANCELLATION_POLICY];

/**
 * Two states, and only ever two. A payout is created already `paid` — the accountant
 * performs the bank transfer first and records it afterwards, so there is no pending
 * state to render. A bounced transfer is `reversed`, which is a distinct accounting
 * event, not a failed attempt.
 */
export const PAYOUT_STATUS = {
  PAID: 'paid',
  REVERSED: 'reversed',
} as const;
export type PayoutStatus = (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];

export const NOTIFICATION_CATEGORY = {
  APPROVAL: 'approval',
  BOOKING: 'booking',
  CANCELLATION: 'cancellation',
  PARTNER: 'partner',
  SYSTEM: 'system',
  REFUND: 'refund',
  // Appended in Phase 4 — the existing set is unchanged.
  PAYOUT: 'payout',
  WALLET: 'wallet',
} as const;
export type NotificationCategory =
  (typeof NOTIFICATION_CATEGORY)[keyof typeof NOTIFICATION_CATEGORY];

/**
 * The fifteen amenity keys the platform stores, and the only fifteen — an unknown key
 * is rejected with `422` on `amenities.{n}`. Labels live in the dictionaries; this is
 * the wire vocabulary.
 *
 * The first eight are the set the partner wizard shows. The remaining seven exist and
 * partner units already use them, so an admin listing that could not offer a lift or a
 * washing machine would be describing a worse unit than the same property listed by a
 * partner.
 */
export const AMENITY = {
  WIFI: 'wifi',
  AC: 'ac',
  KITCHEN: 'kitchen',
  PARKING: 'parking',
  POOL: 'pool',
  SECURITY: 'security',
  SELF_CHECKIN: 'self_checkin',
  FAMILY_FRIENDLY: 'family_friendly',
  SMART_TV: 'smart_tv',
  GARDEN: 'garden',
  BBQ: 'bbq',
  ELEVATOR: 'elevator',
  WASHER: 'washer',
  PRIVATE_BEACH: 'private_beach',
  EVENT_HALL: 'event_hall',
} as const;
export type Amenity = (typeof AMENITY)[keyof typeof AMENITY];
