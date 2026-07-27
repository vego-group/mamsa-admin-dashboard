'use client';

import { cn } from '@/lib/utils/cn';

export interface SegmentedItem {
  value: string;
  label: string;
}

export interface SegmentedProps {
  items: SegmentedItem[];
  value: string;
  onChange: (value: string) => void;
  /** Numeric switches (3M/6M/12M) read left-to-right in every locale. */
  ltr?: boolean;
  className?: string;
}

/** Track with a raised active pill — the chart range switch and the detail tabs. */
export function Segmented({ items, value, onChange, ltr, className }: SegmentedProps) {
  return (
    <div
      dir={ltr ? 'ltr' : undefined}
      role="tablist"
      className={cn('inline-flex rounded-xl bg-surface-muted p-1', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-lg px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors',
              active ? 'bg-white text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
