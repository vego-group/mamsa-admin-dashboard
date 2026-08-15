'use client';

import { useMemo } from 'react';
import { hasAll, hasAny, hasPermission } from '@/lib/auth/permissions';
import { useAuthStore } from '@/stores';
import type { AdminRole, Permission } from '@/types';

export interface CanApi {
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  role: AdminRole | null;
  /** True until the session has resolved — render a skeleton, never a denial. */
  isLoading: boolean;
}

/**
 * The only permission API components use. Nothing in `src/components` or `src/app`
 * may read `admin.role` to decide what to render — ask for a capability instead.
 */
export function useCan(): CanApi {
  const admin = useAuthStore((state) => state.admin);
  const status = useAuthStore((state) => state.status);

  return useMemo<CanApi>(
    () => ({
      can: (permission) => hasPermission(admin, permission),
      canAny: (permissions) => hasAny(admin, permissions),
      canAll: (permissions) => hasAll(admin, permissions),
      role: admin?.role ?? null,
      isLoading: status === 'idle' || status === 'loading',
    }),
    [admin, status],
  );
}
