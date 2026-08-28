import { describe, expect, it } from 'vitest';
import { PLATFORM_COMMISSION_RATE } from '@/lib/constants';
import { formatSAR } from '@/lib/utils/format';
import { mockDashboard } from './index';

describe('dashboard summary', () => {
  it('reports the headline figures the dashboard renders', async () => {
    const summary = await mockDashboard.summary();

    expect(summary.totalUsers.toLocaleString('en-US')).toBe('38,492');
    expect(summary.totalBookings.toLocaleString('en-US')).toBe('12,847');
    expect(summary.activePartners.toLocaleString('en-US')).toBe('1,847');
    expect(summary.pendingRequests).toBe(94);
    // 10% of the 24.35M lifetime GBV = 2,435,000, compacted. Read off an actual run at
    // the new rate, not hand-derived ('487K SAR' was the 2%-era figure).
    expect(formatSAR(summary.platformCommission, { compact: true })).toBe('2.4M SAR');
    expect(summary.monthlyGrowth).toBe(18.4);
  });

  it('keeps commission on the locked 10% split', async () => {
    const summary = await mockDashboard.summary();
    const impliedGbv = summary.avgBookingValue * summary.totalBookings;

    // Both sides charge the rate on the same gross GBV, so the only gap between them
    // is rounding, and it is bounded rather than guessed: `avgBookingValue` is rounded
    // to a whole riyal, so the GBV reconstructed from it is off by at most 0.5 SAR per
    // booking, and the comparison scales that by the rate (plus round2's half-halala
    // on the real figure):
    //   |platformCommission − impliedGbv × rate| ≤ 0.5 × totalBookings × rate + 0.005
    // The bound grows with the rate — the old fixed ±500 covered 2% four times over
    // but sat BELOW the 10% worst case (642) and survived only because this seed's
    // per-booking residual is 0.38, not the full 0.5.
    const roundingBound = 0.5 * summary.totalBookings * PLATFORM_COMMISSION_RATE + 0.005;
    expect(
      Math.abs(summary.platformCommission - impliedGbv * PLATFORM_COMMISSION_RATE),
    ).toBeLessThanOrEqual(roundingBound);

    for (const point of summary.revenueSeries) {
      expect(point.commission).toBeCloseTo(point.revenue * PLATFORM_COMMISSION_RATE, 2);
    }
  });

  it('splits every booking across the status slices exactly once', async () => {
    const summary = await mockDashboard.summary();
    const sliced = summary.bookingStatusSlices.reduce((sum, slice) => sum + slice.count, 0);

    expect(sliced).toBe(summary.totalBookings);
    expect(new Set(summary.bookingStatusSlices.map((slice) => slice.status)).size).toBe(
      summary.bookingStatusSlices.length,
    );
  });

  it('lists the newest pending requests first', async () => {
    const summary = await mockDashboard.summary();
    const submitted = summary.latestPendingRequests.map((request) =>
      new Date(request.submittedAt).getTime(),
    );

    expect(summary.latestPendingRequests[0]?.code).toBe('APR-94');
    expect([...submitted].sort((a, b) => b - a)).toEqual(submitted);
  });
});
