import {
  AMENITY,
  CANCELLATION_POLICY,
  UNIT_STATUS,
  UNIT_TYPE,
  type Amenity,
  type CancellationPolicyName,
  type UnitStatus,
  type UnitType,
} from '@/lib/constants';
import { isInsideSaudi } from '@/lib/units/geo';
import type {
  ClearableUnitField,
  LatLng,
  UnitCreateBody,
  UnitDetail,
  UnitPatchBody,
  UploadedFile,
} from '@/types';

export const WIZARD_STEP_COUNT = 5;

/** Minutes an admin should budget per step, shown next to "Step n of 5". */
export const WIZARD_STEP_MINUTES = [4, 6, 3, 4, 1] as const;

export const MAX_PHOTOS = 10;
export const MAX_UPLOAD_MB = 10;

/**
 * 2000 characters, confirmed against the server rather than guessed at.
 *
 * The 500 this console shipped with was never a number the API gave us. It was our own
 * guess at the partner dashboard's rule, mirrored client-side so an admin would see a
 * field error instead of a `422` on the last step;
 * `BACKEND-REQUEST-mamsa-owned-units.md` §8.4 asked for the real list and got no answer,
 * and the guess then hardened into a fact nobody rechecked. The backend's reply of
 * 2026-08-26 §2 confirms the shape of that: 500 *was* the server rule, on one shared
 * `UnitWriter` behind both consoles, and it came from us.
 *
 * It is now 2000 on both, counted with `mb_strlen` — so this counts characters and so
 * does the server, and an Arabic description gets the full 2000 rather than the ~666 a
 * byte-counting rule would have allowed. A newline is one character on both sides.
 *
 * **Live on staging, which is what `.env.local` points at. Production is still on 500
 * until the backend deploys.** Against production a formatted description will `422`.
 */
export const MAX_DESCRIPTION = 2000;

/**
 * A **submit** gate, not a save rule — the same split the server makes.
 *
 * `PATCH` accepts an empty description at any time, so a draft may hold none; only
 * `POST /units/{id}/submit` refuses one under 10 characters. That is why this is checked
 * in `stepValidity` (which gates the walk toward submit) and deliberately not in
 * `firstIncompleteCreateStep` (which gates "Save as draft").
 */
export const MIN_DESCRIPTION = 10;

export const AMENITY_KEYS = Object.values(AMENITY);

/**
 * Refund tiers, read as "cancelling at least N days before check-in returns X%".
 * The three arrays are index-aligned with `CANCELLATION_TIER_DAYS`; a fourth tier would
 * be a platform decision, not a form option, which is why these are presets.
 */
export const CANCELLATION_TIER_DAYS = [7, 3, 0] as const;

export const CANCELLATION_PRESETS: Record<CancellationPolicyName, readonly number[]> = {
  [CANCELLATION_POLICY.FLEXIBLE]: [100, 75, 50],
  [CANCELLATION_POLICY.MODERATE]: [100, 50, 25],
  [CANCELLATION_POLICY.STRICT]: [75, 25, 0],
};

export interface PhotoItem {
  /** Local and unique. Never the fileId — a photo has a key before it has an id. */
  localId: string;
  /** A `blob:` preview while the file is local; a remote URL once the unit has it. */
  previewUrl: string;
  fileName: string;
  /** `null` while uploading or after a failure. */
  fileId: string | null;
  uploading: boolean;
  error: string | null;
  /** Already on the unit — its preview URL must never be revoked. */
  remote?: boolean;
}

export interface UnitWizardState {
  licenseNo: string;
  licenseFile: UploadedFile | null;
  name: string;
  type: UnitType;
  /** Held as text so the field can be empty; `Number()` only at build time. */
  pricePerNight: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  capacity: number;
  sizeSqm: number;
  city: string;
  district: string;
  description: string;
  amenities: Amenity[];
  checkIn: string;
  checkOut: string;
  cancellationPolicy: CancellationPolicyName;
  location: LatLng | null;
  address: string;
  /**
   * The city-level place the geocoder recognised for the pin. Form state, never sent —
   * it exists so the pin can be checked against the city the admin declared.
   */
  locality: string | null;
  photos: PhotoItem[];
  coverId: string | null;
}

export const EMPTY_WIZARD_STATE: UnitWizardState = {
  licenseNo: '',
  licenseFile: null,
  name: '',
  type: UNIT_TYPE.APARTMENT,
  pricePerNight: '',
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  capacity: 2,
  sizeSqm: 0,
  city: '',
  district: '',
  description: '',
  amenities: [],
  checkIn: '15:00',
  checkOut: '12:00',
  cancellationPolicy: CANCELLATION_POLICY.MODERATE,
  location: null,
  address: '',
  locality: null,
  photos: [],
  coverId: null,
};

/**
 * Fills the wizard from the unit being edited — every field from the record, none from
 * a default.
 *
 * The wizard used to fall back to `moderate`, `15:00` and a `beds` guessed from
 * `bedrooms` because the read side did not return them. It does now, and stating a
 * default as though it were the unit's value is the failure this function exists to
 * avoid: a reviewer opening a unit to check its cancellation terms would have got a
 * confident wrong answer.
 */
export function stateFromUnit(unit: UnitDetail): UnitWizardState {
  const photos: PhotoItem[] = unit.photos.map((photo, index) => ({
    // Keyed by the upload id where there is one, so `photoFileIds` rebuilds the existing
    // set and an added photo merges into the gallery instead of replacing it.
    localId: photo.id ?? `legacy_${index}`,
    previewUrl: photo.url,
    fileName: fileNameFromUrl(photo.url),
    fileId: photo.id,
    uploading: false,
    error: null,
    remote: true,
  }));

  return {
    ...EMPTY_WIZARD_STATE,
    licenseNo: unit.tourismPermitNo ?? '',
    licenseFile: unit.tourismLicenseFileId
      ? {
          fileId: unit.tourismLicenseFileId,
          fileName: fileNameFromUrl(unit.permitFileUrl ?? unit.tourismLicenseFileId),
        }
      : null,
    name: unit.name,
    type: unit.type,
    pricePerNight: unit.pricePerNight ? String(unit.pricePerNight) : '',
    bedrooms: unit.bedrooms,
    beds: unit.beds ?? Math.max(1, unit.bedrooms),
    bathrooms: unit.bathrooms,
    capacity: unit.capacity,
    sizeSqm: unit.sizeSqm,
    // The slug, not the stored Arabic label — the dropdown matches on it, and it is the
    // one of the two that cannot drift when a label is reworded.
    city: unit.cityKey ?? unit.city,
    district: unit.district,
    description: unit.description ?? '',
    // Straight from the server. Deriving these by looking Arabic labels back up in a
    // table failed silently — as an unchecked box — the day a label was reworded.
    amenities: unit.amenityKeys ?? [],
    checkIn: unit.checkIn ?? EMPTY_WIZARD_STATE.checkIn,
    checkOut: unit.checkOut ?? EMPTY_WIZARD_STATE.checkOut,
    cancellationPolicy: unit.cancellationPolicy,
    location: unit.lat && unit.lng ? { lat: unit.lat, lng: unit.lng } : null,
    address: unit.address ?? '',
    photos,
    coverId: photos.find((photo) => photo.fileId === coverIdOf(unit))?.localId ?? null,
  };
}

function coverIdOf(unit: UnitDetail): string | null {
  return unit.photos.find((photo) => photo.isCover)?.id ?? null;
}

function fileNameFromUrl(url: string): string {
  return url.split('/').pop()?.split('?')[0] || 'file';
}

/**
 * The cover photo, resolved the same way everywhere. Falls back to the first uploaded
 * photo, so deleting the cover promotes the next one rather than leaving a unit with
 * photos and no cover.
 */
export function coverPhotoOf(state: UnitWizardState): PhotoItem | undefined {
  return (
    state.photos.find((photo) => photo.localId === state.coverId && photo.fileId) ??
    state.photos.find((photo) => photo.fileId)
  );
}

export function priceOf(state: UnitWizardState): number {
  return Number(state.pricePerNight) || 0;
}

export function uploadedPhotoIds(state: UnitWizardState): string[] {
  return state.photos
    .map((photo) => photo.fileId)
    .filter((fileId): fileId is string => Boolean(fileId));
}

export function anyPhotoUploading(state: UnitWizardState): boolean {
  return state.photos.some((photo) => photo.uploading);
}

/**
 * True when the gallery holds a photo that predates the upload flow. Such a row has no
 * id to re-send, so any `photoFileIds` edit drops it — the one case where an edit still
 * replaces rather than merges.
 *
 * Zero such rows exist on staging or production. Kept as a guard so the warning appears
 * for the unit that needs it instead of for every unit, as it once did.
 */
export function hasUnmergeablePhotos(state: UnitWizardState): boolean {
  return state.photos.some((photo) => photo.remote && !photo.fileId);
}

/**
 * The full body. Empty optional strings are dropped rather than sent as `""`, which a
 * validator reads as a supplied blank rather than an omission.
 *
 * `mamsaOwned` is never included — the server sets it on every unit created here, and
 * sending it would be claiming a decision that is not ours to make.
 */
export function toCreateBody(state: UnitWizardState): UnitCreateBody {
  const photoFileIds = uploadedPhotoIds(state);

  return {
    name: state.name.trim(),
    type: state.type,
    city: state.city,
    district: state.district.trim(),
    pricePerNight: priceOf(state),
    bedrooms: state.bedrooms,
    beds: state.beds,
    bathrooms: state.bathrooms,
    capacity: state.capacity,
    sizeSqm: state.sizeSqm,
    // `trim()` and nothing else, ever. The description's formatting *is* its newlines —
    // the guest site reads `## `, `- ` and `1. ` at the start of a line — so collapsing
    // whitespace here would silently flatten a structured listing into one grey wall.
    // Stripping the outer edges is safe: a leading blank line carries no meaning.
    description: state.description.trim() || undefined,
    /*
      Sorted, because `toPatchBody` compares with `JSON.stringify` and that is positional.

      `toggleAmenity` removes with `filter` and re-adds by appending, so an admin who
      unchecks Wi-Fi, changes their mind and re-checks it leaves the same set in a new
      order — `['wifi','ac']` becomes `['ac','wifi']`. The compare called that a change,
      the patch went out, and an approved unit went back through review for an edit that
      did not exist. Nothing on screen could reveal it: the chips always render in
      `AMENITY_KEYS` order, never in state order.

      Sorting here rather than at the comparison keeps the wire body deterministic too.
      `photoFileIds` is deliberately *not* sorted — its order is the gallery's order and
      the server stores it as given.
    */
    amenities: state.amenities.length ? [...state.amenities].sort() : undefined,
    cancellationPolicy: state.cancellationPolicy,
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    lat: state.location?.lat,
    lng: state.location?.lng,
    address: state.address.trim() || undefined,
    tourismLicenseNumber: state.licenseNo.trim() || undefined,
    tourismLicenseFileId: state.licenseFile?.fileId || undefined,
    photoFileIds: photoFileIds.length ? photoFileIds : undefined,
    coverFileId: coverPhotoOf(state)?.fileId ?? undefined,
  };
}

/**
 * The fields `PATCH` accepts `null` on, as a set for the loop below.
 *
 * Derived from the exported type rather than retyped, so adding a field to one is adding
 * it to both — and neither can quietly grow past what the backend actually documented.
 */
const CLEARABLE_FIELDS = new Set<ClearableUnitField>([
  'description',
  'address',
  'tourismLicenseNumber',
]);

/**
 * Only what actually changed.
 *
 * A `PATCH` treats an absent key as "unchanged", so round-tripping the whole form would
 * rewrite fields nobody touched — and on an approved unit every rewrite costs a trip
 * back through review. Comparison is against the body the unit started as, so a value
 * an admin edited and then edited back counts as unchanged.
 */
export function toPatchBody(state: UnitWizardState, original: UnitWizardState): UnitPatchBody {
  const next = toCreateBody(state);
  const before = toCreateBody(original);
  const patch: UnitPatchBody = {};

  for (const key of Object.keys(next) as Array<keyof UnitCreateBody>) {
    if (JSON.stringify(next[key]) === JSON.stringify(before[key])) continue;

    /*
      Reaching here with `undefined` means the field had a value and the admin emptied it.

      `undefined` cannot say that. `toCreateBody` maps an emptied optional to `undefined`,
      `JSON.stringify` drops undefined-valued keys, and the server reads an absent key as
      "unchanged" — so `{ description: undefined }` went out as `{}` and kept the old
      text. Worse than the no-op itself: `hasChanges` counted the key, the wizard's guard
      did not fire, and the request knocked an approved unit back to `pending_review` to
      change nothing at all.

      `null` is the spelling that clears (backend reply 2026-08-26 §5), but only on the
      three fields it was documented for. Anything else emptied is still skipped rather
      than guessed at — see `ClearableUnitField`.
    */
    if (next[key] === undefined) {
      if (!CLEARABLE_FIELDS.has(key as ClearableUnitField)) continue;
      Object.assign(patch, { [key]: null });
      continue;
    }

    Object.assign(patch, { [key]: next[key] });
  }

  return patch;
}

export function hasChanges(state: UnitWizardState, original: UnitWizardState): boolean {
  return Object.keys(toPatchBody(state, original)).length > 0;
}

/**
 * Whether pressing "submit for review" on an existing unit has nothing left to do.
 *
 * "Nothing changed" and "nothing to submit" are not the same question, and treating them
 * as one swallowed the commonest action in the flow: an admin opening a saved draft to
 * send it for review, changing nothing because there was nothing to change, and being
 * navigated away with no `PATCH`, no `submit`, no success screen and no error. The unit
 * stayed a draft and the admin believed it was queued.
 *
 * A draft has never been submitted, so submitting it is always real work. A rejected unit
 * is the same shape — the fix may have been made somewhere this form cannot see. Anything
 * already in or past review genuinely has nothing to do when nothing changed.
 *
 * Lives here rather than inline in the wizard so it can be tested; the silent-failure
 * version passed a green suite for exactly that reason.
 */
export function submitWouldBeNoop(
  status: UnitStatus | null | undefined,
  dirty: boolean,
): boolean {
  if (dirty) return false;

  // An unknown status attempts the submit rather than swallowing it. The two failures are
  // not equally bad: a redundant submit is visible and recoverable, a skipped one is the
  // silent failure this function exists to stop.
  if (!status) return false;

  return status !== UNIT_STATUS.DRAFT && status !== UNIT_STATUS.REJECTED;
}

/**
 * Whether the nine required fields are present — the only gate on `POST /admin/units`.
 *
 * Everything else a complete listing needs is checked at submit, not here. That split is
 * deliberate and comes from the API: an admin who has photos but no permit yet must
 * still be able to save the draft.
 */
export function canCreate(state: UnitWizardState): boolean {
  return firstIncompleteCreateStep(state) === null;
}

/**
 * Which steps are complete against the **submit** rules — what the wizard's "Next"
 * button gates on, so an admin reaches the end with a unit that will actually pass.
 *
 * Every rule is checked on the step that owns the field it is about. City and district
 * are validated here under `location`, not under `details`, because that is where the
 * two inputs are: gating a step on a field the admin cannot see from it is a dead end
 * with a disabled button and no explanation.
 */
export function stepValidity(state: UnitWizardState): boolean[] {
  const description = state.description.trim();

  return [
    state.licenseNo.trim().length > 0 && Boolean(state.licenseFile),
    state.name.trim().length >= 2 &&
      priceOf(state) > 0 &&
      state.beds >= 1 &&
      description.length >= MIN_DESCRIPTION &&
      description.length <= MAX_DESCRIPTION,
    state.city.length > 0 &&
      state.district.trim().length > 0 &&
      isInsideSaudi(state.location) &&
      state.address.trim().length > 0,
    state.photos.some((photo) => photo.fileId || photo.remote) && !anyPhotoUploading(state),
    true,
  ];
}

/**
 * The first step still missing something `POST /admin/units` requires, or `null` when
 * the unit can be saved.
 *
 * "Save as draft" needs somewhere to send an admin whose draft is not yet saveable, and
 * the answer is the step holding the gap — not always the details step, since city and
 * district are required at create and live under location.
 */
export function firstIncompleteCreateStep(state: UnitWizardState): number | null {
  if (state.name.trim().length < 2 || priceOf(state) <= 0) return stepIndexOf('details');
  if (state.city.length === 0 || state.district.trim().length === 0) {
    return stepIndexOf('location');
  }
  if (state.bathrooms < 1 || state.capacity < 1) return stepIndexOf('details');

  return null;
}

/* ------------------------------------------------- server errors → steps */

export const WIZARD_STEPS = ['license', 'details', 'location', 'photos', 'review'] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

/**
 * Where a rejected field lives in the wizard.
 *
 * Two server keys have no matching body key and must be mapped by hand: `location`
 * stands for lat/lng together, and `photos` for the gallery as a whole.
 */
const FIELD_TO_STEP: Record<string, WizardStep> = {
  tourismLicenseNumber: 'license',
  tourismLicenseFileId: 'license',
  name: 'details',
  type: 'details',
  pricePerNight: 'details',
  bedrooms: 'details',
  bathrooms: 'details',
  beds: 'details',
  capacity: 'details',
  sizeSqm: 'details',
  description: 'details',
  amenities: 'details',
  cancellationPolicy: 'details',
  checkIn: 'details',
  checkOut: 'details',
  city: 'location',
  district: 'location',
  address: 'location',
  location: 'location',
  lat: 'location',
  lng: 'location',
  photos: 'photos',
  photoFileIds: 'photos',
  coverFileId: 'photos',
};

/**
 * The steps a validation response found fault with.
 *
 * Keys arrive flat with dots included (`photoFileIds.2`), so the index is stripped
 * before lookup. Anything unrecognised falls back to the review step, where the raw
 * message is shown — a field the API adds later degrades to "visible", never
 * "swallowed".
 */
export function stepsWithErrors(fields: Record<string, string>): WizardStep[] {
  const steps = Object.keys(fields).map(
    (key) => FIELD_TO_STEP[key.split('.')[0]] ?? 'review',
  );

  return Array.from(new Set(steps));
}

export function stepIndexOf(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}
