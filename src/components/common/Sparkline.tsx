import { cn } from '@/lib/utils/cn';

export interface SparklineProps {
  data: number[];
  className?: string;
}

/** Deliberately dependency-free: a KPI card should not pull in a chart engine. */
export function Sparkline({ data, className }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 96;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-7 w-24 text-brand', className)}
      fill="none"
      aria-hidden
    >
      <polyline points={points} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
