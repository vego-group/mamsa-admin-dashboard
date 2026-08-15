/**
 * LOCKED PERMISSION MODEL — regression suite.
 *
 * Frontend gating is UX; the backend enforces the same rules server-side. These tests
 * exist so the UX layer cannot silently drift away from the contract — above all the
 * segregation of duties that keeps `payouts.reverse` out of the finance role.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ALL_PERMISSIONS,
  NARROWEST_ADMIN_ROLE,
  ROLE_LANDING,
  ROLE_PERMISSIONS,
} from '@/lib/constants';
import { NAV_GROUPS } from '@/components/layout/nav-items';
import type { AdminProfile, Permission } from '@/types';
import { hasAll, hasAny, hasPermission, normalizeAdminProfile } from './permissions';
import { ROUTE_PERMISSIONS, canAccessRoute, landingRouteFor, postLoginRoute } from './routes';

/**
 * Written out by hand on purpose. `satisfies Record<Permission, true>` fails to compile
 * when a permission is added to the union and not listed here, so a new permission
 * cannot reach production unassigned.
 */
const EVERY_PERMISSION = {
  'dashboard.view': true,
  'users.view': true,
  'users.manage': true,
  'partners.view': true,
  'partners.manage': true,
  'units.view': true,
  'units.manage': true,
  'approvals.view': true,
  'approvals.manage': true,
  'bookings.view': true,
  'cancellations.view': true,
  'cancellations.manage': true,
  'wallets.view': true,
  'wallets.adjust': true,
  'payouts.view': true,
  'payouts.execute': true,
  'payouts.reverse': true,
  'payouts.manage': true,
  'reports.financial': true,
  'reports.operational': true,
  'notifications.view': true,
  'profile.view': true,
} satisfies Record<Permission, true>;

const EVERY_PERMISSION_LIST = Object.keys(EVERY_PERMISSION) as Permission[];

const FINANCE_GRANTS: Permission[] = [
  'partners.view',
  'bookings.view',
  'cancellations.view',
  'wallets.view',
  'payouts.view',
  'payouts.execute',
  'reports.financial',
  'notifications.view',
  'profile.view',
];

/** Every capability finance must never hold, whatever else changes. */
const FINANCE_DENIALS: Permission[] = [
  'users.view',
  'users.manage',
  'units.manage',
  'approvals.manage',
  'payouts.reverse',
  'payouts.manage',
  'wallets.adjust',
  'partners.manage',
  'dashboard.view',
  'reports.operational',
];

function profile(overrides: Partial<AdminProfile> = {}): AdminProfile {
  return {
    id: 'adm_test',
    name: 'Test Admin',
    email: 'test@mamsa.sa',
    phone: '+966500000000',
    role: 'superadmin',
    permissions: [...ROLE_PERMISSIONS.superadmin],
    verified: true,
    memberSince: '2024-01-01T00:00:00.000Z',
    totalReviews: 0,
    actionsToday: 0,
    preferredLocale: 'ar',
    ...overrides,
  };
}

const superadmin = profile();
const finance = profile({
  id: 'adm_finance',
  role: 'finance',
  permissions: [...ROLE_PERMISSIONS.finance],
});

describe('superadmin holds the whole union', () => {
  it('is granted every member of Permission, checked against a literal list', () => {
    expect([...ROLE_PERMISSIONS.superadmin].sort()).toEqual([...EVERY_PERMISSION_LIST].sort());
  });

  it('keeps ALL_PERMISSIONS and the literal list in step', () => {
    expect([...ALL_PERMISSIONS].sort()).toEqual([...EVERY_PERMISSION_LIST].sort());
  });

  it('can do everything', () => {
    for (const permission of EVERY_PERMISSION_LIST) {
      expect(hasPermission(superadmin, permission)).toBe(true);
    }
    expect(hasAll(superadmin, EVERY_PERMISSION_LIST)).toBe(true);
  });
});

describe('finance is exactly nine permissions', () => {
  it('holds all nine of its listed grants', () => {
    expect([...ROLE_PERMISSIONS.finance].sort()).toEqual([...FINANCE_GRANTS].sort());
    for (const permission of FINANCE_GRANTS) {
      expect(hasPermission(finance, permission)).toBe(true);
    }
    expect(hasAll(finance, FINANCE_GRANTS)).toBe(true);
  });

  it('holds none of the denied permissions', () => {
    for (const permission of FINANCE_DENIALS) {
      expect(hasPermission(finance, permission)).toBe(false);
    }
    expect(hasAny(finance, FINANCE_DENIALS)).toBe(false);
  });

  it('records transfers but can never reverse one', () => {
    expect(hasPermission(finance, 'payouts.execute')).toBe(true);
    expect(hasPermission(finance, 'payouts.reverse')).toBe(false);
    expect(hasPermission(finance, 'payouts.manage')).toBe(false);
  });
});

describe('a missing profile can do nothing', () => {
  it('returns false for every permission and never throws', () => {
    for (const permission of EVERY_PERMISSION_LIST) {
      expect(hasPermission(null, permission)).toBe(false);
    }
    expect(hasAny(null, EVERY_PERMISSION_LIST)).toBe(false);
    expect(hasAll(null, EVERY_PERMISSION_LIST)).toBe(false);
    expect(hasAll(null, [])).toBe(true);
  });
});

describe('profile normalisation — the API is the source of truth', () => {
  const raw = {
    ...profile(),
    role: 'finance',
    permissions: undefined,
  };

  it('falls back to the role map when the API omits permissions', () => {
    const normalized = normalizeAdminProfile({ ...raw, permissions: null });
    expect(normalized.role).toBe('finance');
    expect([...normalized.permissions].sort()).toEqual([...FINANCE_GRANTS].sort());
  });

  it('prefers the permissions the API sent over the role map', () => {
    const normalized = normalizeAdminProfile({ ...raw, permissions: ['bookings.view'] });
    expect(normalized.permissions).toEqual(['bookings.view']);
  });
});

/**
 * The two fallbacks answer different questions. A missing role means nothing was
 * decided; an unknown role means the backend decided to restrict someone. Collapsing
 * them into one answer is what would hand a restricted admin the full console.
 */
describe('unresolvable roles fall back in two directions', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => consoleError.mockClear());

  it('is finance that is currently the narrowest known role', () => {
    expect(NARROWEST_ADMIN_ROLE).toBe('finance');
  });

  it('restricts an unrecognised role to the narrowest permission set', () => {
    const normalized = normalizeAdminProfile({
      ...profile(),
      role: 'support',
      permissions: null,
    });

    expect(normalized.role).toBe('finance');
    expect([...normalized.permissions].sort()).toEqual([...FINANCE_GRANTS].sort());
    expect(hasPermission(normalized, 'users.manage')).toBe(false);
    expect(hasPermission(normalized, 'payouts.reverse')).toBe(false);
  });

  it('logs the unrecognised value rather than restricting silently', () => {
    normalizeAdminProfile({ ...profile(), role: 'support', permissions: null });

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0]).toContain('support');
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty', ''],
    ['whitespace', '   '],
  ])('treats a %s role as a serialization gap and allows superadmin', (_label, value) => {
    const normalized = normalizeAdminProfile({
      ...profile(),
      role: value,
      permissions: null,
    });

    expect(normalized.role).toBe('superadmin');
    expect([...normalized.permissions].sort()).toEqual([...EVERY_PERMISSION_LIST].sort());
    expect(hasPermission(normalized, 'users.manage')).toBe(true);
  });

  it('logs the missing value too', () => {
    normalizeAdminProfile({ ...profile(), role: undefined, permissions: null });

    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});

describe('route registry', () => {
  it('gives every nav item a permission that matches the registry', () => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        expect(ROUTE_PERMISSIONS[item.href]).toBe(item.permission);
      }
    }
  });

  it('covers every registered route with a nav item', () => {
    const navHrefs = NAV_GROUPS.flatMap((group) => group.items).map((item) => item.href);
    expect([...Object.keys(ROUTE_PERMISSIONS)].sort()).toEqual([...navHrefs].sort());
  });

  it('inherits the parent permission on a detail route', () => {
    expect(canAccessRoute(superadmin, '/units/UNT-014')).toBe(true);
    expect(canAccessRoute(finance, '/units/UNT-014')).toBe(false);
  });

  it('denies a route this build does not serve', () => {
    expect(canAccessRoute(superadmin, '/audit-log')).toBe(false);
  });
});

describe('landing routes', () => {
  it('keeps the declared landing constants', () => {
    expect(ROLE_LANDING).toEqual({ superadmin: '/overview', finance: '/payouts' });
  });

  it('sends superadmin to its declared landing route', () => {
    expect(landingRouteFor(superadmin)).toBe('/overview');
  });

  /**
   * Phase 3 registered `/payouts`, and this expectation flipped on its own — no edit to
   * ROLE_LANDING and none to the resolver, which is what the fallback was designed for.
   */
  it('sends finance to its declared landing route now that /payouts is registered', () => {
    expect(ROUTE_PERMISSIONS['/payouts']).toBe('payouts.view');
    expect(landingRouteFor(finance)).toBe(ROLE_LANDING.finance);
    expect(landingRouteFor(finance)).toBe('/payouts');
  });

  it('still falls back to a reachable route when a declared landing is unregistered', () => {
    // The mechanism itself, exercised against a role whose landing this build cannot serve.
    const stranded = profile({ role: 'finance', permissions: ['partners.view'] });
    expect(canAccessRoute(stranded, ROLE_LANDING.finance)).toBe(false);
    expect(landingRouteFor(stranded)).toBe('/partners');
  });

  it('never lands an admin on a page they would be forbidden from', () => {
    expect(canAccessRoute(superadmin, landingRouteFor(superadmin))).toBe(true);
  });
});

describe('post-login destination', () => {
  it('honours ?next= when the admin may open it', () => {
    expect(postLoginRoute(superadmin, '/users')).toBe('/users');
    expect(postLoginRoute(finance, '/bookings')).toBe('/bookings');
  });

  it('ignores ?next= the admin may not open', () => {
    expect(postLoginRoute(finance, '/users')).toBe('/payouts');
    expect(postLoginRoute(finance, '/audit-log')).toBe('/payouts');
  });

  it('ignores a destination that would leave the app', () => {
    expect(postLoginRoute(superadmin, '//evil.example.com')).toBe('/overview');
    expect(postLoginRoute(superadmin, 'https://evil.example.com')).toBe('/overview');
  });

  it('falls back to the landing route with no ?next=', () => {
    expect(postLoginRoute(superadmin, null)).toBe('/overview');
  });
});
