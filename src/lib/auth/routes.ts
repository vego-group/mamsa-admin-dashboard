/**
 * The route → permission registry.
 *
 * It holds the routes THIS build serves. `/wallets` and `/payouts` are deliberately
 * absent until the phases that create them register their entries here.
 */
import { ROLE_LANDING } from '@/lib/constants';
import type { AdminProfile, Permission } from '@/types';
import { hasPermission } from './permissions';

/** Insertion order doubles as the landing-fallback preference order. */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/overview': 'dashboard.view',
  '/partners': 'partners.view',
  '/bookings': 'bookings.view',
  '/cancellations': 'cancellations.view',
  '/wallets': 'wallets.view',
  '/payouts': 'payouts.view',
  '/reports': 'reports.financial',
  '/users': 'users.view',
  '/units': 'units.view',
  '/approvals': 'approvals.view',
  '/notifications': 'notifications.view',
  '/profile': 'profile.view',
};

/**
 * Longest-prefix match, so `/units/UNT-014` inherits the permission of `/units`.
 * Returns null for a path this build does not serve.
 */
export function permissionForRoute(pathname: string): Permission | null {
  const path = pathname.split('?')[0].split('#')[0];
  let matched: { href: string; permission: Permission } | null = null;

  for (const [href, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (path !== href && !path.startsWith(`${href}/`)) continue;
    if (!matched || href.length > matched.href.length) matched = { href, permission };
  }

  return matched?.permission ?? null;
}

export function canAccessRoute(profile: AdminProfile | null, pathname: string): boolean {
  const permission = permissionForRoute(pathname);
  return permission !== null && hasPermission(profile, permission);
}

/**
 * Where to send this admin when no destination was asked for.
 *
 * ROLE_LANDING stays the declared intent — `finance` lands on `/payouts`. That route
 * does not exist until Phase 3 registers it above, so until it does, the resolver
 * falls back to the first route the profile can actually open. Registering `/payouts`
 * makes this correct with no edit to ROLE_LANDING and no edit here.
 */
export function landingRouteFor(profile: AdminProfile | null): string {
  if (!profile) return '/login';

  const declared = ROLE_LANDING[profile.role];
  if (declared && canAccessRoute(profile, declared)) return declared;

  const reachable = Object.keys(ROUTE_PERMISSIONS).find((href) => canAccessRoute(profile, href));
  return reachable ?? '/profile';
}

/**
 * Resolves a post-login destination: honour `?next=` when it is a local path this
 * admin may open, otherwise their landing route.
 */
export function postLoginRoute(profile: AdminProfile | null, next: string | null): string {
  const landing = landingRouteFor(profile);
  if (!next) return landing;

  // Reject anything that could leave the app: protocol-relative and absolute URLs.
  const isLocalPath = next.startsWith('/') && !next.startsWith('//');
  if (!isLocalPath || !canAccessRoute(profile, next)) return landing;

  return next;
}
