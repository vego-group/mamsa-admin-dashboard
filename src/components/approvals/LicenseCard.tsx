'use client';

import { FileCheck, Info } from 'lucide-react';
import { LtrText } from '@/components/common';
import { PermitFile } from '@/components/units/PermitFile';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils/cn';
import type { UnitDetail } from '@/types';

export interface LicenseCardProps {
  unit: Pick<
    UnitDetail,
    'licenseType' | 'licensedUnitsCount' | 'groupSize' | 'tourismPermitNo' | 'permitFileUrl'
  >;
  className?: string;
}

/**
 * The licence, its numbers, and the permit file — on one card, in one view, because the
 * only thing a reviewer adds here is a comparison the machine cannot make.
 *
 * The server already refuses any group larger than `licensedUnitsCount`, so "is 5 ≤ 8?"
 * is not the question; it has been answered. The question is whether the 8 is true: the
 * partner typed it, and only a human with the permit open can say whether the permit
 * says 8. A reviewer who has to leave the screen to open the file will approve without
 * opening it, which is why the file is rendered here rather than linked from here.
 *
 * `licenseType` is branched on as a code and rendered from the dictionary, never from the
 * server's English value. `null` is "nobody has classified this yet" and is shown in the
 * same neutral tone as any other fact — an unclassified unit books normally.
 *
 * A value the dictionary does not know is **not** the same thing: the partner picked a
 * type, and this console cannot render it. On a verification screen those two must read
 * differently — "not specified" on a classified unit would send the reviewer to the
 * wrong conclusion — so the unknown case gets its own label, and still never the code.
 */
export function LicenseCard({ unit, className }: LicenseCardProps) {
  const t = useT();
  const d = t.approvalDetail;

  const typeLabel =
    unit.licenseType === null
      ? d.licenseUnspecified
      : (d.licenseTypes[unit.licenseType] ?? d.licenseUnknown);
  const licensed = unit.licensedUnitsCount;

  return (
    <Card className={cn('p-5', className)}>
      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <FileCheck className="h-4 w-4 text-slate-400" aria-hidden />
        {d.license}
      </h3>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Fact label={d.licenseType} value={typeLabel} />
        <Fact label={d.tourismPermit} value={unit.tourismPermitNo} ltr />
        {/*
          One relation, not two figures: "5 of 8 in use" is what the reviewer holds up
          against the permit. With no licensed count there is nothing to relate, and the
          group size stands alone.
        */}
        <Fact
          label={licensed !== null ? d.licensedUnits : d.groupSize}
          value={
            licensed !== null ? d.licenseUsage(unit.groupSize, licensed) : String(unit.groupSize)
          }
          hint={licensed !== null ? d.licenseMatchHint : undefined}
          ltr
        />
      </dl>

      <PermitFile url={unit.permitFileUrl} className="mt-4" />
    </Card>
  );
}

function Fact({
  label,
  value,
  hint,
  ltr,
}: {
  label: string;
  value: string | null;
  hint?: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface-page px-4 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={cn('mt-1 font-semibold text-slate-900', ltr && 'tabular-nums')}>
        {value === null ? '—' : ltr ? <LtrText>{value}</LtrText> : value}
      </dd>
      {hint && (
        <p className="mt-1.5 flex items-start gap-1 text-xs leading-relaxed text-slate-600">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-brand" aria-hidden />
          {hint}
        </p>
      )}
    </div>
  );
}
