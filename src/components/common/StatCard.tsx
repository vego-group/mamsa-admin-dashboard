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
  className,
}: StatCardProps) {
  const caption = <p className="text-sm text-slate-500">{label}</p>;
  const figure = <p className="text-3xl font-semibold tabular-nums text-slate-900">{value}</p>;

  return (
    <Card
      className={cn(
        'flex flex-col gap-2 px-5 py-6',
        align === 'center' ? 'items-center text-center' : 'items-start',
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
