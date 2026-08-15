'use client';

import Image from 'next/image';
import { BedDouble, ImageOff, MapPin, Star, Users } from 'lucide-react';
import { StatusBadge } from '@/components/common';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { UNIT_TYPE } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatSAR } from '@/lib/utils/format';
import type { Unit } from '@/types';

export interface UnitCardProps {
  unit: Unit;
  onSelect: () => void;
  className?: string;
}

export function UnitCard({ unit, onSelect, className }: UnitCardProps) {
  const t = useT();
  const city = t.cities[unit.city as keyof typeof t.cities] ?? unit.city;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelect()}
      className={cn(
        'cursor-pointer overflow-hidden transition-shadow hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
        className,
      )}
    >
      <div className="relative grid aspect-[4/3] place-items-center bg-surface-muted">
        {/*
          Quiet on purpose. This is a browse grid, not a review — most listings currently
          have no photography of their own, so an alarm-toned tile here would be constant
          noise. The approvals detail page is where the same absence is called a finding.
        */}
        {unit.coverImage ? (
          <Image
            src={unit.coverImage}
            alt={unit.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-slate-400">
            <ImageOff className="h-7 w-7" aria-hidden />
            <span className="text-xs font-medium">{t.units.noPhoto}</span>
          </span>
        )}

        {/* One lifecycle badge only — an approved unit is published by definition. */}
        <StatusBadge status={unit.status} className="absolute end-3 top-3 bg-white/95 backdrop-blur" />
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-slate-900">{unit.name}</h3>

        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {city}
          </span>
          <span aria-hidden>·</span>
          <StatusBadge status={unit.type} dot={false} />
        </p>

        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-slate-400" aria-hidden />
            {unit.type === UNIT_TYPE.STUDIO ? t.units.studio : unit.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Users className="h-4 w-4 text-slate-400" aria-hidden />
            {unit.capacity}
          </span>
          {unit.reviewsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Star className="h-4 w-4 fill-status-amber text-status-amber" aria-hidden />
              {unit.rating.toFixed(1)} ({unit.reviewsCount})
            </span>
          )}
        </p>

        <div className="mt-4">
          <p className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{t.units.occupancy}</span>
            <span className="font-semibold tabular-nums text-slate-900">{unit.occupancyRate}%</span>
          </p>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <span
              className="block h-full rounded-full bg-brand"
              style={{ width: `${Math.min(100, Math.max(0, unit.occupancyRate))}%` }}
            />
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-hairline pt-3">
          <div>
            <p className="text-xs text-slate-500">{t.units.revenue}</p>
            <p className="font-semibold tabular-nums text-slate-900">
              {formatSAR(unit.revenue, { compact: true })}
            </p>
          </div>
          <div className="text-end">
            <p className="text-xs text-slate-500">{t.units.pricePerNight}</p>
            <p className="font-semibold tabular-nums text-slate-900">
              {formatSAR(unit.pricePerNight)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
