'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CalendarDays,
  CheckCheck,
  CircleX,
  DollarSign,
  Settings,
  SquareCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  type FilterTabItem,
  FilterTabs,
  PageHeader,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { notificationsApi } from '@/lib/api';
import { NOTIFICATION_CATEGORY, type NotificationCategory } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/format';
import { useNotificationsStore } from '@/stores';
import type { ID, NotificationItem } from '@/types';

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  approval: SquareCheck,
  booking: CalendarDays,
  cancellation: CircleX,
  partner: Building2,
  system: Settings,
  refund: DollarSign,
};

const CATEGORY_TONE: Record<NotificationCategory, string> = {
  approval: 'bg-status-greenSoft text-status-green',
  booking: 'bg-status-blueSoft text-status-blue',
  cancellation: 'bg-status-redSoft text-status-red',
  partner: 'bg-status-sageSoft text-status-sage',
  system: 'bg-status-greySoft text-status-grey',
  refund: 'bg-status-amberSoft text-status-amber',
};

/**
 * Where each notification hands off. Approval has a real detail route; booking,
 * partner and cancellation deep-link via `?open=<id>`, which the list page reads
 * on mount to pop the matching row's drawer.
 */
const ENTITY_ROUTE: Record<NonNullable<NotificationItem['entity']>['type'], (id: ID) => string> = {
  approval: (id) => `/approvals/${id}`,
  booking: (id) => `/bookings?open=${id}`,
  partner: (id) => `/partners?open=${id}`,
  cancellation: (id) => `/cancellations?open=${id}`,
  report: () => '/reports',
};

type Scope = 'all' | 'unread';

export default function NotificationsPage() {
  const t = useT();
  const router = useRouter();
  const refreshBadge = useNotificationsStore((state) => state.refresh);
  const markAllReadInStore = useNotificationsStore((state) => state.markAllRead);

  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState(false);
  const [scope, setScope] = useState<Scope>('all');
  const [categories, setCategories] = useState<Set<NotificationCategory>>(new Set());

  const load = useCallback(() => {
    setError(false);
    setItems(null);
    notificationsApi.list().then(setItems).catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  const unreadCount = items?.filter((item) => !item.read).length ?? 0;

  const visible = useMemo(() => {
    if (!items) return [];
    return items
      .filter((item) => (scope === 'unread' ? !item.read : true))
      .filter((item) => categories.size === 0 || categories.has(item.category))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [items, scope, categories]);

  const groups = useMemo(() => groupByRecency(visible), [visible]);

  function toggleCategory(category: NotificationCategory) {
    setCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  async function open(item: NotificationItem) {
    if (!item.read) {
      // Optimistic: the row should stop shouting the moment it is opened.
      setItems((current) =>
        current?.map((row) => (row.id === item.id ? { ...row, read: true } : row)) ?? current,
      );
      await notificationsApi.markRead(item.id);
      void refreshBadge();
    }

    if (item.entity) router.push(ENTITY_ROUTE[item.entity.type](item.entity.id));
  }

  async function markAll() {
    setItems((current) => current?.map((row) => ({ ...row, read: true })) ?? current);
    await markAllReadInStore();
  }

  const tabs: FilterTabItem[] = [
    { value: 'all', label: t.notifications.all, count: items?.length },
    { value: 'unread', label: t.notifications.unread, count: unreadCount, attention: unreadCount > 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.notifications.title}
        subtitle={unreadCount > 0 ? t.notifications.subtitle(unreadCount) : t.notifications.allRead}
        actions={
          <Button variant="secondary" onClick={() => void markAll()} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" />
            {t.notifications.markAllRead}
          </Button>
        }
      />

      <div className="space-y-4">
        <FilterTabs items={tabs} value={scope} onChange={(next) => setScope(next as Scope)} />

        <div className="flex flex-wrap gap-2">
          {Object.values(NOTIFICATION_CATEGORY).map((category) => {
            const Icon = CATEGORY_ICON[category];
            const active = categories.has(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-hairline bg-white text-slate-600 hover:bg-surface-muted',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t.notifications.categories[category]}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : !items ? (
        <Card className="divide-y divide-hairline" aria-busy>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4 p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState title={t.notifications.empty} />
        </Card>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-3">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t.notifications.groups[group.key]}
              </h2>
              <span className="h-px flex-1 bg-hairline" aria-hidden />
              <span className="text-sm tabular-nums text-slate-400">{group.items.length}</span>
            </div>

            <Card className="divide-y divide-hairline overflow-hidden">
              {group.items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  // Today/yesterday headings already carry the date; older rows must
                  // spell it out in the platform's DD/MM/YYYY format.
                  withDate={group.key === 'older'}
                  onOpen={() => void open(item)}
                />
              ))}
            </Card>
          </section>
        ))
      )}
    </div>
  );
}

function NotificationRow({
  item,
  withDate,
  onOpen,
}: {
  item: NotificationItem;
  withDate: boolean;
  onOpen: () => void;
}) {
  const t = useT();
  const Icon = CATEGORY_ICON[item.category];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full items-start gap-4 p-5 text-start transition-colors',
        item.read ? 'bg-white hover:bg-surface-page' : 'bg-surface-page hover:bg-surface-muted',
      )}
    >
      <span
        className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', CATEGORY_TONE[item.category])}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'text-sm',
              item.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900',
            )}
          >
            {item.title}
          </span>

          <span className="flex shrink-0 items-center gap-2">
            <time
              dir="ltr"
              dateTime={item.at}
              className="text-xs tabular-nums text-slate-400"
              title={formatDateTime(item.at)}
            >
              {withDate ? formatDateTime(item.at) : timeOf(item.at)}
            </time>
            {!item.read && (
              <span className="h-2 w-2 rounded-full bg-status-green" aria-hidden />
            )}
          </span>
        </span>

        <span className="mt-1 block text-sm text-slate-500">{item.body}</span>

        <span className="mt-2.5 inline-block rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-slate-600">
          {t.notifications.categories[item.category]}
        </span>
      </span>
    </button>
  );
}

type GroupKey = 'today' | 'yesterday' | 'older';

/**
 * Recency buckets, not date headings: an admin scanning this page cares whether
 * something landed while they were away, not which calendar day it was.
 */
function groupByRecency(items: NotificationItem[]): Array<{ key: GroupKey; items: NotificationItem[] }> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);

  const buckets: Record<GroupKey, NotificationItem[]> = { today: [], yesterday: [], older: [] };

  for (const item of items) {
    const at = new Date(item.at).getTime();
    if (at >= startOfToday.getTime()) buckets.today.push(item);
    else if (at >= startOfYesterday.getTime()) buckets.yesterday.push(item);
    else buckets.older.push(item);
  }

  return (['today', 'yesterday', 'older'] as const)
    .map((key) => ({ key, items: buckets[key] }))
    .filter((group) => group.items.length > 0);
}

/** Latin digits and a 12-hour clock, matching every other timestamp in the console. */
function timeOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
