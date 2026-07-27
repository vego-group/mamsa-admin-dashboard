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
    expect(formatSAR(summary.platformCommission, { compact: true })).toBe('487K SAR');
    expect(summary.monthlyGrowth).toBe(18.4);
  });

  it('keeps commission on the locked 2% split', async () => {
    const summary = await mockDashboard.summary();
    const impliedGbv = summary.avgBookingValue * summary.totalBookings;

    // Rounding on the per-booking average costs a few riyals across 12k bookings.
    expect(summary.platformCommission).toBeCloseTo(impliedGbv * PLATFORM_COMMISSION_RATE, -3);

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
