'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip } from 'lucide-react';
import {
  type Column,
  DataTable,
  type FilterTabItem,
  FilterTabs,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { useT } from '@/i18n';
import { useDebounced } from '@/hooks/useDebounced';
import { complaintsApi } from '@/lib/api';
import { formatRiyadhDate } from '@/lib/complaints/dates';
import { COMPLAINT_STATUS_ORDER, complaintStatusBadge } from '@/lib/complaints/status';
import type { ComplaintStatus } from '@/lib/constants';
import type { ComplaintRow, Paginated } from '@/types';

const PAGE_SIZE = 10;

export default function ComplaintsPage() {
  return (
    <RequirePermission permission="complaints.view">
      <ComplaintsPageContent />
    </RequirePermission>
  );
}

/**
 * The queue. Same table shape as cancellations — and only the shape: nothing financial
 * is on this list, and nothing on the detail is ever computed from a rate. The whole row
 * opens the complaint; there is no drawer, because the detail needs the room.
 */
function ComplaintsPageContent() {
  const t = useT();
  const router = useRouter();

  const [status, setStatus] = useState<ComplaintStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const query = useDebounced(search.trim());
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<ComplaintRow> | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    complaintsApi
      .list({ status, search: query, page, pageSize: PAGE_SIZE })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [status, query, page, reloadToken]);

  useEffect(() => setPage(1), [status, query]);

  const statusLabel = (value: ComplaintStatus) =>
    (t.status as Record<string, string>)[complaintStatusBadge(value)];

  const tabs: FilterTabItem[] = [
    { value: 'all', label: t.complaints.all },
    ...COMPLAINT_STATUS_ORDER.map((value) => ({ value, label: statusLabel(value) })),
  ];

  const columns: Array<Column<ComplaintRow>> = useMemo(
    () => [
      {
        key: 'status',
        header: t.complaints.status,
        width: '16%',
        cell: (row) => <StatusBadge status={complaintStatusBadge(row.status)} />,
      },
      {
        key: 'bookingCode',
        header: t.complaints.booking,
        width: '12%',
        cell: (row) =>
          row.bookingCode ? (
            <LtrText className="font-semibold text-slate-900">{row.bookingCode}</LtrText>
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        key: 'unitName',
        header: t.complaints.unit,
        width: '20%',
        cell: (row) => <span className="truncate text-slate-700">{row.unitName ?? '—'}</span>,
      },
      {
        key: 'guestName',
        header: t.complaints.guest,
        width: '16%',
        cell: (row) => <span className="truncate font-medium text-slate-800">{row.guestName ?? '—'}</span>,
      },
      {
        key: 'partnerName',
        header: t.complaints.partner,
        width: '16%',
        cell: (row) => <span className="truncate text-slate-600">{row.partnerName ?? '—'}</span>,
      },
      {
        key: 'createdAt',
        header: t.complaints.date,
        width: '11%',
        cell: (row) => <LtrText className="text-slate-500">{formatRiyadhDate(row.createdAt)}</LtrText>,
      },
      {
        key: 'hasAttachments',
        header: t.complaints.attachments,
        align: 'end',
        cell: (row) =>
          row.hasAttachments ? (
            <span
              className="inline-flex items-center gap-1 text-slate-500"
              title={t.complaints.hasAttachments}
            >
              <Paperclip className="h-4 w-4" aria-hidden />
              <span className="sr-only">{t.complaints.hasAttachments}</span>
            </span>
          ) : (
            <span className="text-slate-300" aria-label={t.complaints.noAttachments}>
              —
            </span>
          ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t.complaints.title} subtitle={t.complaints.subtitle} />

      <DataTable
        columns={columns}
        rows={result?.items ?? []}
        rowKey={(row) => String(row.id)}
        loading={!result && !error}
        error={error}
        onRetry={reload}
        onRowClick={(row) => router.push(`/complaints/${row.id}`)}
        emptyTitle={t.complaints.empty}
        header={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterTabs
              items={tabs}
              value={status}
              onChange={(next) => setStatus(next as ComplaintStatus | 'all')}
            />
            {/* Booking code, unit name, guest name or guest mobile — the server's scope. */}
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t.complaints.searchPlaceholder}
              className="w-full max-w-sm"
            />
          </div>
        }
        footer={
          result &&
          result.total > result.pageSize && (
            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              onPageChange={setPage}
            />
          )
        }
      />
    </div>
  );
}
