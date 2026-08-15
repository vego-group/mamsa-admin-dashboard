'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Globe, Menu, Search } from 'lucide-react';
import { NotificationBell } from '@/components/notifications';
import { useT } from '@/i18n';
import { landingRouteFor } from '@/lib/auth/routes';
import { cn } from '@/lib/utils/cn';
import { useAuthStore, useUiStore } from '@/stores';
import { NAV_GROUPS } from './nav-items';

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);
  const setMobileNav = useUiStore((state) => state.setMobileNav);
  const admin = useAuthStore((state) => state.admin);

  const current = NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={() => setMobileNav(true)}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 lg:hidden"
        aria-label={t.nav.openNavigation}
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
        <Link
          href={landingRouteFor(admin)}
          className="text-slate-400 transition-colors hover:text-slate-600"
        >
          Mamsa
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 rtl:rotate-180" />
        <span className="font-medium text-slate-800">
          {current ? t.nav[current.labelKey] : t.nav.dashboard}
        </span>
      </nav>

      <div className="mx-auto hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder={t.common.search}
            className="h-10 w-full rounded-xl border border-hairline bg-surface-page ps-9 pe-14 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          />
          <kbd className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 rounded-md border border-hairline bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-surface-muted"
        >
          <Globe className="h-4 w-4" />
          {locale === 'ar' ? 'EN' : 'AR'}
        </button>

        <NotificationBell />

        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-2 rounded-xl border border-hairline px-2 py-1.5 transition-colors hover:bg-surface-muted',
          )}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
            {admin?.name?.[0] ?? 'A'}
          </span>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">Admin</span>
        </Link>
      </div>
    </header>
  );
}
