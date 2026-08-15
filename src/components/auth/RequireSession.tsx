'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/common';
import { useAuthStore } from '@/stores';

/**
 * The session gate for every `(admin)` route.
 *
 * This replaces the middleware gate the plan called for: the API's session cookie is
 * scoped to the API host (`domain=api.mamsaa.com`, httpOnly), so Next.js middleware
 * running on the admin origin can never read it — see
 * docs/backend/AUTH-ENVIRONMENT-FINDINGS.md. `GET /admin/me` is therefore the only
 * honest way for this app to learn whether a session exists.
 *
 * This gate is UX. The backend rejects an unauthenticated request regardless of what
 * renders here.
 */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const load = useAuthStore((state) => state.load);

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  useEffect(() => {
    if (status !== 'anonymous') return;
    // window.location rather than useSearchParams: reading the query through the hook
    // would push this layout — and so every admin route — into a Suspense bailout.
    const next = `${pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [status, pathname, router]);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-surface-page px-4 py-6 lg:px-6">
        <PageSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
