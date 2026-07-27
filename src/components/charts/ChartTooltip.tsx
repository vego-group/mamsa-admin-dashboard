import { cn } from '@/lib/utils/cn';

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

/**
 * One tooltip shape for every chart on the console. Figures render LTR because they
 * are numeric data, even inside the Arabic layout.
 */
export function ChartTooltipBox({
  title,
  rows,
  className,
}: {
  title: string;
  rows: TooltipRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-w-[9rem] rounded-xl border border-hairline bg-white p-3 shadow-pop',
        className,
      )}
    >
      <p className="text-xs font-medium text-slate-500">{title}</p>

      <ul className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 text-xs">
            {row.color && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden
              />
            )}
            <span className="flex-1 text-slate-600">{row.label}</span>
            <span dir="ltr" className="font-semibold tabular-nums text-slate-900">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
