'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatDateTime, formatTime } from '@/lib/utils/format';
import { useNotificationsStore } from '@/stores';
import type { NotificationItem } from '@/types';
import { categoryIcon, categoryTone, notificationHref } from './categories';

/**
 * How often the badge re-checks while the tab is in front. A booking is confirmed
 * out in the world, not by anything the admin clicked here, so without a poll a
 * super admin parked on another page would never learn about it.
 */
const POLL_INTERVAL_MS = 60_000;

/** Enough to see what just landed; the full history is one click away. */
const PANEL_LIMIT = 6;

export function NotificationBell() {
  const t = useT();
  const router = useRouter();
  const items = useNotificationsStore((state) => state.items);
  const unread = useNotificationsStore((state) => state.unreadCount);
  const failed = useNotificationsStore((state) => state.failed);
  const refresh = useNotificationsStore((state) => state.refresh);
  const loadFeed = useNotificationsStore((state) => state.loadFeed);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Badge only: the feed itself is fetched when the panel is opened.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') void refresh();
    };

    tick();
    const timer = window.setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [refresh]);

  const toggle = useCallback(() => {
    setOpen((current) => {
      // Always refetch on the way open — the badge may have moved since last time.
      if (!current) void loadFeed();
      return !current;
    });
  }, [loadFeed]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function openItem(item: NotificationItem) {
    setOpen(false);
    void markRead(item.id);

    const href = notificationHref(item);
    if (href) router.push(href);
  }

  const visible = items?.slice(0, PANEL_LIMIT) ?? null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={t.nav.notifications}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-surface-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          open && 'bg-surface-muted text-slate-700',
        )}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.notifications.title}
          className={cn(
            'absolute end-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))]',
            'overflow-hidden rounded-2xl border border-hairline bg-white shadow-pop',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{t.notifications.title}</p>
              <p className="truncate text-xs text-slate-400">
                {unread > 0 ? t.notifications.subtitle(unread) : t.notifications.allRead}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unread === 0}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                unread === 0
                  ? 'cursor-not-allowed text-slate-300'
                  : 'text-brand hover:bg-brand-soft',
              )}
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden />
              {t.notifications.markAllRead}
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {!visible ? (
              failed ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">{t.common.errorBody}</p>
              ) : (
                <div className="divide-y divide-hairline" aria-busy>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-3 px-4 py-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">{t.notifications.empty}</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {visible.map((item) => (
                  <li key={item.id}>
                    <PanelRow item={item} onOpen={() => void openItem(item)} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-hairline px-4 py-3 text-center text-sm font-medium text-brand transition-colors hover:bg-surface-page"
          >
            {t.common.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}

function PanelRow({ item, onOpen }: { item: NotificationItem; onOpen: () => void }) {
  const t = useT();
  const Icon = categoryIcon(item.category);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-start transition-colors',
        item.read ? 'bg-white hover:bg-surface-page' : 'bg-surface-page hover:bg-surface-muted',
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
          categoryTone(item.category),
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm',
              item.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900',
            )}
          >
            {item.title}
          </span>

          <span className="flex shrink-0 items-center gap-1.5">
            <time
              dir="ltr"
              dateTime={item.at}
              title={formatDateTime(item.at)}
              className="text-[11px] tabular-nums text-slate-400"
            >
              {shortStamp(item.at)}
            </time>
            {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-status-green" aria-hidden />}
          </span>
        </span>

        <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500">{item.body}</span>

        <span className="mt-1.5 inline-block rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {t.notifications.categories[item.category]}
        </span>
      </span>
    </button>
  );
}

/** Today's arrivals read as a clock time; anything older needs its date. */
function shortStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return date.getTime() >= startOfToday.getTime() ? formatTime(date) : formatDate(date);
}
