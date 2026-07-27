import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { Sparkline } from './Sparkline';

/** Icon chip tints. `brand` is the default; the rest borrow the status palette. */
const ICON_TONE = {
  brand: 'bg-surface-muted text-brand',
  amber: 'bg-status-amberSoft text-status-amber',
  green: 'bg-status-greenSoft text-status-green',
  blue: 'bg-status-blueSoft text-status-blue',
  red: 'bg-status-redSoft text-status-red',
} as const;

export interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Percentage change. Omit for pure operational counts — a count is not a trend. */
  delta?: number;
  hint?: string;
  series?: number[];
  tone?: 'default' | 'attention';
  /** Tints the icon chip only. Use it to separate metric families in one grid. */
  iconTone?: keyof typeof ICON_TONE;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  series,
  tone = 'default',
  iconTone = 'brand',
  className,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <Card
      className={cn(
        'p-5',
        tone === 'attention' && 'border-status-amber/30 bg-status-amberSoft/40',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <span
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl',
              tone === 'attention' ? 'bg-white text-status-amber' : ICON_TONE[iconTone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}

        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              positive ? 'bg-status-greenSoft text-status-green' : 'bg-status-redSoft text-status-red',
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>

      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {series && series.length > 1 && <Sparkline data={series} className="mt-3" />}
    </Card>
  );
}
