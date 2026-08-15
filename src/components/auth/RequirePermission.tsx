'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ForbiddenState, PageSkeleton } from '@/components/common';
import { useCan } from '@/hooks/useCan';
import { useAuthStore } from '@/stores';
import type { Permission } from '@/types';

export interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
}

/**
 * Wraps a screen in the capability that opens it. Frontend gating is UX only — the
 * backend enforces the same permission on every request this screen makes.
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const admin = useAuthStore((state) => state.admin);
  const { can, isLoading } = useCan();

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login');
  }, [status, router]);

  if (isLoading) return <PageSkeleton />;
  if (!admin) return null;
  if (!can(permission)) return <ForbiddenState />;

  return <>{children}</>;
}
