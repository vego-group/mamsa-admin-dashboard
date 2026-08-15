'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, CalendarDays, Check, CircleCheck, Copy, Download, TrendingDown } from 'lucide-react';
import {
  Avatar,
  type Column,
  DataTable,
  EmptyState,
  KpiCard,
  LtrText,
  PageHeader,
  Pagination,
  Segmented,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { ManualPayoutDialog } from '@/components/payouts/ManualPayoutDialog';
import { PayoutDetailDrawer } from '@/components/payouts/PayoutDetailDrawer';
import { RecordTransferDialog } from '@/components/payouts/RecordTransferDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { ApiError, payoutsApi } from '@/lib/api';
import { PAYOUT_MIN_BALANCE } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatDate, formatSAR } from '@/lib/utils/format';
import type {
  EligiblePartner,
  ID,
  IneligiblePartner,
  Paginated,
  Payout,
  PayoutStats,
} from '@/types';

const PAGE_SIZE = 10;
const TABS = ['eligible', 'paid', 'ineligible'] as const;
type Tab = (typeof TABS)[number];

export default function PayoutsPage() {
  return (
    <RequirePermission permission="payouts.view">
      <PayoutsPageContent />
    </RequirePermission>
  );
}

/**
 * The finance role's landing page. Everything needed to run a payout cycle lives here —
 * who is due, what was paid, and why someone is missing from the first list.
 */
function PayoutsPageContent() {
  const t = useT();
  const { can } = useCan();

  const [tab, setTab] = useState<Tab>('eligible');
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [eligible, setEligible] = useState<EligiblePartner[] | null>(null);
  const [ineligible, setIneligible] = useState<IneligiblePartner[] | null>(null);
  const [paid, setPaid] = useState<Paginated<Payout> | null>(null);
  const [page, setPage] = useState(1);
  const [periodMonth, setPeriodMonth] = useState<string>('');
  const [error, setError] = useState(false);
  const [recording, setRecording] = useState<EligiblePartner | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [inspecting, setInspecting] = useState<ID | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);

    void Promise.all([payoutsApi.stats(), payoutsApi.listEligible(), payoutsApi.listIneligible()])
      .then(([statsResponse, eligibleResponse, ineligibleResponse]) => {
        if (stale) return;
        setStats(statsResponse);
        setEligible(eligibleResponse);
        setIneligible(ineligibleResponse);
        // The month picker defaults to the cycle currently being worked.
        setPeriodMonth((current) => current || statsResponse.currentPeriodMonth);
      })
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (!periodMonth) return;

    let stale = false;
    setPaid(null);
    payoutsApi
      .list({ page, pageSize: PAGE_SIZE, periodMonth })
      .then((response) => !stale && setPaid(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [periodMonth, page, reloadToken]);

  useEffect(() => setPage(1), [periodMonth]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);

  const periodOptions = useMemo(() => {
    const months = new Set<string>();
    if (stats) months.add(stats.currentPeriodMonth);
    if (periodMonth) months.add(periodMonth);
    for (const payout of paid?.items ?? []) months.add(payout.periodMonth);
    // Six months back is as far as an accountant realistically reconciles.
    if (stats) {
      const [year, month] = stats.currentPeriodMonth.split('-').map(Number);
      for (let back = 1; back <= 6; back += 1) {
        const date = new Date(Date.UTC(year, month - 1 - back, 1));
        months.add(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`);
      }
    }
    return Array.from(months).sort().reverse();
  }, [stats, periodMonth, paid]);

  function exportCsv() {
    if (!paid) return;
    const csv = toCsv(paid.items, [
      { header: 'Reference', value: (row) => row.reference },
      { header: 'Partner', value: (row) => row.partnerName },
      { header: 'Period', value: (row) => row.periodMonth },
      { header: 'Amount (SAR)', value: (row) => row.amount },
      { header: 'Bookings', value: (row) => row.bookingsCount },
      { header: 'IBAN', value: (row) => row.iban },
      { header: 'Bank reference', value: (row) => row.bankReference },
      { header: 'Paid at', value: (row) => formatDate(row.paidAt) },
      { header: 'Recorded by', value: (row) => row.recordedByAdminName },
      { header: 'Status', value: (row) => row.status },
    ]);
    downloadCsv(`mamsa-payouts-${periodMonth}.csv`, csv);
  }

  const eligibleColumns: Array<Column<EligiblePartner>> = useMemo(
    () => [
      {
        key: 'partnerName',
        header: t.payouts.partner,
        width: '20%',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.partnerName} size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-slate-900">{row.partnerName}</span>
              <span className="block text-xs text-slate-400">{t.status[row.partnerType]}</span>
            </span>
          </div>
        ),
      },
      {
        key: 'amount',
        header: t.payouts.amount,
        width: '12%',
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-900">{formatSAR(row.amount)}</span>
        ),
      },
      {
        key: 'bookingsCount',
        header: t.payouts.bookingsCount,
        width: '9%',
        cell: (row) => <span className="tabular-nums text-slate-600">{row.bookingsCount}</span>,
      },
      {
        key: 'iban',
        header: t.payouts.iban,
        width: '25%',
        // Full, never truncated: this is about to be pasted into a banking portal.
        cell: (row) => <LtrText className="text-xs text-slate-700">{row.iban}</LtrText>,
      },
      {
        key: 'accountHolderName',
        header: t.payouts.accountHolder,
        width: '16%',
        cell: (row) => <span className="truncate text-slate-600">{row.accountHolderName}</span>,
      },
      {
        key: 'lastPaidAt',
        header: t.payouts.lastPaid,
        width: '10%',
        cell: (row) =>
          row.lastPaidAt ? (
            <LtrText className="text-slate-500">{formatDate(row.lastPaidAt)}</LtrText>
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        key: 'actions',
        header: t.payouts.action,
        align: 'end',
        cell: (row) => (
          <span className="inline-flex items-center gap-1.5">
            <CopyTransferButton partner={row} />
            {can('payouts.execute') && (
              <Button size="sm" onClick={() => setRecording(row)}>
                {t.payouts.record}
              </Button>
            )}
          </span>
        ),
      },
    ],
    [t, can],
  );

  const paidColumns: Array<Column<Payout>> = useMemo(
    () => [
      {
        key: 'reference',
        header: t.payouts.reference,
        width: '17%',
        cell: (row) => (
          <LtrText className="font-semibold text-slate-900">{row.reference}</LtrText>
        ),
      },
      {
        key: 'partnerName',
        header: t.payouts.partner,
        width: '20%',
        cell: (row) => <span className="truncate text-slate-700">{row.partnerName}</span>,
      },
      {
        key: 'amount',
        header: t.payouts.amount,
        width: '13%',
        cell: (row) => (
          <span
            className={cn(
              'font-semibold tabular-nums',
              row.status === 'reversed' ? 'text-slate-400 line-through' : 'text-slate-900',
            )}
          >
            {formatSAR(row.amount)}
          </span>
        ),
      },
      {
        key: 'bankReference',
        header: t.payouts.bankReference,
        width: '15%',
        cell: (row) => <LtrText className="text-xs text-slate-500">{row.bankReference}</LtrText>,
      },
      {
        key: 'paidAt',
        header: t.payouts.paidAt,
        width: '12%',
        cell: (row) => <LtrText className="text-slate-500">{formatDate(row.paidAt)}</LtrText>,
      },
      {
        key: 'recordedByAdminName',
        header: t.payouts.recordedBy,
        width: '13%',
        cell: (row) => <span className="truncate text-slate-600">{row.recordedByAdminName}</span>,
      },
      {
        key: 'status',
        header: t.common.confirm,
        align: 'end',
        cell: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [t],
  );

  const ineligibleColumns: Array<Column<IneligiblePartner>> = useMemo(
    () => [
      {
        key: 'partnerName',
        header: t.payouts.partner,
        width: '28%',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.partnerName} size="sm" />
            <span className="truncate font-medium text-slate-900">{row.partnerName}</span>
          </div>
        ),
      },
      {
        key: 'availableBalance',
        header: t.wallets.availableBalance,
        width: '16%',
        cell: (row) => (
          <span
            className={cn(
              'font-semibold tabular-nums',
              row.availableBalance < 0 ? 'text-status-red' : 'text-slate-900',
            )}
          >
            {row.availableBalance < 0
              ? `−${formatSAR(Math.abs(row.availableBalance))}`
              : formatSAR(row.availableBalance)}
          </span>
        ),
      },
      {
        key: 'reason',
        header: t.common.reason,
        width: '26%',
        cell: (row) => (
          <span className="inline-flex items-center rounded-lg bg-status-amberSoft px-2.5 py-1 text-xs font-semibold text-status-amber">
            {t.wallets.ineligible[row.reason]}
          </span>
        ),
      },
      {
        key: 'shortfall',
        header: t.payouts.remainingToMinimum,
        align: 'end',
        // Answers "how close are they?" without making the operator do the subtraction.
        cell: (row) =>
          row.shortfall === null ? (
            <span className="text-slate-300">—</span>
          ) : (
            <span className="inline-flex flex-col items-end gap-1">
              <span className="font-medium tabular-nums text-slate-700">
                {formatSAR(row.shortfall)}
              </span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                <span
                  className="block h-full rounded-full bg-brand-rail"
                  style={{
                    width: `${Math.min(100, Math.max(0, (row.availableBalance / PAYOUT_MIN_BALANCE) * 100))}%`,
                  }}
                />
              </span>
            </span>
          ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.payouts.title}
        subtitle={t.payouts.subtitle}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!paid?.items.length}>
              <Download className="h-4 w-4" />
              {t.payouts.exportCsv}
            </Button>
            {can('payouts.manage') && (
              <Button onClick={() => setManualOpen(true)}>
                <Banknote className="h-4 w-4" />
                {t.payouts.manual}
              </Button>
            )}
          </>
        }
      />

      {notice && (
        <p role="status" className="rounded-xl bg-status-amberSoft px-3.5 py-3 text-sm text-status-amber">
          {notice}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.payouts.eligible}
          value={stats ? String(stats.eligibleCount) : '—'}
          hint={stats ? formatSAR(stats.eligibleAmount, { compact: true }) : undefined}
          icon={CircleCheck}
          iconTone="green"
        />
        <KpiCard
          label={t.payouts.paidThisMonth}
          value={stats ? String(stats.paidThisMonthCount) : '—'}
          hint={stats ? formatSAR(stats.paidThisMonthAmount, { compact: true }) : undefined}
          icon={Banknote}
          iconTone="blue"
        />
        <KpiCard
          label={t.payouts.ineligible}
          value={stats ? String(stats.ineligibleCount) : '—'}
          icon={TrendingDown}
          iconTone="amber"
        />
        <KpiCard
          label={t.payouts.currentPeriod}
          value={stats?.currentPeriodMonth ?? '—'}
          hint={t.payouts.oncePerMonth}
          icon={CalendarDays}
          iconTone="brand"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          items={TABS.map((value) => ({ value, label: t.payouts.tabs[value] }))}
          value={tab}
          onChange={(value) => setTab(value as Tab)}
        />

        {tab === 'paid' && (
          <select
            value={periodMonth}
            onChange={(event) => setPeriodMonth(event.target.value)}
            aria-label={t.payouts.period}
            dir="ltr"
            className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm tabular-nums text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            {periodOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}
      </div>

      {tab === 'eligible' &&
        (eligible && eligible.length === 0 ? (
          <Card>
            <EmptyState
              title={t.payouts.noEligible}
              description={t.payouts.minBalanceNote(formatSAR(PAYOUT_MIN_BALANCE))}
              action={
                <Button variant="secondary" onClick={() => setTab('ineligible')}>
                  {t.payouts.noEligibleAction}
                </Button>
              }
            />
          </Card>
        ) : (
          <DataTable
            columns={eligibleColumns}
            rows={eligible ?? []}
            rowKey={(row) => row.partnerId}
            loading={!eligible && !error}
            error={error}
            onRetry={reload}
            emptyTitle={t.payouts.noEligible}
          />
        ))}

      {tab === 'paid' && (
        <DataTable
          columns={paidColumns}
          rows={paid?.items ?? []}
          rowKey={(row) => row.id}
          loading={!paid && !error}
          error={error}
          onRetry={reload}
          onRowClick={(row) => setInspecting(row.id)}
          emptyTitle={t.payouts.noPaid}
          footer={
            paid &&
            paid.total > paid.pageSize && (
              <Pagination
                page={paid.page}
                pageSize={paid.pageSize}
                total={paid.total}
                onPageChange={setPage}
              />
            )
          }
        />
      )}

      {tab === 'ineligible' && (
        <DataTable
          columns={ineligibleColumns}
          rows={ineligible ?? []}
          rowKey={(row) => row.partnerId}
          loading={!ineligible && !error}
          error={error}
          onRetry={reload}
          emptyTitle={t.payouts.noIneligible}
        />
      )}

      <RecordTransferDialog
        partner={recording}
        open={Boolean(recording)}
        onOpenChange={(open) => !open && setRecording(null)}
        onRecorded={(reference) => {
          setNotice(`${t.payouts.record} · ${reference}`);
          reload();
        }}
        onStale={(message) => {
          setNotice(message);
          reload();
        }}
      />

      <ManualPayoutDialog open={manualOpen} onOpenChange={setManualOpen} onCreated={reload} />

      <PayoutDetailDrawer
        payoutId={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
        onChanged={reload}
      />
    </div>
  );
}

/** One click, one paste — fewer transposition errors than re-typing an IBAN. */
function CopyTransferButton({ partner }: { partner: EligiblePartner }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      title={copied ? t.payouts.copied : t.payouts.copyTransferData}
      aria-label={copied ? t.payouts.copied : t.payouts.copyTransferData}
      onClick={(event) => {
        event.stopPropagation();
        void navigator.clipboard?.writeText(
          [partner.accountHolderName, partner.iban, formatSAR(partner.amount)].join('\n'),
        );
        setCopied(true);
      }}
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-surface-muted hover:text-brand"
    >
      {copied ? <Check className="h-4 w-4 text-status-green" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
