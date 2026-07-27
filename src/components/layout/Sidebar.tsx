'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils/cn';
import { useAuthStore, useNotificationsStore, useUiStore } from '@/stores';
import { NAV_GROUPS } from './nav-items';

export interface SidebarProps {
  /** Pending approval count — the number an admin acts on most. */
  approvalsCount?: number;
  /**
   * Overrides the stored preference. The mobile drawer passes `false`: it has room
   * for labels, and a rail with no text would be useless there.
   */
  collapsed?: boolean;
  /** Hides the collapse toggle where collapsing makes no sense (the drawer). */
  collapsible?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({
  approvalsCount = 0,
  collapsed: collapsedOverride,
  collapsible = true,
  onNavigate,
  className,
}: SidebarProps) {
  const t = useT();
  const pathname = usePathname();
  const storedCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const unread = useNotificationsStore((state) => state.unreadCount);
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);

  const collapsed = collapsedOverride ?? storedCollapsed;

  const badgeValue = (source: string | null) =>
    source === 'approvals' ? approvalsCount : source === 'notifications' ? unread : 0;

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar text-white transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[264px]',
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <Link
          href="/overview"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 font-semibold">
            M
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">Mamsa</span>
              <span className="block truncate text-[11px] uppercase tracking-wide text-sidebar-muted">
                {t.common.superadmin}
              </span>
            </span>
          )}
        </Link>

        {collapsible && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={t.nav.toggleSidebar}
            aria-expanded={!collapsed}
            className={cn(
              'hidden shrink-0 rounded-lg p-1.5 text-sidebar-muted transition-colors lg:block',
              'hover:bg-sidebar-hover hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 rtl:rotate-180" />
            ) : (
              <PanelLeftClose className="h-4 w-4 rtl:rotate-180" />
            )}
          </button>
        )}
      </div>

      <nav
        aria-label={t.nav.primary}
        className="scrollbar-sidebar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.titleKey} className="mb-5 last:mb-0">
            {collapsed ? (
              // No room for a heading in the rail — groups are separated by a rule,
              // and the first one needs none.
              groupIndex > 0 && <span className="mx-3 mb-3 block h-px bg-sidebar-border" aria-hidden />
            ) : (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
                {t.nav[group.titleKey]}
              </p>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const count = badgeValue(item.badge);
                const label = t.nav[item.labelKey];

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? label : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                        active
                          ? 'bg-sidebar-active font-medium text-white'
                          : 'text-white/75 hover:bg-sidebar-hover hover:text-white',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      {active && (
                        <span className="absolute end-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-brand-rail" />
                      )}

                      <span className="relative shrink-0">
                        <item.icon className="h-[18px] w-[18px]" />
                        {/* Collapsed: the count has no room, so it becomes a dot on the
                            icon. Expanded: it sits at the end of the row as a number. */}
                        {collapsed && count > 0 && (
                          <span
                            className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-sidebar"
                            aria-hidden
                          />
                        )}
                      </span>

                      {!collapsed && <span className="flex-1 truncate">{label}</span>}

                      {!collapsed && count > 0 && (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                          {count}
                        </span>
                      )}

                      {collapsed && count > 0 && <span className="sr-only">{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-2 py-2',
            collapsed && 'flex-col gap-2 px-0',
          )}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-semibold">
            {admin?.name?.[0] ?? 'A'}
          </span>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{admin?.name ?? 'Super Admin'}</p>
              <p dir="ltr" className="truncate text-xs text-sidebar-muted">
                {admin?.email ?? 'admin@mamsa.sa'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void logout()}
            title={t.nav.logout}
            aria-label={t.nav.logout}
            className={cn(
              'shrink-0 rounded-lg p-1.5 text-sidebar-muted transition-colors',
              'hover:bg-sidebar-hover hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            )}
          >
            <LogOut className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </aside>
  );
}
