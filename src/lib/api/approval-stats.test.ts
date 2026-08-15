/**
 * The approvals counters are read against two API generations at once: the deployed
 * one that only knows "today", and the range-aware one that replaces it. The page
 * decides whether to offer a range switch purely from `rangeSupported`, so getting
 * that flag wrong mislabels real numbers — hence the asserts below.
 */
import { describe, expect, it } from 'vitest';
import { normalizeApprovalStats } from './resources';

describe('normalizeApprovalStats', () => {
  it('reads the legacy today-only shape and reports the range as unsupported', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 3,
      approvedToday: 1,
      rejectedToday: 0,
      avgReviewHours: 90.6,
    });

    expect(stats).toEqual({
      pendingReview: 3,
      approved: 1,
      rejected: 0,
      avgReviewHours: 90.6,
      avgReviewSample: null,
      rangeSupported: false,
    });
  });

  it('reads the range-aware shape and reports the range as supported', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 94,
      approved: 31,
      rejected: 9,
      avgReviewHours: 14.2,
      avgReviewSample: 40,
      range: '30d',
    });

    expect(stats).toEqual({
      pendingReview: 94,
      approved: 31,
      rejected: 9,
      avgReviewHours: 14.2,
      avgReviewSample: 40,
      rangeSupported: true,
    });
  });

  it('trusts the new keys over the legacy ones when a response carries both', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 94,
      approved: 31,
      rejected: 9,
      approvedToday: 2,
      rejectedToday: 1,
      avgReviewHours: 14.2,
      range: '30d',
    });

    expect(stats.approved).toBe(31);
    expect(stats.rejected).toBe(9);
  });

  it('keeps a null average null — "no sample" must never become "instant"', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 1,
      approved: 2,
      rejected: 1,
      avgReviewHours: null,
      range: 'today',
    });

    // A numeric fallback here renders as "< 1h", i.e. the absence of data shown as the
    // healthiest possible figure — the failure this whole field exists to avoid.
    expect(stats.avgReviewHours).toBeNull();
  });

  it('distinguishes a genuine zero average from no data at all', () => {
    const measured = normalizeApprovalStats({
      pendingReview: 0,
      approved: 1,
      rejected: 0,
      avgReviewHours: 0,
      range: 'today',
    });

    expect(measured.avgReviewHours).toBe(0);
  });

  it('treats an omitted average as no data rather than zero', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 3,
      approvedToday: 1,
      rejectedToday: 0,
    } as never);

    expect(stats.avgReviewHours).toBeNull();
  });

  it('carries the sample size so a null average can explain itself', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 1,
      approved: 6,
      rejected: 1,
      avgReviewHours: null,
      avgReviewSample: 0,
      range: '30d',
    });

    // Seven decisions and none measurable: without the sample, the screen reads as
    // "6 approved" beside "no average" with nothing reconciling the two.
    expect(stats.avgReviewSample).toBe(0);
    expect(stats.approved + stats.rejected).toBe(7);
  });

  it('reports an absent sample as null, not as a measured zero', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 1,
      approved: 3,
      rejected: 0,
      avgReviewHours: 12,
      range: '7d',
    });

    // An API that predates the field has not told us the sample is 0 — it has told us
    // nothing, and the caption must not claim "based on 0 of 3".
    expect(stats.avgReviewSample).toBeNull();
  });

  it('counts a zero decision day as supported when the range is echoed', () => {
    const stats = normalizeApprovalStats({
      pendingReview: 94,
      approved: 0,
      rejected: 0,
      avgReviewHours: 0,
      range: 'today',
    });

    expect(stats.rangeSupported).toBe(true);
  });
});
