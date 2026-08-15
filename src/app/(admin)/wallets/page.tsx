'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, CircleCheck, TrendingDown, Wallet } from 'lucide-react';
import {
  Avatar,
  type Column,
  DataTable,
  KpiCard,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { EligibilityChip, Money, WalletDetailDrawer } from '@/components/wallets/WalletDetailDrawer';
import { useT } from '@/i18n';
import { ApiError, walletsApi } from '@/lib/api';
import { PARTNER_TYPE, PAYOUT_MIN_BALANCE, type PartnerType } from '@/lib/constants';
import { formatSAR } from '@/lib/utils/format';
import type {
  ID,
  Paginated,
  PartnerWallet,
  WalletEligibilityFilter,
  WalletStats,
} from '@/types';

const PAGE_SIZE = 8;

export default function WalletsPage() {
  return (
    <RequirePermission permission="wallets.view">
      <WalletsPageContent />
    </RequirePermission>
  );
}

function WalletsPageContent() {
  const t = useT();

  const [type, setType] = useState<PartnerType | 'all'>('all');
  const [eligibility, setEligibility] = useState<WalletEligibilityFilter>('all');
  const [search, setSearch] = useState('');
  const [minBalance, setMinBalance] = useState('');
  const [maxBalance, setMaxBalance] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by: string; dir: 'asc' | 'desc' } | null>({
    by: 'availableBalance',
    dir: 'desc',
  });

  const [result, setResult] = useState<Paginated<PartnerWallet> | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [inspecting, setInspecting] = useState<ID | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setErrorMessage(undefined);
    setResult(null);

    walletsApi
      .list({
        page,
        pageSize: PAGE_SIZE,
        q: search,
        type,
        eligibility,
        minBalance: minBalance === '' ? undefined : Number(minBalance),
        maxBalance: maxBalance === '' ? undefined : Number(maxBalance),
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
  }, [type, eligibility, search, minBalance, maxBalance, page, sort, reloadToken]);

  useEffect(() => {
    let stale = false;
    walletsApi
      .stats()
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [type, eligibility, search, minBalance, maxBalance]);

  const columns: Array<Column<PartnerWallet>> = useMemo(
    () => [
      {
        key: 'partnerName',
        header: t.wallets.partner,
        width: '24%',
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
        sortable: true,
        cell: (row) => <Money value={row.availableBalance} />,
      },
      {
        key: 'pendingBalance',
        header: t.wallets.pendingBalance,
        width: '13%',
        sortable: true,
        cell: (row) => (
          <span className="tabular-nums text-slate-600">{formatSAR(row.pendingBalance)}</span>
        ),
      },
      {
        key: 'lifetimeEarnings',
        header: t.wallets.lifetimeEarnings,
        width: '13%',
        sortable: true,
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.wallets.totalAvailable}
          value={stats ? formatSAR(stats.totalAvailable, { compact: true }) : '—'}
          icon={Wallet}
          iconTone="blue"
        />
        <KpiCard
          label={t.wallets.eligibleCount}
          value={stats ? String(stats.eligibleCount) : '—'}
          hint={stats ? t.wallets.eligibleAmount(formatSAR(stats.eligibleAmount, { compact: true })) : undefined}
          icon={CircleCheck}
          iconTone="green"
        />
        <KpiCard
          label={t.wallets.belowMinimum}
          value={stats ? String(stats.belowMinimumCount) : '—'}
          hint={t.wallets.minimumNote(formatSAR(PAYOUT_MIN_BALANCE))}
          icon={TrendingDown}
          iconTone="amber"
        />
        <KpiCard
          label={t.wallets.missingBankDetails}
          value={stats ? String(stats.bankUnverifiedCount + stats.bankMissingCount) : '—'}
          icon={Banknote}
          iconTone="red"
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
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t.wallets.searchPlaceholder}
              className="w-full max-w-xs"
            />

            <select
              value={type}
              onChange={(event) => setType(event.target.value as PartnerType | 'all')}
              aria-label={t.wallets.allTypes}
              className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              <option value="all">{t.wallets.allTypes}</option>
              {Object.values(PARTNER_TYPE).map((value) => (
                <option key={value} value={value}>
                  {t.status[value]}
                </option>
              ))}
            </select>

            <select
              value={eligibility}
              onChange={(event) => setEligibility(event.target.value as WalletEligibilityFilter)}
              aria-label={t.wallets.allEligibility}
              className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              <option value="all">{t.wallets.allEligibility}</option>
              <option value="eligible">{t.wallets.onlyEligible}</option>
              <option value="ineligible">{t.wallets.onlyIneligible}</option>
            </select>

            <div dir="ltr" className="flex items-center gap-2">
              <input
                inputMode="numeric"
                value={minBalance}
                onChange={(event) => setMinBalance(event.target.value.replace(/[^\d-]/g, ''))}
                placeholder={t.wallets.minBalance}
                aria-label={t.wallets.minBalance}
                className="h-10 w-28 rounded-xl border border-hairline bg-white px-3 text-sm tabular-nums text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              />
              <input
                inputMode="numeric"
                value={maxBalance}
                onChange={(event) => setMaxBalance(event.target.value.replace(/[^\d-]/g, ''))}
                placeholder={t.wallets.maxBalance}
                aria-label={t.wallets.maxBalance}
                className="h-10 w-28 rounded-xl border border-hairline bg-white px-3 text-sm tabular-nums text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              />
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

      <WalletDetailDrawer
        partnerId={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
        onChanged={reload}
      />
    </div>
  );
}
