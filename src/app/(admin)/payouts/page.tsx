'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Banknote, Check, CircleCheck, Copy, Download, ExternalLink, TrendingDown } from 'lucide-react';
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
import { RecordTransferDialog } from '@/components/payouts/RecordTransferDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { payoutsApi } from '@/lib/api';
import { PAYOUT_MIN_BALANCE } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatDate, formatSAR } from '@/lib/utils/format';
import type { EligiblePartner, IneligiblePartner, Payout, PayoutPage } from '@/types';

const TABS = ['eligible', 'paid', 'ineligible'] as const;
const PAGE_SIZE = 10;
type Tab = (typeof TABS)[number];

/**
 * `YYYY-MM` in Riyadh. Computed rather than taken from an endpoint: the payout stats
 * route that used to supply it does not exist, and the month is a calendar fact.
 */
const currentPeriodMonth = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Riyadh',
  year: 'numeric',
  month: '2-digit',
})
  .format(new Date())
  .slice(0, 7);

export default function PayoutsPage() {
  return (
    <RequirePermission permission="payouts.view">
      <PayoutsPageContent />
    </RequirePermission>
  );
}

/**
 * The monthly payout run — a **reconciliation worksheet, not a checkout flow**.
 *
 * The accountant executes transfers in their own banking channel and comes here to record
 * what they already did. Nothing on this screen moves money, which is why there is no
 * amount input, no pending state and no reverse button.
 *
 * Exactly three endpoints exist: `eligible`, `ineligible` and `record`. A payout list, a
 * stats endpoint and a payout detail were all built against Phase-3 stubs and answer 404
 * on both environments — asking for them is what left this whole page on an error state,
 * because a single rejected call in the batch took the two real lists down with it.
 *
 * The counters are therefore derived from the two lists this page already holds. They
 * cannot disagree with the rows underneath them, which a separate endpoint could.
 */
function PayoutsPageContent() {
  const t = useT();
  const { can } = useCan();

  const [tab, setTab] = useState<Tab>('eligible');
  const [eligible, setEligible] = useState<EligiblePartner[] | null>(null);
  const [ineligible, setIneligible] = useState<IneligiblePartner[] | null>(null);
  const [paid, setPaid] = useState<PayoutPage | null>(null);
  const [periodMonth, setPeriodMonth] = useState(currentPeriodMonth);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [recording, setRecording] = useState<EligiblePartner | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);

    void Promise.all([payoutsApi.listEligible(), payoutsApi.listIneligible()])
      .then(([eligibleResponse, ineligibleResponse]) => {
        if (stale) return;
        setEligible(eligibleResponse);
        setIneligible(ineligibleResponse);
      })
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [reloadToken]);

  // Only fetched when the tab is opened: closing a month is an occasional act, and the
  // run itself is what this page is for.
  useEffect(() => {
    if (tab !== 'paid') return;

    let stale = false;
    setPaid(null);
    payoutsApi
      .list({ periodMonth, page, pageSize: PAGE_SIZE })
      .then((response) => !stale && setPaid(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [tab, periodMonth, page, reloadToken]);

  useEffect(() => setPage(1), [periodMonth]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);

  const totals = useMemo(() => {
    const rows = eligible ?? [];
    // `already_paid_this_month` is the cycle's success state, so it is counted as one.
    const paid = (ineligible ?? []).filter((row) => row.reason === 'already_paid_this_month');

    return {
      eligibleCount: rows.length,
      eligibleAmount: rows.reduce((sum, row) => sum + row.amount, 0),
      paidCount: paid.length,
      blockedCount: (ineligible ?? []).length - paid.length,
    };
  }, [eligible, ineligible]);

  function exportCsv() {
    if (!eligible?.length) return;
    const csv = toCsv(eligible, [
      { header: 'Partner', value: (row) => row.partnerName },
      { header: 'Type', value: (row) => row.partnerType },
      { header: 'Amount (SAR)', value: (row) => row.amount },
      { header: 'Bookings', value: (row) => row.bookingsCount },
      { header: 'IBAN', value: (row) => row.iban },
      { header: 'Account holder', value: (row) => row.accountHolderName },
      { header: 'Bank', value: (row) => row.bankName ?? '' },
      { header: 'Last paid', value: (row) => (row.lastPaidAt ? formatDate(row.lastPaidAt) : '') },
      { header: 'Last period', value: (row) => row.lastPaidPeriod ?? '' },
    ]);
    downloadCsv('mamsa-payout-run.csv', csv);
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
        width: '14%',
        // Server-computed and authoritative — this is exactly what will be paid.
        cell: (row) => (
          <span className="block">
            <span className="block font-semibold tabular-nums text-slate-900">
              {formatSAR(row.amount)}
            </span>
            <span className="block text-xs text-slate-400">
              {t.payouts.bookingsWithCount(row.bookingsCount)}
            </span>
          </span>
        ),
      },
      {
        key: 'iban',
        header: t.payouts.iban,
        width: '28%',
        // Full, never truncated: this is about to be pasted into a banking portal, and a
        // transcription error here sends real money to the wrong account.
        cell: (row) => (
          <span className="block">
            <LtrText className="block text-xs text-slate-700">{row.iban}</LtrText>
            <span className="block truncate text-xs text-slate-400">
              {row.accountHolderName}
              {row.bankName ? ` · ${row.bankName}` : ''}
            </span>
          </span>
        ),
      },
      {
        key: 'lastPaidAt',
        header: t.payouts.lastPaid,
        width: '13%',
        cell: (row) =>
          row.lastPaidAt ? (
            <span className="block">
              <LtrText className="block text-slate-500">{formatDate(row.lastPaidAt)}</LtrText>
              {row.lastPaidPeriod && (
                <LtrText className="block text-xs text-slate-400">{row.lastPaidPeriod}</LtrText>
              )}
            </span>
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
        width: '18%',
        cell: (row) => (
          <span className="block">
            <LtrText className="block font-semibold text-slate-900">{row.reference}</LtrText>
            {/* The month EARNED, not the month paid — unlabelled it reads as a bug. */}
            <LtrText className="block text-xs text-slate-400">
              {t.payouts.forPeriod(row.periodMonth)}
            </LtrText>
          </span>
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
        width: '15%',
        // Struck through when reversed: the money came back, and `totalAmount` below
        // already excludes it, so the row must not read as part of the month's total.
        cell: (row) => (
          <span className="block">
            <span
              className={cn(
                'block font-semibold tabular-nums',
                row.status === 'reversed' ? 'text-slate-400 line-through' : 'text-slate-900',
              )}
            >
              {formatSAR(row.amount)}
            </span>
            <span className="block text-xs text-slate-400">
              {t.payouts.bookingsWithCount(row.bookingsCount)}
            </span>
          </span>
        ),
      },
      {
        key: 'bankReference',
        header: t.payouts.bankReference,
        width: '20%',
        cell: (row) => (
          <span className="block">
            <LtrText className="block text-xs text-slate-600">{row.bankReference}</LtrText>
            <LtrText className="block text-xs text-slate-400">
              {row.ibanMasked}
              {row.bankName ? ` · ${row.bankName}` : ''}
            </LtrText>
          </span>
        ),
      },
      {
        key: 'paidAt',
        header: t.payouts.paidAt,
        width: '12%',
        cell: (row) => <LtrText className="text-slate-500">{formatDate(row.paidAt)}</LtrText>,
      },
      {
        key: 'status',
        header: t.payouts.statusHeader,
        align: 'end',
        cell: (row) => (
          <span className="inline-flex flex-col items-end gap-1">
            <StatusBadge status={row.status} />
            {/* Written by an operator command, never by this app — but it still arrives. */}
            {row.status === 'reversed' && row.reversalReason && (
              <span className="max-w-48 text-xs text-slate-400">{row.reversalReason}</span>
            )}
          </span>
        ),
      },
    ],
    [t],
  );

  const ineligibleColumns: Array<Column<IneligiblePartner>> = useMemo(
    () => [
      {
        key: 'partnerName',
        header: t.payouts.partner,
        width: '26%',
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
        width: '15%',
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
        width: '30%',
        cell: (row) => <IneligibleReason row={row} />,
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
          <Button variant="secondary" onClick={exportCsv} disabled={!eligible?.length}>
            <Download className="h-4 w-4" />
            {t.payouts.exportCsv}
          </Button>
        }
      />

      {notice && (
        <p role="status" className="rounded-xl bg-status-amberSoft px-3.5 py-3 text-sm text-status-amber">
          {notice}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label={t.payouts.eligible}
          value={eligible ? String(totals.eligibleCount) : '—'}
          hint={eligible ? formatSAR(totals.eligibleAmount, { compact: true }) : undefined}
          icon={CircleCheck}
          iconTone="green"
        />
        <KpiCard
          label={t.payouts.paidThisMonth}
          value={ineligible ? String(totals.paidCount) : '—'}
          hint={t.payouts.oncePerMonth}
          icon={Banknote}
          iconTone="blue"
        />
        <KpiCard
          label={t.payouts.blocked}
          value={ineligible ? String(totals.blockedCount) : '—'}
          icon={TrendingDown}
          iconTone="amber"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          items={TABS.map((value) => ({ value, label: t.payouts.tabs[value] }))}
          value={tab}
          onChange={(value) => setTab(value as Tab)}
        />

        {tab === 'paid' && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            {t.payouts.period}
            {/* A month input, not a free-text field: a malformed `periodMonth` is a 422,
                deliberately, so that "2026-7" cannot render as "we paid nobody in July". */}
            <input
              type="month"
              dir="ltr"
              value={periodMonth}
              max={currentPeriodMonth}
              onChange={(event) => setPeriodMonth(event.target.value || currentPeriodMonth)}
              className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm tabular-nums text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            />
          </label>
        )}
      </div>

      {tab === 'eligible' &&
        (eligible && eligible.length === 0 ? (
          // Outside a run window this is the NORMAL state, not a failure.
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
          emptyTitle={t.payouts.noPaid}
          footer={
            paid && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Covers the WHOLE month, not this page, and excludes reversed rows —
                    which is the number an accountant closes the month against. */}
                <p className="text-sm text-slate-600">
                  {t.payouts.monthTotal}{' '}
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatSAR(paid.totalAmount)}
                  </span>
                  <span className="text-slate-400">
                    {' · '}
                    {t.payouts.bookingsWithCount(paid.totalBookingsCount)}
                  </span>
                </p>
                {paid.total > paid.pageSize && (
                  <Pagination
                    page={paid.page}
                    pageSize={paid.pageSize}
                    total={paid.total}
                    onPageChange={setPage}
                  />
                )}
              </div>
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
          // The reference is what the accountant quotes in a support ticket and what the
          // partner sees, so it is shown back rather than swallowed by a refresh.
          setNotice(`${t.payouts.recorded} · ${reference}`);
          reload();
        }}
        onStale={(message) => {
          setNotice(message);
          reload();
        }}
      />
    </div>
  );
}

/**
 * `already_paid_this_month` is a **positive** outcome — the cycle is done for that
 * partner. Colouring it amber next to `bank_missing` reads as six problems where there
 * are five, so it gets the success treatment and its payout reference.
 *
 * `bank_unverified` is the only reason an admin can act on from here, so it is the only
 * one that links out — to the wallet detail, where the verify control lives.
 */
function IneligibleReason({ row }: { row: IneligiblePartner }) {
  const t = useT();

  if (row.reason === 'already_paid_this_month') {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-status-greenSoft px-2.5 py-1 text-xs font-semibold text-status-green">
          <Check className="h-3.5 w-3.5" aria-hidden />
          {t.wallets.ineligible.already_paid_this_month}
        </span>
        {row.paidThisMonthReference && (
          <LtrText className="text-xs text-slate-400">{row.paidThisMonthReference}</LtrText>
        )}
      </span>
    );
  }

  if (row.reason === 'bank_unverified') {
    return (
      <Link
        href={`/wallets?open=${row.partnerId}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-status-amberSoft px-2.5 py-1 text-xs font-semibold text-status-amber transition-colors hover:bg-status-amber hover:text-white"
      >
        {t.wallets.ineligible.bank_unverified}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-status-amberSoft px-2.5 py-1 text-xs font-semibold text-status-amber">
      {t.wallets.ineligible[row.reason]}
    </span>
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
