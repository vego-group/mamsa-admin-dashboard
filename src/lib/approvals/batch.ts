import { ApiError } from '@/lib/api/client';
import type { ID } from '@/types';

export interface BatchOutcome {
  /** Requests the API accepted a decision for. */
  succeeded: ID[];
  /**
   * Requests that had already left `pending_review` — someone else decided them, or a
   * stale page was acted on. Not a failure: the queue simply moved on.
   */
  alreadyDecided: ID[];
  /** Requests that genuinely failed, with the message the API gave. */
  failed: Array<{ id: ID; message: string }>;
}

/**
 * Runs one decision per request and reports what actually happened to each.
 *
 * There is no bulk endpoint, so this is N calls — and N calls fail independently. The
 * dangerous version of this function is the one that resolves to a single boolean:
 * approving 20 units and reporting "done" while 3 silently failed leaves three
 * partners waiting on a decision the admin believes they made. Every id lands in
 * exactly one bucket, and the caller is expected to show all three.
 *
 * Calls run sequentially. A queue decision writes to the public site, and firing
 * twenty writes at once at an API with no batch endpoint is how you find its rate
 * limiter during a review session.
 */
export async function runBatchDecision(
  ids: readonly ID[],
  decide: (id: ID) => Promise<unknown>,
): Promise<BatchOutcome> {
  const outcome: BatchOutcome = { succeeded: [], alreadyDecided: [], failed: [] };

  for (const id of ids) {
    try {
      await decide(id);
      outcome.succeeded.push(id);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT') {
        outcome.alreadyDecided.push(id);
        continue;
      }
      outcome.failed.push({
        id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return outcome;
}
