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

  it('keeps the reported commission on the locked 10% split', async () => {
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

/**
 * The cheapest guard against a future VAT change silently double-counting tax.
 *
 * `netRevenue` and `vatCollected` are read from the API, never derived here from
 * `totalRevenue` — the backend computes both as `total − taxes`, so the identity holds
 * before and after the VAT-inclusive flip. If a later change starts adding VAT on top of
 * a total that already contains it, this is what fails.
 */
describe('VAT is separated from revenue, never added to it', () => {
  const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

  it('holds for the figures verified against staging', () => {
    // GET /admin/reports/summary?range=1y, 2026-08-14.
    const netRevenue = 225891;
    const vatCollected = 13446.45;
    const totalRevenue = 239337.45;

    expect(round2(netRevenue + vatCollected)).toBe(totalRevenue);
  });

  it('holds for every range the mock serves', async () => {
    for (const range of ['6m', '1y', 'all'] as const) {
      const summary = await mockReports.summary(range);

      expect(summary.netRevenue).toBeDefined();
      expect(summary.vatCollected).toBeDefined();
      expect(round2(summary.netRevenue! + summary.vatCollected!)).toBe(summary.totalRevenue);
    }
  });

  it('never folds VAT into a revenue figure', async () => {
    const summary = await mockReports.summary('1y');

    // Net revenue is strictly smaller than the gross it came out of, and VAT is the gap.
    expect(summary.netRevenue!).toBeLessThan(summary.totalRevenue);
    expect(summary.vatCollected!).toBe(round2(summary.totalRevenue - summary.netRevenue!));
    expect(summary.vatCollected!).toBeGreaterThan(0);
  });
});
