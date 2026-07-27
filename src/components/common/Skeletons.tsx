import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-hairline" aria-busy>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4"
              style={{ width: colIndex === 0 ? '18%' : `${Math.max(8, 60 / columns)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className} aria-busy>
      <div className="space-y-3 p-5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
    </Card>
  );
}

export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card aria-busy>
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="w-full" style={{ height }} />
      </div>
    </Card>
  );
}
