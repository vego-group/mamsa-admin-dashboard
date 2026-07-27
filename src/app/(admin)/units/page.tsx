'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck, Home, LayoutGrid, List, Star, TrendingUp } from 'lucide-react';
import {
  type Column,
  DataTable,
  EmptyState,
  ErrorState,
  KpiCard,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
} from '@/components/common';
import { AddUnitDialog } from '@/components/units/AddUnitDialog';
import { UnitCard } from '@/components/units/UnitCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { unitsApi } from '@/lib/api';
import {
  SAUDI_CITIES,
  UNIT_STATUS,
  UNIT_TYPE,
  type UnitStatus,
  type UnitType,
} from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatSAR } from '@/lib/utils/format';
import type { Paginated, Unit, UnitStats } from '@/types';

const PAGE_SIZE = 8;

type View = 'grid' | 'list';

export default function UnitsPage() {
  const t = useT();
  const router = useRouter();

  const [view, setView] = useState<View>('grid');
  const [status, setStatus] = useState<UnitStatus | 'all'>('all');
  const [type, setType] = useState<UnitType | 'all'>('all');
  const [city, setCity] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<Unit> | null>(null);
  const [stats, setStats] = useState<UnitStats | null>(null);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    unitsApi
      .list({ status, type, city, search, page, pageSize: PAGE_SIZE })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [status, type, city, search, page, reloadToken]);

  useEffect(() => {
    let stale = false;
    unitsApi
      .stats()
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [status, type, city, search]);

  const open = useCallback((unit: Unit) => router.push(`/units/${unit.id}`), [router]);

  const columns: Array<Column<Unit>> = useMemo(
    () => [
      {
        key: 'name',
        header: t.units.unit,
        width: '26%',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{row.name}</p>
            <LtrText className="text-xs text-slate-400">{row.code}</LtrText>
          </div>
        ),
      },
      {
        key: 'partnerName',
        header: t.units.partner,
        width: '18%',
        cell: (row) => <span className="truncate text-slate-600">{row.partnerName}</span>,
      },
      {
        key: 'city',
        header: t.units.city,
        width: '10%',
        cell: (row) => t.cities[row.city as keyof typeof t.cities] ?? row.city,
      },
      {
        key: 'type',
        header: t.units.type,
        width: '11%',
        cell: (row) => <StatusBadge status={row.type} dot={false} />,
      },
      {
        key: 'occupancyRate',
        header: t.units.occupancy,
        width: '10%',
        cell: (row) => <span className="tabular-nums">{row.occupancyRate}%</span>,
      },
      {
        key: 'rating',
        header: t.units.rating,
        width: '9%',
        cell: (row) =>
          row.reviewsCount > 0 ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="h-4 w-4 fill-status-amber text-status-amber" aria-hidden />
              {row.rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        key: 'pricePerNight',
        header: t.units.pricePerNight,
        width: '12%',
        align: 'end',
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-900">
            {formatSAR(row.pricePerNight)}
          </span>
        ),
      },
      {
        key: 'status',
        header: t.units.status,
        align: 'end',
        cell: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [t],
  );

  function exportCsv() {
    if (!result) return;

    const csv = toCsv(result.items, [
      { header: 'Code', value: (row) => row.code },
      { header: 'Name', value: (row) => row.name },
      { header: 'Partner', value: (row) => row.partnerName },
      { header: 'City', value: (row) => row.city },
      { header: 'District', value: (row) => row.district },
      { header: 'Type', value: (row) => row.type },
      { header: 'Status', value: (row) => row.status },
      { header: 'Price/night (SAR)', value: (row) => row.pricePerNight },
      { header: 'Occupancy (%)', value: (row) => row.occupancyRate },
      { header: 'Revenue (SAR)', value: (row) => row.revenue },
      { header: 'Mamsa-owned', value: (row) => String(row.mamsaOwned) },
    ]);

    downloadCsv(`mamsa-units-page-${page}.csv`, csv);
  }

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t.units.searchPlaceholder}
        className="w-full min-w-0 flex-1 sm:max-w-xs"
      />

      <FilterSelect
        value={status}
        onChange={(value) => setStatus(value as UnitStatus | 'all')}
        allLabel={t.units.allStatuses}
        options={Object.values(UNIT_STATUS).map((value) => ({ value, label: t.status[value] }))}
      />
      <FilterSelect
        value={type}
        onChange={(value) => setType(value as UnitType | 'all')}
        allLabel={t.units.allTypes}
        options={Object.values(UNIT_TYPE).map((value) => ({ value, label: t.status[value] }))}
      />
      <FilterSelect
        value={city}
        onChange={setCity}
        allLabel={t.units.allCities}
        options={SAUDI_CITIES.map((value) => ({ value, label: t.cities[value] }))}
      />

      <div className="ms-auto inline-flex rounded-xl border border-hairline p-1">
        <ViewButton active={view === 'grid'} label={t.units.gridView} onClick={() => setView('grid')}>
          <LayoutGrid className="h-4 w-4" />
        </ViewButton>
        <ViewButton active={view === 'list'} label={t.units.listView} onClick={() => setView('list')}>
          <List className="h-4 w-4" />
        </ViewButton>
      </div>
    </div>
  );

  const pager = result && result.total > result.pageSize && (
    <Pagination
      page={result.page}
      pageSize={result.pageSize}
      total={result.total}
      onPageChange={setPage}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.units.title}
        subtitle={t.units.subtitle(stats?.total ?? 0, stats?.approved ?? 0)}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!result?.items.length}>
              {t.common.export}
            </Button>
            <Button onClick={() => setAdding(true)}>
              <Home className="h-4 w-4" />
              {t.units.add}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t.units.published}
          value={stats ? String(stats.approved) : '—'}
          icon={CircleCheck}
          iconTone="green"
        />
        <KpiCard
          label={t.units.avgOccupancy}
          value={stats ? `${stats.avgOccupancy}%` : '—'}
          icon={TrendingUp}
          iconTone="blue"
        />
        <KpiCard
          label={t.units.totalRevenue}
          value={stats ? formatSAR(stats.totalRevenue, { compact: true }) : '—'}
          icon={TrendingUp}
        />
      </div>

      {view === 'list' ? (
        <DataTable
          columns={columns}
          rows={result?.items ?? []}
          rowKey={(row) => row.id}
          loading={!result && !error}
          error={error}
          onRetry={reload}
          onRowClick={open}
          emptyTitle={t.units.empty}
          header={filters}
          footer={pager}
        />
      ) : (
        <>
          <Card className="p-4">{filters}</Card>

          {error ? (
            <Card>
              <ErrorState onRetry={reload} />
            </Card>
          ) : !result ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <Card key={index} className="overflow-hidden" aria-busy>
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : result.items.length === 0 ? (
            <Card>
              <EmptyState title={t.units.empty} />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {result.items.map((unit) => (
                <UnitCard key={unit.id} unit={unit} onSelect={() => open(unit)} />
              ))}
            </div>
          )}

          {pager && <Card className="p-4">{pager}</Card>}
        </>
      )}

      <AddUnitDialog open={adding} onOpenChange={setAdding} onCreated={reload} />
    </div>
  );
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded-lg p-2 transition-colors',
        active ? 'bg-surface-muted text-slate-900' : 'text-slate-400 hover:text-slate-600',
      )}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  allLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={allLabel}
      className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
