/**
 * §4.6 of the spec — the four states of the execute button, decided from `refunds[]`
 * alone. Each case is a way an admin could refund a guest twice if it were wrong.
 */
import { describe, expect, it } from 'vitest';
import type { ComplaintRefund } from '@/types';
import { newestFirst, refundGate } from './refund-state';

function refund(
  id: number,
  status: ComplaintRefund['status'],
  createdAt: string | null = '2026-07-27T09:00:00.000Z',
): ComplaintRefund {
  return {
    id,
    status,
    amountHalalas: 60000,
    partnerHalalas: 46957,
    failureReason: status === 'failed' ? 'gateway_timeout' : null,
    moyasarRefundId: status === 'failed' ? null : `refund_${id}`,
    createdAt,
  };
}

describe('refundGate', () => {
  it('is ready when nothing has been attempted', () => {
    expect(refundGate([])).toEqual({ kind: 'ready' });
  });

  it('blocks on a pending attempt and hands back the row to show its time', () => {
    const pending = refund(2, 'pending', '2026-07-27T10:00:00.000Z');
    expect(refundGate([pending])).toEqual({ kind: 'blocked', pending });
  });

  it('still blocks when a pending attempt follows a failed one', () => {
    const failed = refund(1, 'failed', '2026-07-26T10:00:00.000Z');
    const pending = refund(2, 'pending', '2026-07-27T10:00:00.000Z');
    expect(refundGate([failed, pending])).toEqual({ kind: 'blocked', pending });
  });

  /**
   * A pending row next to a succeeded one means a second refund is already in flight.
   * Whatever the complaint status says, nothing more may be sent.
   */
  it('lets pending outrank a settled row', () => {
    const succeeded = refund(1, 'succeeded', '2026-07-26T10:00:00.000Z');
    const pending = refund(2, 'pending', '2026-07-27T10:00:00.000Z');
    expect(refundGate([succeeded, pending]).kind).toBe('blocked');
  });

  it('allows a retry when every attempt failed, pointing at the newest failure', () => {
    const older = refund(1, 'failed', '2026-07-26T10:00:00.000Z');
    const newer = refund(2, 'failed', '2026-07-27T10:00:00.000Z');
    expect(refundGate([older, newer])).toEqual({ kind: 'retry', lastFailed: newer });
  });

  it('is settled once any attempt succeeded, even after earlier failures', () => {
    const failed = refund(1, 'failed', '2026-07-26T10:00:00.000Z');
    const succeeded = refund(2, 'succeeded', '2026-07-27T10:00:00.000Z');
    expect(refundGate([failed, succeeded])).toEqual({ kind: 'settled', succeeded });
  });

  /**
   * The proof that moved here from the mock on 2026-09-06, when the backend grew its own
   * `REFUND_IN_FLIGHT` guard. The page's gate is the first of the two layers, and it is
   * decided from the rows alone: any input holding a pending row is blocked before a
   * request exists to refuse — whatever else the rows contain, and even without a stamp.
   */
  it('is the first layer: every input holding a pending row comes back blocked', () => {
    const inputs: ComplaintRefund[][] = [
      [refund(1, 'pending')],
      [refund(1, 'failed', '2026-07-26T10:00:00.000Z'), refund(2, 'pending')],
      [refund(1, 'succeeded', '2026-07-26T10:00:00.000Z'), refund(2, 'pending')],
      [refund(1, 'pending', null)],
      [refund(1, 'pending', null), refund(2, 'failed', '2026-07-27T10:00:00.000Z')],
    ];

    for (const rows of inputs) {
      expect(refundGate(rows).kind).toBe('blocked');
    }
  });
});

describe('newestFirst', () => {
  it('orders by creation time, newest first, with missing times last', () => {
    const rows = [
      refund(1, 'failed', '2026-07-25T10:00:00.000Z'),
      refund(2, 'failed', null),
      refund(3, 'pending', '2026-07-27T10:00:00.000Z'),
    ];
    expect(newestFirst(rows).map((row) => row.id)).toEqual([3, 1, 2]);
  });

  it('does not mutate the input', () => {
    const rows = [refund(1, 'failed', '2026-07-25T10:00:00.000Z'), refund(2, 'pending')];
    newestFirst(rows);
    expect(rows.map((row) => row.id)).toEqual([1, 2]);
  });
});
