import { describe, expect, it } from 'vitest';
import { AMENITY, UNIT_STATUS, UNIT_TYPE } from '@/lib/constants';
import { ar } from '@/i18n/ar';
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

describe('mockUnits.update — clearing an optional field', () => {
  /**
   * `null` is what the API accepts to empty a field (backend reply 2026-08-26 §5), so the
   * mock has to round-trip it the way the server does. These run against the mock rather
   * than the pure body builder because the bug they guard lived in the mock alone: a
   * naive spread of the patch over the detail shape assumes the write-side and read-side
   * key names match, and for the tourism licence they do not.
   */
  async function editableUnit() {
    const { items } = await mockUnits.list({ pageSize: 50 });
    return items.find((unit) => unit.status !== UNIT_STATUS.PENDING_REVIEW)!;
  }

  it('clears the description', async () => {
    const unit = await editableUnit();
    const updated = await mockUnits.update(unit.id, { description: null });

    expect(updated.description).toBeNull();
  });

  it('clears the address', async () => {
    const unit = await editableUnit();
    const updated = await mockUnits.update(unit.id, { address: null });

    expect(updated.address).toBeNull();
  });

  /**
   * The write side calls it `tourismLicenseNumber`; the read side answers with
   * `tourismPermitNo`. Spreading the patch straight over the detail left the old number
   * in place plus a stray key nothing reads, so the wizard rebaselined to the old value
   * and the clear looked like it had been undone.
   */
  it('clears the tourism licence number under its read-side name', async () => {
    const unit = await editableUnit();
    const updated = await mockUnits.update(unit.id, { tourismLicenseNumber: null });

    expect(updated.tourismPermitNo).toBeNull();
    expect('tourismLicenseNumber' in updated).toBe(false);
  });

  it('leaves a field alone when the patch does not mention it', async () => {
    const unit = await editableUnit();
    const before = await mockUnits.get(unit.id);
    const updated = await mockUnits.update(unit.id, { description: null });

    expect(updated.tourismPermitNo).toBe(before.tourismPermitNo);
    expect(updated.address).toBe(before.address);
  });

  /**
   * The same write/read split as the licence number, and a nastier one: the write side
   * sends amenity *keys* under `amenities`, while the read side uses that name for the
   * stored Arabic *labels* and puts the keys in `amenityKeys`. A naive spread therefore
   * emptied the labels, left the keys untouched — and the wizard reads the keys, so every
   * chip came back on reload.
   */
  it('clears both the amenity keys and the labels read beside them', async () => {
    const unit = await editableUnit();
    const before = await mockUnits.get(unit.id);
    expect(before.amenityKeys.length).toBeGreaterThan(0);

    const updated = await mockUnits.update(unit.id, { amenities: [] });

    expect(updated.amenityKeys).toEqual([]);
    expect(updated.amenities).toEqual([]);
  });

  it('keeps the keys and their labels in step when amenities are replaced', async () => {
    const unit = await editableUnit();
    const updated = await mockUnits.update(unit.id, { amenities: [AMENITY.WIFI, AMENITY.POOL] });

    expect(updated.amenityKeys).toEqual([AMENITY.WIFI, AMENITY.POOL]);
    // Labels, not raw keys — a spread used to put `['wifi','pool']` in this field.
    expect(updated.amenities).toEqual([ar.amenities.wifi, ar.amenities.pool]);
  });

  it('writes a new licence number under the read-side name too', async () => {
    const unit = await editableUnit();
    const updated = await mockUnits.update(unit.id, { tourismLicenseNumber: 'TL-2026-9999' });

    expect(updated.tourismPermitNo).toBe('TL-2026-9999');
  });
});
