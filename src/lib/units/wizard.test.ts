import { describe, expect, it } from 'vitest';
import { AMENITY, CANCELLATION_POLICY, UNIT_STATUS, UNIT_TYPE } from '@/lib/constants';
import {
  MAX_DESCRIPTION,
  MIN_DESCRIPTION,
  canCreate,
  coverPhotoOf,
  firstIncompleteCreateStep,
  hasChanges,
  hasUnmergeablePhotos,
  isDefinitelyUndersized,
  stateFromUnit,
  stepValidity,
  stepsWithErrors,
  submitWouldBeNoop,
  toCreateBody,
  toPatchBody,
  type PhotoItem,
  type UnitWizardState,
} from './wizard';
import { EMPTY_WIZARD_STATE } from './wizard';
import type { UnitDetail } from '@/types';
import { DESCRIPTION_TEMPLATE } from './description-template';
import { ar } from '@/i18n/ar';
import { en } from '@/i18n/en';

function photo(overrides: Partial<PhotoItem> = {}): PhotoItem {
  return {
    localId: 'p1',
    previewUrl: 'blob:1',
    fileName: 'a.jpg',
    fileId: 'file_1',
    uploading: false,
    error: null,
    ...overrides,
  };
}

function complete(overrides: Partial<UnitWizardState> = {}): UnitWizardState {
  return {
    ...EMPTY_WIZARD_STATE,
    licenseNo: 'TL-2025-0001',
    licenseFile: { fileId: 'file_lic', fileName: 'permit.pdf' },
    name: '  Mamsa Al Olaya  ',
    type: UNIT_TYPE.STUDIO,
    pricePerNight: '450',
    sizeSqm: 90,
    city: 'riyadh',
    district: '  Al Olaya  ',
    description: 'A description comfortably past the minimum length.',
    amenities: [AMENITY.WIFI, AMENITY.ELEVATOR],
    location: { lat: 24.7136, lng: 46.6753 },
    address: 'Al Olaya, Riyadh',
    photos: [photo()],
    coverId: 'p1',
    ...overrides,
  };
}

describe('toCreateBody', () => {
  it('carries the whole listing, not just the stored nine', () => {
    const body = toCreateBody(complete());

    expect(body.description).toBe('A description comfortably past the minimum length.');
    // Sorted, not as picked — the comparison in toPatchBody is positional, so the wire
    // body is normalised to keep a re-picked set from reading as an edit.
    expect(body.amenities).toEqual([AMENITY.ELEVATOR, AMENITY.WIFI]);
    expect(body.lat).toBe(24.7136);
    expect(body.tourismLicenseFileId).toBe('file_lic');
    expect(body.photoFileIds).toEqual(['file_1']);
    expect(body.coverFileId).toBe('file_1');
  });

  it('never claims ownership — the server sets mamsaOwned', () => {
    expect('mamsaOwned' in toCreateBody(complete())).toBe(false);
  });

  it('trims the free-text fields', () => {
    const body = toCreateBody(complete());

    expect(body.name).toBe('Mamsa Al Olaya');
    expect(body.district).toBe('Al Olaya');
  });

  it('omits empty optionals rather than sending a blank string', () => {
    const body = toCreateBody(complete({ address: '   ', description: '', licenseNo: '' }));

    expect(body.address).toBeUndefined();
    expect(body.description).toBeUndefined();
    expect(body.tourismLicenseNumber).toBeUndefined();
  });

  it('omits photoFileIds entirely when nothing has been uploaded', () => {
    // An edit that never touched the gallery must not send an empty array — that would
    // replace the unit's photos with nothing.
    const body = toCreateBody(complete({ photos: [photo({ fileId: null, remote: true })] }));

    expect(body.photoFileIds).toBeUndefined();
    expect(body.coverFileId).toBeUndefined();
  });

  it('reads the price out of its text field', () => {
    expect(toCreateBody(complete({ pricePerNight: '' })).pricePerNight).toBe(0);
    expect(toCreateBody(complete({ pricePerNight: '450.5' })).pricePerNight).toBe(450.5);
  });
});

describe('toPatchBody', () => {
  it('sends nothing when nothing changed', () => {
    const state = complete();

    expect(toPatchBody(state, state)).toEqual({});
    expect(hasChanges(state, state)).toBe(false);
  });

  it('sends only the fields that actually differ', () => {
    const before = complete();
    const after = complete({ pricePerNight: '600' });

    expect(toPatchBody(after, before)).toEqual({ pricePerNight: 600 });
  });

  it('treats an edit that was undone as unchanged', () => {
    const before = complete();
    const after = complete({ name: '  Mamsa Al Olaya  ' });

    expect(hasChanges(after, before)).toBe(false);
  });

  it('notices an amenity being added', () => {
    const before = complete();
    const after = complete({ amenities: [AMENITY.WIFI, AMENITY.ELEVATOR, AMENITY.POOL] });

    expect(toPatchBody(after, before)).toEqual({
      amenities: [AMENITY.ELEVATOR, AMENITY.POOL, AMENITY.WIFI],
    });
  });
});

describe('canCreate', () => {
  it('accepts a unit with only the create-time fields filled in', () => {
    // No permit, no photos, no location — a draft the admin will finish later.
    const draft = complete({
      licenseNo: '',
      licenseFile: null,
      description: '',
      location: null,
      address: '',
      photos: [],
      coverId: null,
    });

    expect(canCreate(draft)).toBe(true);
  });

  it('requires a district — the API does, and a rejection here is confusing', () => {
    expect(canCreate(complete({ district: '  ' }))).toBe(false);
  });

  it('points a missing district at the step that actually holds the field', () => {
    // City and district live on the location step. Sending an admin to the details
    // step for them is a disabled button with nothing on screen to fix.
    expect(firstIncompleteCreateStep(complete({ district: '  ' }))).toBe(2);
    expect(firstIncompleteCreateStep(complete({ city: '' }))).toBe(2);
  });

  it('points a missing name or price at the details step', () => {
    expect(firstIncompleteCreateStep(complete({ name: 'x' }))).toBe(1);
    expect(firstIncompleteCreateStep(complete({ pricePerNight: '0' }))).toBe(1);
  });

  it('returns null when the unit is saveable', () => {
    expect(firstIncompleteCreateStep(complete())).toBeNull();
  });

  it('rejects a price of zero', () => {
    expect(canCreate(complete({ pricePerNight: '0' }))).toBe(false);
  });

  it('rejects a one-character name', () => {
    expect(canCreate(complete({ name: 'x' }))).toBe(false);
  });
});

describe('coverPhotoOf', () => {
  it('falls back to the first uploaded photo when the cover was removed', () => {
    const state = complete({
      photos: [photo({ localId: 'a', fileId: 'fa' }), photo({ localId: 'b', fileId: 'fb' })],
      coverId: null,
    });

    expect(coverPhotoOf(state)?.fileId).toBe('fa');
  });

  it('never nominates a photo that has no file id', () => {
    const state = complete({
      photos: [photo({ localId: 'a', fileId: null }), photo({ localId: 'b', fileId: 'fb' })],
      coverId: 'a',
    });

    expect(coverPhotoOf(state)?.fileId).toBe('fb');
  });
});

describe('stepValidity', () => {
  it('accepts a complete listing on every step', () => {
    expect(stepValidity(complete())).toEqual([true, true, true, true, true]);
  });

  it('checks city and district on the step that shows them, not the details step', () => {
    // The regression this guards: district starts empty, so validating it under
    // "details" left Next permanently disabled with the field two screens away.
    const noDistrict = complete({ district: '  ' });

    expect(stepValidity(noDistrict)[1]).toBe(true);
    expect(stepValidity(noDistrict)[2]).toBe(false);
  });

  it('requires the permit file on the licence step', () => {
    expect(stepValidity(complete({ licenseFile: null }))[0]).toBe(false);
  });

  it('requires a photo before the review step', () => {
    expect(stepValidity(complete({ photos: [], coverId: null }))[3]).toBe(false);
  });

  it('counts a photo already on the unit as satisfying the gallery', () => {
    const state = complete({ photos: [photo({ fileId: null, remote: true })] });

    expect(stepValidity(state)[3]).toBe(true);
  });

  it('blocks the photo step while an upload is still in flight', () => {
    const state = complete({
      photos: [photo({ localId: 'a' }), photo({ localId: 'b', fileId: null, uploading: true })],
    });

    expect(stepValidity(state)[3]).toBe(false);
  });

  it('rejects a description the server would refuse as too short', () => {
    expect(stepValidity(complete({ description: 'x'.repeat(MIN_DESCRIPTION - 1) }))[1]).toBe(false);
  });

  it('rejects a pin outside Saudi Arabia even with an address typed', () => {
    // Cairo — the mis-drag onto another country the bounding box exists to catch.
    expect(stepValidity(complete({ location: { lat: 30.0444, lng: 31.2357 } }))[2]).toBe(false);
  });

  it('accepts Gulf neighbours the rectangle cannot exclude', () => {
    // Dubai sits inside the box. Documented rather than fixed: see SAUDI_BOUNDS — a
    // rectangle narrow enough to exclude it also excludes the eastern province.
    expect(stepValidity(complete({ location: { lat: 25.2048, lng: 55.2708 } }))[2]).toBe(true);
  });

  it('rejects a missing pin', () => {
    expect(stepValidity(complete({ location: null }))[2]).toBe(false);
  });
});

describe('stepsWithErrors', () => {
  it('routes every field the API rejects to the step that owns it', () => {
    const steps = stepsWithErrors({
      tourismLicenseNumber: 'مطلوب',
      description: 'قصير',
      address: 'مطلوب',
      photos: 'أضف صورة',
    });

    expect(steps).toEqual(['license', 'details', 'location', 'photos']);
  });

  it('maps the two keys that have no body field of their own', () => {
    // `location` is lat/lng together; `photos` is the gallery as a whole.
    expect(stepsWithErrors({ location: 'خارج الحدود' })).toEqual(['location']);
    expect(stepsWithErrors({ photos: 'مطلوبة' })).toEqual(['photos']);
  });

  it('strips the index off a flat dotted key', () => {
    expect(stepsWithErrors({ 'photoFileIds.2': 'ملف غير صالح' })).toEqual(['photos']);
    expect(stepsWithErrors({ 'amenities.0': 'غير معروف' })).toEqual(['details']);
  });

  it('sends an unrecognised field to the review step rather than swallowing it', () => {
    expect(stepsWithErrors({ somethingNewTheApiAdded: 'خطأ' })).toEqual(['review']);
  });

  it('reports each step once even when several of its fields fail', () => {
    expect(stepsWithErrors({ name: 'a', description: 'b', pricePerNight: 'c' })).toEqual([
      'details',
    ]);
  });
});

/* -------------------------------------------------------------- edit mode */

function savedUnit(overrides: Partial<UnitDetail> = {}): UnitDetail {
  return {
    id: 'u_1',
    code: 'UNT-001',
    name: 'Mamsa Al Olaya',
    partnerId: 'mamsa',
    partnerName: 'ممسى',
    city: 'الرياض',
    cityKey: 'riyadh',
    district: 'العليا',
    type: UNIT_TYPE.STUDIO,
    status: UNIT_STATUS.APPROVED,
    pricePerNight: 450,
    bedrooms: 1,
    bathrooms: 1,
    capacity: 2,
    sizeSqm: 90,
    rating: 0,
    reviewsCount: 0,
    occupancyRate: 0,
    revenue: 0,
    bookingsCount: 0,
    coverImage: null,
    mamsaOwned: true,
    rejectionReason: null,
    approvedAt: null,
    description: 'A stored description.',
    images: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
    photos: [
      { id: 'file_a', url: 'https://cdn/a.jpg', isCover: false },
      { id: 'file_b', url: 'https://cdn/b.jpg', isCover: true },
    ],
    amenities: ['واي فاي', 'تكييف'],
    amenityKeys: [AMENITY.WIFI, AMENITY.AC],
    lat: 24.7136,
    lng: 46.6753,
    address: 'حي العليا، الرياض',
    beds: 3,
    checkIn: '16:00',
    checkOut: '11:00',
    cancellationPolicy: CANCELLATION_POLICY.STRICT,
    publicUrl: null,
    tourismPermitNo: 'TL-2025-0001',
    permitFileUrl: 'https://cdn/permit.pdf',
    tourismLicenseFileId: 'file_permit',
    ownerIdNumber: null,
    ...overrides,
  };
}

describe('stateFromUnit', () => {
  it('prefills from the record, never from a default', () => {
    // The regression this guards: the wizard used to state `moderate` / `15:00` /
    // `12:00` as though they were the unit's values, because the read side had no way
    // to tell it otherwise.
    const state = stateFromUnit(savedUnit());

    expect(state.cancellationPolicy).toBe(CANCELLATION_POLICY.STRICT);
    expect(state.checkIn).toBe('16:00');
    expect(state.checkOut).toBe('11:00');
    expect(state.beds).toBe(3);
    expect(state.address).toBe('حي العليا، الرياض');
  });

  it('takes amenity keys from the server rather than reading labels back', () => {
    expect(stateFromUnit(savedUnit()).amenities).toEqual([AMENITY.WIFI, AMENITY.AC]);
  });

  it('uses the city slug, not the stored Arabic label', () => {
    expect(stateFromUnit(savedUnit()).city).toBe('riyadh');
  });

  it('falls back to the stored label when the slug is missing', () => {
    expect(stateFromUnit(savedUnit({ cityKey: null })).city).toBe('الرياض');
  });

  it('carries the permit id, not the display URL', () => {
    expect(stateFromUnit(savedUnit()).licenseFile?.fileId).toBe('file_permit');
  });

  it('marks the cover the server nominated, not the first photo', () => {
    expect(coverPhotoOf(stateFromUnit(savedUnit()))?.fileId).toBe('file_b');
  });

  it('seeds beds from bedrooms only when the server has none', () => {
    expect(stateFromUnit(savedUnit({ beds: null, bedrooms: 4 })).beds).toBe(4);
  });
});

describe('editing the gallery', () => {
  it('merges a new photo into the existing set instead of replacing it', () => {
    const state = stateFromUnit(savedUnit());
    const withNew: UnitWizardState = {
      ...state,
      photos: [...state.photos, photo({ localId: 'new', fileId: 'file_c' })],
    };

    const body = toCreateBody(withNew);

    expect(body.photoFileIds).toEqual(['file_a', 'file_b', 'file_c']);
    // Sent explicitly on every photo edit — omitting it silently moves the cover to the
    // first photo when the admin only meant to append.
    expect(body.coverFileId).toBe('file_b');
  });

  it('removes a photo by leaving it out of the authoritative set', () => {
    const state = stateFromUnit(savedUnit());
    const withoutFirst: UnitWizardState = {
      ...state,
      photos: state.photos.filter((item) => item.fileId !== 'file_a'),
    };

    expect(toCreateBody(withoutFirst).photoFileIds).toEqual(['file_b']);
  });

  it('sends no gallery change when the photos were not touched', () => {
    const state = stateFromUnit(savedUnit());

    expect(toPatchBody(state, state).photoFileIds).toBeUndefined();
  });

  it('warns only for a unit holding a photo from before the upload flow', () => {
    expect(hasUnmergeablePhotos(stateFromUnit(savedUnit()))).toBe(false);

    const legacy = savedUnit({
      photos: [{ id: null, url: 'https://cdn/old.jpg', isCover: true }],
    });
    expect(hasUnmergeablePhotos(stateFromUnit(legacy))).toBe(true);
  });
});

describe('clearing an optional field', () => {
  /**
   * `undefined` cannot ask for anything.
   *
   * `toCreateBody` maps an emptied optional to `undefined`, `JSON.stringify` drops
   * undefined-valued keys, and the server reads an absent key as "unchanged" — so the
   * patch went out as `{}` and kept the old text. Worse than the no-op: `hasChanges`
   * counted the key, so the wizard's guard did not fire and an approved unit was knocked
   * back to `pending_review` to change nothing. `null` is the spelling that clears
   * (backend reply 2026-08-26 §5).
   */
  it('sends null for each of the three text fields', () => {
    const original = stateFromUnit(savedUnit());

    expect(toPatchBody({ ...original, description: '' }, original)).toEqual({
      description: null,
    });
    expect(toPatchBody({ ...original, address: '' }, original)).toEqual({ address: null });
    expect(toPatchBody({ ...original, licenseNo: '' }, original)).toEqual({
      tourismLicenseNumber: null,
    });
  });

  it('counts a clear as a change, so the save button is reachable', () => {
    const original = stateFromUnit(savedUnit());

    expect(hasChanges({ ...original, description: '' }, original)).toBe(true);
  });

  it('treats whitespace as empty rather than as a value to store', () => {
    const original = stateFromUnit(savedUnit());

    expect(toPatchBody({ ...original, description: '   \n\n  ' }, original)).toEqual({
      description: null,
    });
  });

  /**
   * A field that was already empty and stays empty is not a clear. Both sides are
   * `undefined`, so the equality check ends it before the clearing branch is reached —
   * otherwise opening an edit form and saving nothing would send three nulls.
   */
  it('sends nothing for a field that was empty to begin with', () => {
    const blank = stateFromUnit(
      savedUnit({ description: '', address: null, tourismPermitNo: null }),
    );

    expect(toPatchBody(blank, blank)).toEqual({});
    expect(hasChanges(blank, blank)).toBe(false);
  });

  /**
   * An emptied amenity list is sent as `[]`, not as `null`.
   *
   * The server takes either on either shape, so this is a choice: `[]` says "this set,
   * and it is empty", and — decisively — `[]` on an array has always worked in
   * production while `null` on an array is built but not yet deployed there. The
   * spelling that works everywhere wins.
   */
  it('empties the amenity list with an empty array', () => {
    const original = stateFromUnit(savedUnit());
    const stripped: UnitWizardState = { ...original, amenities: [] };

    expect(toPatchBody(stripped, original)).toEqual({ amenities: [] });
    expect(hasChanges(stripped, original)).toBe(true);
  });

  it('does not send an empty array for a list that was already empty', () => {
    const blank = stateFromUnit(savedUnit({ amenityKeys: [] }));

    expect(toPatchBody(blank, blank)).toEqual({});
  });

  /**
   * `photoFileIds` stays out of the clearable set: an empty array there means "delete
   * every photo", and a gallery that looks empty in the form is not always one the admin
   * emptied.
   */
  it('never sends an empty photo list, whatever the gallery looks like', () => {
    const original = stateFromUnit(savedUnit());
    const legacyOnly: UnitWizardState = {
      ...original,
      photos: [photo({ localId: 'legacy_0', fileId: null, remote: true })],
    };

    expect(toPatchBody(legacyOnly, original).photoFileIds).toBeUndefined();
    expect(toPatchBody({ ...original, photos: [] }, original).photoFileIds).toBeUndefined();
  });

  /**
   * And this is the half the rule above does **not** cover, pinned so nobody reads it as
   * a guarantee it never made.
   *
   * `syncPhotos()` deletes every image row and rebuilds from the list on *every* write,
   * so a photo with no `fileId` is lost to any patch carrying `photoFileIds` at all — not
   * only to an empty one. There is no "complete" list to send: the row that needs
   * protecting is the one that cannot be represented in a list.
   *
   * The console does not block this. It warns, via `hasUnmergeablePhotos`, because
   * refusing the write would make adding a photo to such a unit fail silently — and a
   * silent failure is worse than a stated loss. Deleting the guard means deleting the
   * warning with it, which is what this test exists to make obvious.
   */
  it('sends a partial list when a photo is added beside an unrepresentable one, and says so', () => {
    const legacy = photo({ localId: 'legacy_0', fileId: null, remote: true });
    const original = stateFromUnit(savedUnit());
    const withLegacy: UnitWizardState = { ...original, photos: [legacy] };

    const added: UnitWizardState = {
      ...withLegacy,
      photos: [legacy, photo({ localId: 'new', fileId: 'file_new' })],
    };

    // The legacy row cannot be in the list, so the list the server rebuilds from omits it.
    expect(toPatchBody(added, withLegacy).photoFileIds).toEqual(['file_new']);

    // Which is exactly why the admin is told before they save.
    expect(hasUnmergeablePhotos(added)).toBe(true);
  });

  it('still carries a field that was edited rather than emptied', () => {
    const original = stateFromUnit(savedUnit());
    const formatted = ['## عنوان', '- نقطة'].join('\n');
    const edited: UnitWizardState = { ...original, description: formatted };

    expect(toPatchBody(edited, original)).toEqual({ description: formatted });
  });
});

describe('submitWouldBeNoop', () => {
  /**
   * The silent failure this guards: an admin opens a saved draft to send it for review,
   * changes nothing because there was nothing to change, presses submit — and the wizard
   * navigated away with no PATCH, no submit, no success screen and no error. The unit
   * stayed a draft and the admin believed it was queued.
   */
  it('never skips a draft, changed or not', () => {
    expect(submitWouldBeNoop(UNIT_STATUS.DRAFT, false)).toBe(false);
    expect(submitWouldBeNoop(UNIT_STATUS.DRAFT, true)).toBe(false);
  });

  it('never skips a rejected unit — the fix may have been made elsewhere', () => {
    expect(submitWouldBeNoop(UNIT_STATUS.REJECTED, false)).toBe(false);
  });

  it('skips an untouched unit that is already in or past review', () => {
    expect(submitWouldBeNoop(UNIT_STATUS.APPROVED, false)).toBe(true);
    expect(submitWouldBeNoop(UNIT_STATUS.PENDING_REVIEW, false)).toBe(true);
  });

  it('never skips anything that actually changed', () => {
    for (const status of Object.values(UNIT_STATUS)) {
      expect(submitWouldBeNoop(status, true), status).toBe(false);
    }
  });

  it('treats an unknown status as submittable rather than swallowing it', () => {
    // A redundant submit is visible and recoverable; a skipped one is not.
    expect(submitWouldBeNoop(null, false)).toBe(false);
    expect(submitWouldBeNoop(undefined, false)).toBe(false);
  });
});

describe('an edit that is not an edit', () => {
  /**
   * `toggleAmenity` removes with `filter` and re-adds by appending, so unchecking a
   * chip and re-checking it leaves the same set in a different order. `toPatchBody`
   * compares with `JSON.stringify`, which is positional, so it called that a change —
   * and on an approved unit every change costs a trip back through review.
   *
   * Nothing on screen could have revealed it: the chips render in `AMENITY_KEYS` order,
   * never in state order.
   */
  it('does not treat a reordered amenity list as a change', () => {
    const original = stateFromUnit(savedUnit({ amenityKeys: [AMENITY.WIFI, AMENITY.AC] }));
    const reordered: UnitWizardState = { ...original, amenities: [AMENITY.AC, AMENITY.WIFI] };

    expect(toPatchBody(reordered, original)).toEqual({});
    expect(hasChanges(reordered, original)).toBe(false);
  });

  it('still notices a real amenity change', () => {
    const original = stateFromUnit(savedUnit({ amenityKeys: [AMENITY.WIFI, AMENITY.AC] }));
    const added: UnitWizardState = { ...original, amenities: [AMENITY.AC, AMENITY.WIFI, AMENITY.POOL] };

    expect(toPatchBody(added, original)).toEqual({
      amenities: [AMENITY.AC, AMENITY.POOL, AMENITY.WIFI],
    });
  });

  it('sends the amenity list in a stable order whatever order it was picked in', () => {
    const base = stateFromUnit(savedUnit());
    const one: UnitWizardState = { ...base, amenities: [AMENITY.POOL, AMENITY.WIFI] };
    const other: UnitWizardState = { ...base, amenities: [AMENITY.WIFI, AMENITY.POOL] };

    expect(toCreateBody(one).amenities).toEqual(toCreateBody(other).amenities);
  });

  /** The gallery's order is the gallery's; only the amenity *set* gets normalised. */
  it('leaves the photo order alone', () => {
    const state: UnitWizardState = {
      ...EMPTY_WIZARD_STATE,
      photos: [photo({ localId: 'b', fileId: 'file_b' }), photo({ localId: 'a', fileId: 'file_a' })],
    };

    expect(toCreateBody(state).photoFileIds).toEqual(['file_b', 'file_a']);
  });
});

/**
 * The constants the description's formatting rests on, pinned so a change to any of them
 * has to be deliberate.
 *
 * None of these have a test anywhere else: `MAX_DESCRIPTION` is only ever read (the
 * counter, the slice, the step gate), the hint is a dictionary string nothing asserts on,
 * and the template is inserted rather than computed. Each could be changed back to its old
 * value with a green suite, which is exactly the regression worth a guard.
 */
describe('description formatting constants', () => {
  it('caps the description at 2000 characters, not the 500 it started at', () => {
    // 500 was our own guess at the partner rule, never a number the API gave us, and a
    // description written as headings and lists does not fit in it. The backend confirmed
    // 2000 with `mb_strlen` on both consoles, live on staging and production since
    // 2026-08-26.
    expect(MAX_DESCRIPTION).toBe(2000);
    expect(MIN_DESCRIPTION).toBe(10);
  });

  it('offers a template that is a valid description the moment it is inserted', () => {
    // The button drops this into an empty field and the admin may save straight away, so
    // it has to clear the same two gates the field does.
    expect(DESCRIPTION_TEMPLATE.trim().length).toBeGreaterThanOrEqual(MIN_DESCRIPTION);
    expect(DESCRIPTION_TEMPLATE.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
  });

  it('catches the photo the API measurably refuses, in either orientation', () => {
    // 432×768 is the real rejection this guard was written from — a phone photo that
    // came back through a messaging app. Rotating it changes nothing: too few pixels is
    // too few pixels.
    expect(isDefinitelyUndersized(432, 768)).toBe(true);
    expect(isDefinitelyUndersized(768, 432)).toBe(true);
  });

  it('lets a portrait through that only the strictest reading would refuse', () => {
    // 720×1280 fails a literal `width ≥ 1024`, and passes a long-edge rule. Which one
    // the API implements is not known, so this stays the server's call — the wasted
    // round trip is the cheaper of the two mistakes.
    expect(isDefinitelyUndersized(720, 1280)).toBe(false);
    expect(isDefinitelyUndersized(3024, 4032)).toBe(false);
  });

  it('treats the floor itself as acceptable, not as the first rejection', () => {
    // An off-by-one here rejects the exact photo the hint tells the admin to bring.
    expect(isDefinitelyUndersized(1024, 576)).toBe(false);
    expect(isDefinitelyUndersized(1023, 576)).toBe(true);
    expect(isDefinitelyUndersized(1024, 575)).toBe(true);
  });

  it('keeps the cheatsheet naming every marker the parser reads', () => {
    // Reflowing this Arabic string is easy and dropping a marker from it is invisible —
    // the field still works, and the admin is simply never told the marker exists.
    for (const marker of ['##', '- ', '1.', '*ميزة*', '**كلمة**', '>']) {
      expect(ar.unitWizard.descriptionFormatHint).toContain(marker);
    }
    expect(en.unitWizard.descriptionFormatHint).toContain('##');
  });
});
