'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  type FilterTabItem,
  FilterTabs,
  PageHeader,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import {
  CATEGORY_ICON,
  categoryIcon,
  categoryTone,
  notificationHref,
} from '@/components/notifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { NOTIFICATION_CATEGORY, type NotificationCategory } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDateTime, formatTime } from '@/lib/utils/format';
import { useNotificationsStore } from '@/stores';
import type { NotificationItem } from '@/types';

type Scope = 'all' | 'unread';

export default function NotificationsPage() {
  return (
    <RequirePermission permission="notifications.view">
      <NotificationsPageContent />
    </RequirePermission>
  );
}

function NotificationsPageContent() {
  const t = useT();
  const router = useRouter();
  // The feed is shared with the header bell, so opening one item here dims it there
  // too — and a booking that arrives while this page is open shows up on the next poll.
  const items = useNotificationsStore((state) => state.items);
  const error = useNotificationsStore((state) => state.failed);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const loadFeed = useNotificationsStore((state) => state.loadFeed);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);

  const [scope, setScope] = useState<Scope>('all');
  const [categories, setCategories] = useState<Set<NotificationCategory>>(new Set());

  const load = useCallback(() => void loadFeed(), [loadFeed]);

  useEffect(load, [load]);

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

  function open(item: NotificationItem) {
    void markRead(item.id);

    const href = notificationHref(item);
    if (href) router.push(href);
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
          <Button variant="secondary" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
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

      {/* A failed refresh behind a feed we already have stays quiet — the stale list
          is more useful than an error card wiping it away. */}
      {error && !items ? (
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
  const Icon = categoryIcon(item.category);

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
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
          categoryTone(item.category),
        )}
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
              {withDate ? formatDateTime(item.at) : formatTime(item.at)}
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
