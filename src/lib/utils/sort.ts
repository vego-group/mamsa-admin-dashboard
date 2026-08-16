import type { Paginated } from '@/types';

export interface SortState {
  by: string;
  dir: 'asc' | 'desc';
}

/**
 * Which column the table should show an arrow on: the sort the **API says it applied**,
 * not the one we asked for.
 *
 * An unrecognised `sortBy` is not rejected — the list comes back in default order, which
 * is indistinguishable from a sort that ran. That is how a `commission` sort on bookings
 * survived for months looking like it worked. Since 2026-08-16 every list endpoint echoes
 * `sortBy`/`sortDir` and answers `null` when it did not recognise the column, so reading
 * the echo makes an unsupported sort *visibly* do nothing instead of invisibly doing
 * nothing.
 *
 * Falls back to the requested sort when the response omits the fields altogether — mock
 * mode, and any endpoint deployed before the echo. Absent and `null` are different
 * claims: absent means "this API cannot tell us", `null` means "we ignored you".
 */
export function appliedSort<T>(
  result: Paginated<T> | null,
  requested: SortState | null,
): { by?: string; dir?: 'asc' | 'desc' } {
  if (!result || !('sortBy' in result)) {
    return { by: requested?.by, dir: requested?.dir };
  }

  return { by: result.sortBy ?? undefined, dir: result.sortDir ?? undefined };
}
