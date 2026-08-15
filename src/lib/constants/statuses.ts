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

export const UNIT_TYPE = {
  APARTMENT: 'apartment',
  VILLA: 'villa',
  CHALET: 'chalet',
  STUDIO: 'studio',
  HOTEL_ROOM: 'hotel_room',
} as const;
export type UnitType = (typeof UNIT_TYPE)[keyof typeof UNIT_TYPE];

export const PARTNER_TYPE = { INDIVIDUAL: 'individual', COMPANY: 'company' } as const;
export type PartnerType = (typeof PARTNER_TYPE)[keyof typeof PARTNER_TYPE];

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
