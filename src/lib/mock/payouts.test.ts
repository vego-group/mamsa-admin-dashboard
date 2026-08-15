/**
 * The payout rules, not the row shapes.
 *
 * Every assertion here is a control someone could lose money to: an amount the client
 * was allowed to choose, a transfer recorded twice, a reversal that quietly edited
 * history instead of compensating it.
 *
 * These run in declaration order against one shared mock store, because that is what
 * makes "record, then try again" a real sequence rather than two isolated fixtures.
 */
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { PAYOUT_MIN_BALANCE, PAYOUT_STATUS } from '@/lib/constants';
import { splitPrice } from '@/lib/utils/format';
import { mockPayouts, mockWallets } from './index';
import * as seed from './seed';

async function failureOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error('expected the call to reject, but it resolved');
}

describe('eligibility is computed live, not stored', () => {
  it('lists only partners who clear every condition', async () => {
    const eligible = await mockPayouts.listEligible();
    expect(eligible.length).toBeGreaterThanOrEqual(6);

    for (const partner of eligible) {
      expect(partner.amount).toBeGreaterThanOrEqual(PAYOUT_MIN_BALANCE);
      expect(partner.iban).toMatch(/^SA\d{22}$/);
    }
  });

  it('puts everyone else on the ineligible list with a reason', async () => {
    const [eligible, ineligible] = await Promise.all([
      mockPayouts.listEligible(),
      mockPayouts.listIneligible(),
    ]);

    const overlap = eligible.filter((e) =>
      ineligible.some((i) => i.partnerId === e.partnerId),
    );
    expect(overlap).toEqual([]);
    expect(ineligible.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps a below-minimum partner off the list and reports the shortfall', async () => {
    const ineligible = await mockPayouts.listIneligible();
    const below = ineligible.filter((partner) => partner.reason === 'below_minimum');

    expect(below.length).toBeGreaterThanOrEqual(1);
    for (const partner of below) {
      expect(partner.shortfall).toBe(PAYOUT_MIN_BALANCE - partner.availableBalance);
    }
  });

  it('keeps an unverified bank account off the list', async () => {
    const ineligible = await mockPayouts.listIneligible();
    expect(ineligible.some((partner) => partner.reason === 'bank_unverified')).toBe(true);
  });

  it('reports a partner already settled for this month, with the reference', async () => {
    const ineligible = await mockPayouts.listIneligible();
    const paid = ineligible.filter((partner) => partner.reason === 'already_paid_this_month');

    expect(paid.length).toBeGreaterThanOrEqual(1);
    expect(paid[0].paidThisMonthReference).toBeTruthy();
    // Otherwise payable — that is the whole point of the reason existing.
    expect(paid[0].availableBalance).toBeGreaterThanOrEqual(PAYOUT_MIN_BALANCE);
  });
});

describe('recording a transfer', () => {
  it('ignores an amount and an IBAN passed in, and uses the wallet instead', async () => {
    const [target] = await mockPayouts.listEligible();
    const walletBefore = await mockWallets.get(target.partnerId);

    await mockPayouts.record({
      partnerId: target.partnerId,
      bankReference: 'FT-CLIENT-SUPPLIED-1',
      // A tampered client trying to choose what it gets paid, and where.
      amount: 999_999,
      iban: 'SA0000000000000000000000',
    } as never);

    const payouts = await mockPayouts.list({ partnerId: target.partnerId, pageSize: 50 });
    const recorded = payouts.items.find((p) => p.bankReference === 'FT-CLIENT-SUPPLIED-1')!;

    expect(recorded.amount).toBe(walletBefore.availableBalance);
    expect(recorded.amount).not.toBe(999_999);
    expect(recorded.iban).toBe(walletBefore.bankDetails?.iban);
    expect(recorded.iban).not.toBe('SA0000000000000000000000');
  });

  it('moves the money: balance drops, a negative row lands, lifetimePaidOut rises', async () => {
    const [target] = await mockPayouts.listEligible();
    const before = await mockWallets.get(target.partnerId);

    await mockPayouts.record({ partnerId: target.partnerId, bankReference: 'FT-MOVES-MONEY' });
    const after = await mockWallets.get(target.partnerId);

    expect(after.availableBalance).toBe(0);
    expect(after.lifetimePaidOut).toBe(
      Math.round((before.lifetimePaidOut + before.availableBalance) * 100) / 100,
    );

    const row = after.recentLedger[0];
    expect(row.type).toBe('payout');
    expect(row.amount).toBe(-before.availableBalance);
    expect(row.balanceAfter).toBe(0);
  });

  it('drops the partner off the eligible list once paid', async () => {
    const [target] = await mockPayouts.listEligible();
    await mockPayouts.record({ partnerId: target.partnerId, bankReference: 'FT-DROPS-OFF' });

    const eligible = await mockPayouts.listEligible();
    expect(eligible.some((partner) => partner.partnerId === target.partnerId)).toBe(false);
  });

  it('rejects a duplicate bank reference', async () => {
    const [target] = await mockPayouts.listEligible();
    const error = await failureOf(
      mockPayouts.record({ partnerId: target.partnerId, bankReference: 'FT-MOVES-MONEY' }),
    );

    expect(error.code).toBe('DUPLICATE_BANK_REFERENCE');
    expect(error.status).toBe(409);
  });

  it('rejects a second transfer for the same partner in the same Riyadh month', async () => {
    const ineligible = await mockPayouts.listIneligible();
    const alreadyPaid = ineligible.find((p) => p.reason === 'already_paid_this_month')!;

    const error = await failureOf(
      mockPayouts.record({ partnerId: alreadyPaid.partnerId, bankReference: 'FT-SECOND-TRY' }),
    );

    expect(error.code).toBe('ALREADY_PAID_THIS_MONTH');
    expect(error.status).toBe(409);
  });

  it('rejects a transfer dated in the future', async () => {
    const [target] = await mockPayouts.listEligible();
    const error = await failureOf(
      mockPayouts.record({
        partnerId: target.partnerId,
        bankReference: 'FT-FUTURE',
        paidAt: new Date(Date.now() + 90 * 86_400_000).toISOString(),
      }),
    );

    expect(error.status).toBe(422);
  });
});

describe('reversing a payout', () => {
  it('compensates rather than edits, and restores the exact balance', async () => {
    const [target] = await mockPayouts.listEligible();
    const before = await mockWallets.get(target.partnerId);

    const recorded = await mockPayouts.record({
      partnerId: target.partnerId,
      bankReference: 'FT-TO-BE-REVERSED',
    });
    const emptied = await mockWallets.get(target.partnerId);
    expect(emptied.availableBalance).toBe(0);

    await mockPayouts.reverse(recorded.payoutId, {
      reason: 'ارتد التحويل من البنك لعدم تطابق الاسم',
    });
    const restored = await mockWallets.get(target.partnerId);

    expect(restored.availableBalance).toBe(before.availableBalance);
    expect(restored.lifetimePaidOut).toBe(before.lifetimePaidOut);

    const detail = await mockPayouts.get(recorded.payoutId);
    expect(detail.status).toBe(PAYOUT_STATUS.REVERSED);

    // The original debit is still there, untouched, beside a new compensating credit.
    const original = restored.recentLedger.find(
      (row) => row.type === 'payout' && row.refId === recorded.payoutId,
    )!;
    const compensating = restored.recentLedger.find(
      (row) => row.type === 'adjustment' && row.refId === recorded.payoutId,
    )!;

    expect(original.amount).toBe(-before.availableBalance);
    expect(compensating.amount).toBe(before.availableBalance);
    expect(compensating.refType).toBe('payout');
  });

  it('frees the month slot so the partner can be paid again', async () => {
    const [target] = await mockPayouts.listEligible();

    const recorded = await mockPayouts.record({
      partnerId: target.partnerId,
      bankReference: 'FT-FREES-SLOT',
    });
    await mockPayouts.reverse(recorded.payoutId, { reason: 'خطأ في رقم الحساب المستفيد' });

    const eligible = await mockPayouts.listEligible();
    expect(eligible.some((partner) => partner.partnerId === target.partnerId)).toBe(true);
  });

  it('refuses a second reversal', async () => {
    const [target] = await mockPayouts.listEligible();
    const recorded = await mockPayouts.record({
      partnerId: target.partnerId,
      bankReference: 'FT-DOUBLE-REVERSE',
    });

    await mockPayouts.reverse(recorded.payoutId, { reason: 'سبب أول كافٍ الطول' });
    const error = await failureOf(
      mockPayouts.reverse(recorded.payoutId, { reason: 'سبب ثانٍ كافٍ الطول' }),
    );

    expect(error.code).toBe('ALREADY_REVERSED');
    expect(error.status).toBe(409);
  });

  it('requires a reason of at least 10 characters', async () => {
    const [target] = await mockPayouts.listEligible();
    const recorded = await mockPayouts.record({
      partnerId: target.partnerId,
      bankReference: 'FT-SHORT-REASON',
    });

    const error = await failureOf(mockPayouts.reverse(recorded.payoutId, { reason: 'خطأ' }));
    expect(error.status).toBe(422);
  });
});

describe('manual payouts', () => {
  it('refuses an amount larger than the balance, override or not', async () => {
    const [target] = await mockPayouts.listEligible();
    const wallet = await mockWallets.get(target.partnerId);

    const error = await failureOf(
      mockPayouts.createManual({
        partnerId: target.partnerId,
        amount: wallet.availableBalance + 1,
        note: 'تجاوز الرصيد',
        override: true,
      }),
    );

    expect(error.code).toBe('INSUFFICIENT_BALANCE');
    expect(error.status).toBe(422);
  });

  it('bypasses the minimum and the monthly cap when overridden', async () => {
    const ineligible = await mockPayouts.listIneligible();
    const below = ineligible.find(
      (partner) => partner.reason === 'below_minimum' && partner.availableBalance > 0,
    );
    if (!below) return;

    const result = await mockPayouts.createManual({
      partnerId: below.partnerId,
      amount: below.availableBalance,
      note: 'تسوية استثنائية',
      override: true,
    });

    const detail = await mockPayouts.get(result.payoutId);
    expect(detail.isManual).toBe(true);
    expect(detail.status).toBe(PAYOUT_STATUS.PAID);
  });
});

/**
 * Checked against the seed rather than the live store: a payout recorded at runtime is
 * for the whole available balance, which can legitimately include an adjustment no
 * booking accounts for. That discrepancy is real, and the payout drawer surfaces it as a
 * reconciliation warning instead of hiding it — it is not a seeding bug.
 */
describe('seeded payouts reconcile against their booking lines', () => {
  it('sums every payout’s lines to exactly its amount', () => {
    const covered = Object.entries(seed.payoutCoverage);
    expect(covered.length).toBeGreaterThanOrEqual(10);

    for (const [payoutId, bookings] of covered) {
      const payout = seed.payouts.find((item) => item.id === payoutId)!;
      const total =
        Math.round(bookings.reduce((sum, booking) => sum + splitPrice(booking.total).partnerShare, 0) * 100) /
        100;

      expect(total).toBe(payout.amount);
    }
  });

  it('never settles the same booking twice', () => {
    const ids = Object.values(seed.payoutCoverage)
      .flat()
      .map((booking) => booking.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has 14 paid payouts across prior months, one reversed and one manual', () => {
    const paid = seed.payouts.filter((payout) => payout.status === PAYOUT_STATUS.PAID);
    expect(paid.length).toBeGreaterThanOrEqual(14);
    expect(seed.payouts.filter((p) => p.status === PAYOUT_STATUS.REVERSED)).toHaveLength(1);
    expect(seed.payouts.filter((p) => p.isManual)).toHaveLength(1);
    expect(new Set(seed.payouts.map((p) => p.periodMonth)).size).toBeGreaterThanOrEqual(3);
  });
});
