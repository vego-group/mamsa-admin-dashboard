'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, X } from 'lucide-react';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { approvalsApi, setForbiddenHandler, setUnauthorizedHandler } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import { useAuthStore, useUiStore } from '@/stores';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNav = useUiStore((state) => state.setMobileNav);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const { can } = useCan();
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [denied, setDenied] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // RequireSession owns loading the admin; the badge is all this shell fetches.
  // The unread badge is the bell's own business — it polls for itself in the header.
  const canSeeApprovals = can('approvals.view');
  useEffect(() => {
    if (!canSeeApprovals) {
      setApprovalsCount(0);
      return;
    }

    approvalsApi
      .stats()
      .then((stats) => setApprovalsCount(stats.pendingReview))
      .catch(() => setApprovalsCount(0));
  }, [canSeeApprovals]);

  // Any request elsewhere in the app can discover the session died (401) — react to
  // it the same way everywhere: drop the cached admin and bounce to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAdmin(null);
      router.push('/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [router, setAdmin]);

  // A 403 is a denied action, not a dead session: say so and leave the admin signed in.
  useEffect(() => {
    setForbiddenHandler(() => setDenied(true));
    return () => setForbiddenHandler(null);
  }, []);

  useEffect(() => {
    if (!denied) return;
    const timer = setTimeout(() => setDenied(false), 6000);
    return () => clearTimeout(timer);
  }, [denied]);

  // The drawer only exists below `lg`. Crossing that line while it is open would hide
  // it behind `display:none` and strand the scroll lock below, with no visible drawer
  // left to close — so the breakpoint closes it.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const close = () => {
      if (desktop.matches) setMobileNav(false);
    };

    close();
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, [setMobileNav]);

  // Escape closes the drawer, and the page behind it must not scroll while it is up.
  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNav(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    drawerRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileNavOpen, setMobileNav]);

  return (
    <div className="flex min-h-screen bg-surface-page">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar approvalsCount={approvalsCount} />
      </div>

      {/* Mobile drawer. Kept mounted so it can slide both ways; `visibility` flips
          only after the slide-out finishes, which also takes it out of the tab order
          and the accessibility tree while closed. */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', !mobileNavOpen && 'pointer-events-none')}
        aria-hidden={!mobileNavOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-slate-900/40 transition-opacity duration-200',
            mobileNavOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileNav(false)}
        />

        <div
          ref={drawerRef}
          role="dialog"
          aria-modal={mobileNavOpen}
          aria-label={t.nav.primary}
          tabIndex={-1}
          className={cn(
            'absolute inset-y-0 start-0 flex max-w-[85vw] focus:outline-none',
            'transition-[transform,visibility] duration-200',
            mobileNavOpen
              ? 'visible translate-x-0'
              : 'invisible -translate-x-full rtl:translate-x-full',
          )}
        >
          <Sidebar
            approvalsCount={approvalsCount}
            collapsed={false}
            collapsible={false}
            onNavigate={() => setMobileNav(false)}
            className="shadow-pop"
          />

          <button
            type="button"
            onClick={() => setMobileNav(false)}
            aria-label={t.nav.closeNavigation}
            className={cn(
              'absolute end-3 top-3 rounded-lg p-2 text-sidebar-muted transition-colors',
              'hover:bg-sidebar-hover hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 lg:px-6">
          {denied && (
            <p
              role="status"
              className="mb-4 flex items-center gap-2.5 rounded-xl bg-status-redSoft px-3.5 py-3 text-sm font-medium text-status-red"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
              {t.errors.forbidden}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
