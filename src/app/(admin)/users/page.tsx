'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  Eye,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
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
import { RequirePermission } from '@/components/auth';
import { InviteUserDialog } from '@/components/users/InviteUserDialog';
import { UserDetailDrawer } from '@/components/users/UserDetailDrawer';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { usersApi } from '@/lib/api';
import { ACCOUNT_STATUS, SAUDI_CITIES } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatDate, formatSAR } from '@/lib/utils/format';
import { appliedSort } from '@/lib/utils/sort';
import type { ID, Paginated, User, UserStats } from '@/types';

/** Eight rows is what the design fits above the pager. */
const PAGE_SIZE = 8;

type StatusFilter = User['status'] | 'all';
type PendingAction = { kind: 'status' | 'remove'; user: User } | null;

export default function UsersPage() {
  return (
    <RequirePermission permission="users.view">
      <UsersPageContent />
    </RequirePermission>
  );
}

function UsersPageContent() {
  const t = useT();

  const [status, setStatus] = useState<StatusFilter>('all');
  const [city, setCity] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Unsorted by default — the backend's own order is the registration order.
  const [sort, setSort] = useState<{ by: string; dir: 'asc' | 'desc' } | null>(null);

  const [result, setResult] = useState<Paginated<User> | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState(false);

  const [inspecting, setInspecting] = useState<ID | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [inviting, setInviting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  /** The arrow follows what the API applied, not what we asked for. See appliedSort. */
  const applied = appliedSort(result, sort);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    usersApi
      .list({
        status,
        city,
        search,
        page,
        pageSize: PAGE_SIZE,
        sortBy: sort?.by,
        sortDir: sort?.dir,
      })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    // Typing fires a request per keystroke; only the newest may land.
    return () => {
      stale = true;
    };
  }, [status, city, search, page, sort, reloadToken]);

  useEffect(() => {
    let stale = false;
    usersApi
      .stats()
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  // Changing what is filtered invalidates the page number.
  useEffect(() => setPage(1), [status, city, search]);

  const tabs: FilterTabItem[] = [
    { value: 'all', label: t.users.allUsers, count: stats?.total },
    { value: ACCOUNT_STATUS.ACTIVE, label: t.status.active, count: stats?.active },
    {
      value: ACCOUNT_STATUS.PENDING_ACTIVATION,
      label: t.status.pending_activation,
      count: stats?.pendingActivation,
    },
    { value: ACCOUNT_STATUS.DISABLED, label: t.status.disabled, count: stats?.disabled },
  ];

  const columns: Array<Column<User>> = useMemo(
    () => [
      {
        key: 'name',
        header: t.users.user,
        width: '24%',
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{row.name}</p>
              <LtrText className="text-xs text-slate-400">{row.code}</LtrText>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        header: t.users.email,
        width: '18%',
        cell: (row) =>
          row.email ? (
            <LtrText className="text-slate-600">{row.email}</LtrText>
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        key: 'city',
        header: t.users.city,
        width: '12%',
        cell: (row) => (
          <span className="inline-block rounded-lg bg-surface-muted px-2.5 py-1 text-xs text-slate-600">
            {t.cities[row.city as keyof typeof t.cities] ?? row.city}
          </span>
        ),
      },
      {
        key: 'bookingsCount',
        header: t.users.bookings,
        width: '10%',
        sortable: true,
        cell: (row) => <span className="tabular-nums">{row.bookingsCount}</span>,
      },
      {
        key: 'totalSpent',
        header: t.users.totalSpent,
        width: '14%',
        sortable: true,
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-900">
            {formatSAR(row.totalSpent)}
          </span>
        ),
      },
      {
        key: 'joinedAt',
        header: t.users.joined,
        width: '12%',
        sortable: true,
        cell: (row) => <LtrText className="text-slate-400">{formatDate(row.joinedAt)}</LtrText>,
      },
      {
        key: 'status',
        header: t.users.status,
        width: '10%',
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        header: '',
        align: 'end',
        cell: (row) => {
          const disabled = row.status === ACCOUNT_STATUS.DISABLED;
          return (
            <div className="flex items-center justify-end gap-0.5">
              <RowAction label={t.users.view} onClick={() => setInspecting(row.id)}>
                <Eye className="h-4 w-4" />
              </RowAction>
              <RowAction
                label={disabled ? t.users.enable : t.users.disable}
                onClick={() => setPendingAction({ kind: 'status', user: row })}
              >
                {disabled ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              </RowAction>
              <RowAction
                label={t.users.remove}
                destructive
                onClick={() => setPendingAction({ kind: 'remove', user: row })}
              >
                <Trash2 className="h-4 w-4" />
              </RowAction>
            </div>
          );
        },
      },
    ],
    [t],
  );

  function exportCsv() {
    if (!result) return;

    const csv = toCsv(result.items, [
      { header: 'Code', value: (row) => row.code },
      { header: 'Name', value: (row) => row.name },
      { header: 'Email', value: (row) => row.email },
      { header: 'Mobile', value: (row) => row.phone },
      { header: 'City', value: (row) => row.city },
      { header: 'Bookings', value: (row) => row.bookingsCount },
      { header: 'Total Spent (SAR)', value: (row) => row.totalSpent },
      { header: 'Joined', value: (row) => formatDate(row.joinedAt) },
      { header: 'Status', value: (row) => row.status },
    ]);

    downloadCsv(`mamsa-users-page-${page}.csv`, csv);
  }

  const actionUser = pendingAction?.user;
  const disabling = actionUser?.status !== ACCOUNT_STATUS.DISABLED;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.users.title}
        subtitle={t.users.subtitle(stats?.total ?? 0)}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} disabled={!result?.items.length}>
              {t.common.exportCsv}
            </Button>
            <Button onClick={() => setInviting(true)}>
              <UserPlus className="h-4 w-4" />
              {t.users.invite}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t.users.activeUsers}
          value={stats ? String(stats.active) : '—'}
          icon={UserCheck}
          iconTone="green"
        />
        <KpiCard
          label={t.users.inactiveUsers}
          value={stats ? String(stats.total - stats.active) : '—'}
          icon={UserX}
          iconTone="amber"
        />
        <KpiCard
          label={t.users.avgSpend}
          value={stats ? formatSAR(stats.avgSpend, { compact: true }) : '—'}
          icon={TrendingUp}
          iconTone="blue"
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
        emptyTitle={t.users.empty}
        sortBy={applied.by}
        sortDir={applied.dir}
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
              onChange={(next) => setStatus(next as StatusFilter)}
            />

            <div className="flex flex-1 items-center justify-end gap-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t.users.searchPlaceholder}
                className="w-full max-w-xs"
              />

              <div className="relative">
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  aria-label={t.users.city}
                  className="h-10 appearance-none rounded-xl border border-hairline bg-white ps-3 pe-9 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                  <option value="all">{t.users.allCities}</option>
                  {SAUDI_CITIES.map((name) => (
                    <option key={name} value={name}>
                      {t.cities[name]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
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

      <UserDetailDrawer
        userId={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
        onToggleStatus={(user) => {
          setInspecting(null);
          setPendingAction({ kind: 'status', user });
        }}
        onRemove={(user) => {
          setInspecting(null);
          setPendingAction({ kind: 'remove', user });
        }}
      />

      <InviteUserDialog open={inviting} onOpenChange={setInviting} onInvited={reload} />

      <ConfirmDialog
        open={pendingAction?.kind === 'status'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={disabling ? t.users.disable : t.users.enable}
        icon={disabling ? Ban : CheckCircle2}
        description={
          <RichText
            template={disabling ? t.users.disableQuestion : t.users.enableQuestion}
            values={{ name: actionUser?.name ?? '' }}
          />
        }
        warning={disabling && actionUser?.hasActiveBookings ? t.users.hasActiveBookings : undefined}
        variant={disabling ? 'destructive' : 'success'}
        confirmLabel={disabling ? t.users.confirmDisable : t.users.confirmEnable}
        onConfirm={async () => {
          if (!actionUser) return;
          await usersApi.setStatus(
            actionUser.id,
            disabling ? ACCOUNT_STATUS.DISABLED : ACCOUNT_STATUS.ACTIVE,
          );
          setPendingAction(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={pendingAction?.kind === 'remove'}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={t.users.remove}
        icon={Ban}
        description={
          <RichText template={t.users.deleteQuestion} values={{ name: actionUser?.name ?? '' }} />
        }
        warning={t.users.irreversible}
        variant="destructive"
        confirmLabel={t.users.confirmDelete}
        onConfirm={async () => {
          if (!actionUser) return;
          await usersApi.remove(actionUser.id);
          setPendingAction(null);
          reload();
        }}
      />
    </div>
  );
}

function RowAction({
  label,
  destructive,
  onClick,
  children,
}: {
  label: string;
  destructive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(event) => {
        // The row itself opens the detail dialog — an action must not do both.
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'rounded-lg p-2 text-slate-400 transition-colors',
        destructive
          ? 'hover:bg-status-redSoft hover:text-status-red'
          : 'hover:bg-surface-muted hover:text-slate-700',
      )}
    >
      {children}
    </button>
  );
}
