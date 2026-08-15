/**
 * A batch decision is N independent writes against an API with no batch endpoint, so
 * partial failure is the normal case, not the edge case. Every assertion here exists to
 * stop the same class of bug: the UI reporting a decision that never reached the server,
 * which leaves a partner waiting on an approval the admin believes they granted.
 */
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { runBatchDecision } from './batch';

describe('runBatchDecision', () => {
  it('reports every id as applied when the API accepts them all', async () => {
    const outcome = await runBatchDecision(['a', 'b', 'c'], () => Promise.resolve({ ok: true }));

    expect(outcome.succeeded).toEqual(['a', 'b', 'c']);
    expect(outcome.alreadyDecided).toEqual([]);
    expect(outcome.failed).toEqual([]);
  });

  it('keeps going after a failure instead of abandoning the rest of the batch', async () => {
    const outcome = await runBatchDecision(['a', 'b', 'c'], (id) =>
      id === 'b' ? Promise.reject(new Error('boom')) : Promise.resolve({ ok: true }),
    );

    expect(outcome.succeeded).toEqual(['a', 'c']);
    expect(outcome.failed).toEqual([{ id: 'b', message: 'boom' }]);
  });

  it('separates an already-decided request from a real failure', async () => {
    const outcome = await runBatchDecision(['a', 'b'], (id) =>
      id === 'a'
        ? Promise.reject(new ApiError('no longer pending', 409, 'CONFLICT'))
        : Promise.reject(new ApiError('server exploded', 500, 'INTERNAL')),
    );

    expect(outcome.alreadyDecided).toEqual(['a']);
    expect(outcome.succeeded).toEqual([]);
    expect(outcome.failed).toEqual([{ id: 'b', message: 'server exploded' }]);
  });

  it('accounts for every id exactly once, so nothing is silently dropped', async () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const outcome = await runBatchDecision(ids, (id) => {
      if (id === 'b') return Promise.reject(new ApiError('gone', 409, 'CONFLICT'));
      if (id === 'd') return Promise.reject(new Error('nope'));
      return Promise.resolve({ ok: true });
    });

    const accounted = [
      ...outcome.succeeded,
      ...outcome.alreadyDecided,
      ...outcome.failed.map((failure) => failure.id),
    ];

    expect(accounted.sort()).toEqual(ids);
  });

  it('issues the calls one at a time rather than flooding the API', async () => {
    let inFlight = 0;
    let peak = 0;

    await runBatchDecision(['a', 'b', 'c', 'd'], async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      inFlight -= 1;
    });

    expect(peak).toBe(1);
  });

  it('does nothing at all on an empty selection', async () => {
    const decide = vi.fn();
    const outcome = await runBatchDecision([], decide);

    expect(decide).not.toHaveBeenCalled();
    expect(outcome).toEqual({ succeeded: [], alreadyDecided: [], failed: [] });
  });
});
