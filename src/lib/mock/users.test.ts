import { describe, expect, it } from 'vitest';
import { ACCOUNT_STATUS } from '@/lib/constants';
import { mockUsers } from './index';

describe('mockUsers.list', () => {
  it('pages without dropping or duplicating a row', async () => {
    const first = await mockUsers.list({ page: 1, pageSize: 8 });
    const second = await mockUsers.list({ page: 2, pageSize: 8 });

    expect(first.items).toHaveLength(8);
    expect(first.total).toBe(12);
    expect(second.items).toHaveLength(4);
    expect(new Set([...first.items, ...second.items].map((u) => u.id)).size).toBe(12);
  });

  it('filters by status, city and free text together', async () => {
    const byStatus = await mockUsers.list({ status: ACCOUNT_STATUS.DISABLED, pageSize: 50 });
    expect(byStatus.items.every((u) => u.status === ACCOUNT_STATUS.DISABLED)).toBe(true);

    const byCity = await mockUsers.list({ city: 'Riyadh', pageSize: 50 });
    expect(byCity.items.every((u) => u.city === 'Riyadh')).toBe(true);

    const bySearch = await mockUsers.list({ search: 'USR-003', pageSize: 50 });
    expect(bySearch.items.map((u) => u.code)).toEqual(['USR-003']);
  });

  it('sorts on a requested column and leaves seed order alone otherwise', async () => {
    const unsorted = await mockUsers.list({ pageSize: 50 });
    expect(unsorted.items.map((u) => u.code)).toEqual([
      ...unsorted.items.map((u) => u.code).sort(),
    ]);

    const topSpenders = await mockUsers.list({ sortBy: 'totalSpent', sortDir: 'desc', pageSize: 50 });
    const spends = topSpenders.items.map((u) => u.totalSpent);
    expect(spends).toEqual([...spends].sort((a, b) => b - a));
  });

  it('counts every account exactly once across the status tabs', async () => {
    const stats = await mockUsers.stats();
    expect(stats.active + stats.pendingActivation + stats.disabled).toBe(stats.total);
  });
});

describe('mockUsers.get', () => {
  it('never dates a milestone before the account existed', async () => {
    const { items } = await mockUsers.list({ pageSize: 50 });

    for (const user of items) {
      const detail = await mockUsers.get(user.id);
      const stamps = detail.activity.map((entry) => new Date(entry.at).getTime());

      expect(stamps[0]).toBe(new Date(detail.joinedAt).getTime());
      expect([...stamps].sort((a, b) => a - b)).toEqual(stamps);
    }
  });

  it('derives the average from the totals it displays', async () => {
    const detail = await mockUsers.get('usr_001');
    expect(detail.avgBookingValue).toBe(Math.round(detail.totalSpent / detail.bookingsCount));
  });
});
