/**
 * Permission resolution. Pure functions, no React, no throwing — a missing profile
 * is simply "cannot", never an error.
 *
 * The API is the source of truth for what an admin may do: `AdminProfile.permissions`
 * wins whenever it is present. ROLE_PERMISSIONS is the mock's source and the fallback
 * for an API build that does not send the field yet.
 */
import {
  DEFAULT_ADMIN_ROLE,
  NARROWEST_ADMIN_ROLE,
  ROLE_PERMISSIONS,
  isAdminRole,
} from '@/lib/constants';
import type { AdminProfile, AdminRole, Permission } from '@/types';

/** What the API actually sends: a role string, and permissions only on newer builds. */
export type IncomingAdminProfile = Omit<AdminProfile, 'role' | 'permissions'> & {
  role?: string | null;
  permissions?: Permission[] | null;
};

export function permissionsOf(profile: AdminProfile | null): readonly Permission[] {
  if (!profile) return [];
  if (profile.permissions?.length) return profile.permissions;
  return ROLE_PERMISSIONS[profile.role] ?? [];
}

export function hasPermission(profile: AdminProfile | null, permission: Permission): boolean {
  return permissionsOf(profile).includes(permission);
}

export function hasAny(profile: AdminProfile | null, permissions: Permission[]): boolean {
  const granted = permissionsOf(profile);
  return permissions.some((permission) => granted.includes(permission));
}

export function hasAll(profile: AdminProfile | null, permissions: Permission[]): boolean {
  const granted = permissionsOf(profile);
  return permissions.every((permission) => granted.includes(permission));
}

function isMissingRole(role: unknown): boolean {
  return role === undefined || role === null || (typeof role === 'string' && role.trim() === '');
}

/**
 * Two different failures, two different answers — collapsing them is what makes an
 * unknown role dangerous:
 *
 * - **No role at all** is a serialization gap. Nothing was decided, and production
 *   issues superadmin sessions only, so fall back to `superadmin`.
 * - **A role this build does not know** is a decision. The backend named something in
 *   order to restrict that admin; replying with a full superadmin UI would invert its
 *   intent. Fall back to the narrowest role instead.
 *
 * Both are logged: a silent fallback here is a permission bug nobody can see.
 */
function resolveRole(rawRole: unknown): AdminRole {
  if (isAdminRole(rawRole)) return rawRole;

  if (isMissingRole(rawRole)) {
    console.error(
      '[auth] admin profile arrived with no role (%o) — falling back to %s',
      rawRole,
      DEFAULT_ADMIN_ROLE,
    );
    return DEFAULT_ADMIN_ROLE;
  }

  console.error(
    '[auth] unrecognised admin role %o — restricting to %s',
    rawRole,
    NARROWEST_ADMIN_ROLE,
  );
  return NARROWEST_ADMIN_ROLE;
}

/**
 * Fills in what the live API omits so the rest of the app can treat `role` and
 * `permissions` as guaranteed. An explicit `permissions` array from the API always
 * wins — the role map is only consulted when the API sends none.
 */
export function normalizeAdminProfile(raw: IncomingAdminProfile): AdminProfile {
  const role = resolveRole(raw.role);
  const permissions = raw.permissions?.length
    ? [...raw.permissions]
    : [...(ROLE_PERMISSIONS[role] ?? [])];

  return { ...raw, role, permissions };
}
