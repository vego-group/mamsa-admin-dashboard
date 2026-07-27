'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useT } from '@/i18n';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const t = useT();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      <p>
        {t.common.showing} <span className="font-medium text-slate-700">{from}–{to}</span>{' '}
        {t.common.of} <span className="font-medium text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <PagerButton disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </PagerButton>

        {Array.from({ length: pages }).map((_, index) => {
          const value = index + 1;
          return (
            <PagerButton key={value} active={value === page} onClick={() => onPageChange(value)}>
              {value}
            </PagerButton>
          );
        })}

        <PagerButton disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next">
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </PagerButton>
      </div>
    </div>
  );
}

function PagerButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm transition-colors',
        active ? 'bg-brand text-white' : 'text-slate-600 hover:bg-surface-muted',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    />
  );
}
