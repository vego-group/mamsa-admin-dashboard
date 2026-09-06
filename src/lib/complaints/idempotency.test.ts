import { afterEach, describe, expect, it, vi } from 'vitest';
import { UUID_V4_PATTERN, newIdempotencyKey } from './idempotency';

afterEach(() => vi.unstubAllGlobals());

describe('newIdempotencyKey', () => {
  it('mints a UUID v4', () => {
    expect(newIdempotencyKey()).toMatch(UUID_V4_PATTERN);
  });

  it('never repeats — each attempt is its own key', () => {
    const keys = new Set(Array.from({ length: 500 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(500);
  });

  it('still mints a well-formed v4 where crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => {
        for (let index = 0; index < array.length; index += 1) array[index] = (index * 37) % 256;
        return array;
      },
    });

    expect(newIdempotencyKey()).toMatch(UUID_V4_PATTERN);
  });

  it('falls back to Math.random with no crypto at all, still well-formed', () => {
    vi.stubGlobal('crypto', undefined);

    expect(newIdempotencyKey()).toMatch(UUID_V4_PATTERN);
  });
});
