import { describe, expect, it } from 'vitest';
import { appliedSort } from './sort';
import type { Paginated } from '@/types';

function page(extra: Partial<Paginated<unknown>> = {}): Paginated<unknown> {
  return { items: [], total: 0, page: 1, pageSize: 10, ...extra };
}

describe('appliedSort', () => {
  it('shows the sort the API says it applied', () => {
    expect(appliedSort(page({ sortBy: 'total', sortDir: 'asc' }), { by: 'total', dir: 'asc' })).toEqual({
      by: 'total',
      dir: 'asc',
    });
  });

  it('drops the arrow when the API echoes null — the column was not recognised', () => {
    // The whole point: asking for `commission` and getting default order back must not
    // leave an arrow sitting on a column that did nothing.
    expect(appliedSort(page({ sortBy: null, sortDir: null }), { by: 'commission', dir: 'desc' })).toEqual({
      by: undefined,
      dir: undefined,
    });
  });

  it('keeps the requested sort when the response omits the echo entirely', () => {
    // Absent is not null: mock mode and pre-echo endpoints cannot tell us either way,
    // so falling back to `null` there would blank the arrow on a sort that works.
    expect(appliedSort(page(), { by: 'name', dir: 'asc' })).toEqual({ by: 'name', dir: 'asc' });
  });

  it('keeps the requested sort while the first page is still loading', () => {
    expect(appliedSort(null, { by: 'name', dir: 'asc' })).toEqual({ by: 'name', dir: 'asc' });
  });

  it('shows nothing when no sort was requested', () => {
    expect(appliedSort(null, null)).toEqual({ by: undefined, dir: undefined });
  });
});
