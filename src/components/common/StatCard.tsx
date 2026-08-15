import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

const TONE = {
  brand: 'text-brand',
  amber: 'text-status-amber',
  accent: 'text-accent',
  green: 'text-status-green',
  red: 'text-status-red',
  blue: 'text-status-blue',
  slate: 'text-slate-700',
} as const;

export interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  tone?: keyof typeof TONE;
  /**
   * `center` stacks icon → figure → caption for a row of peer counters.
   * `start` leads with the caption so a grid of analytics tiles scans as a list.
   */
  align?: 'center' | 'start';
  /**
   * Makes the whole tile a button. Use it when the figure has somewhere to lead — a
   * counter the reader cannot drill into is a dead end.
   */
  onClick?: () => void;
  /** Announced on the actionable tile, where the caption alone rarely says where it goes. */
  actionLabel?: string;
  /** Small print under the caption — the target a figure is being judged against. */
  hint?: string;
  className?: string;
}

/**
 * A bare counter — no chip, no trend. `KpiCard` is the other shape: a tinted icon
 * chip and a delta pill, for figures that move week to week.
 */
export function StatCard({
  icon: Icon,
  value,
  label,
  tone = 'brand',
  align = 'center',
  onClick,
  actionLabel,
  hint,
  className,
}: StatCardProps) {
  const caption = (
    <div className="space-y-0.5">
      <p className="text-sm text-slate-500">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
  const figure = <p className="text-3xl font-semibold tabular-nums text-slate-900">{value}</p>;

  return (
    <Card
      {...(onClick
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-label': actionLabel,
            onClick,
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onClick();
            },
          }
        : {})}
      className={cn(
        'flex flex-col gap-2 px-5 py-6',
        align === 'center' ? 'items-center text-center' : 'items-start',
        onClick &&
          'cursor-pointer transition-colors hover:border-brand/40 hover:bg-brand-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
        className,
      )}
    >
      <Icon className={cn('h-7 w-7', TONE[tone])} aria-hidden />
      {align === 'center' ? (
        <>
          {figure}
          {caption}
        </>
      ) : (
        <>
          {caption}
          {figure}
        </>
      )}
    </Card>
  );
}
