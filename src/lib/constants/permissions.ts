/**
 * LOCKED PERMISSION MAP.
 *
 * The backend enforces these server-side; everything the frontend does with them is
 * UX. Never branch on a role inside a component — ask for a permission instead, so
 * that adding a role is an edit to this file only.
 */
import type { AdminRole, Permission } from '@/types';

/**
 * Every member of the Permission union, in declaration order. `superadmin` holds all
 * of them, so a newly added permission is unassigned until it is listed here.
 */
export const ALL_PERMISSIONS = [
  'dashboard.view',
  'users.view',
  'users.manage',
  'partners.view',
  'partners.manage',
  'units.view',
  'units.manage',
  'approvals.view',
  'approvals.manage',
  'bookings.view',
  'cancellations.view',
  'cancellations.manage',
  'wallets.view',
  'wallets.adjust',
  'payouts.view',
  'payouts.execute',
  'payouts.reverse',
  'payouts.manage',
  'reports.financial',
  'reports.operational',
  'notifications.view',
  'profile.view',
] as const satisfies readonly Permission[];

/**
 * Finance records bank transfers; it must not be able to unwind its own records, so
 * `payouts.reverse` and `payouts.manage` stay with superadmin. That single omission
 * is the whole segregation-of-duties control.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  finance: [
    'partners.view',
    'bookings.view',
    'cancellations.view',
    'wallets.view',
    'payouts.view',
    'payouts.execute',
    'reports.financial',
    'notifications.view',
    'profile.view',
  ],
};

/** Where a role lands after login when no `?next=` asks for somewhere else. */
export const ROLE_LANDING: Record<AdminRole, string> = {
  superadmin: '/overview',
  finance: '/payouts',
};

/**
 * The role a profile falls back to when the API sends **no** role at all.
 *
 * A missing role is a serialization gap, not a decision — production issues superadmin
 * sessions only, so this keeps a real admin working.
 */
export const DEFAULT_ADMIN_ROLE: AdminRole = 'superadmin';

/**
 * The least-privileged role this build knows — used when the API names a role this
 * build does **not** recognise. The backend deliberately restricted that admin; opening
 * a full superadmin UI in response would invert its stated intent.
 *
 * Derived rather than pinned, so it stays true the day a narrower role is added.
 */
export const NARROWEST_ADMIN_ROLE: AdminRole = (
  Object.keys(ROLE_PERMISSIONS) as AdminRole[]
).reduce((narrowest, role) =>
  ROLE_PERMISSIONS[role].length < ROLE_PERMISSIONS[narrowest].length ? role : narrowest,
);

export function isAdminRole(value: unknown): value is AdminRole {
  return value === 'superadmin' || value === 'finance';
}
