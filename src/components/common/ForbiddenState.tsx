'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { landingRouteFor } from '@/lib/auth/routes';
import { useAuthStore } from '@/stores';
import { EmptyState } from './EmptyState';

/**
 * Shown in place of a screen the signed-in admin may not open.
 *
 * Deliberately not a silent redirect: a permissions bug and a routing bug look
 * identical when the app quietly sends you somewhere else.
 */
export function ForbiddenState() {
  const t = useT();
  const router = useRouter();
  const admin = useAuthStore((state) => state.admin);

  return (
    <Card>
      <EmptyState
        icon={ShieldAlert}
        title={t.errors.forbidden}
        description={t.errors.forbiddenBody}
        action={
          <Button variant="secondary" onClick={() => router.push(landingRouteFor(admin))}>
            {t.errors.backToLanding}
          </Button>
        }
      />
    </Card>
  );
}
