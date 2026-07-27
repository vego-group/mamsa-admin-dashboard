'use client';

import { cn } from '@/lib/utils/cn';

export interface FilterTabItem {
  value: string;
  label: string;
  count?: number;
  /** Amber-tinted tab, used for states that need attention (pending payment). */
  attention?: boolean;
}

export interface FilterTabsProps {
  items: FilterTabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ items, value, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)} role="tablist">
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
              'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              active ? 'bg-surface-muted text-slate-900' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs tabular-nums',
                  item.attention
                    ? 'bg-status-amberSoft text-status-amber'
                    : active
                      ? 'bg-white text-slate-600'
                      : 'bg-surface-muted text-slate-500',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
