import { describe, expect, it } from 'vitest';
import { UNIT_STATUS, UNIT_TYPE } from '@/lib/constants';
import { mockUnits } from './index';

describe('mockUnits.list', () => {
  it('filters by status, type and city together', async () => {
    const approved = await mockUnits.list({ status: UNIT_STATUS.APPROVED, pageSize: 50 });
    expect(approved.items.every((u) => u.status === UNIT_STATUS.APPROVED)).toBe(true);

    const villas = await mockUnits.list({ type: UNIT_TYPE.VILLA, pageSize: 50 });
    expect(villas.items.every((u) => u.type === UNIT_TYPE.VILLA)).toBe(true);

    const riyadh = await mockUnits.list({ city: 'Riyadh', pageSize: 50 });
    expect(riyadh.items.every((u) => u.city === 'Riyadh')).toBe(true);
  });

  it('gives neighbouring cards different cover art', async () => {
    const { items } = await mockUnits.list({ pageSize: 8 });
    // Only real photography — several units genuinely have none, and counting their
    // shared `null` as a duplicate cover would fail this for the wrong reason.
    const covers = items.map((unit) => unit.coverImage).filter(Boolean);

    expect(new Set(covers).size).toBe(covers.length);
  });
});

describe('mockUnits.stats', () => {
  it('counts published units as the approved ones — there is no third state', async () => {
    const stats = await mockUnits.stats();
    const approved = await mockUnits.list({ status: UNIT_STATUS.APPROVED, pageSize: 50 });
    const pending = await mockUnits.list({ status: UNIT_STATUS.PENDING_REVIEW, pageSize: 50 });

    expect(stats.approved).toBe(approved.total);
    expect(stats.pendingReview).toBe(pending.total);
    expect(stats.total).toBeGreaterThanOrEqual(stats.approved + stats.pendingReview);
  });

  it('averages occupancy over bookable units only', async () => {
    const stats = await mockUnits.stats();
    const { items } = await mockUnits.list({ status: UNIT_STATUS.APPROVED, pageSize: 50 });
    const expected = Math.round(
      items.reduce((sum, unit) => sum + unit.occupancyRate, 0) / items.length,
    );

    expect(stats.avgOccupancy).toBe(expected);
  });
});

describe('mockUnits.get', () => {
  it('leads the gallery with the cover and offers distinct extra shots', async () => {
    // Picked by cover rather than by id: which seeded unit has photography is a detail of
    // the seed, and pinning an id here makes this fail the day the seed shifts.
    const { items } = await mockUnits.list({ pageSize: 50 });
    const photographed = items.find((unit) => unit.coverImage !== null);
    const detail = await mockUnits.get(photographed!.id);

    expect(detail.images[0]).toBe(detail.coverImage);
    expect(detail.images).toHaveLength(5);
    expect(new Set(detail.images).size).toBe(5);
  });

  it('serves no images at all for a unit with no cover — never a stand-in', async () => {
    const { items } = await mockUnits.list({ pageSize: 50 });
    const unphotographed = items.find((unit) => unit.coverImage === null);
    const detail = await mockUnits.get(unphotographed!.id);

    // A one-element array holding a placeholder is what let a reviewer tick "photos
    // reviewed" on a listing that has none. Empty is the honest answer.
    expect(detail.images).toEqual([]);
  });
});
