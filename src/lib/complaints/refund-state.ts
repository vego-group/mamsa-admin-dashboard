/**
 * The execute button's four states, decided from `refunds[]` alone — §4.6 of the spec,
 * the most important rule in the feature.
 *
 * A successful execution leaves a `pending` row while the complaint stays `approved`.
 * Without this gate an admin who mistakes "still pending" for "nothing happened" clicks
 * again and the client mints a new idempotency key. Since 2026-09-06 the backend refuses
 * that request with `409 REFUND_IN_FLIGHT` — this gate is the first layer and that is the
 * second, and both stay: the page stops the click, the server stops the request. So a
 * pending row **disables** the button — disabled, not hidden, so the admin sees that
 * something is in flight rather than wondering where the button went.
 */
import type { ComplaintRefund } from '@/types';

export type RefundGate =
  /** No attempt yet — execute is available. */
  | { kind: 'ready' }
  /** An attempt is at the gateway — wait; nothing may be sent. */
  | { kind: 'blocked'; pending: ComplaintRefund }
  /** Every attempt failed — retry, with a **new** idempotency key. */
  | { kind: 'retry'; lastFailed: ComplaintRefund }
  /** Money moved — read only. */
  | { kind: 'settled'; succeeded: ComplaintRefund };

const stampOf = (row: ComplaintRefund) => (row.createdAt ? new Date(row.createdAt).getTime() : 0);

/** Newest first; a missing timestamp sorts last, ties break on id. */
export function newestFirst(refunds: ComplaintRefund[]): ComplaintRefund[] {
  return [...refunds].sort((a, b) => stampOf(b) - stampOf(a) || b.id - a.id);
}

export function refundGate(refunds: ComplaintRefund[]): RefundGate {
  const rows = newestFirst(refunds);

  // Pending outranks everything, including a settled row: money in flight is the one
  // state in which a second request is never safe.
  const pending = rows.find((row) => row.status === 'pending');
  if (pending) return { kind: 'blocked', pending };

  const succeeded = rows.find((row) => row.status === 'succeeded');
  if (succeeded) return { kind: 'settled', succeeded };

  const lastFailed = rows.find((row) => row.status === 'failed');
  if (lastFailed) return { kind: 'retry', lastFailed };

  return { kind: 'ready' };
}
