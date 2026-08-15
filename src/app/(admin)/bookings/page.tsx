'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, CreditCard, DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import {
  Avatar,
  type Column,
  DataTable,
  type FilterTabItem,
  FilterTabs,
  KpiCard,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { BookingDetailDrawer } from '@/components/bookings/BookingDetailDrawer';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { bookingsApi } from '@/lib/api';
import { BOOKING_STATUS, type BookingStatus } from '@/lib/constants';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatDate, formatSAR } from '@/lib/utils/format';
import type { Booking, BookingStats, ID, Paginated } from '@/types';

const PAGE_SIZE = 10;

function BookingsPageContent() {
  const t = useT();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by: string; dir: 'asc' | 'desc' } | null>(null);

  const [result, setResult] = useState<Paginated<Booking> | null>(null);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState(false);
  // Seeded from ?open=<id> so a notification's deep link pops the drawer on arrival.
  const [inspecting, setInspecting] = useState<ID | null>(() => searchParams.get('open'));
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    bookingsApi
      .list({ status, search, page, pageSize: PAGE_SIZE, sortBy: sort?.by, sortDir: sort?.dir })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [status, search, page, sort, reloadToken]);

  useEffect(() => {
    let stale = false;
    bookingsApi
      .stats()
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    bookingsApi
      .counts()
      .then((response) => !stale && setCounts(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [status, search]);

  // One tab per booking status, each carrying its live count. Pending Payment gets
  // the amber attention treatment.
  const tabs: FilterTabItem[] = [
    { value: 'all', label: t.common.all, count: counts?.all },
    {
      value: BOOKING_STATUS.PENDING_PAYMENT,
      label: t.status.pending_payment,
      count: counts?.[BOOKING_STATUS.PENDING_PAYMENT],
      attention: true,
    },
    {
      value: BOOKING_STATUS.CONFIRMED,
      label: t.status.confirmed,
      count: counts?.[BOOKING_STATUS.CONFIRMED],
    },
    {
      value: BOOKING_STATUS.COMPLETED,
      label: t.status.completed,
      count: counts?.[BOOKING_STATUS.COMPLETED],
    },
    {
      value: BOOKING_STATUS.CANCELLED,
      label: t.status.cancelled,
      count: counts?.[BOOKING_STATUS.CANCELLED],
    },
  ];

  const columns: Array<Column<Booking>> = useMemo(
    () => [
      {
        key: 'code',
        header: t.bookings.bookingId,
        width: '10%',
        cell: (row) => <LtrText className="font-semibold text-slate-900">{row.code}</LtrText>,
      },
      {
        key: 'guestName',
        header: t.bookings.guest,
        width: '15%',
        cell: (row) => (
          <span className="flex items-center gap-2.5">
            <Avatar name={row.guestName} size="sm" />
            <span className="truncate font-medium text-slate-800">{row.guestName}</span>
          </span>
        ),
      },
      {
        key: 'unitName',
        header: t.bookings.property,
        width: '18%',
        cell: (row) => (
          <span className="block min-w-0">
            <span className="block truncate text-slate-700">{row.unitName}</span>
            <span className="block truncate text-xs text-slate-400">
              {t.cities[row.unitCity as keyof typeof t.cities] ?? row.unitCity}
            </span>
          </span>
        ),
      },
      {
        key: 'checkIn',
        header: t.bookings.dates,
        width: '11%',
        cell: (row) => <LtrText className="text-slate-500">{formatDate(row.checkIn)}</LtrText>,
      },
      {
        key: 'total',
        header: t.bookings.amount,
        width: '11%',
        sortable: true,
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-900">{formatSAR(row.total)}</span>
        ),
      },
      {
        key: 'commission',
        header: t.bookings.commission,
        width: '10%',
        sortable: true,
        cell: (row) => (
          <span className="font-medium tabular-nums text-status-blue">
            {formatSAR(row.commission)}
          </span>
        ),
      },
      {
        key: 'paymentMethod',
        header: t.bookings.payment,
        width: '11%',
        cell: (row) => <span className="text-slate-600">{row.paymentMethod}</span>,
      },
      {
        key: 'paymentStatus',
        header: t.bookings.paymentStatus,
        width: '10%',
        cell: (row) => <StatusBadge status={row.paymentStatus} />,
      },
      {
        key: 'status',
        header: t.bookings.status,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'open',
        header: '',
        align: 'end',
        cell: () => <ChevronRight className="h-4 w-4 text-slate-300 rtl:rotate-180" aria-hidden />,
      },
    ],
    [t],
  );

  function exportCsv() {
    if (!result) return;

    const csv = toCsv(result.items, [
      { header: 'Booking', value: (row) => row.code },
      { header: 'Guest', value: (row) => row.guestName },
      { header: 'Property', value: (row) => row.unitName },
      { header: 'City', value: (row) => row.unitCity },
      { header: 'Partner', value: (row) => row.partnerName },
      { header: 'Check-in', value: (row) => formatDate(row.checkIn) },
      { header: 'Check-out', value: (row) => formatDate(row.checkOut) },
      { header: 'Nights', value: (row) => row.nights },
      { header: 'Total (SAR)', value: (row) => row.total },
      { header: 'Commission (SAR)', value: (row) => row.commission },
      { header: 'Partner share (SAR)', value: (row) => row.partnerShare },
      { header: 'Payment', value: (row) => row.paymentMethod },
      { header: 'Payment status', value: (row) => row.paymentStatus },
      { header: 'Status', value: (row) => row.status },
    ]);

    downloadCsv(`mamsa-bookings-page-${page}.csv`, csv);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.bookings.title}
        subtitle={t.bookings.subtitle(
          result?.total ?? 0,
          stats ? formatSAR(stats.totalRevenue, { compact: true }) : '—',
        )}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!result?.items.length}>
              <Download className="h-4 w-4" />
              {t.common.exportCsv}
            </Button>
            <Button variant="secondary" onClick={() => window.print()} disabled={!result}>
              <FileText className="h-4 w-4" />
              {t.common.exportPdf}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t.bookings.totalRevenue}
          value={stats ? formatSAR(stats.totalRevenue, { compact: true }) : '—'}
          icon={DollarSign}
        />
        <KpiCard
          label={t.bookings.platformCommission}
          value={stats ? formatSAR(stats.commission, { compact: true }) : '—'}
          icon={TrendingUp}
          iconTone="blue"
        />
        <KpiCard
          label={t.bookings.avgBookingValue}
          value={stats ? formatSAR(stats.avgBookingValue, { compact: true }) : '—'}
          icon={CreditCard}
          iconTone="amber"
        />
      </div>

      <DataTable
        columns={columns}
        rows={result?.items ?? []}
        rowKey={(row) => row.id}
        loading={!result && !error}
        error={error}
        onRetry={reload}
        onRowClick={(row) => setInspecting(row.id)}
        emptyTitle={t.bookings.empty}
        sortBy={sort?.by}
        sortDir={sort?.dir}
        onSort={(key) =>
          setSort((current) =>
            current?.by === key
              ? { by: key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
              : { by: key, dir: 'desc' },
          )
        }
        header={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterTabs
              items={tabs}
              value={status}
              onChange={(next) => setStatus(next as BookingStatus | 'all')}
            />
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t.bookings.searchPlaceholder}
              className="w-full max-w-xs"
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

      <BookingDetailDrawer
        bookingId={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <RequirePermission permission="bookings.view">
      <Suspense fallback={null}>
        <BookingsPageContent />
      </Suspense>
    </RequirePermission>
  );
}
