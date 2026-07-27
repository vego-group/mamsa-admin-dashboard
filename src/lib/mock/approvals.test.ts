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
