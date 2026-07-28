'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useT } from '@/i18n';
import { approvalsApi, setUnauthorizedHandler } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import { useAuthStore, useNotificationsStore, useUiStore } from '@/stores';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNav = useUiStore((state) => state.setMobileNav);
  const loadAdmin = useAuthStore((state) => state.load);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const refreshUnread = useNotificationsStore((state) => state.refresh);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadAdmin();
    void refreshUnread();

    approvalsApi
      .stats()
      .then((stats) => setApprovalsCount(stats.pendingReview))
      .catch(() => setApprovalsCount(0));
  }, [loadAdmin, refreshUnread]);

  // Any request elsewhere in the app can discover the session died (401) — react to
  // it the same way everywhere: drop the cached admin and bounce to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAdmin(null);
      router.push('/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [router, setAdmin]);

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
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
