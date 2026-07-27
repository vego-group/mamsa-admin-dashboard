'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, CircleCheck, Eye, Star, TrendingUp } from 'lucide-react';
import {
  Avatar,
  type Column,
  ConfirmDialog,
  DataTable,
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
import { AddPartnerDialog } from '@/components/partners/AddPartnerDialog';
import { PartnerDetailDrawer } from '@/components/partners/PartnerDetailDrawer';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { partnersApi } from '@/lib/api';
import { PARTNER_TYPE } from '@/lib/constants';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatSAR } from '@/lib/utils/format';
import type { ID, Paginated, Partner, PartnerStats } from '@/types';

const PAGE_SIZE = 8;

type TypeFilter = Partner['type'] | 'all';
type ActionKind = 'approveVerify' | 'reject' | 'revoke' | 'suspend';
type PendingAction = { kind: ActionKind; partner: Partner } | null;

export default function PartnersPage() {
  const t = useT();

  const [type, setType] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Unsorted by default so the API's own order — pending first — survives.
  const [sort, setSort] = useState<{ by: string; dir: 'asc' | 'desc' } | null>(null);

  const [result, setResult] = useState<Paginated<Partner> | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [error, setError] = useState(false);

  const [inspecting, setInspecting] = useState<ID | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [adding, setAdding] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    partnersApi
      .list({ type, search, page, pageSize: PAGE_SIZE, sortBy: sort?.by, sortDir: sort?.dir })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [type, search, page, sort, reloadToken]);

  useEffect(() => {
    let stale = false;
    partnersApi
      .stats()
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [type, search]);

  const tabs: FilterTabItem[] = [
    { value: 'all', label: t.partners.all, count: stats?.total },
    {
      value: PARTNER_TYPE.INDIVIDUAL,
      label: t.partners.individuals,
      count: stats?.individuals,
    },
    { value: PARTNER_TYPE.COMPANY, label: t.partners.companies, count: stats?.companies },
  ];

  const columns: Array<Column<Partner>> = useMemo(
    () => [
      {
        key: 'name',
        header: t.partners.partner,
        width: '22%',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.name} size="sm" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-medium text-slate-900">
                <span className="truncate">{row.name}</span>
                {row.flagged && (
                  <AlertTriangle
                    className="h-4 w-4 shrink-0 text-status-amber"
                    aria-label={t.partners.flagged}
                  />
                )}
              </p>
              <LtrText className="text-xs text-slate-400">{row.code}</LtrText>
            </div>
          </div>
        ),
      },
      {
        key: 'type',
        header: t.partners.type,
        width: '9%',
        cell: (row) => <StatusBadge status={row.type} dot={false} />,
      },
      {
        key: 'city',
        header: t.partners.city,
        width: '9%',
        cell: (row) => t.cities[row.city as keyof typeof t.cities] ?? row.city,
      },
      {
        key: 'unitsCount',
        header: t.partners.units,
        width: '8%',
        sortable: true,
        cell: (row) => <span className="tabular-nums">{row.unitsCount}</span>,
      },
      {
        key: 'bookingsCount',
        header: t.partners.bookings,
        width: '9%',
        sortable: true,
        cell: (row) => <span className="tabular-nums">{row.bookingsCount.toLocaleString('en-US')}</span>,
      },
      {
        key: 'revenue',
        header: t.partners.revenue,
        width: '11%',
        sortable: true,
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-900">
            {formatSAR(row.revenue, { compact: true })}
          </span>
        ),
      },
      {
        key: 'rating',
        header: t.partners.rating,
        width: '8%',
        cell: (row) => (
          <span className="inline-flex items-center gap-1 font-medium tabular-nums text-slate-800">
            <Star className="h-4 w-4 fill-status-amber text-status-amber" aria-hidden />
            {row.rating.toFixed(1)}
          </span>
        ),
      },
      {
        key: 'verified',
        header: t.partners.verifiedColumn,
        width: '10%',
        cell: (row) => (
          <StatusBadge status={row.verified ? 'verified' : 'unverified'} dot={false} />
        ),
      },
      {
        key: 'status',
        header: t.partners.status,
        width: '10%',
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        header: '',
        align: 'end',
        cell: (row) => (
          <button
            type="button"
            title={t.partners.view}
            aria-label={t.partners.view}
            onClick={(event) => {
              event.stopPropagation();
              setInspecting(row.id);
            }}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-surface-muted hover:text-slate-700"
          >
            <Eye className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [t],
  );

  function exportCsv() {
    if (!result) return;

    const csv = toCsv(result.items, [
      { header: 'Code', value: (row) => row.code },
      { header: 'Name', value: (row) => row.name },
      { header: 'Type', value: (row) => row.type },
      { header: 'City', value: (row) => row.city },
      { header: 'Email', value: (row) => row.email },
      { header: 'Mobile', value: (row) => row.phone },
      { header: 'Units', value: (row) => row.unitsCount },
      { header: 'Bookings', value: (row) => row.bookingsCount },
      { header: 'Revenue (SAR)', value: (row) => row.revenue },
      { header: 'Rating', value: (row) => row.rating },
      { header: 'Verified', value: (row) => String(row.verified) },
      { header: 'Status', value: (row) => row.status },
      { header: 'Cancellation rate (%)', value: (row) => row.cancellationRate },
    ]);

    downloadCsv(`mamsa-partners-page-${page}.csv`, csv);
  }

  const target = pendingAction?.partner;

  /** The drawer hands off to a confirm dialog — both must not be open at once. */
  function openAction(kind: ActionKind, partner: Partner) {
    setInspecting(null);
    setPendingAction({ kind, partner });
  }

  async function runAction(call: () => Promise<unknown>) {
    if (!target) return;
    await call();
    setPendingAction(null);
    reload();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.partners.title}
        subtitle={t.partners.subtitle(stats?.total ?? 0, stats?.verified ?? 0, stats?.highRisk ?? 0)}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!result?.items.length}>
              {t.common.export}
            </Button>
            <Button onClick={() => setAdding(true)}>
              <Building2 className="h-4 w-4" />
              {t.partners.add}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t.partners.activePartners}
          value={stats ? String(stats.active) : '—'}
          icon={CircleCheck}
          iconTone="green"
        />
        <KpiCard
          label={t.partners.totalRevenue}
          value={stats ? formatSAR(stats.totalRevenue, { compact: true }) : '—'}
          icon={TrendingUp}
          iconTone="blue"
        />
        <KpiCard
          label={t.partners.highRisk}
          value={stats ? String(stats.highRisk) : '—'}
          icon={AlertTriangle}
          // Red chip on a plain card: flagged partners are a standing figure to watch,
          // not an alert that should shout from the whole tile.
          iconTone="red"
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
        emptyTitle={t.partners.empty}
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
            <FilterTabs items={tabs} value={type} onChange={(next) => setType(next as TypeFilter)} />
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t.partners.searchPlaceholder}
              className="w-full max-w-xs"
            />
          </div>
        }
        footer={
          result && (
            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              onPageChange={setPage}
            />
          )
        }
      />

      <PartnerDetailDrawer
        partnerId={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
        onApproveVerify={(partner) => openAction('approveVerify', partner)}
        onReject={(partner) => openAction('reject', partner)}
        onRevokeVerification={(partner) => openAction('revoke', partner)}
        onSuspend={(partner) => openAction('suspend', partner)}
      />

      <AddPartnerDialog open={adding} onOpenChange={setAdding} onInvited={reload} />

      <ConfirmDialog
        open={pendingAction?.kind === 'approveVerify'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={t.partners.approveVerifyTitle}
        variant="success"
        description={
          <RichText
            template={t.partners.approveVerifyQuestion}
            values={{ name: target?.name ?? '' }}
          />
        }
        confirmLabel={t.partners.approveVerify}
        onConfirm={() =>
          runAction(async () => {
            await partnersApi.approve(target!.id);
            await partnersApi.verify(target!.id);
          })
        }
      />

      <ConfirmDialog
        open={pendingAction?.kind === 'reject'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={t.partners.rejectTitle}
        variant="destructive"
        description={
          <RichText template={t.partners.rejectQuestion} values={{ name: target?.name ?? '' }} />
        }
        requireReason
        reasonLabel={t.partners.reasonForPartner}
        confirmLabel={t.partners.reject}
        onConfirm={({ reason }) => runAction(() => partnersApi.reject(target!.id, reason ?? ''))}
      />

      <ConfirmDialog
        open={pendingAction?.kind === 'revoke'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={t.partners.revokeVerification}
        variant="destructive"
        description={
          <RichText template={t.partners.revokeQuestion} values={{ name: target?.name ?? '' }} />
        }
        onConfirm={() => runAction(() => partnersApi.revokeVerification(target!.id))}
      />

      <ConfirmDialog
        open={pendingAction?.kind === 'suspend'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={t.partners.suspendTitle}
        variant="destructive"
        description={
          <RichText template={t.partners.suspendQuestion} values={{ name: target?.name ?? '' }} />
        }
        impact={t.partners.suspendConsequence}
        requireReason
        reasonLabel={t.partners.reasonForPartner}
        confirmLabel={t.partners.suspend}
        onConfirm={({ reason }) => runAction(() => partnersApi.suspend(target!.id, reason ?? ''))}
      />
    </div>
  );
}
