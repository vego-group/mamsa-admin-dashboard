import { describe, expect, it } from 'vitest';
import { formatRiyadhDate, formatRiyadhDateTime } from './dates';

describe('Riyadh date rendering', () => {
  it('renders DD/MM/YYYY in Riyadh, not in UTC', () => {
    // 22:30 UTC on 31 July is already 01:30 on 1 August in Riyadh.
    expect(formatRiyadhDate('2026-07-31T22:30:00.000Z')).toBe('01/08/2026');
    expect(formatRiyadhDateTime('2026-07-31T22:30:00.000Z')).toBe('01/08/2026 01:30');
  });

  it('uses a 24-hour clock with a two-digit midnight', () => {
    // 21:00 UTC is exactly midnight in Riyadh — the case `hour12: false` renders as 24:00.
    expect(formatRiyadhDateTime('2026-07-31T21:00:00.000Z')).toBe('01/08/2026 00:00');
    expect(formatRiyadhDateTime('2026-07-27T09:05:00.000Z')).toBe('27/07/2026 12:05');
  });

  it('renders a dash for a missing or unparseable value', () => {
    expect(formatRiyadhDate(null)).toBe('—');
    expect(formatRiyadhDate(undefined)).toBe('—');
    expect(formatRiyadhDate('not-a-date')).toBe('—');
    expect(formatRiyadhDateTime('')).toBe('—');
  });
});
