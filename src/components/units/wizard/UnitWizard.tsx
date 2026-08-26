'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Lock,
  Minus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useT } from '@/i18n';
import { Segmented } from '@/components/common';
import { useUiStore, type Locale } from '@/stores/uiStore';
import { ApiError, citiesApi, unitsApi, uploadsApi } from '@/lib/api';
import {
  CANCELLATION_POLICY,
  UNIT_STATUS,
  UNIT_TYPE,
  type Amenity,
  type CancellationPolicyName,
  type UnitType,
} from '@/lib/constants';
import {
  AMENITY_KEYS,
  CANCELLATION_PRESETS,
  CANCELLATION_TIER_DAYS,
  EMPTY_WIZARD_STATE,
  MAX_DESCRIPTION,
  MAX_PHOTOS,
  MAX_UPLOAD_MB,
  MIN_DESCRIPTION,
  WIZARD_STEP_COUNT,
  WIZARD_STEP_MINUTES,
  anyPhotoUploading,
  firstIncompleteCreateStep,
  hasUnmergeablePhotos,
  coverPhotoOf,
  hasChanges,
  priceOf,
  stateFromUnit,
  stepIndexOf,
  stepValidity,
  stepsWithErrors,
  submitWouldBeNoop,
  toCreateBody,
  toPatchBody,
  type PhotoItem,
  type UnitWizardState,
  type WizardStep,
} from '@/lib/units/wizard';
import { DESCRIPTION_TEMPLATE } from '@/lib/units/description-template';
import { localityMatchesCity } from '@/lib/units/locality';
import { cn } from '@/lib/utils/cn';
import { formatSAR } from '@/lib/utils/format';
import type { City, LatLng, UnitDetail } from '@/types';
import { UnitDescription } from '@/components/units/UnitDescription';
import { FileUploadRow } from './FileUploadRow';
import { LocationPicker, StaticMapPreview } from './LocationPicker';
import { PriceBreakdown } from './PriceBreakdown';

export interface UnitWizardProps {
  /** Present in edit mode. Absent creates a new Mamsa-owned unit. */
  existing?: UnitDetail;
}

/**
 * Listing a unit Mamsa owns, in the five steps a partner walks through.
 *
 * The flow is deliberately the partner's flow: a unit reviewed from this console and a
 * unit reviewed from the partner app should have been described the same way, or the
 * approvals queue is comparing two different things. What differs is ownership — no KYC
 * step, no account-type gate, no revenue split, because Mamsa does not verify itself and
 * does not pay itself a commission.
 *
 * Saving is two calls on purpose: `create` returns a draft, `submit` sends it for review
 * and answers with every remaining gap at once. The created id is held from the first
 * call onward, so a failed submit is retried against the same unit rather than quietly
 * producing a second draft every time someone forgets a photo.
 */
export function UnitWizard({ existing }: UnitWizardProps) {
  const t = useT();
  const router = useRouter();
  const editing = Boolean(existing);

  const [unit, setUnit] = useState<UnitDetail | null>(existing ?? null);
  const [original, setOriginal] = useState<UnitWizardState>(() =>
    existing ? stateFromUnit(existing) : EMPTY_WIZARD_STATE,
  );
  const [state, setState] = useState<UnitWizardState>(original);
  const [unitId, setUnitId] = useState<string | null>(existing?.id ?? null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [errorSteps, setErrorSteps] = useState<WizardStep[]>([]);
  const [conflicted, setConflicted] = useState(false);
  const [done, setDone] = useState(false);

  const [cities, setCities] = useState<City[] | null>(null);

  // The blob previews belong to this component; nothing else can free them.
  const photosRef = useRef<PhotoItem[]>(state.photos);
  photosRef.current = state.photos;
  useEffect(
    () => () => {
      for (const photo of photosRef.current) {
        if (!photo.remote) URL.revokeObjectURL(photo.previewUrl);
      }
    },
    [],
  );

  useEffect(() => {
    let stale = false;
    citiesApi
      .list()
      .then((list) => {
        if (stale) return;
        setCities(list);
        // Only seed a default; never overwrite a city the unit already has.
        setState((current) =>
          current.city ? current : { ...current, city: list[0]?.key ?? '' },
        );
      })
      .catch(() => !stale && setCities([]));

    return () => {
      stale = true;
    };
  }, []);

  const validity = useMemo(() => stepValidity(state), [state]);
  /**
   * A pin that disagrees with the declared city blocks the location step outright.
   *
   * Warning was not enough: the unit this guard exists for was saved 150km from its
   * address, and every other check passed it — inside the national bounding box, valid
   * coordinates, an address that resolved cleanly to the wrong governorate.
   */
  const cityMismatch = !localityMatchesCity(
    state.locality,
    cities?.find((city) => city.key === state.city),
  );
  const stepValid = validity[step] && !(step === 2 && cityMismatch);
  const uploading = anyPhotoUploading(state);
  const busy = saving || submitting;

  const approvedEdit = editing && unit?.status === UNIT_STATUS.APPROVED;
  /**
   * A unit under review is locked server-side. Read from the status rather than waiting
   * for a `409`, so an admin who has just sent an approved unit back for review sees the
   * form close instead of being refused on their next save.
   */
  const locked = conflicted || unit?.status === UNIT_STATUS.PENDING_REVIEW;
  const dirty = editing ? hasChanges(state, original) : true;
  /**
   * An edit merges into the gallery now that photos carry their upload ids. The warning
   * survives only for a unit holding a pre-upload-flow row, which has no id to re-send.
   */
  const unmergeable = editing && hasUnmergeablePhotos(state);

  function patch(next: Partial<UnitWizardState>) {
    setState((current) => ({ ...current, ...next }));
    setError(null);
  }

  function clearFieldError(key: string) {
    setFieldErrors((current) => {
      if (!current?.[key]) return current;
      const next = { ...current };
      delete next[key];
      return Object.keys(next).length ? next : null;
    });
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;

    const room = Math.max(0, MAX_PHOTOS - state.photos.length);
    for (const file of Array.from(files).slice(0, room)) {
      const localId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);
      const oversized = file.size > MAX_UPLOAD_MB * 1024 * 1024;

      setState((current) => ({
        ...current,
        photos: [
          ...current.photos,
          {
            localId,
            previewUrl,
            fileName: file.name,
            fileId: null,
            uploading: !oversized,
            error: oversized ? t.unitWizard.fileTooLarge(MAX_UPLOAD_MB) : null,
          },
        ],
        coverId: current.coverId ?? localId,
      }));

      if (oversized) continue;

      // Uploaded on pick, not at submit: ten photos at the final button is a long wait at
      // the worst moment, and a failure there would cost the whole form. Each file also
      // uploads independently, so one failure does not take the others with it.
      uploadsApi
        .upload('unit_photo', file)
        .then(({ fileId }) => updatePhoto(localId, { fileId, uploading: false }))
        .catch((err: unknown) =>
          updatePhoto(localId, {
            uploading: false,
            error: err instanceof ApiError ? err.message : t.unitWizard.uploadFailed,
          }),
        );
    }
  }

  function updatePhoto(localId: string, next: Partial<PhotoItem>) {
    setState((current) => ({
      ...current,
      photos: current.photos.map((photo) =>
        photo.localId === localId ? { ...photo, ...next } : photo,
      ),
    }));
  }

  function removePhoto(localId: string) {
    setState((current) => {
      const target = current.photos.find((photo) => photo.localId === localId);
      if (target && !target.remote) URL.revokeObjectURL(target.previewUrl);

      return {
        ...current,
        photos: current.photos.filter((photo) => photo.localId !== localId),
        coverId: current.coverId === localId ? null : current.coverId,
      };
    });
  }

  function toggleAmenity(key: Amenity) {
    setState((current) => ({
      ...current,
      amenities: current.amenities.includes(key)
        ? current.amenities.filter((value) => value !== key)
        : [...current.amenities, key],
    }));
  }

  /** Turns a rejection into something the admin can act on, at the step that owns it. */
  function absorb(err: unknown) {
    if (!(err instanceof ApiError)) {
      setError(t.unitWizard.submitError);
      return;
    }

    // Render the API's own Arabic message — it is more specific than anything we would
    // substitute, and swallowing it once already cost a full debugging round.
    setError(err.message);

    if (err.status === 409) {
      setConflicted(true);
      return;
    }

    if (err.fields) {
      const steps = stepsWithErrors(err.fields);
      setFieldErrors(err.fields);
      setErrorSteps(steps);
      if (steps.length) setStep(stepIndexOf(steps[0]));
    }
  }

  /**
   * Adopts the server's version of the unit as the new baseline. Everything downstream —
   * the dirty check, the status badge, the next PATCH — reads from what was stored, not
   * from what we hoped we stored.
   */
  function rebaseline(saved: UnitDetail) {
    const next = stateFromUnit(saved);
    setUnit(saved);
    setOriginal(next);
    setState(next);
  }

  /** Creates the draft the first time, patches it after. Returns null on failure. */
  async function persist(): Promise<UnitDetail | null> {
    try {
      if (unitId) {
        const body = toPatchBody(state, original);
        // Nothing changed — a no-op PATCH on an approved unit would still send it back
        // through review, which is a real cost for saving nothing.
        if (Object.keys(body).length === 0) return unit;

        const updated = await unitsApi.update(unitId, body);
        rebaseline(updated);
        return updated;
      }

      const created = await unitsApi.create(toCreateBody(state));
      setUnitId(created.id);
      rebaseline(created);
      return created;
    } catch (err) {
      absorb(err);
      return null;
    }
  }

  async function saveDraft() {
    const gap = firstIncompleteCreateStep(state);
    if (gap !== null) {
      setError(t.unitWizard.createRequirements);
      setStep(gap);
      return;
    }

    setSaving(true);
    setError(null);
    const saved = await persist();
    setSaving(false);
    if (saved) router.push(`/units/${saved.id}`);
  }

  async function submitForReview() {
    const gap = firstIncompleteCreateStep(state);
    if (gap !== null) {
      setError(t.unitWizard.createRequirements);
      setStep(gap);
      return;
    }

    // Letting a draft through costs nothing extra — `persist()` already returns the unit
    // untouched when the patch body is empty, so no pointless PATCH goes out either way.
    if (editing && submitWouldBeNoop(unit?.status, dirty)) {
      router.push(`/units/${unitId}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors(null);
    setErrorSteps([]);

    const saved = await persist();
    if (!saved) {
      setSubmitting(false);
      return;
    }

    try {
      // An approved unit is already back in review from the PATCH itself; only a draft
      // or a rejected unit needs the explicit push.
      if (saved.status === UNIT_STATUS.DRAFT || saved.status === UNIT_STATUS.REJECTED) {
        setUnit(await unitsApi.submit(saved.id));
      }
      setDone(true);
    } catch (err) {
      absorb(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/40 p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-pop">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">{t.unitWizard.createdTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {t.unitWizard.createdBodySubmitted}
          </p>
          <button
            type="button"
            onClick={() => router.push(unitId ? `/units/${unitId}` : '/units')}
            className="mt-6 w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            {t.unitWizard.backToUnits}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-page">
      <header className="shrink-0 border-b border-hairline bg-white">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.push('/units')}
            aria-label={t.unitWizard.close}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-surface-muted"
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {editing ? t.unitWizard.editTitle : t.unitWizard.title}
          </h1>
          <span className="rounded-full bg-status-greySoft px-2.5 py-0.5 text-xs font-semibold text-status-grey">
            {unit ? t.status[unit.status] : t.unitWizard.draft}
          </span>
          <div className="ms-auto text-end text-xs leading-tight text-slate-500">
            <div>{t.unitWizard.stepOf(step + 1, WIZARD_STEP_COUNT)}</div>
            <div>{t.unitWizard.minEstimate(WIZARD_STEP_MINUTES[step])}</div>
          </div>
        </div>

        <div className="h-0.5 w-full bg-hairline">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${((step + 1) / WIZARD_STEP_COUNT) * 100}%` }}
          />
        </div>

        <div className="px-4 py-4 sm:px-8">
          <StepRail current={step} labels={t.unitWizard.steps} errorSteps={errorSteps} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{STEP_TITLES(t)[step]}</h2>
            <p className="mt-1 text-sm text-slate-600">{STEP_SUBTITLES(t)[step]}</p>
          </div>

          {locked && (
            <Banner tone="red" icon={Lock}>
              {t.unitWizard.lockedInReview}
            </Banner>
          )}

          {approvedEdit && dirty && !locked && (
            <Banner tone="amber" icon={AlertTriangle}>
              {t.unitWizard.approvedEditWarning}
            </Banner>
          )}

          <fieldset disabled={locked} className="space-y-6 disabled:opacity-60">
            {step === 0 && (
              <LicenseStep state={state} patch={patch} errors={fieldErrors} clear={clearFieldError} />
            )}
            {step === 1 && (
              <DetailsStep
                state={state}
                patch={patch}
                toggleAmenity={toggleAmenity}
                errors={fieldErrors}
                clear={clearFieldError}
                locked={locked}
              />
            )}
            {step === 2 && (
              <LocationStep
                state={state}
                patch={patch}
                cities={cities}
                cityMismatch={cityMismatch}
                errors={fieldErrors}
                clear={clearFieldError}
              />
            )}
            {step === 3 && (
              <PhotosStep
                state={state}
                addPhotos={addPhotos}
                removePhoto={removePhoto}
                setCover={(localId) => patch({ coverId: localId })}
                unmergeable={unmergeable}
                errors={fieldErrors}
              />
            )}
            {step === 4 && <ReviewStep state={state} cities={cities} goTo={setStep} valid={validity} />}
          </fieldset>

          {error && (
            <Banner tone="red" icon={AlertTriangle}>
              {error}
            </Banner>
          )}

          {fieldErrors && step === 4 && (
            <div className="rounded-2xl border border-status-red/30 bg-status-redSoft px-4 py-3">
              <p className="text-sm font-semibold text-status-red">{t.unitWizard.fixTheseFields}</p>
              <ul className="mt-2 space-y-1 text-sm text-status-red">
                {Object.entries(fieldErrors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-hairline bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <FooterButton
            variant="outline"
            onClick={() => void saveDraft()}
            disabled={busy || uploading || locked}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t.unitWizard.saveDraft}
          </FooterButton>

          <div className="flex flex-wrap items-center gap-3">
            {!stepValid && (
              <span className="hidden text-sm text-slate-500 sm:inline">
                {t.unitWizard.completeToContinue}
              </span>
            )}
            {step > 0 && (
              <FooterButton variant="outline" onClick={() => setStep((current) => current - 1)}>
                <ChevronRight className="h-4 w-4 rtl:hidden" />
                <ChevronLeft className="hidden h-4 w-4 rtl:block" />
                {t.unitWizard.back}
              </FooterButton>
            )}
            {step < WIZARD_STEP_COUNT - 1 ? (
              <FooterButton
                onClick={() => stepValid && setStep((current) => current + 1)}
                disabled={!stepValid}
              >
                {t.unitWizard.next}
                <ChevronLeft className="h-4 w-4 rtl:hidden" />
                <ChevronRight className="hidden h-4 w-4 rtl:block" />
              </FooterButton>
            ) : (
              <FooterButton
                onClick={() => void submitForReview()}
                disabled={busy || uploading || locked}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {t.unitWizard.createAndSubmit}
              </FooterButton>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ steps */

type Dict = ReturnType<typeof useT>;

const STEP_TITLES = (t: Dict) => [
  t.unitWizard.s1Title,
  t.unitWizard.s2Title,
  t.unitWizard.s3Title,
  t.unitWizard.s4Title,
  t.unitWizard.s5Title,
];

const STEP_SUBTITLES = (t: Dict) => [
  t.unitWizard.s1Sub,
  t.unitWizard.s2Sub,
  t.unitWizard.s3Sub,
  t.unitWizard.s4Sub,
  t.unitWizard.s5Sub,
];

interface StepProps {
  state: UnitWizardState;
  patch: (next: Partial<UnitWizardState>) => void;
  errors: Record<string, string> | null;
  clear: (key: string) => void;
}

function LicenseStep({ state, patch, errors, clear }: StepProps) {
  const t = useT();

  return (
    <>
      <Section label={t.unitWizard.owner}>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-brand bg-brand-soft px-5 py-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-slate-900">{t.unitWizard.ownerMamsa}</p>
            <p className="text-xs text-slate-600">{t.unitWizard.ownerMamsaNote}</p>
          </div>
        </div>
      </Section>

      <Section label={t.unitWizard.tourismLicense}>
        <div className="space-y-4">
          <Field label={t.unitWizard.tourismLicenseNo} required error={errors?.tourismLicenseNumber}>
            <input
              value={state.licenseNo}
              onChange={(event) => {
                patch({ licenseNo: event.target.value });
                clear('tourismLicenseNumber');
              }}
              dir="ltr"
              placeholder="TL-2025-XXXXX"
              className={INPUT}
            />
          </Field>

          <FileUploadRow
            kind="license_pdf"
            title={t.unitWizard.uploadTourismLicense}
            subtitle={t.unitWizard.pdfMax10}
            accept="application/pdf"
            value={state.licenseFile}
            onChange={(licenseFile) => {
              patch({ licenseFile });
              clear('tourismLicenseFileId');
            }}
          />
          {errors?.tourismLicenseFileId && <FieldError message={errors.tourismLicenseFileId} />}
        </div>
      </Section>
    </>
  );
}

function DetailsStep({
  state,
  patch,
  toggleAmenity,
  errors,
  clear,
  locked,
}: StepProps & { toggleAmenity: (key: Amenity) => void; locked?: boolean }) {
  const t = useT();

  return (
    <>
      <Section label={t.unitWizard.basicInfo}>
        <div className="space-y-4">
          <Field label={t.unitWizard.unitName} required error={errors?.name}>
            <input
              value={state.name}
              onChange={(event) => {
                patch({ name: event.target.value });
                clear('name');
              }}
              placeholder={t.unitWizard.unitNamePh}
              className={INPUT}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.unitWizard.unitType} required error={errors?.type}>
              <Select
                value={state.type}
                onChange={(value) => patch({ type: value as UnitType })}
                options={Object.values(UNIT_TYPE).map((value) => ({
                  value,
                  label: t.status[value],
                }))}
              />
            </Field>

            <Field label={t.unitWizard.priceInclVat} required error={errors?.pricePerNight}>
              <input
                value={state.pricePerNight}
                onChange={(event) => {
                  patch({ pricePerNight: event.target.value.replace(/[^\d.]/g, '') });
                  clear('pricePerNight');
                }}
                dir="ltr"
                inputMode="decimal"
                placeholder="0"
                className={cn(INPUT, 'tabular-nums')}
              />
            </Field>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">{t.unitWizard.priceHelper}</p>
          <PriceBreakdown gross={priceOf(state)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Stepper
              label={t.unitWizard.bedroomsField}
              value={state.bedrooms}
              min={0}
              max={20}
              onChange={(bedrooms) => patch({ bedrooms })}
            />
            <Stepper
              label={t.unitWizard.bedsField}
              value={state.beds}
              min={1}
              max={20}
              onChange={(beds) => patch({ beds })}
              hint={t.unitWizard.bedsHint}
            />
            <Stepper
              label={t.unitWizard.bathroomsField}
              value={state.bathrooms}
              min={1}
              max={10}
              onChange={(bathrooms) => patch({ bathrooms })}
            />
            <Stepper
              label={t.unitWizard.guestsField}
              value={state.capacity}
              min={1}
              max={40}
              onChange={(capacity) => patch({ capacity })}
            />
          </div>

          <Field label={t.unitWizard.sizeField} error={errors?.sizeSqm}>
            <input
              value={state.sizeSqm === 0 ? '' : String(state.sizeSqm)}
              onChange={(event) =>
                patch({ sizeSqm: Number(event.target.value.replace(/\D/g, '')) || 0 })
              }
              dir="ltr"
              inputMode="numeric"
              placeholder="0"
              className={cn(INPUT, 'tabular-nums')}
            />
          </Field>
        </div>
      </Section>

      <DescriptionField state={state} patch={patch} errors={errors} clear={clear} locked={locked} />

      <Section label={t.unitWizard.amenitiesField}>
        <div className="flex flex-wrap gap-2.5">
          {AMENITY_KEYS.map((key) => {
            const active = state.amenities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleAmenity(key)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'border-brand bg-brand-soft text-slate-900'
                    : 'border-hairline bg-white text-slate-600 hover:bg-surface-muted',
                )}
              >
                {active && <Check className="h-3.5 w-3.5 text-brand" />}
                {t.amenities[key]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {t.unitWizard.amenitiesSelected(state.amenities.length)}
        </p>
      </Section>

      <Section label={t.unitWizard.checkInOut}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.unitWizard.checkInTime}>
            <input
              type="time"
              dir="ltr"
              value={state.checkIn}
              onChange={(event) => patch({ checkIn: event.target.value })}
              className={INPUT}
            />
          </Field>
          <Field label={t.unitWizard.checkOutTime}>
            <input
              type="time"
              dir="ltr"
              value={state.checkOut}
              onChange={(event) => patch({ checkOut: event.target.value })}
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      <Section label={t.unitWizard.cancellationPolicy}>
        <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.unitWizard.refundLegend}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(CANCELLATION_POLICY).map((name) => (
            <PolicyCard
              key={name}
              name={name}
              selected={state.cancellationPolicy === name}
              onSelect={() => patch({ cancellationPolicy: name })}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">{t.unitWizard.cancellationLockedNote}</p>
      </Section>
    </>
  );
}

/**
 * The description, its live preview, and the two affordances that make the markers
 * discoverable — a collapsed cheatsheet and a skeleton for an empty field.
 *
 * The preview is not a convenience here. Mamsa-owned units are the example partner
 * listings are measured against in review, so a badly formatted one sets the bar low for
 * every partner description that follows it. The tab renders through the same parser the
 * approvals screens use, which is the same contract the guest site implements.
 *
 * The textarea's value reaches state untouched apart from the length cap. No trimming,
 * no newline normalising, no `\s+` collapse — the markers only mean anything at the
 * start of a line, so whitespace here is data.
 */
/**
 * Ties the two tab buttons to the two panes they control.
 *
 * A constant rather than `useId()` because there is exactly one description field on the
 * page — the wizard shows one step at a time — so a stable, readable id is worth more
 * here than a collision-proof generated one.
 */
const DESCRIPTION_TABS = 'unit-description';

/**
 * Exported for `DescriptionField.test.tsx` only — nothing else imports it.
 *
 * Reaching this field through `UnitWizard` means satisfying the licence step first,
 * which means uploading a file, so a test driven from the top would spend all its effort
 * on a step it is not about. `LocationPicker` exports `StaticMapPreview` the same way.
 */
export function DescriptionField({
  state,
  patch,
  errors,
  clear,
  locked,
}: StepProps & { locked?: boolean }) {
  const t = useT();
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const trimmed = state.description.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_DESCRIPTION;

  /*
    The counter measures the trimmed string — the one that is stored and the one both
    gates in `stepValidity` are checked against.

    Counting the raw value instead let the counter contradict the form: nine characters
    and one Enter read "10/2000", exactly the stated minimum, while the field error under
    it said "10 أحرف على الأقل" and Next stayed disabled. Two numbers describing the same
    field have to be the same number.
  */
  const counted = trimmed.length;
  const nearLimit = counted > MAX_DESCRIPTION * 0.9;

  const counterId = `${DESCRIPTION_TABS}-counter`;
  const errorId = `${DESCRIPTION_TABS}-error`;
  const invalid = Boolean(errors?.description) || tooShort;
  const describedBy = [invalid ? errorId : null, counterId].filter(Boolean).join(' ');

  /*
    A locked unit shows both panes at once instead of the switch.
    `<fieldset disabled>` reaches every control inside it, and there is no per-control
    exemption in HTML — so while a unit sits in review the tab buttons are dead, and the
    one screen where an admin most needs to see how a description renders would be the
    one screen that refuses to show them. Stacking the panes needs no button to work.
  */
  const showWrite = locked || tab === 'write';
  const showPreview = locked || tab === 'preview';

  return (
    <Section label={t.unitWizard.descriptionField} required>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {locked ? (
          // Nothing but the counter here while locked. The caption belongs directly above
          // the preview it describes, further down — over the disabled textarea it was
          // pointing at raw markers and saying "this is how the guest reads it".
          <span />
        ) : (
          <Segmented
            items={[
              { value: 'write', label: t.unitWizard.descriptionWrite },
              { value: 'preview', label: t.unitWizard.descriptionPreview },
            ]}
            value={tab}
            onChange={(value) => setTab(value as 'write' | 'preview')}
            idPrefix={DESCRIPTION_TABS}
          />
        )}
        {/* Counts the string as stored — a newline is one character on both sides. */}
        <span
          id={counterId}
          className={cn('text-xs tabular-nums', nearLimit ? 'text-accent' : 'text-slate-500')}
        >
          {counted}/{MAX_DESCRIPTION}
        </span>
      </div>

      {/*
        Both panes stay mounted and are hidden with CSS rather than swapped by a ternary.
        Unmounting the textarea threw away the caret, the scroll position and any height
        the admin had dragged it to — on a 2000-character field, checking the preview
        twice meant finding your place twice.
      */}
      <div
        id={`${DESCRIPTION_TABS}-panel-write`}
        role={locked ? undefined : 'tabpanel'}
        aria-labelledby={locked ? undefined : `${DESCRIPTION_TABS}-tab-write`}
        className={cn(!showWrite && 'hidden')}
      >
        {/*
          `maxLength`, not a `slice` in the handler.

          Slicing always cut from the *end*, wherever the edit was: with the field at
          2000, putting the caret mid-description and typing one character silently
          deleted the last one — enough to turn a closing `*` into a broken feature card
          the admin never saw change. It also cut blind through a surrogate pair, leaving
          a lone half that `json_decode` rejects outright. `maxLength` refuses the
          keystroke instead, which is the browser's own well-understood behaviour, and it
          truncates an over-long paste at the end rather than corrupting the middle.

          No `min-h` either: it sat a few pixels above the natural ten-row height, so the
          resize handle could grow the field but never shrink it back.
        */}
        <textarea
          rows={10}
          maxLength={MAX_DESCRIPTION}
          value={state.description}
          onChange={(event) => {
            patch({ description: event.target.value });
            clear('description');
          }}
          aria-label={t.unitWizard.descriptionField}
          aria-required
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          placeholder={t.unitWizard.descriptionPh}
          className="w-full resize-y rounded-xl border border-hairline bg-white p-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        />
      </div>

      <div
        id={`${DESCRIPTION_TABS}-panel-preview`}
        role={locked ? undefined : 'tabpanel'}
        aria-labelledby={locked ? undefined : `${DESCRIPTION_TABS}-tab-preview`}
        className={cn(!showPreview && 'hidden', locked && 'mt-4')}
      >
        {locked && (
          <p className="mb-2 text-xs font-medium text-slate-500">
            {t.unitWizard.descriptionPreviewNote}
          </p>
        )}
        <div className="min-h-[16rem] rounded-xl border border-hairline bg-surface-page p-4">
          <UnitDescription
            text={state.description}
            emptyLabel={t.unitWizard.descriptionPreviewEmpty}
          />
        </div>
      </div>

      {/* Given an id so the textarea can point `aria-describedby` at it — an error a
          screen reader never reaches is an error nobody was told about. */}
      <div id={errorId}>
        {errors?.description ? (
          <FieldError message={errors.description} />
        ) : (
          tooShort && <FieldError message={t.unitWizard.descriptionTooShort(MIN_DESCRIPTION)} />
        )}
      </div>

      {!locked && tab === 'preview' && trimmed.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">{t.unitWizard.descriptionPreviewNote}</p>
      )}

      {/* Only for an empty field: the skeleton is a starting point, never an overwrite. */}
      {trimmed.length === 0 && (
        <button
          type="button"
          onClick={() => {
            patch({ description: DESCRIPTION_TEMPLATE });
            clear('description');
            setTab('write');
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-surface-muted"
        >
          <FileText className="h-3.5 w-3.5 text-brand" aria-hidden />
          {t.unitWizard.descriptionTemplateBtn}
          <span className="font-normal text-slate-400">{t.unitWizard.descriptionTemplateHint}</span>
        </button>
      )}

      <details className="group mt-3 rounded-xl border border-hairline bg-surface-page px-3.5 py-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-slate-600 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
            aria-hidden
          />
          {t.unitWizard.descriptionFormatSummary}
        </summary>
        <FormatHint hint={t.unitWizard.descriptionFormatHint} />
      </details>
    </Section>
  );
}

function FormatHint({ hint }: { hint: string }) {
  // No lookbehind: `-(?=\s)` cannot fire inside a hyphenated word, and old Safari never
  // learned lookbehind.
  const MARKER = /(\*\*[^*]+\*\*|\*[^*]+\*|##|>|\d+\.|-(?=\s))/g;

  return (
    <p className="mt-2 text-xs leading-loose text-slate-500">
      {hint.split(MARKER).map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            dir="ltr"
            className="mx-0.5 inline-block rounded bg-white px-1 font-mono text-[0.7rem] text-slate-700"
          >
            {part}
          </code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

function LocationStep({
  state,
  patch,
  cities,
  cityMismatch,
  errors,
  clear,
}: StepProps & { cities: City[] | null; cityMismatch: boolean }) {
  const t = useT();
  const locale = useUiStore((store) => store.locale);
  const selectedCity = cities?.find((city) => city.key === state.city);
  const cityName = selectedCity
    ? locale === 'ar'
      ? selectedCity.ar
      : selectedCity.en
    : state.city;

  return (
    <>
      <Section label={t.unitWizard.cityField}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.unitWizard.cityField} required error={errors?.city}>
            <CitySelect
              value={state.city}
              cities={cities}
              onChange={(city) => {
                patch({ city });
                clear('city');
              }}
            />
          </Field>
          <Field label={t.unitWizard.districtField} required error={errors?.district}>
            <input
              value={state.district}
              onChange={(event) => {
                patch({ district: event.target.value });
                clear('district');
              }}
              placeholder={t.unitWizard.districtPh}
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      <Section label={t.unitWizard.searchAddress}>
        <LocationPicker
          value={state.location}
          cityLabel={selectedCity ? `${selectedCity.en}, Saudi Arabia` : undefined}
          onChange={(location: LatLng, address, locality) => {
            patch({
              location,
              ...(address ? { address } : {}),
              // `undefined` means the lookup did not run; `null` means it ran and found
              // nothing. Only the second should clear a previous answer.
              ...(locality !== undefined ? { locality } : {}),
            });
            clear('location');
          }}
        />
        {errors?.location && <FieldError message={errors.location} />}

        {/*
          The check that catches a wrong pin however it was produced — a slipped digit, a
          stale map centre, a short code resolved against the wrong reference.
        */}
        {cityMismatch && (
          <div className="mt-3">
            <Banner tone="red" icon={AlertTriangle}>
              {t.unitWizard.cityMismatch(state.locality ?? '', cityName)}
            </Banner>
          </div>
        )}
      </Section>

      <Section label={t.unitWizard.fullAddress} required>
        <input
          value={state.address}
          onChange={(event) => {
            patch({ address: event.target.value });
            clear('address');
          }}
          placeholder={t.unitWizard.fullAddressPh}
          aria-label={t.unitWizard.fullAddress}
          className={INPUT}
        />
        {errors?.address && <FieldError message={errors.address} />}
      </Section>
    </>
  );
}

function PhotosStep({
  state,
  addPhotos,
  removePhoto,
  setCover,
  unmergeable,
  errors,
}: {
  state: UnitWizardState;
  addPhotos: (files: FileList | null) => void;
  removePhoto: (localId: string) => void;
  setCover: (localId: string) => void;
  unmergeable: boolean;
  errors: Record<string, string> | null;
}) {
  const t = useT();
  const cover = coverPhotoOf(state);

  return (
    <Section label={t.unitWizard.photosUploaded}>
      {/*
        An edit merges into the gallery now. This survives only for a unit holding a
        photo from before the upload flow, which has no id to re-send and so cannot be
        carried through the edit.
      */}
      {unmergeable && (
        <div className="mb-4">
          <Banner tone="amber" icon={AlertTriangle}>
            {t.unitWizard.galleryReplaceWarning}
          </Banner>
        </div>
      )}

      <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-hairline bg-white py-12 transition hover:border-brand">
        <input
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          disabled={state.photos.length >= MAX_PHOTOS}
          onChange={(event) => {
            addPhotos(event.target.files);
            // Without this, re-picking the very same file never fires `change` again.
            event.target.value = '';
          }}
        />
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Upload className="h-6 w-6" />
        </span>
        <span className="mt-2 font-bold text-slate-800">{t.unitWizard.dragPhotos}</span>
        <span className="text-sm text-slate-500">{t.unitWizard.pngJpgMax}</span>
        <span className="text-sm text-slate-400">
          {t.unitWizard.uploadedCount(state.photos.length, MAX_PHOTOS)}
        </span>
      </label>

      {errors?.photos && <FieldError message={errors.photos} />}

      {state.photos.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-status-amberSoft px-4 py-3 text-sm text-status-amber">
          {t.unitWizard.photoRequired}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {state.photos.map((photo) => {
            const isCover = cover?.localId === photo.localId;
            const superseded = unmergeable && photo.remote && !photo.fileId;

            return (
              <div
                key={photo.localId}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={photo.fileName}
                  className={cn('h-full w-full object-cover', superseded && 'opacity-40 grayscale')}
                />

                {photo.uploading && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-900/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}

                {photo.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-status-red/80 px-2 text-center text-xs text-white">
                    <AlertTriangle className="h-4 w-4" />
                    {photo.error}
                  </div>
                )}

                {superseded ? (
                  <span className="absolute start-3 top-3 rounded-lg bg-slate-700/90 px-2.5 py-1 text-xs font-semibold text-white">
                    {t.unitWizard.willBeReplaced}
                  </span>
                ) : isCover ? (
                  <span className="absolute start-3 top-3 rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                    {t.unitWizard.cover}
                  </span>
                ) : (
                  photo.fileId && (
                    <button
                      type="button"
                      onClick={() => setCover(photo.localId)}
                      className="absolute start-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      {t.unitWizard.setCover}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => removePhoto(photo.localId)}
                  aria-label={t.unitWizard.removePhoto}
                  className="absolute end-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-status-red opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        {t.unitWizard.photoTip}
      </p>
    </Section>
  );
}

function ReviewStep({
  state,
  cities,
  goTo,
  valid,
}: {
  state: UnitWizardState;
  cities: City[] | null;
  goTo: (step: number) => void;
  valid: boolean[];
}) {
  const t = useT();
  const locale = useUiStore((store) => store.locale);
  const cover = coverPhotoOf(state);
  const dash = t.unitWizard.notProvided;

  return (
    <>
      <ReviewCard title={t.unitWizard.s1Title} onEdit={() => goTo(0)}>
        <ReviewRow label={t.unitWizard.licenseNoLabel} value={state.licenseNo || dash} ltr />
        <ReviewRow label={t.unitWizard.owner} value={t.unitWizard.ownerMamsa} />
        <ReviewRow
          label={t.unitWizard.tourismLicense}
          value={state.licenseFile ? state.licenseFile.fileName : dash}
        />
      </ReviewCard>

      <ReviewCard title={t.unitWizard.s2Title} onEdit={() => goTo(1)}>
        <ReviewRow label={t.unitWizard.nameLabel} value={state.name || dash} />
        <ReviewRow label={t.unitWizard.typeLabel} value={t.status[state.type]} />
        <ReviewRow
          label={t.unitWizard.priceLabel}
          value={priceOf(state) > 0 ? t.unitWizard.sarPerNight(formatSAR(priceOf(state))) : dash}
        />
        <ReviewRow
          label={t.unitWizard.capacityLabel}
          value={t.unitWizard.capacitySummary(
            state.bedrooms,
            state.beds,
            state.bathrooms,
            state.capacity,
          )}
        />
        <ReviewRow
          label={t.unitWizard.amenitiesField}
          value={t.unitWizard.amenitiesCount(state.amenities.length)}
        />
        <ReviewRow
          label={t.unitWizard.cancellationPolicy}
          value={t.cancellationPolicies[state.cancellationPolicy].label}
        />

        {/*
          Full width and formatted, not a truncated `ReviewRow`. The description is the
          only field on this screen whose *shape* can be wrong while every character of
          it is right, so the last look before submitting has to be at the shape.
        */}
        <div className="col-span-2 min-w-0">
          <dt className="text-xs text-slate-400">{t.unitWizard.descriptionField}</dt>
          <dd className="mt-1.5">
            <UnitDescription text={state.description} emptyLabel={dash} />
          </dd>
        </div>
      </ReviewCard>

      <ReviewCard title={t.unitWizard.s3Title} onEdit={() => goTo(2)}>
        <ReviewRow label={t.unitWizard.cityField} value={cityLabel(state.city, cities, locale) || dash} />
        <ReviewRow label={t.unitWizard.districtField} value={state.district || dash} />
        <ReviewRow label={t.unitWizard.addressLabel} value={state.address || dash} />
        <ReviewRow
          label={t.unitWizard.coordinates}
          value={
            state.location
              ? `${state.location.lat.toFixed(6)}, ${state.location.lng.toFixed(6)}`
              : dash
          }
          ltr
        />

        {state.location && (
          <div className="col-span-2">
            <StaticMapPreview
              point={state.location}
              className="w-full max-w-sm overflow-hidden rounded-xl border border-hairline"
            />
          </div>
        )}
      </ReviewCard>

      <ReviewCard title={t.unitWizard.s4Title} onEdit={() => goTo(3)}>
        <ReviewRow
          label={t.unitWizard.photosUploaded}
          value={state.photos.length ? t.unitWizard.photosCount(state.photos.length) : dash}
        />
        <ReviewRow label={t.unitWizard.coverPhoto} value={cover?.fileName ?? dash} />
      </ReviewCard>

      {state.photos.length > 0 && (
        <Section label={t.unitWizard.uploadedPhotos}>
          <div className="grid grid-cols-3 gap-3">
            {state.photos.map((photo) => (
              <div
                key={photo.localId}
                className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={photo.fileName}
                  className="h-full w-full object-cover"
                />
                {cover?.localId === photo.localId && (
                  <span className="absolute bottom-2 start-2 rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                    {t.unitWizard.cover}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {valid.every(Boolean) && (
        <Banner tone="brand" icon={CheckCircle2}>
          {t.unitWizard.allComplete}
        </Banner>
      )}
    </>
  );
}

/* --------------------------------------------------------- sub-components */

const INPUT =
  'h-10 w-full rounded-xl border border-hairline bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30';

/** The API sends both labels; which one to show is a UI decision, not a data one. */
function cityLabel(value: string, cities: City[] | null, locale: Locale): string {
  const match = cities?.find((city) => city.key === value);
  if (!match) return value;
  return locale === 'ar' ? match.ar : match.en;
}

function CitySelect({
  value,
  cities,
  onChange,
}: {
  value: string;
  cities: City[] | null;
  onChange: (value: string) => void;
}) {
  const locale = useUiStore((store) => store.locale);

  if (!cities) {
    return <div className="h-10 w-full animate-pulse rounded-xl bg-surface-muted" />;
  }

  // A unit created before this list existed may carry a city string that is not a key.
  // Keeping it as an option means opening that unit does not silently rewrite its city.
  const unknown = value && !cities.some((city) => city.key === value);

  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={INPUT}>
      {unknown && <option value={value}>{value}</option>}
      {cities.map((city) => (
        <option key={city.key} value={city.key}>
          {locale === 'ar' ? city.ar : city.en}
        </option>
      ))}
    </select>
  );
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'amber' | 'red' | 'brand';
  icon: typeof AlertTriangle;
  children: React.ReactNode;
}) {
  const TONE = {
    amber: 'bg-status-amberSoft text-status-amber',
    red: 'border border-status-red/30 bg-status-redSoft text-status-red',
    brand: 'bg-brand-soft text-brand',
  } as const;

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-2xl px-4 py-3 text-sm leading-relaxed',
        TONE[tone],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="mt-1.5 text-xs text-status-red">{message}</p>;
}

function StepRail({
  current,
  labels,
  errorSteps,
}: {
  current: number;
  labels: string[];
  errorSteps: WizardStep[];
}) {
  const failing = new Set(errorSteps.map(stepIndexOf));

  return (
    <div className="flex items-center">
      {labels.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const bad = failing.has(index);

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition',
                  bad
                    ? 'bg-status-red text-white'
                    : done || active
                      ? 'bg-brand text-white'
                      : 'bg-surface-muted text-slate-400',
                )}
              >
                {bad ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-sm font-medium',
                  bad ? 'text-status-red' : done || active ? 'text-slate-800' : 'text-slate-400',
                )}
              >
                {label}
              </span>
            </div>
            {index < labels.length - 1 && (
              <span
                className={cn('mx-2 hidden h-px flex-1 sm:block', done ? 'bg-brand' : 'bg-hairline')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
        {required && <span className="ms-1 text-status-red">*</span>}
      </h3>
      {children}
    </section>
  );
}

function FieldLabelText({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-sm font-semibold text-slate-800">
      {children}
      {required && <span className="ms-1 text-status-red">*</span>}
    </span>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block">
        <FieldLabelText required={required}>{label}</FieldLabelText>
      </span>
      {children}
      {error && <FieldError message={error} />}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={INPUT}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const button =
    'grid h-10 w-10 place-items-center rounded-full border border-hairline text-slate-700 transition hover:bg-surface-muted disabled:opacity-40';

  return (
    <div>
      <span className="mb-2 block">
        <FieldLabelText>{label}</FieldLabelText>
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={button}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`${label} -1`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-lg font-bold tabular-nums text-slate-900">
          {value}
        </span>
        <button
          type="button"
          className={button}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`${label} +1`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function PolicyCard({
  name,
  selected,
  onSelect,
}: {
  name: CancellationPolicyName;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const preset = CANCELLATION_PRESETS[name];
  const copy = t.cancellationPolicies[name];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-start transition',
        selected ? 'border-brand bg-brand-soft' : 'border-hairline bg-white hover:bg-surface-muted',
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="font-bold text-slate-900">{copy.label}</span>
        {selected && <Check className="h-4 w-4 shrink-0 text-brand" />}
      </span>
      <span className="text-xs leading-relaxed text-slate-600">{copy.description}</span>

      <dl className="mt-1 w-full space-y-1.5 border-t border-hairline pt-3">
        {CANCELLATION_TIER_DAYS.map((days, index) => {
          const percent = preset[index];
          return (
            <div key={days} className="flex items-center justify-between gap-2">
              <dt className="text-xs leading-snug text-slate-500">
                {t.unitWizard.policyTiers[index]}
              </dt>
              <dd
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                  refundTone(percent),
                )}
              >
                {percent === 0 ? t.unitWizard.noRefund : t.unitWizard.refundOf(percent)}
              </dd>
            </div>
          );
        })}
      </dl>
    </button>
  );
}

/** Green / amber / grey by how much the guest gets back, so a row reads at a glance. */
function refundTone(percent: number): string {
  if (percent >= 75) return 'bg-status-greenSoft text-status-green';
  if (percent > 0) return 'bg-status-amberSoft text-status-amber';
  return 'bg-status-greySoft text-status-grey';
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const t = useT();

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-hairline px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-surface-muted"
        >
          {t.unitWizard.edit}
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd
        className={cn('mt-0.5 truncate font-semibold text-slate-800', ltr && 'tabular-nums')}
        dir={ltr ? 'ltr' : undefined}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function FooterButton({
  variant = 'primary',
  disabled,
  onClick,
  children,
}: {
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed',
        variant === 'primary'
          ? 'bg-brand text-white hover:bg-brand-hover disabled:bg-brand/30'
          : 'border border-hairline bg-white text-slate-700 hover:bg-surface-muted disabled:opacity-50',
      )}
    >
      {children}
    </button>
  );
}
