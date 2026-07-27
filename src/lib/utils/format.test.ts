import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatPhone,
  formatSAR,
  nightsBetween,
  splitCommission,
  splitForUnit,
  waitingTime,
} from './format';

describe('formatSAR', () => {
  it('groups thousands and suffixes SAR', () => {
    expect(formatSAR(4200)).toBe('4,200 SAR');
    expect(formatSAR(0)).toBe('0 SAR');
  });

  it('keeps two decimals only when there is a fraction', () => {
    expect(formatSAR(84)).toBe('84 SAR');
    expect(formatSAR(84.44)).toBe('84.44 SAR');
  });

  it('compacts large figures on request', () => {
    expect(formatSAR(1_600_000, { compact: true })).toBe('1.6M SAR');
    expect(formatSAR(39_000, { compact: true })).toBe('39K SAR');
  });
});

describe('formatDate', () => {
  it('renders Gregorian DD/MM/YYYY', () => {
    expect(formatDate('2024-03-15T00:00:00.000Z')).toBe('15/03/2024');
  });

  it('degrades gracefully on bad input', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});

describe('formatPhone', () => {
  it('formats a Saudi mobile', () => {
    expect(formatPhone('+966501234567')).toBe('+966 50 123 4567');
    expect(formatPhone('966551234567')).toBe('+966 55 123 4567');
  });
});

describe('splitCommission', () => {
  it('splits 2% / 98%', () => {
    expect(splitCommission(4200)).toEqual({
      total: 4200,
      commission: 84,
      partnerShare: 4116,
    });
  });

  it('always sums back to the total', () => {
    for (const total of [1, 99.99, 850, 2222, 6500, 487_000]) {
      const { commission, partnerShare } = splitCommission(total);
      expect(Math.round((commission + partnerShare) * 100) / 100).toBe(
        Math.round(total * 100) / 100,
      );
    }
  });
});

describe('splitForUnit', () => {
  it('gives the platform everything for Mamsa-owned units', () => {
    expect(splitForUnit(1000, true)).toEqual({
      total: 1000,
      commission: 1000,
      partnerShare: 0,
    });
  });

  it('falls back to the 2% split for partner units', () => {
    expect(splitForUnit(1000, false)).toEqual({
      total: 1000,
      commission: 20,
      partnerShare: 980,
    });
  });
});

describe('waitingTime', () => {
  const now = new Date('2024-03-20T12:00:00.000Z');

  it('grades against the 24/48h SLA', () => {
    expect(waitingTime('2024-03-20T06:00:00.000Z', now).severity).toBe('ok');
    expect(waitingTime('2024-03-19T06:00:00.000Z', now).severity).toBe('warn');
    expect(waitingTime('2024-03-18T06:00:00.000Z', now).severity).toBe('breach');
  });
});

describe('nightsBetween', () => {
  it('counts nights', () => {
    expect(nightsBetween('2024-03-15', '2024-03-18')).toBe(3);
  });
});
