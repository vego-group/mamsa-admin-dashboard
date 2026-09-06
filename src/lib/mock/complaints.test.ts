/**
 * The complaint state machine, and the one guard money depends on.
 *
 * These run against the shared mock store and reset it before each test, so "execute,
 * then execute again with the same key" is a real sequence rather than two fixtures.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { mockComplaints } from './complaints';

async function failureOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error('expected the call to reject, but it resolved');
}

const SUBMITTED = '1001';
/** Mamsa-owned unit, under review. */
const UNDER_REVIEW = '1003';
/** Approved, 600 SAR, nothing executed yet. */
const APPROVED_CLEAN = '1004';
/** Approved, 1,200 SAR, one attempt pending at the gateway. */
const APPROVED_PENDING = '1005';
/** Approved, one attempt failed. */
const APPROVED_FAILED = '1006';
const RESOLVED = '1007';

const KEY = '3b1c6f0e-2d4a-4b8c-9e7f-1a2b3c4d5e6f';
const OTHER_KEY = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

beforeEach(() => mockComplaints.reset());

describe('list', () => {
  it('shows the newest complaint first', async () => {
    const { items, total } = await mockComplaints.list({ pageSize: 50 });
    const stamps = items.map((row) => new Date(row.createdAt ?? 0).getTime());

    expect(total).toBeGreaterThanOrEqual(12);
    expect(stamps).toEqual([...stamps].sort((a, b) => b - a));
  });

  it('filters by status', async () => {
    const approved = await mockComplaints.list({ status: 'approved', pageSize: 50 });
    expect(approved.items.length).toBeGreaterThan(0);
    expect(approved.items.every((row) => row.status === 'approved')).toBe(true);
  });

  it('searches the booking code and the guest mobile', async () => {
    const byCode = await mockComplaints.list({ search: 'BKG-8841' });
    expect(byCode.items.map((row) => row.id)).toEqual([1001]);

    // The guest on BKG-8841 — the search reaches the mobile even though the row omits it.
    const byPhone = await mockComplaints.list({ search: '572413911' });
    expect(byPhone.items.some((row) => row.id === 1001)).toBe(true);
  });

  it('paginates', async () => {
    const first = await mockComplaints.list({ page: 1, pageSize: 10 });
    const second = await mockComplaints.list({ page: 2, pageSize: 10 });

    expect(first.items).toHaveLength(10);
    expect(second.items).toHaveLength(first.total - 10);
  });
});

describe('detail money is integer halalas read off the frozen booking', () => {
  it('sums VAT + commission + partner share to the gross, to the halala', async () => {
    const { booking } = await mockComplaints.get(APPROVED_CLEAN);

    for (const value of [
      booking.grossHalalas,
      booking.vatHalalas,
      booking.commissionHalalas,
      booking.partnerShareHalalas,
      booking.maxRefundableHalalas,
    ]) {
      expect(Number.isInteger(value)).toBe(true);
    }
    expect(booking.vatHalalas + booking.commissionHalalas + booking.partnerShareHalalas).toBe(
      booking.grossHalalas,
    );
    expect(booking.maxRefundableHalalas).toBe(
      booking.grossHalalas - booking.alreadyRefundedHalalas - booking.pendingRefundHalalas,
    );
  });

  it('takes in-flight money off the ceiling while an attempt is pending', async () => {
    const { booking, complaint } = await mockComplaints.get(APPROVED_PENDING);

    expect(booking.pendingRefundHalalas).toBe(complaint.approvedRefundHalalas);
    expect(booking.alreadyRefundedHalalas).toBe(0);
    expect(booking.maxRefundableHalalas).toBe(booking.grossHalalas - booking.pendingRefundHalalas);
  });

  it('flags a Mamsa-owned unit and gives it no partner wallet', async () => {
    const detail = await mockComplaints.get(UNDER_REVIEW);

    expect(detail.booking.mamsaOwned).toBe(true);
    expect(detail.booking.partnerShareHalalas).toBe(0);
    expect(detail.partner.availableBalanceHalalas).toBe(0);
  });

  it('hands out fresh signed attachment URLs on every read', async () => {
    const first = await mockComplaints.get(SUBMITTED);
    const second = await mockComplaints.get(SUBMITTED);

    expect(first.attachments.length).toBeGreaterThan(0);
    expect(first.attachments[0].url).not.toBe(second.attachments[0].url);
  });

  it('answers 404 for an unknown id', async () => {
    const error = await failureOf(mockComplaints.get('999999'));
    expect(error.status).toBe(404);
  });
});

describe('review → approve → reject', () => {
  it('moves submitted to under_review once, then refuses with 409', async () => {
    await mockComplaints.review(SUBMITTED);
    expect((await mockComplaints.get(SUBMITTED)).complaint.status).toBe('under_review');

    const error = await failureOf(mockComplaints.review(SUBMITTED));
    expect(error.status).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('approves an amount within the ceiling and fixes it on the complaint', async () => {
    const before = await mockComplaints.get(UNDER_REVIEW);
    expect(before.booking.maxRefundableHalalas).toBeGreaterThanOrEqual(25000);

    await mockComplaints.approve(UNDER_REVIEW, { amountHalalas: 25000, guestMessage: 'تمت الموافقة' });
    const after = await mockComplaints.get(UNDER_REVIEW);

    expect(after.complaint.status).toBe('approved');
    expect(after.complaint.approvedRefundHalalas).toBe(25000);
    expect(after.complaint.approvedAt).toBeTruthy();
    expect(after.complaint.canAmendApproval).toBe(true);
    expect(after.complaint.guestMessage).toBe('تمت الموافقة');
  });

  it('refuses an amount above the ceiling, with the ceiling on the field', async () => {
    const { booking } = await mockComplaints.get(UNDER_REVIEW);
    const error = await failureOf(
      mockComplaints.approve(UNDER_REVIEW, { amountHalalas: booking.maxRefundableHalalas + 1 }),
    );

    expect(error.status).toBe(422);
    expect(error.code).toBe('AMOUNT_EXCEEDS_REFUNDABLE');
    expect(error.fields?.amountHalalas).toBeTruthy();
  });

  it('refuses a non-integer or non-positive amount', async () => {
    const fractional = await failureOf(mockComplaints.approve(UNDER_REVIEW, { amountHalalas: 10.5 }));
    expect(fractional.status).toBe(422);
    expect(fractional.fields?.amountHalalas).toBeTruthy();

    const zero = await failureOf(mockComplaints.approve(UNDER_REVIEW, { amountHalalas: 0 }));
    expect(zero.status).toBe(422);
  });

  it('rejects only with a guest message, and closes the complaint', async () => {
    const missing = await failureOf(mockComplaints.reject(UNDER_REVIEW, { guestMessage: '  ' }));
    expect(missing.status).toBe(422);
    expect(missing.fields?.guestMessage).toBeTruthy();

    await mockComplaints.reject(UNDER_REVIEW, { guestMessage: 'لا أساس للشكوى' });
    const after = await mockComplaints.get(UNDER_REVIEW);
    expect(after.complaint.status).toBe('resolved_rejected');
    expect(after.complaint.guestMessage).toBe('لا أساس للشكوى');

    const again = await failureOf(mockComplaints.reject(UNDER_REVIEW, { guestMessage: 'x' }));
    expect(again.status).toBe(409);
  });
});

describe('executing the approved amount', () => {
  it('refuses any amount but the approved one, naming the approved amount on the field', async () => {
    const { complaint } = await mockComplaints.get(APPROVED_CLEAN);
    const error = await failureOf(
      mockComplaints.refund(APPROVED_CLEAN, {
        amountHalalas: complaint.approvedRefundHalalas! - 1,
        idempotencyKey: KEY,
      }),
    );

    expect(error.status).toBe(422);
    expect(error.code).toBe('AMOUNT_NOT_APPROVED');
    expect(error.fields?.amountHalalas).toContain('600.00');
    // Nothing was written: no row, and the key is still unused.
    expect((await mockComplaints.get(APPROVED_CLEAN)).refunds).toHaveLength(0);
  });

  it('leaves a pending row, keeps the complaint approved and locks the amount', async () => {
    const result = await mockComplaints.refund(APPROVED_CLEAN, {
      amountHalalas: 60000,
      idempotencyKey: KEY,
    });
    expect(result.status).toBe('pending');
    expect(result.replayed).toBeUndefined();

    const after = await mockComplaints.get(APPROVED_CLEAN);
    expect(after.complaint.status).toBe('approved');
    expect(after.complaint.canAmendApproval).toBe(false);
    expect(after.refunds).toHaveLength(1);
    expect(after.refunds[0].status).toBe('pending');
    expect(after.refunds[0].amountHalalas).toBe(60000);
    // Not settled, so not "refunded" — but at the gateway, so it comes off the ceiling.
    expect(after.booking.alreadyRefundedHalalas).toBe(0);
    expect(after.booking.pendingRefundHalalas).toBe(60000);
    expect(after.booking.maxRefundableHalalas).toBe(after.booking.grossHalalas - 60000);

    const amend = await failureOf(mockComplaints.amendApproval(APPROVED_CLEAN, 50000));
    expect(amend.status).toBe(409);
    expect(amend.code).toBe('REFUND_IN_FLIGHT');
  });

  it('replays the same key with the original result and no second row', async () => {
    const first = await mockComplaints.refund(APPROVED_CLEAN, {
      amountHalalas: 60000,
      idempotencyKey: KEY,
    });
    const second = await mockComplaints.refund(APPROVED_CLEAN, {
      amountHalalas: 60000,
      idempotencyKey: KEY,
    });

    expect(second.replayed).toBe(true);
    expect(second.refundId).toBe(first.refundId);
    expect((await mockComplaints.get(APPROVED_CLEAN)).refunds).toHaveLength(1);
  });

  /**
   * The backend's guard, added 2026-09-06: a second execution under a NEW key while the
   * first is still pending is refused with `REFUND_IN_FLIGHT`, naming the attempt in
   * flight. Not a failure — nothing to retry — so the message must not invite one. The
   * page's own gate stays as the first layer; its proof lives in `refund-state.test.ts`.
   */
  it('refuses a second execution under a new key while the first is pending', async () => {
    const first = await mockComplaints.refund(APPROVED_CLEAN, {
      amountHalalas: 60000,
      idempotencyKey: KEY,
    });
    const error = await failureOf(
      mockComplaints.refund(APPROVED_CLEAN, { amountHalalas: 60000, idempotencyKey: OTHER_KEY }),
    );

    expect(error.status).toBe(409);
    expect(error.code).toBe('REFUND_IN_FLIGHT');
    expect(error.fields?.refundId).toBe(String(first.refundId));
    expect(error.message).not.toMatch(/حاول|try again/i);

    const { refunds } = await mockComplaints.get(APPROVED_CLEAN);
    expect(refunds).toHaveLength(1);
  });

  it('still replays the original key while its attempt is pending, rather than refusing it', async () => {
    const first = await mockComplaints.refund(APPROVED_CLEAN, {
      amountHalalas: 60000,
      idempotencyKey: KEY,
    });
    const replay = await mockComplaints.refund(APPROVED_CLEAN, {
      amountHalalas: 60000,
      idempotencyKey: KEY,
    });

    expect(replay.replayed).toBe(true);
    expect(replay.refundId).toBe(first.refundId);
  });

  it('charges the partner less than the refund on a partner unit — VAT and commission are not theirs', async () => {
    await mockComplaints.refund(APPROVED_CLEAN, { amountHalalas: 60000, idempotencyKey: KEY });
    const { refunds } = await mockComplaints.get(APPROVED_CLEAN);

    expect(refunds[0].partnerHalalas).toBeGreaterThan(0);
    expect(refunds[0].partnerHalalas).toBeLessThan(refunds[0].amountHalalas);
  });

  it('gives a Mamsa-owned refund no partner deduction', async () => {
    await mockComplaints.approve(UNDER_REVIEW, { amountHalalas: 30000 });
    await mockComplaints.refund(UNDER_REVIEW, { amountHalalas: 30000, idempotencyKey: KEY });

    const { refunds, booking } = await mockComplaints.get(UNDER_REVIEW);
    expect(booking.mamsaOwned).toBe(true);
    expect(refunds[0].partnerHalalas).toBe(0);
  });

  it('refuses to execute anything that is not approved', async () => {
    const error = await failureOf(
      mockComplaints.refund(SUBMITTED, { amountHalalas: 1, idempotencyKey: KEY }),
    );
    expect(error.status).toBe(409);
  });
});

describe('rejecting from approved (contract update of 2026-09-06)', () => {
  it('is open while nothing has been executed, and closes the complaint', async () => {
    const before = await mockComplaints.get(APPROVED_CLEAN);
    expect(before.complaint.canReject).toBe(true);

    await mockComplaints.reject(APPROVED_CLEAN, { guestMessage: 'وصل دليل من الشريك ينفي الشكوى.' });
    const after = await mockComplaints.get(APPROVED_CLEAN);

    expect(after.complaint.status).toBe('resolved_rejected');
    expect(after.complaint.guestMessage).toBe('وصل دليل من الشريك ينفي الشكوى.');
    expect(after.complaint.canReject).toBe(false);
    expect(after.complaint.canAmendApproval).toBe(false);
  });

  it('is refused with REFUND_IN_FLIGHT once an attempt is pending', async () => {
    const { complaint, refunds } = await mockComplaints.get(APPROVED_PENDING);
    expect(complaint.canReject).toBe(false);

    const error = await failureOf(
      mockComplaints.reject(APPROVED_PENDING, { guestMessage: 'لا أساس للشكوى.' }),
    );
    expect(error.status).toBe(409);
    expect(error.code).toBe('REFUND_IN_FLIGHT');
    expect(error.fields?.refundId).toBe(String(refunds[0].id));
    expect((await mockComplaints.get(APPROVED_PENDING)).complaint.status).toBe('approved');
  });

  it('stays open after a failed attempt — no money moved', async () => {
    const { complaint } = await mockComplaints.get(APPROVED_FAILED);
    expect(complaint.canReject).toBe(true);
    expect(complaint.canAmendApproval).toBe(true);
  });

  it('flips canReject on exactly the condition that flips canAmendApproval', async () => {
    const { items } = await mockComplaints.list({ pageSize: 50 });

    for (const row of items) {
      const { complaint, refunds } = await mockComplaints.get(String(row.id));
      const moving = refunds.some((r) => r.status === 'pending' || r.status === 'succeeded');

      if (complaint.status === 'approved') {
        expect(complaint.canReject).toBe(complaint.canAmendApproval);
        expect(complaint.canReject).toBe(!moving);
      } else if (complaint.status === 'under_review') {
        expect(complaint.canReject).toBe(true);
      } else {
        expect(complaint.canReject).toBe(false);
      }
    }
  });
});

describe('settlement — the webhook / hourly-job stand-in', () => {
  it('a failure reopens the door: amend and a fresh execution are allowed again', async () => {
    await mockComplaints.settle(APPROVED_PENDING, 'failed', 'gateway_timeout');
    const after = await mockComplaints.get(APPROVED_PENDING);

    expect(after.complaint.status).toBe('approved');
    expect(after.refunds[0].status).toBe('failed');
    expect(after.refunds[0].failureReason).toBe('gateway_timeout');
    expect(after.complaint.canAmendApproval).toBe(true);
    // Nothing is at the gateway any more, so the whole booking is available again.
    expect(after.booking.pendingRefundHalalas).toBe(0);
    expect(after.booking.maxRefundableHalalas).toBe(after.booking.grossHalalas);

    const retry = await mockComplaints.refund(APPROVED_PENDING, {
      amountHalalas: after.complaint.approvedRefundHalalas!,
      idempotencyKey: OTHER_KEY,
    });
    expect(retry.status).toBe('pending');
  });

  it('a success resolves the complaint and lowers the ceiling by what moved', async () => {
    const before = await mockComplaints.get(APPROVED_PENDING);
    const approved = before.complaint.approvedRefundHalalas!;

    await mockComplaints.settle(APPROVED_PENDING, 'succeeded');
    const after = await mockComplaints.get(APPROVED_PENDING);

    expect(after.complaint.status).toBe('resolved_refunded');
    expect(after.complaint.canAmendApproval).toBe(false);
    expect(after.booking.alreadyRefundedHalalas).toBe(approved);
    expect(after.booking.pendingRefundHalalas).toBe(0);
    // The ceiling does not move at settlement: the money came off it while pending.
    expect(after.booking.maxRefundableHalalas).toBe(before.booking.maxRefundableHalalas);
    expect(after.booking.maxRefundableHalalas).toBe(after.booking.grossHalalas - approved);

    const again = await failureOf(
      mockComplaints.refund(APPROVED_PENDING, { amountHalalas: approved, idempotencyKey: OTHER_KEY }),
    );
    expect(again.status).toBe(409);
    expect(again.code).toBe('REFUND_IN_FLIGHT');
  });

  it('seeds a retryable failure and a read-only resolution', async () => {
    const failed = await mockComplaints.get(APPROVED_FAILED);
    expect(failed.refunds.every((row) => row.status === 'failed')).toBe(true);
    expect(failed.refunds[0].failureReason).toBeTruthy();
    expect(failed.complaint.canAmendApproval).toBe(true);

    const resolved = await mockComplaints.get(RESOLVED);
    expect(resolved.complaint.status).toBe('resolved_refunded');
    expect(resolved.complaint.canAmendApproval).toBe(false);
    expect(resolved.refunds.some((row) => row.status === 'succeeded')).toBe(true);
  });
});
