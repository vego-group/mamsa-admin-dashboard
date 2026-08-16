'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useT } from '@/i18n';
import { ApiError, unitsApi } from '@/lib/api';
import { SAUDI_CITIES, UNIT_TYPE } from '@/lib/constants';
import type { UnitDraft } from '@/types';

export interface AddUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const EMPTY: UnitDraft = {
  name: '',
  type: UNIT_TYPE.APARTMENT,
  city: SAUDI_CITIES[0],
  district: '',
  pricePerNight: 0,
  bedrooms: 1,
  bathrooms: 1,
  capacity: 2,
  sizeSqm: 0,
};

export function AddUnitDialog({ open, onOpenChange, onCreated }: AddUnitDialogProps) {
  const t = useT();
  const [draft, setDraft] = useState<UnitDraft>(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDraft(EMPTY);
      setPending(false);
      setError(null);
    }
  }, [open]);

  const valid = draft.name.trim().length > 0 && draft.pricePerNight > 0;

  function set<K extends keyof UnitDraft>(key: K, value: UnitDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function create() {
    if (!valid) {
      setError(t.units.nameRequired);
      return;
    }

    setPending(true);
    try {
      await unitsApi.create({ ...draft, name: draft.name.trim(), district: draft.district.trim() });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.units.addTitle}</DialogTitle>
          <DialogDescription>{t.units.addBody}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-5">
          <p className="rounded-xl bg-status-amberSoft px-3.5 py-2.5 text-sm leading-relaxed text-status-amber">
            {t.units.addNoMediaWarning}
          </p>

          <Field label={t.units.name}>
            <Input value={draft.name} onChange={(event) => set('name', event.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.units.type}>
              <Select
                value={draft.type}
                onChange={(value) => set('type', value as UnitDraft['type'])}
                options={Object.values(UNIT_TYPE).map((value) => ({
                  value,
                  label: t.status[value],
                }))}
              />
            </Field>

            <Field label={t.units.city}>
              <Select
                value={draft.city}
                onChange={(value) => set('city', value)}
                options={SAUDI_CITIES.map((value) => ({ value, label: t.cities[value] }))}
              />
            </Field>
          </div>

          <Field label={t.units.district}>
            <Input
              value={draft.district}
              onChange={(event) => set('district', event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.units.price}>
              <NumberInput
                value={draft.pricePerNight}
                onChange={(value) => set('pricePerNight', value)}
              />
            </Field>
            <Field label={t.units.size}>
              <NumberInput value={draft.sizeSqm} onChange={(value) => set('sizeSqm', value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.units.bedrooms}>
              <NumberInput value={draft.bedrooms} onChange={(value) => set('bedrooms', value)} />
            </Field>
            <Field label={t.units.bathrooms}>
              <NumberInput value={draft.bathrooms} onChange={(value) => set('bathrooms', value)} />
            </Field>
            <Field label={t.units.capacity}>
              <NumberInput value={draft.capacity} onChange={(value) => set('capacity', value)} />
            </Field>
          </div>

          {error && <p className="text-sm text-status-red">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void create()} disabled={pending || !valid}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.units.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <Input
      inputMode="numeric"
      value={value === 0 ? '' : String(value)}
      onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '')) || 0)}
      className="tabular-nums"
    />
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
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-xl border border-hairline bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
