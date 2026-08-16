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
  /**
   * What the delta actually measures. **Required whenever it is not a change in the
   * figure above it**, which on the dashboard is every one of them: the KPI is a
   * lifetime total and the delta is this month's inflow, so `+12%` beside `1,240 users`
   * means 12% more signups than last month, not a 12% larger user base.
   */
  deltaLabel?: string;
  /**
   * `verdict` colours the chip green/red. `neutral` renders it grey with no arrow.
   *
   * Use `neutral` when the comparison is structurally unfair and the sign is therefore
   * not news — the dashboard compares a **partial** current month against a **complete**
   * previous one, so it reads negative for most of every month and only becomes a fair
   * comparison on the last day. The number still tells you something as it climbs; the
   * colour would tell you something false.
   */
  deltaTone?: 'verdict' | 'neutral';
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
  deltaLabel,
  deltaTone = 'verdict',
  hint,
  series,
  tone = 'default',
  iconTone = 'brand',
  className,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const neutralDelta = deltaTone === 'neutral';

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
              neutralDelta
                ? 'bg-surface-muted text-slate-600'
                : positive
                  ? 'bg-status-greenSoft text-status-green'
                  : 'bg-status-redSoft text-status-red',
            )}
            title={deltaLabel}
          >
            {/* No arrow in the neutral case: an arrow is a verdict, and this comparison
                has not earned one. The sign on the number is still visible. */}
            {!neutralDelta &&
              (positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              ))}
            {neutralDelta && positive ? '+' : ''}
            {neutralDelta ? delta : Math.abs(delta)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>

      {/* The chip is meaningless without this on every dashboard tile — it names the
          quantity the percentage belongs to, which is never the figure above it. */}
      {typeof delta === 'number' && deltaLabel && (
        <p className="mt-1 text-xs text-slate-500">{deltaLabel}</p>
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {series && series.length > 1 && <Sparkline data={series} className="mt-3" />}
    </Card>
  );
}
