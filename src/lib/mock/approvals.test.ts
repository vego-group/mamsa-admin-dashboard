import { describe, expect, it } from 'vitest';
import { PARTNER_TYPE, REQUEST_TYPE, REVIEW_SLA_HOURS } from '@/lib/constants';
import { waitingTime } from '@/lib/utils/format';
import { mockApprovals } from './index';

describe('mockApprovals.list', () => {
  it('serves the oldest request first so the SLA clock is respected', async () => {
    const { items } = await mockApprovals.list({ pageSize: 50 });
    const submitted = items.map((request) => new Date(request.submittedAt).getTime());

    expect(submitted).toEqual([...submitted].sort((a, b) => a - b));
  });

  it('filters by request type and partner type independently', async () => {
    const resubmissions = await mockApprovals.list({
      requestType: REQUEST_TYPE.RESUBMISSION,
      pageSize: 50,
    });
    expect(resubmissions.items.every((r) => r.requestType === REQUEST_TYPE.RESUBMISSION)).toBe(true);

    const companies = await mockApprovals.list({ partnerType: PARTNER_TYPE.COMPANY, pageSize: 50 });
    expect(companies.items.every((r) => r.partnerType === PARTNER_TYPE.COMPANY)).toBe(true);
  });

  it('carries a request type from the locked vocabulary on every row', async () => {
    const { items } = await mockApprovals.list({ pageSize: 50 });
    const allowed = Object.values(REQUEST_TYPE);

    expect(items.length).toBeGreaterThan(0);
    for (const request of items) {
      expect(allowed).toContain(request.requestType);
    }
  });

  it('grades the wait against the 24/48h review window', async () => {
    const { items } = await mockApprovals.list({ pageSize: 50 });

    for (const request of items) {
      const wait = waitingTime(request.submittedAt);
      const expected =
        wait.hours >= REVIEW_SLA_HOURS.breach
          ? 'breach'
          : wait.hours >= REVIEW_SLA_HOURS.warn
            ? 'warn'
            : 'ok';

      expect(wait.severity).toBe(expected);
    }
  });
});

describe('mockApprovals.stats', () => {
  it('echoes the range it answered for, so the client can trust the captions', async () => {
    for (const range of ['today', '7d', '30d'] as const) {
      expect((await mockApprovals.stats(range)).range).toBe(range);
    }
  });

  it('widens the decision counts as the window widens', async () => {
    const [today, week, month] = await Promise.all([
      mockApprovals.stats('today'),
      mockApprovals.stats('7d'),
      mockApprovals.stats('30d'),
    ]);

    const decided = (stats: { approved?: number; rejected?: number }) =>
      (stats.approved ?? 0) + (stats.rejected ?? 0);

    expect(decided(today)).toBeLessThanOrEqual(decided(week));
    expect(decided(week)).toBeLessThanOrEqual(decided(month));
    // A switch nothing ever moves is the bug this whole range exists to avoid.
    expect(decided(month)).toBeGreaterThan(decided(today));
  });

  it('holds queue depth outside the range — pending is now, not a window', async () => {
    const [today, month] = await Promise.all([
      mockApprovals.stats('today'),
      mockApprovals.stats('30d'),
    ]);

    expect(today.pendingReview).toBe(month.pendingReview);
  });

  it('reports a measured average when the window contains decisions', async () => {
    const month = await mockApprovals.stats('30d');

    expect(month.avgReviewHours).toBeGreaterThan(0);
  });

  it('keeps the sample size consistent with the average it reports', async () => {
    for (const range of ['today', '7d', '30d'] as const) {
      const stats = await mockApprovals.stats(range);

      // The contract runs both ways: a null average always has a sample of 0, and any
      // sample above zero must have produced a number.
      if (stats.avgReviewHours === null) expect(stats.avgReviewSample).toBe(0);
      else expect(stats.avgReviewSample).toBeGreaterThan(0);
    }
  });

  it('answers null — not zero — for a window with nothing to average', async () => {
    // The deployed API sends null for an empty sample; a mock that sends 0 would render
    // as "< 1h" in development and hide the case the UI must handle.
    const empty = await mockApprovals.stats('today');
    const decisions = empty.approved! + empty.rejected!;

    if (decisions === 0) expect(empty.avgReviewHours).toBeNull();
    else expect(empty.avgReviewHours).toBeGreaterThan(0);
  });
});
