/**
 * The wallet ledger is the one screen where a wrong number is worse than no screen —
 * it teaches the accountant to distrust the figure and reconcile by hand. These tests
 * pin the two properties that make the balance trustworthy: the ledger sums to it, and
 * every row's running total is honest.
 */
import { describe, expect, it } from 'vitest';
import { PAYOUT_MIN_BALANCE } from '@/lib/constants';
import { splitPrice } from '@/lib/utils/format';
import type { WalletIneligibleReason } from '@/types';
import { bankDetailsByPartner, bookings, partnerLedgers, partners, wallets } from './seed';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

describe('every partner wallet reconciles against its ledger', () => {
  it('has a wallet and a ledger for every seeded partner', () => {
    expect(wallets).toHaveLength(partners.length);
    for (const partner of partners) {
      expect(partnerLedgers[partner.id]).toBeDefined();
    }
  });

  it('sums the ledger to exactly the available balance', () => {
    for (const wallet of wallets) {
      const total = round2(
        partnerLedgers[wallet.partnerId].reduce((sum, row) => sum + row.amount, 0),
      );
      expect(total).toBe(wallet.availableBalance);
    }
  });

  it('carries a running balanceAfter equal to the total of all prior rows', () => {
    for (const partner of partners) {
      let running = 0;
      for (const row of partnerLedgers[partner.id]) {
        running = round2(running + row.amount);
        expect(row.balanceAfter).toBe(running);
      }
    }
  });

  it('orders every ledger chronologically', () => {
    for (const partner of partners) {
      const times = partnerLedgers[partner.id].map((row) => new Date(row.createdAt).getTime());
      expect([...times].sort((a, b) => a - b)).toEqual(times);
    }
  });

  it('derives lifetime earnings and paid-out from the ledger', () => {
    for (const wallet of wallets) {
      const rows = partnerLedgers[wallet.partnerId];
      const earned = round2(
        rows.filter((r) => r.type === 'earning').reduce((sum, r) => sum + r.amount, 0),
      );
      // A reversed payout is netted off by its compensating credit (refType 'payout').
      const reversedBack = round2(
        rows
          .filter((r) => r.type === 'adjustment' && r.refType === 'payout')
          .reduce((sum, r) => sum + r.amount, 0),
      );
      const paidOut = round2(
        rows.filter((r) => r.type === 'payout').reduce((sum, r) => sum + Math.abs(r.amount), 0) -
          reversedBack,
      );

      expect(wallet.lifetimeEarnings).toBe(earned);
      expect(wallet.lifetimePaidOut).toBe(paidOut);
    }
  });
});

/**
 * A Mamsa-owned unit is stored against the admin who created it. Crediting its bookings
 * would accrue a phantom partner balance for that admin — so it must produce no rows at
 * all, not rows of zero. UNT-014 sits under PTR-001, which makes PTR-001 the proof.
 */
describe('Mamsa-owned bookings produce no ledger entries', () => {
  const mamsaBookings = bookings.filter((booking) => booking.mamsaOwned);

  it('has Mamsa-owned bookings in the seed to exclude', () => {
    expect(mamsaBookings.length).toBeGreaterThan(0);
  });

  it('references none of them from any ledger row — zero rows, not zero amounts', () => {
    const mamsaIds = new Set(mamsaBookings.map((booking) => booking.id));
    const referenced = Object.values(partnerLedgers)
      .flat()
      .filter((row) => mamsaIds.has(row.refId));

    expect(referenced).toEqual([]);
  });

  it("excludes them from the owning partner's balance", () => {
    for (const booking of mamsaBookings) {
      const wallet = wallets.find((item) => item.partnerId === booking.partnerId);
      if (!wallet) continue;

      const rows = partnerLedgers[booking.partnerId];
      const earned = round2(
        rows.filter((r) => r.type === 'earning').reduce((sum, r) => sum + r.amount, 0),
      );
      const earnedIncludingMamsa = round2(earned + splitPrice(booking.total).partnerShare);

      expect(wallet.lifetimeEarnings).toBe(earned);
      expect(wallet.lifetimeEarnings).not.toBe(earnedIncludingMamsa);
    }
  });
});

describe('seeded coverage — every ineligibility path renders', () => {
  const withReason = (reason: string) =>
    wallets.filter((wallet) => wallet.ineligibleReason === reason);

  it('has at least 3 eligible partners', () => {
    const eligible = wallets.filter((wallet) => wallet.payoutEligible);
    expect(eligible.length).toBeGreaterThanOrEqual(3);

    for (const wallet of eligible) {
      expect(wallet.availableBalance).toBeGreaterThanOrEqual(PAYOUT_MIN_BALANCE);
      expect(wallet.bankVerified).toBe(true);
      expect(wallet.ineligibleReason).toBeNull();
    }
  });

  it('has at least 2 below the minimum', () => {
    expect(withReason('below_minimum').length).toBeGreaterThanOrEqual(2);
  });

  it('has at least one unverified and one missing bank account', () => {
    expect(withReason('bank_unverified').length).toBeGreaterThanOrEqual(1);
    expect(withReason('bank_missing').length).toBeGreaterThanOrEqual(1);

    for (const wallet of withReason('bank_missing')) {
      expect(bankDetailsByPartner[wallet.partnerId]).toBeNull();
    }
  });

  it('has a suspended partner', () => {
    expect(withReason('partner_suspended').length).toBeGreaterThanOrEqual(1);
  });

  /**
   * "Awaiting review" and "suspended" are different facts about a partner, and telling a
   * pending partner their account is suspended is a support ticket. These two pin the
   * distinction so a precedence change cannot quietly merge them again.
   */
  it('reports a partner still awaiting approval as not_approved, never suspended', () => {
    const pending = withReason('not_approved');
    expect(pending.length).toBeGreaterThanOrEqual(1);

    for (const wallet of pending) {
      const partner = partners.find((item) => item.id === wallet.partnerId)!;
      expect(partner.status).not.toBe('suspended');
      expect(partner.status).not.toBe('active');
      // Nothing above it in the precedence may be what is really blocking them.
      expect(bankDetailsByPartner[partner.id]?.verified).toBe(true);
      expect(wallet.availableBalance).toBeGreaterThanOrEqual(0);
    }
  });

  it('reserves partner_suspended for an approved account that was switched off', () => {
    for (const wallet of withReason('partner_suspended')) {
      const partner = partners.find((item) => item.id === wallet.partnerId)!;
      expect(partner.status).toBe('suspended');
      expect(partner.isActive).toBe(false);
    }
  });

  it('gives every reason in the union a seeded partner', () => {
    const reasons: WalletIneligibleReason[] = [
      'negative_balance',
      'bank_missing',
      'bank_unverified',
      'not_approved',
      'partner_suspended',
      'below_minimum',
    ];

    for (const reason of reasons) {
      expect(withReason(reason).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has exactly one negative balance, caused by a refund reversal', () => {
    const negative = withReason('negative_balance');
    expect(negative).toHaveLength(1);
    expect(negative[0].availableBalance).toBeLessThan(0);

    const rows = partnerLedgers[negative[0].partnerId];
    expect(rows.some((row) => row.type === 'refund_reversal')).toBe(true);
  });

  it('includes at least one manual adjustment row', () => {
    const adjustments = Object.values(partnerLedgers)
      .flat()
      .filter((row) => row.type === 'adjustment');

    expect(adjustments.length).toBeGreaterThanOrEqual(1);
  });

  it('uses IBANs shaped like real Saudi ones', () => {
    for (const details of Object.values(bankDetailsByPartner)) {
      if (!details) continue;
      expect(details.iban).toMatch(/^SA\d{22}$/);
    }
  });
});
