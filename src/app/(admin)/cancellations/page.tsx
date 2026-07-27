'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, DollarSign, RotateCcw, TrendingDown } from 'lucide-react';
import {
  Avatar,
  type Column,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  type FilterTabItem,
  FilterTabs,
  KpiCard,
  LtrText,
  PageHeader,
  Pagination,
  RichText,
  SearchInput,
  StatusBadge,
} from '@/components/common';
import { CancellationTrendChart, REFUND_COLOR } from '@/components/charts';
import { CancellationDetailDrawer } from '@/components/cancellations/CancellationDetailDrawer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { cancellationsApi } from '@/lib/api';
import { CANCELLED_BY, REFUND_STATUS, type CancelledBy, type RefundStatus } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatDate, formatPercent, formatSAR } from '@/lib/utils/format';
import type { Cancellation, CancellationStats, HighRiskPartner, Paginated } from '@/types';

const PAGE_SIZE = 10;

export default function CancellationsPage() {
  const t = useT();

  const [cancelledBy, setCancelledBy] = useState<CancelledBy | 'all'>('all');
  const [refundStatus, setRefundStatus] = useState<RefundStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<Cancellation> | null>(null);
  const [stats, setStats] = useState<CancellationStats | null>(null);
  const [highRisk, setHighRisk] = useState<HighRiskPartner[] | null>(null);
  const [error, setError] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [retrying, setRetrying] = useState<Cancellation | null>(null);
  const [inspecting, setInspecting] = useState<Cancellation | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    cancellationsApi
      .list({ cancelledBy, refundStatus, search, page, pageSize: PAGE_SIZE })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [cancelledBy, refundStatus, search, page, reloadToken]);

  useEffect(() => {
    let stale = false;
    setStatsError(false);
    void Promise.all([cancellationsApi.stats(), cancellationsApi.highRisk()])
      .then(([statsResponse, riskResponse]) => {
        if (stale) return;
        setStats(statsResponse);
        setHighRisk(riskResponse);
      })
      .catch(() => !stale && setStatsError(true));
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [cancelledBy, refundStatus, search]);

  const tabs: FilterTabItem[] = [
    { value: 'all', label: t.cancellations.all, count: stats?.total },
    { value: CANCELLED_BY.GUEST, label: t.cancellations.guest, count: stats?.byGuest },
    { value: CANCELLED_BY.HOST, label: t.cancellations.host, count: stats?.byHost },
  ];

  const columns: Array<Column<Cancellation>> = useMemo(
    () => [
      {
        key: 'id',
        header: t.cancellations.id,
        width: '9%',
        cell: (row) => <LtrText className="font-semibold text-slate-900">{row.id}</LtrText>,
      },
      {
        key: 'bookingCode',
        header: t.cancellations.booking,
        width: '11%',
        cell: (row) => <LtrText className="text-slate-500">{row.bookingCode}</LtrText>,
      },
      {
        key: 'guestName',
        header: t.cancellations.guestColumn,
        width: '17%',
        cell: (row) => (
          <span className="flex items-center gap-2.5">
            <Avatar name={row.guestName} size="sm" />
            <span className="truncate font-medium text-slate-800">{row.guestName}</span>
          </span>
        ),
      },
      {
        key: 'cancelledBy',
        header: t.cancellations.cancelledBy,
        width: '11%',
        cell: (row) => <StatusBadge status={row.cancelledBy} dot={false} />,
      },
      {
        key: 'unitName',
        header: t.cancellations.property,
        width: '16%',
        cell: (row) => <span className="truncate text-slate-600">{row.unitName}</span>,
      },
      {
        key: 'at',
        header: t.cancellations.date,
        width: '10%',
        cell: (row) => <LtrText className="text-slate-500">{formatDate(row.at)}</LtrText>,
      },
      {
        key: 'refundAmount',
        header: t.cancellations.refund,
        width: '10%',
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-900">
            {formatSAR(row.refundAmount)}
          </span>
        ),
      },
      {
        key: 'impact',
        header: t.cancellations.impact,
        width: '10%',
        cell: (row) =>
          row.impact === 0 ? (
            <span className="text-slate-300">—</span>
          ) : (
            <LtrText className="font-semibold text-status-red">
              −{formatSAR(Math.abs(row.impact))}
            </LtrText>
          ),
      },
      {
        key: 'refundStatus',
        header: t.cancellations.refundStatusColumn,
        align: 'end',
        cell: (row) => (
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={row.refundStatus} />
            {/* A failed refund is the one state that still owes the guest money. */}
            {row.refundStatus === REFUND_STATUS.FAILED && (
              <button
                type="button"
                title={t.cancellations.retryRefund}
                aria-label={t.cancellations.retryRefund}
                onClick={(event) => {
                  event.stopPropagation();
                  setRetrying(row);
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-surface-muted hover:text-brand"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </span>
        ),
      },
    ],
    [t],
  );

  function exportCsv() {
    if (!result) return;

    const csv = toCsv(result.items, [
      { header: 'ID', value: (row) => row.id },
      { header: 'Booking', value: (row) => row.bookingCode },
      { header: 'Guest', value: (row) => row.guestName },
      { header: 'Cancelled by', value: (row) => row.cancelledBy },
      { header: 'Property', value: (row) => row.unitName },
      { header: 'Partner', value: (row) => row.partnerName },
      { header: 'Date', value: (row) => formatDate(row.at) },
      { header: 'Reason', value: (row) => row.reason },
      { header: 'Booking total (SAR)', value: (row) => row.bookingTotal },
      { header: 'Refund (SAR)', value: (row) => row.refundAmount },
      { header: 'Impact (SAR)', value: (row) => row.impact },
      { header: 'Refund status', value: (row) => row.refundStatus },
    ]);

    downloadCsv(`mamsa-cancellations-page-${page}.csv`, csv);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.cancellations.title}
        subtitle={t.cancellations.subtitle}
        actions={
          <Button variant="secondary" onClick={exportCsv} disabled={!result?.items.length}>
            {t.cancellations.exportReport}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t.cancellations.totalRefunds}
          value={stats ? formatSAR(stats.totalRefunds, { compact: true }) : '—'}
          icon={DollarSign}
          iconTone="blue"
        />
        <KpiCard
          label={t.cancellations.financialImpact}
          value={stats ? formatSAR(stats.financialImpact, { compact: true }) : '—'}
          icon={TrendingDown}
          iconTone="red"
        />
        <KpiCard
          label={t.cancellations.hostCancellations}
          value={stats ? String(stats.hostCancellations) : '—'}
          icon={AlertTriangle}
          iconTone="amber"
        />
      </div>

      {statsError ? (
        <Card>
          <ErrorState onRetry={reload} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            {stats ? (
              <CancellationTrendChart data={stats.trend} className="xl:col-span-2" />
            ) : (
              <Card className="xl:col-span-2" aria-busy>
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-[260px] w-full" />
                </div>
              </Card>
            )}

            <RefundBreakdown stats={stats} />
          </div>

          <HighRiskCard partners={highRisk} />
        </>
      )}

      {/* Failed is the one refund state that still owes the guest money — it gets a
          loud callout, not just a table badge. */}
      {stats && stats.refundBreakdown[REFUND_STATUS.FAILED] > 0 && (
        <Card className="flex flex-wrap items-center gap-4 border-status-red/25 bg-status-redSoft/40 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-status-red" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-status-red">
              {t.cancellations.failedAlert(stats.refundBreakdown[REFUND_STATUS.FAILED])}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">{t.cancellations.failedAlertBody}</p>
          </div>
          <Button variant="secondary" onClick={() => setRefundStatus(REFUND_STATUS.FAILED)}>
            {t.cancellations.showFailed}
          </Button>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={result?.items ?? []}
        rowKey={(row) => row.id}
        loading={!result && !error}
        error={error}
        onRetry={reload}
        onRowClick={(row) => setInspecting(row)}
        emptyTitle={t.cancellations.empty}
        header={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterTabs
              items={tabs}
              value={cancelledBy}
              onChange={(next) => setCancelledBy(next as CancelledBy | 'all')}
            />

            <div className="flex flex-1 items-center justify-end gap-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t.cancellations.searchPlaceholder}
                className="w-full max-w-xs"
              />
              <select
                value={refundStatus}
                onChange={(event) => setRefundStatus(event.target.value as RefundStatus | 'all')}
                aria-label={t.cancellations.allRefundStatuses}
                className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                <option value="all">{t.cancellations.allRefundStatuses}</option>
                {Object.values(REFUND_STATUS).map((value) => (
                  <option key={value} value={value}>
                    {t.status[value]}
                  </option>
                ))}
              </select>
            </div>
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

      <CancellationDetailDrawer
        cancellation={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
      />

      <ConfirmDialog
        open={Boolean(retrying)}
        onOpenChange={(open) => !open && setRetrying(null)}
        title={t.cancellations.retryTitle}
        icon={RotateCcw}
        description={
          <RichText
            template={t.cancellations.retryQuestion}
            values={{
              amount: retrying ? formatSAR(retrying.refundAmount) : '',
              code: retrying?.bookingCode ?? '',
            }}
          />
        }
        confirmLabel={t.cancellations.retryRefund}
        onConfirm={async () => {
          if (!retrying) return;
          await cancellationsApi.retryRefund(retrying.id);
          setRetrying(null);
          reload();
        }}
      />
    </div>
  );
}

function RefundBreakdown({ stats }: { stats: CancellationStats | null }) {
  const t = useT();

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900">{t.cancellations.refundStatusTitle}</h3>

      <ul className="mt-5 space-y-4">
        {Object.values(REFUND_STATUS).map((status) => {
          const count = stats?.refundBreakdown[status] ?? 0;
          const share = stats?.total ? (count / stats.total) * 100 : 0;

          return (
            <li key={status}>
              <p className="flex items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: REFUND_COLOR[status] }}
                  aria-hidden
                />
                <span className="flex-1 text-slate-600">{t.status[status]}</span>
                <span className="font-semibold tabular-nums text-slate-900">{count}</span>
              </p>

              <span
                className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-muted"
                aria-hidden
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${share}%`, backgroundColor: REFUND_COLOR[status] }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function HighRiskCard({ partners }: { partners: HighRiskPartner[] | null }) {
  const t = useT();

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t.cancellations.highRiskTitle}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{t.cancellations.highRiskSubtitle}</p>
        </div>
        {partners && partners.length > 0 && (
          <span className="rounded-full bg-status-redSoft px-2.5 py-1 text-xs font-semibold text-status-red">
            {t.cancellations.atRisk(partners.length)}
          </span>
        )}
      </div>

      {!partners ? (
        <div className="mt-4 space-y-3" aria-busy>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[68px] w-full rounded-2xl" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <EmptyState title={t.cancellations.noRisk} />
      ) : (
        <ul className="mt-4 space-y-3">
          {partners.map((partner) => (
            <li
              key={partner.partnerId}
              className={cn(
                'flex flex-wrap items-center gap-3 rounded-2xl border border-status-red/15',
                'bg-status-redSoft/40 px-4 py-3',
              )}
            >
              <Avatar name={partner.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{partner.name}</p>
                <p className="truncate text-sm text-slate-500">
                  {t.cities[partner.city as keyof typeof t.cities] ?? partner.city} ·{' '}
                  {t.status[partner.type]}
                </p>
              </div>

              <div className="flex items-center gap-3 text-end">
                <div>
                  <p className="font-semibold text-status-red">
                    {t.cancellations.cancellationsCount(partner.cancellations)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t.cancellations.rate(formatPercent(partner.rate))}
                  </p>
                </div>
                <AlertTriangle className="h-5 w-5 shrink-0 text-status-amber" aria-hidden />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
