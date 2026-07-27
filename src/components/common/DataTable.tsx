'use client';

import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { useT } from '@/i18n';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { TableSkeleton } from './Skeletons';

export interface Column<T> {
  key: string;
  header: string;
  /** Header alignment follows the cell; numbers read better trailing. */
  align?: 'start' | 'end';
  width?: string;
  sortable?: boolean;
  cell: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  /** Rendered above the table, inside the card — a title, or a title plus a link. */
  header?: ReactNode;
  /** Rendered under the table — pass <Pagination /> here. */
  footer?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  onRowClick,
  emptyTitle,
  emptyDescription,
  sortBy,
  sortDir,
  onSort,
  header,
  footer,
  className,
}: DataTableProps<T>) {
  const t = useT();

  // The header belongs to the card, not the table — it stays put while the body
  // swaps between skeleton, error, empty and rows.
  const shell = (children: ReactNode) => (
    <Card className={cn('overflow-hidden', className)}>
      {header && <div className="border-b border-hairline p-5">{header}</div>}
      {children}
    </Card>
  );

  if (loading) return shell(<TableSkeleton columns={columns.length} />);
  if (error) return shell(<ErrorState onRetry={onRetry} />);
  if (rows.length === 0) {
    return shell(<EmptyState title={emptyTitle ?? t.common.noResults} description={emptyDescription} />);
  }

  return shell(
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-hairline">
              {columns.map((column) => {
                const active = sortBy === column.key;
                const SortIcon = !active ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown;

                return (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(
                      'px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500',
                      column.align === 'end' ? 'text-end' : 'text-start',
                    )}
                  >
                    {column.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(column.key)}
                        className={cn(
                          'inline-flex items-center gap-1 transition-colors hover:text-slate-700',
                          active && 'text-slate-800',
                        )}
                      >
                        {column.header}
                        <SortIcon className="h-3 w-3" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-hairline">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-page',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-5 py-4 align-middle text-slate-700',
                      column.align === 'end' ? 'text-end' : 'text-start',
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer && <div className="border-t border-hairline px-5 py-3">{footer}</div>}
    </>,
  );
}
