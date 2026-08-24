import { describe, expect, it } from 'vitest';
import { AMENITY, CANCELLATION_POLICY, UNIT_STATUS, UNIT_TYPE } from '@/lib/constants';
import {
  MIN_DESCRIPTION,
  canCreate,
  coverPhotoOf,
  firstIncompleteCreateStep,
  hasChanges,
  hasUnmergeablePhotos,
  stateFromUnit,
  stepValidity,
  stepsWithErrors,
  toCreateBody,
  toPatchBody,
  type PhotoItem,
  type UnitWizardState,
} from './wizard';
import { EMPTY_WIZARD_STATE } from './wizard';
import type { UnitDetail } from '@/types';

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
    expect(body.amenities).toEqual([AMENITY.WIFI, AMENITY.ELEVATOR]);
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
      amenities: [AMENITY.WIFI, AMENITY.ELEVATOR, AMENITY.POOL],
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
