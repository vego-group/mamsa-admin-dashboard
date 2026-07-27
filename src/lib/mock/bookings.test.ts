import { describe, expect, it } from 'vitest';
import { BOOKING_STATUS, PLATFORM_COMMISSION_RATE } from '@/lib/constants';
import { splitForUnit } from '@/lib/utils/format';
import { mockBookings } from './index';

describe('mockBookings.list', () => {
  it('shows the newest booking first by default', async () => {
    const { items } = await mockBookings.list({ pageSize: 50 });
    const stamps = items.map((row) => new Date(row.createdAt).getTime());

    expect(stamps).toEqual([...stamps].sort((a, b) => b - a));
  });

  it('lets a column sort override the newest-first default', async () => {
    const { items } = await mockBookings.list({ sortBy: 'total', sortDir: 'desc', pageSize: 50 });
    const totals = items.map((row) => row.total);

    expect(totals).toEqual([...totals].sort((a, b) => b - a));
  });

  it('filters by booking status', async () => {
    const cancelled = await mockBookings.list({ status: BOOKING_STATUS.CANCELLED, pageSize: 50 });
    expect(cancelled.items.every((row) => row.status === BOOKING_STATUS.CANCELLED)).toBe(true);
  });

  it('splits every booking so the parts add back to the total', async () => {
    const { items } = await mockBookings.list({ pageSize: 50 });

    for (const row of items) {
      expect(row.commission + row.partnerShare).toBe(row.total);
      expect(row.commission).toBe(splitForUnit(row.total, row.mamsaOwned).commission);
    }
  });

  it('charges partner units the locked rate and Mamsa units nothing extra', async () => {
    const { items } = await mockBookings.list({ pageSize: 50 });

    for (const row of items) {
      if (row.mamsaOwned) {
        expect(row.commission).toBe(row.total);
        expect(row.partnerShare).toBe(0);
      } else {
        expect(row.commission).toBeCloseTo(row.total * PLATFORM_COMMISSION_RATE, 1);
      }
    }
  });

  it('prices each booking from its nightly rate and length of stay', async () => {
    const { items } = await mockBookings.list({ pageSize: 50 });

    for (const row of items) {
      expect(row.nights).toBeGreaterThan(0);
      expect(row.total).toBe(row.nightlyRate * row.nights);
      expect(new Date(row.checkOut).getTime()).toBeGreaterThan(new Date(row.checkIn).getTime());
    }
  });
});

describe('mockBookings.get', () => {
  it('freezes a cancellation policy with tiers ordered from most to least generous', async () => {
    const { items } = await mockBookings.list({ pageSize: 1 });
    const detail = await mockBookings.get(items[0].id);
    const refunds = detail.policySnapshot.tiers.map((tier) => tier.refundPercent);

    expect(refunds.length).toBeGreaterThan(0);
    expect(refunds).toEqual([...refunds].sort((a, b) => b - a));
    expect(detail.policySnapshot.capturedAt).toBeTruthy();
  });
});

describe('mockBookings.counts', () => {
  it('accounts for every booking exactly once', async () => {
    const counts = await mockBookings.counts();
    const summed = Object.values(BOOKING_STATUS).reduce((sum, status) => sum + counts[status], 0);

    expect(summed).toBe(counts.all);
  });
});
