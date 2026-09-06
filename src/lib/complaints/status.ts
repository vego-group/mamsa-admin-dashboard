import {
  COMPLAINT_STATUS,
  type ComplaintRefundStatus,
  type ComplaintStatus,
} from '@/lib/constants';

/** Lifecycle order — what the list's filter tabs show. */
export const COMPLAINT_STATUS_ORDER: ComplaintStatus[] = [
  COMPLAINT_STATUS.SUBMITTED,
  COMPLAINT_STATUS.UNDER_REVIEW,
  COMPLAINT_STATUS.APPROVED,
  COMPLAINT_STATUS.RESOLVED_REFUNDED,
  COMPLAINT_STATUS.RESOLVED_REJECTED,
];

/**
 * StatusBadge keys. Prefixed so a complaint's `approved` and a refund's `pending` never
 * collide with the unit and payment vocabularies that already own those words — and so
 * the badge can say "processing at the gateway" where a bare `pending` would say "paid
 * soon".
 */
export const complaintStatusBadge = (status: ComplaintStatus) => `complaint_${status}` as const;
export const refundStatusBadge = (status: ComplaintRefundStatus) => `refund_${status}` as const;
