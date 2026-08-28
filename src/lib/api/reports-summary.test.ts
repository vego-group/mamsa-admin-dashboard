import { describe, expect, it } from 'vitest';
import { normalizeReportsSummary } from './resources';
import type { ReportsSummaryResponse } from '@/types';

/**
 * Figures lifted verbatim from `MAMSA-BACKEND-REPLY-reports-vat-basis.md` §1 — the
 * backend's own live staging response for partner 5, not an invented example.
 *
 * FROZEN 2%-ERA DATA, deliberately. The `commission` below (2,005.20 = 2% of the
 * 100,260 net) was captured before the 2026-08-27 move to 10%. These tests exercise
 * field *mapping*, not the rate, so the payload stays exactly as captured. Anyone
 * refreshing it from a 10%-era response should expect commission ≈ 10,026 and a
 * partnersShare / commission ratio near 9 — see the note on that assertion below.
 */
const LIVE: ReportsSummaryResponse = {
  grossRevenue: 123834.2,
  netRevenue: 100260.0,
  vat: 7298.2,
  fees: 16276.0,
  commission: 2005.2,
  netProfit: 98254.8,
  totalBookings: 23,
  avgMonthlyRevenue: 10319.52,
  revenueSeries: [],
  revenueByCity: [],
  bookingStatusSlices: [],
  bookingVolume: [],
  occupancySeries: [],
  occupancyAverage: 0,
  topPartners: [],
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

describe('the reports money basis survives both field vocabularies', () => {
  it('reads the partner-endpoint names', () => {
    const summary = normalizeReportsSummary(LIVE);

    expect(summary.totalRevenue).toBe(123834.2);
    expect(summary.totalCommission).toBe(2005.2);
    expect(summary.vatCollected).toBe(7298.2);
    expect(summary.fees).toBe(16276.0);
  });

  /**
   * The admin vocabulary — what `/admin/reports/summary` has always emitted, and what
   * this screen actually consumes. Pinned because a backend correction that described
   * the *partner* endpoint nearly had us drop `vatCollected` altogether.
   */
  it('reads the admin-endpoint names, which are the ones this screen receives', () => {
    const summary = normalizeReportsSummary({
      ...LIVE,
      grossRevenue: undefined,
      commission: undefined,
      vat: undefined,
      netProfit: undefined,
      totalRevenue: 123834.2,
      totalCommission: 2005.2,
      vatCollected: 7298.2,
      partnersShare: 98254.8,
    });

    expect(summary.totalRevenue).toBe(123834.2);
    expect(summary.totalCommission).toBe(2005.2);
    expect(summary.vatCollected).toBe(7298.2);
    expect(summary.partnersShare).toBe(98254.8);
  });

  /**
   * The one that matters. `netProfit` is `SUM(partner_share)` — money owed to partners,
   * which is the opposite of platform profit. If it ever reaches a tile labelled
   * "profit", this screen overstates what Mamsa earned by a factor of forty-nine.
   */
  it('maps netProfit onto the partners’ share, never onto profit', () => {
    const summary = normalizeReportsSummary(LIVE);

    expect(summary.partnersShare).toBe(98254.8);
    // What Mamsa actually earned is the commission, and it is two orders smaller.
    expect(summary.totalCommission).toBe(2005.2);
    // 48 encodes the 2%-era split this frozen fixture was captured under (98/2 ≈ 49).
    // A fixture refreshed from a 10%-era payload lands near 9 (90/10) — update this
    // threshold together with the fixture; that drop is not a regression.
    expect(summary.partnersShare! / summary.totalCommission).toBeGreaterThan(48);
  });

  it('holds both of the backend’s stated identities', () => {
    const summary = normalizeReportsSummary(LIVE);

    // netRevenue + vat + fees === gross
    expect(round2(summary.netRevenue! + summary.vatCollected! + summary.fees!)).toBe(summary.totalRevenue);
    // netRevenue − commission === the partners' share
    expect(round2(summary.netRevenue! - summary.totalCommission)).toBe(summary.partnersShare);
  });

  it('never lets a missing figure become a zero', () => {
    // The admin payload carries neither `fees` nor a VAT field under the partner's name.
    const summary = normalizeReportsSummary({ ...LIVE, vat: undefined, fees: undefined });

    // A zero here would claim no VAT was collected — a different, worse statement.
    expect(summary.vatCollected).toBeUndefined();
    expect(summary.fees).toBeUndefined();
  });
});
