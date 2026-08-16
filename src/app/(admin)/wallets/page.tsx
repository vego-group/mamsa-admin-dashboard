'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, CircleCheck, TrendingDown, Wallet } from 'lucide-react';
import {
  Avatar,
  KpiCard,
  type Column,
  DataTable,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { EligibilityChip, Money, WalletDetailDrawer } from '@/components/wallets/WalletDetailDrawer';
import { useT } from '@/i18n';
import { useDebounced } from '@/hooks/useDebounced';
import { ApiError, walletsApi } from '@/lib/api';
import { formatSAR } from '@/lib/utils/format';
import type { ID, Paginated, PartnerWallet, WalletStats } from '@/types';

const PAGE_SIZE = 8;

export default function WalletsPage() {
  return (
    <RequirePermission permission="wallets.view">
      <WalletsPageContent />
    </RequirePermission>
  );
}

/**
 * Read-only by design: balances move through earnings and payouts, and nothing on this
 * screen writes them. The only mutation reachable from here is bank verify/reject, which
 * lives in the drawer behind `wallets.adjust`.
 *
 * The endpoint takes `page`, `pageSize`, `search`, `sortBy` and `sortDir` — nothing else.
 * Type, eligibility and balance-range filters were sent for months and silently ignored,
 * which is worse than not offering them: the operator narrows the list, the list does not
 * narrow, and the screen looks broken rather than unsupported.
 */
function WalletsPageContent() {
  const t = useT();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  /**
   * `partnerName` is the ONLY accepted sort. Defaulting to `availableBalance` asked for a
   * sort the server drops on the floor, so the arrow said one thing and the rows another.
   * Unsorted by default now — the server's own order (partner id ascending) is stable.
   */
  const [sort, setSort] = useState<{ by: string; dir: 'asc' | 'desc' } | null>(null);

  const [result, setResult] = useState<Paginated<PartnerWallet> | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [inspecting, setInspecting] = useState<ID | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // The field stays responsive; only the query trails it.
  const debouncedSearch = useDebounced(search);

  useEffect(() => {
    let stale = false;
    setError(false);
    setErrorMessage(undefined);
    setResult(null);

    walletsApi
      .list({
        page,
        pageSize: PAGE_SIZE,
        // `search`, not `q` — the param name the API actually reads. Under `q` the box
        // typed, the request went out, and every partner came back regardless.
        search: debouncedSearch,
        sortBy: sort?.by,
        sortDir: sort?.dir,
      })
      .then((response) => !stale && setResult(response))
      .catch((err) => {
        if (stale) return;
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : undefined);
      });

    return () => {
      stale = true;
    };
  }, [debouncedSearch, page, sort, reloadToken]);

  useEffect(() => {
    let stale = false;
    walletsApi
      .stats()
      // Silent: the tiles read "—" and the table below is the page's actual job.
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [debouncedSearch]);

  const columns: Array<Column<PartnerWallet>> = useMemo(
    () => [
      {
        key: 'partnerName',
        header: t.wallets.partner,
        width: '24%',
        // The one column the API can actually sort on.
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.partnerName} size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-slate-900">{row.partnerName}</span>
              <LtrText className="block text-xs text-slate-400">{row.partnerId}</LtrText>
            </span>
          </div>
        ),
      },
      {
        key: 'partnerType',
        header: t.wallets.partnerType,
        width: '9%',
        cell: (row) => <StatusBadge status={row.partnerType} dot={false} />,
      },
      {
        key: 'availableBalance',
        header: t.wallets.availableBalance,
        width: '14%',
        cell: (row) => <Money value={row.availableBalance} />,
      },
      {
        key: 'pendingBalance',
        header: t.wallets.pendingBalance,
        width: '13%',
        cell: (row) => (
          <span className="tabular-nums text-slate-600">{formatSAR(row.pendingBalance)}</span>
        ),
      },
      {
        key: 'lifetimeEarnings',
        header: t.wallets.lifetimeEarnings,
        width: '13%',
        cell: (row) => (
          <span className="tabular-nums text-slate-600">
            {formatSAR(row.lifetimeEarnings, { compact: true })}
          </span>
        ),
      },
      {
        key: 'bankVerified',
        header: t.wallets.bankStatus,
        width: '13%',
        cell: (row) => (
          <StatusBadge
            status={
              row.ineligibleReason === 'bank_missing'
                ? 'unverified'
                : row.bankVerified
                  ? 'verified'
                  : 'pending_review'
            }
            dot={false}
          />
        ),
      },
      {
        key: 'payoutEligible',
        header: t.wallets.eligibility,
        align: 'end',
        cell: (row) => (
          <EligibilityChip eligible={row.payoutEligible} reason={row.ineligibleReason} />
        ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.wallets.title}
        subtitle={t.wallets.subtitle(result?.total ?? 0)}
      />

      {/*
        Computed by the same eligibility service as the payout run, so these tiles cannot
        disagree with what /payouts lists. The eight counts partition the partner base
        exactly — `partnersCount` is rendered beside them so a reader can see that they
        add up rather than take it on trust.
      */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.wallets.totalAvailable}
          value={stats ? formatSAR(stats.totalAvailable, { compact: true }) : '—'}
          hint={stats ? t.wallets.pendingHint(formatSAR(stats.totalPending)) : undefined}
          icon={Wallet}
          iconTone="blue"
        />
        <KpiCard
          label={t.wallets.eligibleCount}
          value={stats ? String(stats.eligibleCount) : '—'}
          hint={
            stats
              ? t.wallets.eligibleAmount(formatSAR(stats.eligibleAmount, { compact: true }))
              : undefined
          }
          icon={CircleCheck}
          iconTone="green"
        />
        {/* Done for the cycle — a success, so it does not sit under a warning icon. */}
        <KpiCard
          label={t.wallets.paidThisCycle}
          value={stats ? String(stats.alreadyPaidCount) : '—'}
          hint={stats ? t.wallets.ofPartners(stats.partnersCount) : undefined}
          icon={Banknote}
          iconTone="brand"
        />
        <KpiCard
          label={t.wallets.blockedCount}
          value={
            stats
              ? String(
                  stats.bankMissingCount +
                    stats.bankUnverifiedCount +
                    stats.suspendedCount +
                    stats.negativeBalanceCount,
                )
              : '—'
          }
          hint={stats ? t.wallets.belowMinimumHint(stats.belowMinimumCount) : undefined}
          icon={TrendingDown}
          iconTone="amber"
        />
      </div>

      <DataTable
        columns={columns}
        rows={result?.items ?? []}
        rowKey={(row) => row.partnerId}
        loading={!result && !error}
        error={error}
        errorDescription={errorMessage}
        onRetry={reload}
        onRowClick={(row) => setInspecting(row.partnerId)}
        emptyTitle={t.wallets.empty}
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
          // Search matches partner name or phone — the only filter the endpoint honours.
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t.wallets.searchPlaceholder}
            className="w-full max-w-xs"
          />
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

      <WalletDetailDrawer
        partnerId={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
        onChanged={reload}
      />
    </div>
  );
}
