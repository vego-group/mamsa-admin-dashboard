import { describe, expect, it } from 'vitest';
import { PARTNER_STATUS, PARTNER_TYPE } from '@/lib/constants';
import { mockPartners } from './index';

describe('mockPartners.list', () => {
  it('sorts partners awaiting verification to the front by default', async () => {
    const { items } = await mockPartners.list({ pageSize: 50 });
    const statuses = items.map((partner) => partner.status);
    const lastPending = statuses.lastIndexOf(PARTNER_STATUS.PENDING);
    const firstSettled = statuses.findIndex((status) => status !== PARTNER_STATUS.PENDING);

    expect(lastPending).toBeGreaterThanOrEqual(0);
    expect(lastPending).toBeLessThan(firstSettled);
  });

  it('lets an explicit sort override the pending-first default', async () => {
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
  it('keeps every partner split on the locked 2% commission', async () => {
    const { items } = await mockPartners.list({ pageSize: 50 });

    for (const partner of items) {
      const detail = await mockPartners.get(partner.id);
      expect(detail.commissionPaid + detail.partnerEarning).toBe(detail.revenue);
    }
  });

  it('reports the profile figures the drawer renders for PTR-001', async () => {
    const detail = await mockPartners.get('ptr_001');

    expect(detail.revenue).toBe(487_000);
    // 2% of revenue — the locked split, not the 10% the comp sketched.
    expect(detail.commissionPaid).toBe(9_740);
    expect(detail.partnerEarning).toBe(477_260);
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
