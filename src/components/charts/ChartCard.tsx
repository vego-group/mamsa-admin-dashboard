import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface ChartCardProps {
  title: string;
  description?: string;
  /** Range switcher, "View all" link — anything that sits opposite the title. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>

      <div className="flex-1 p-5 pt-4">{children}</div>
    </Card>
  );
}
