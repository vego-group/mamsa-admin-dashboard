'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils/cn';
import { formatSAR, splitPriceForUnit } from '@/lib/utils/format';

/**
 * What the nightly price actually resolves to for a unit Mamsa owns.
 *
 * The partner dashboard shows this card as "your earnings after our cut". Here there
 * is no cut to take — Mamsa is both the platform and the owner — so the headline is the
 * full net base and the commission line is replaced by the reason it is absent. Showing
 * a 10% row that nets back to us would misstate the same number twice.
 */
export function PriceBreakdown({ gross, className }: { gross: number; className?: string }) {
  const t = useT();
  const debounced = useDebounced(gross, 150);
  const [open, setOpen] = useState(false);

  if (debounced <= 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-hairline bg-surface-muted/60 p-4 text-sm text-slate-500',
          className,
        )}
      >
        {t.unitWizard.pricePlaceholder}
      </div>
    );
  }

  const split = splitPriceForUnit(debounced, true);

  return (
    <div className={cn('rounded-2xl border border-hairline bg-surface-muted/60 p-4', className)}>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{t.unitWizard.guestPays}</span>
        <span className="font-medium tabular-nums text-slate-800">{formatSAR(split.gross)}</span>
      </div>

      <div className="mt-3">
        <p className="text-sm text-slate-600">{t.unitWizard.mamsaKeeps}</p>
        <p className="text-2xl font-bold tabular-nums text-brand">{formatSAR(split.netBase)}</p>
        <p className="mt-0.5 text-xs text-slate-500">{t.unitWizard.mamsaKeepsNote}</p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-3 text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
        aria-expanded={open}
      >
        {t.unitWizard.showDeductions}
      </button>

      {open && (
        <dl className="mt-3 space-y-2 border-t border-hairline pt-3 text-sm">
          <Row label={t.unitWizard.netBase} value={formatSAR(split.netBase)} />
          <Row label={t.unitWizard.vatLine} value={formatSAR(split.vat)} hint={t.unitWizard.vatTooltip} />
          <p className="pt-1 text-xs leading-relaxed text-slate-500">
            {t.unitWizard.noCommissionLine}
          </p>
        </dl>
      )}
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-600" title={hint}>
        {label}
        {hint && <span className="ms-1 text-slate-400">ⓘ</span>}
      </dt>
      <dd className="tabular-nums text-slate-800">{value}</dd>
    </div>
  );
}

/** Keeps the card from recomputing on every keystroke while a price is being typed. */
function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);

  return settled;
}
