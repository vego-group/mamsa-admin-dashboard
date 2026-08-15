/**
 * A payout whose booking lines do not add up is a **reachable, legitimate state**, not a
 * bug: the amount is the partner's whole available balance, and that balance can carry a
 * manual adjustment no booking accounts for.
 *
 * This pins the path end to end — record against a partner whose balance includes an
 * adjustment, then assert the discrepancy is detected with the exact figure the drawer
 * puts in front of the operator.
 */
import { describe, expect, it } from 'vitest';
import { ar, en } from '@/i18n';
import { formatSAR } from '@/lib/utils/format';
import { mockPayouts, mockWallets } from '@/lib/mock';
import * as seed from '@/lib/mock/seed';
import { reconcilePayout } from './reconcile';

/** PTR-008 carries the seed's manual adjustment — see the fixture table in seed.ts. */
const PARTNER_WITH_ADJUSTMENT = 'ptr_008';

describe('a payout that carries more than its bookings explain', () => {
  it('is a state the seed can actually produce', () => {
    const adjustments = (seed.partnerLedgers[PARTNER_WITH_ADJUSTMENT] ?? []).filter(
      (row) => row.type === 'adjustment' && row.refType === 'manual',
    );

    expect(adjustments).toHaveLength(1);
    expect(adjustments[0].amount).toBe(150);
  });

  it('reports the unaccounted-for amount, not just a mismatch', async () => {
    const eligible = await mockPayouts.listEligible();
    const target = eligible.find((partner) => partner.partnerId === PARTNER_WITH_ADJUSTMENT);
    expect(target, 'PTR-008 should be due a transfer before this test records one').toBeTruthy();

    const walletBefore = await mockWallets.get(PARTNER_WITH_ADJUSTMENT);
    const recorded = await mockPayouts.record({
      partnerId: PARTNER_WITH_ADJUSTMENT,
      bankReference: 'FT-RECONCILE-1',
    });

    const detail = await mockPayouts.get(recorded.payoutId);
    const reconciliation = reconcilePayout(detail);

    // The payout is for the whole balance; the lines only cover the booking part of it.
    expect(detail.amount).toBe(walletBefore.availableBalance);
    expect(reconciliation.reconciles).toBe(false);
    expect(reconciliation.difference).toBe(150);
    expect(reconciliation.linesTotal).toBe(detail.amount - 150);
  });

  it('states the figure in both dictionaries, worded as an explanation', () => {
    const amount = formatSAR(150);

    for (const dictionary of [ar, en]) {
      const message = dictionary.payouts.reconciliationNote(amount);

      // The operator has to be able to read the number without opening the ledger.
      expect(message).toContain(amount);
      expect(message.length).toBeGreaterThan(40);
    }
  });

  it('says nothing when the lines do add up', () => {
    const clean = reconcilePayout({
      amount: 1000,
      bookings: [
        { partnerShare: 600 },
        { partnerShare: 400 },
      ] as never,
    });

    expect(clean.reconciles).toBe(true);
    expect(clean.difference).toBe(0);
    expect(clean.linesTotal).toBe(1000);
  });

  it('detects a shortfall in the other direction too', () => {
    // A refund clawback after the bookings completed leaves less than the lines suggest.
    const clawed = reconcilePayout({
      amount: 800,
      bookings: [{ partnerShare: 1000 }] as never,
    });

    expect(clawed.reconciles).toBe(false);
    expect(clawed.difference).toBe(-200);
  });
});
