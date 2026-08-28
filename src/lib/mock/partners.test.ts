import { describe, expect, it } from 'vitest';
import { PARTNER_TYPE } from '@/lib/constants';
import { mockPartners } from './index';

describe('mockPartners.list', () => {
  it('sorts by an explicit column', async () => {
    const { items } = await mockPartners.list({ sortBy: 'revenue', sortDir: 'desc', pageSize: 50 });
    const revenues = items.map((partner) => partner.revenue);

    expect(revenues).toEqual([...revenues].sort((a, b) => b - a));
  });

  it('splits the type tabs across every partner', async () => {
    const stats = await mockPartners.stats();
    expect(stats.individuals + stats.companies).toBe(stats.total);

    const companies = await mockPartners.list({ type: PARTNER_TYPE.COMPANY, pageSize: 50 });
    expect(companies.total).toBe(stats.companies);
  });
});

describe('mockPartners.get', () => {
  /**
   * Fetched together, not one after another.
   *
   * Awaiting each `get` in sequence cost one mock `delay` per partner — 200-400ms each —
   * so the run time scaled with the seed and sat right on the 5s default timeout. The
   * test failed about three runs in four, which is worse than no test: a suite that is
   * red for a reason nobody trusts stops being read at all. Nothing about what is
   * asserted changed.
   */
  it('keeps every partner split on the locked 10% commission', async () => {
    const { items } = await mockPartners.list({ pageSize: 50 });
    const details = await Promise.all(items.map((partner) => mockPartners.get(partner.id)));

    expect(details).toHaveLength(items.length);
    for (const detail of details) {
      expect(detail.commissionPaid + detail.partnerEarning).toBe(detail.revenue);
    }
  });

  it('reports the profile figures the drawer renders for PTR-001', async () => {
    const detail = await mockPartners.get('ptr_001');

    expect(detail.revenue).toBe(487_000);
    // 10% of revenue — the live rate since 2026-08-27. (10% began as a rejected comp
    // figure; it is now the owner-decided split.)
    expect(detail.commissionPaid).toBe(48_700);
    expect(detail.partnerEarning).toBe(438_300);
    expect(detail.avgPerBooking).toBe(1_561);
    expect(detail.cancellationRate).toBe(1.0);
  });

  it('exposes the record set that matches the partner type', async () => {
    const individual = await mockPartners.get('ptr_001');
    expect(individual.nationalId).not.toBeNull();
    expect(individual.crNumber).toBeNull();

    const company = await mockPartners.get('ptr_002');
    expect(company.crNumber).not.toBeNull();
    expect(company.nationalId).toBeNull();
  });
});
