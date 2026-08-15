/**
 * Does a payout's booking lines account for what was transferred?
 *
 * This is a **reachable, legitimate state**, not a safety net for a bug. A payout is for
 * the partner's whole available balance, and that balance can include manual adjustments
 * or refund clawbacks that no booking accounts for. When it does, the lines will not add
 * up — and the operator has to be able to tell that apart from something being wrong.
 *
 * So the difference is computed and named here rather than checked inline, and the UI
 * states the figure instead of just flagging a mismatch.
 */
import type { PayoutDetail } from '@/types';

export interface PayoutReconciliation {
  /** Σ partnerShare of the booking lines. */
  linesTotal: number;
  /** amount − linesTotal. Positive: the payout carries more than the bookings explain. */
  difference: number;
  reconciles: boolean;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function reconcilePayout(
  payout: Pick<PayoutDetail, 'amount' | 'bookings'>,
): PayoutReconciliation {
  const linesTotal = round2(
    payout.bookings.reduce((sum, line) => sum + line.partnerShare, 0),
  );
  const difference = round2(payout.amount - linesTotal);

  return { linesTotal, difference, reconciles: difference === 0 };
}
