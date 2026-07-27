import { describe, expect, it } from 'vitest';
import { CANCELLED_BY, REFUND_STATUS } from '@/lib/constants';
import { splitForUnit } from '@/lib/utils/format';
import { mockCancellations } from './index';

describe('mockCancellations.list', () => {
  it('shows the newest cancellation first', async () => {
    const { items } = await mockCancellations.list({ pageSize: 50 });
    const stamps = items.map((row) => new Date(row.at).getTime());

    expect(stamps).toEqual([...stamps].sort((a, b) => b - a));
  });

  it('filters by who cancelled and by refund state', async () => {
    const byHost = await mockCancellations.list({ cancelledBy: CANCELLED_BY.HOST, pageSize: 50 });
    expect(byHost.items.every((row) => row.cancelledBy === CANCELLED_BY.HOST)).toBe(true);

    const failed = await mockCancellations.list({
      refundStatus: REFUND_STATUS.FAILED,
      pageSize: 50,
    });
    expect(failed.items.every((row) => row.refundStatus === REFUND_STATUS.FAILED)).toBe(true);
  });

  it('never refunds more than the booking was worth', async () => {
    const { items } = await mockCancellations.list({ pageSize: 50 });

    for (const row of items) {
      expect(row.refundAmount).toBeLessThanOrEqual(row.bookingTotal);
      expect(row.refundAmount).toBeGreaterThanOrEqual(0);
      // Impact is what the platform lost, so it is never a gain.
      expect(row.impact).toBeLessThanOrEqual(0);
    }
  });

  it('caps the platform loss at the commission it would have earned', async () => {
    const { items } = await mockCancellations.list({ pageSize: 50 });

    for (const row of items) {
      // A Mamsa-owned unit is not split, so the whole booking was the platform's.
      const atStake = splitForUnit(row.bookingTotal, row.mamsaOwned).commission;
      expect(Math.abs(row.impact)).toBeLessThanOrEqual(Math.round(atStake) + 1);
    }
  });
});

describe('mockCancellations.stats', () => {
  it('splits every cancellation between guest and host', async () => {
    const stats = await mockCancellations.stats();
    expect(stats.byGuest + stats.byHost).toBe(stats.total);
  });

  it('accounts for every row exactly once in the refund breakdown', async () => {
    const stats = await mockCancellations.stats();
    const counted = Object.values(stats.refundBreakdown).reduce((sum, value) => sum + value, 0);

    expect(counted).toBe(stats.total);
  });

  it('reports the financial impact as a positive figure to render', async () => {
    const stats = await mockCancellations.stats();
    expect(stats.financialImpact).toBeGreaterThan(0);
  });
});

describe('mockCancellations.highRisk', () => {
  it('lists only flagged partners, worst first', async () => {
    const partners = await mockCancellations.highRisk();
    const counts = partners.map((partner) => partner.cancellations);

    expect(partners.length).toBeGreaterThan(0);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });
});
