import { describe, expect, it } from 'vitest';
import { formatHalalas, halalasToInput, parseSarToHalalas } from './money';

describe('formatHalalas', () => {
  it('divides by 100 and always shows two decimals', () => {
    expect(formatHalalas(100000)).toBe('1,000.00 SAR');
    expect(formatHalalas(13043)).toBe('130.43 SAR');
    expect(formatHalalas(8696)).toBe('86.96 SAR');
    expect(formatHalalas(0)).toBe('0.00 SAR');
  });

  it('degrades to zero on a non-number', () => {
    expect(formatHalalas(Number.NaN)).toBe('0.00 SAR');
  });
});

describe('halalasToInput', () => {
  it('produces the plain input value', () => {
    expect(halalasToInput(100050)).toBe('1000.50');
    expect(halalasToInput(5)).toBe('0.05');
  });
});

describe('parseSarToHalalas', () => {
  it('parses whole and fractional SAR into integer halalas', () => {
    expect(parseSarToHalalas('1000')).toBe(100000);
    expect(parseSarToHalalas('1000.5')).toBe(100050);
    expect(parseSarToHalalas('1000.50')).toBe(100050);
    expect(parseSarToHalalas('.5')).toBe(50);
    expect(parseSarToHalalas('12.')).toBe(1200);
  });

  it('drops grouping separators and accepts Arabic-Indic digits and the Arabic decimal mark', () => {
    expect(parseSarToHalalas('1,000.50')).toBe(100050);
    expect(parseSarToHalalas('٣٥٠٫٧٥')).toBe(35075);
    expect(parseSarToHalalas('١٬٢٠٠')).toBe(120000);
    expect(parseSarToHalalas(' 250 ')).toBe(25000);
  });

  /**
   * Rejected, not rounded: an amount with sub-halala precision would be approved at a
   * figure the admin never saw.
   */
  it('rejects more than two decimals, signs and anything that is not an amount', () => {
    expect(parseSarToHalalas('12.345')).toBeNull();
    expect(parseSarToHalalas('-5')).toBeNull();
    expect(parseSarToHalalas('abc')).toBeNull();
    expect(parseSarToHalalas('')).toBeNull();
    expect(parseSarToHalalas('1e3')).toBeNull();
    expect(parseSarToHalalas('1.2.3')).toBeNull();
  });
});
