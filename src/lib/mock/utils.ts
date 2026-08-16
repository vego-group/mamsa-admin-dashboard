import type { ListParams, Paginated } from '@/types';

/**
 * Visible-but-brief delay so loading states are exercised during UI work.
 *
 * Callers signal a mock error as `delay(Promise.reject(err))`, which builds the rejected
 * promise **now** and hands it over unhandled until the timer fires — long enough for
 * Node to report an unhandled rejection and fail a run that is otherwise green. Adopting
 * it immediately marks it handled; the rejection still surfaces to whoever awaits the
 * returned promise, because `resolve` adopts the same settled state.
 */
export function delay<T>(value: T, ms = 200 + Math.random() * 200): Promise<T> {
  if (value instanceof Promise) value.catch(() => undefined);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function paginate<T>(items: T[], params: ListParams | undefined): Paginated<T> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export function matches(haystack: Array<string | null | undefined>, needle?: string): boolean {
  if (!needle?.trim()) return true;
  const q = needle.trim().toLowerCase();
  return haystack.some((value) => value?.toLowerCase().includes(q));
}

export function sortBy<T>(items: T[], key: keyof T | undefined, dir: 'asc' | 'desc' = 'desc'): T[] {
  if (!key) return items;
  return [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av;
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}

/** Deterministic pseudo-random so the seed is stable between reloads. */
export function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function daysAgo(days: number, hours = 0): string {
  const date = new Date(BASE_NOW);
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

export function daysAhead(days: number): string {
  const date = new Date(BASE_NOW);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/** Fixed reference point keeps the seed reproducible across sessions. */
export const BASE_NOW = new Date('2026-07-27T09:00:00.000Z');
