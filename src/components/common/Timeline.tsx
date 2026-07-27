import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/format';

export interface TimelineItem {
  id: string;
  label: string;
  at: string;
  state?: 'done' | 'current' | 'cancelled';
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const DOT: Record<NonNullable<TimelineItem['state']>, string> = {
  done: 'bg-status-green',
  current: 'bg-status-amber ring-4 ring-status-amberSoft',
  cancelled: 'bg-status-red',
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn('relative space-y-5 ps-5', className)}>
      <span className="absolute inset-y-1 start-[5px] w-px bg-hairline" aria-hidden />

      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              'absolute -start-5 top-1.5 h-2.5 w-2.5 rounded-full',
              DOT[item.state ?? 'done'],
            )}
            aria-hidden
          />
          <p className="text-sm font-medium text-slate-800">{item.label}</p>
          <p className="text-xs tabular-nums text-slate-500">{formatDateTime(item.at)}</p>
          {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
        </li>
      ))}
    </ol>
  );
}
