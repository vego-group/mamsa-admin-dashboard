import { describe, expect, it } from 'vitest';
import { PLATFORM_COMMISSION_RATE } from '@/lib/constants';
import { formatSAR } from '@/lib/utils/format';
import { mockReports } from './index';

describe('mockReports.summary', () => {
  it('reports the headline figures the revenue tab renders', async () => {
    const summary = await mockReports.summary('1y');

    expect(formatSAR(summary.totalRevenue, { compact: true })).toBe('5.9M SAR');
    expect(summary.totalBookings.toLocaleString('en-US')).toBe('15,440');
    expect(summary.occupancyAverage).toBe(76);
  });

  it('keeps the reported commission on the locked 2% split', async () => {
    const summary = await mockReports.summary('1y');
    expect(summary.totalCommission).toBeCloseTo(summary.totalRevenue * PLATFORM_COMMISSION_RATE, 0);
  });

  it('derives the monthly average from the series it charts', async () => {
    const summary = await mockReports.summary('1y');
    expect(summary.avgMonthlyRevenue).toBe(
      Math.round(summary.totalRevenue / summary.revenueSeries.length),
    );
  });

  it('narrows every series together when the range shortens', async () => {
    const half = await mockReports.summary('6m');

    expect(half.revenueSeries).toHaveLength(6);
    expect(half.bookingVolume).toHaveLength(6);
    expect(half.occupancySeries).toHaveLength(6);
    expect(half.totalRevenue).toBeLessThan((await mockReports.summary('1y')).totalRevenue);
  });

  it('ranks top partners by revenue, highest first', async () => {
    const summary = await mockReports.summary('1y');
    const revenues = summary.topPartners.map((partner) => partner.revenue);

    expect(summary.topPartners).toHaveLength(5);
    expect(revenues).toEqual([...revenues].sort((a, b) => b - a));
  });
});
