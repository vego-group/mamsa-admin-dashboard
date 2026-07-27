/**
 * LOCKED PLATFORM RULES — regression suite.
 *
 * Every assertion here is a business decision, not an implementation detail. If one
 * of these tests fails, a locked rule has been broken — fix the code, never the test,
 * and never without a product decision.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BOOKING_STATUS,
  OTP_LENGTH,
  PARTNER_SHARE_RATE,
  PLATFORM_COMMISSION_RATE,
  REFUND_STATUS,
  UNIT_STATUS,
} from '@/lib/constants';
import { splitCommission, splitForUnit } from '@/lib/utils/format';
import { bookings, POLICY_PRESETS } from '@/lib/mock/seed';

describe('commission — 2%, never 10%', () => {
  it('locks the split rates and their sum', () => {
    expect(PLATFORM_COMMISSION_RATE).toBe(0.02);
    expect(PARTNER_SHARE_RATE).toBe(0.98);
    expect(PLATFORM_COMMISSION_RATE + PARTNER_SHARE_RATE).toBe(1);
  });

  it('splits 4,200 SAR into 84 commission and 4,116 partner share', () => {
    expect(splitCommission(4200)).toEqual({ total: 4200, commission: 84, partnerShare: 4116 });
  });

  it('gives the platform everything and the partner nothing on Mamsa-owned units', () => {
    const split = splitForUnit(4200, true);
    expect(split.commission).toBe(split.total);
    expect(split.partnerShare).toBe(0);
  });

  it('sums commission + partnerShare back to total exactly for every seeded booking', () => {
    expect(bookings.length).toBeGreaterThan(0);
    for (const booking of bookings) {
      expect(booking.commission + booking.partnerShare).toBe(booking.total);
    }
  });

  it('keeps every seeded booking on the locked rate', () => {
    for (const booking of bookings) {
      if (booking.mamsaOwned) {
        // No partner split: the platform keeps the full amount.
        expect(booking.commission).toBe(booking.total);
        expect(booking.partnerShare).toBe(0);
      } else {
        // Within a cent of 2% — rounding is the only tolerated deviation.
        expect(
          Math.abs(booking.commission - booking.total * PLATFORM_COMMISSION_RATE),
        ).toBeLessThanOrEqual(0.01);
      }
    }
  });
});

describe('status vocabularies', () => {
  it('bookings have exactly four statuses, never approved or bare pending', () => {
    const values = Object.values(BOOKING_STATUS);
    expect(values).toHaveLength(4);
    expect(values).not.toContain('approved');
    expect(values).not.toContain('pending');
    expect(values.sort()).toEqual(['cancelled', 'completed', 'confirmed', 'pending_payment']);
  });

  it('units have exactly four lifecycle statuses and no separate published state', () => {
    const values = Object.values(UNIT_STATUS);
    expect(values).toHaveLength(4);
    expect(values).not.toContain('published');
    expect(values.sort()).toEqual(['approved', 'draft', 'pending_review', 'rejected']);
  });

  it('refunds know failed but never pending', () => {
    const values = Object.values(REFUND_STATUS);
    expect(values).toContain('failed');
    expect(values).not.toContain('pending');
  });
});

describe('authentication — OTP only', () => {
  it('locks the OTP length at 6', () => {
    expect(OTP_LENGTH).toBe(6);
  });
});

describe('cancellation policy — days, and frozen', () => {
  const presets = Object.entries(POLICY_PRESETS);

  it('has three presets', () => {
    expect(presets).toHaveLength(3);
  });

  it('expresses every tier in days, never hours', () => {
    for (const [, tiers] of presets) {
      for (const tier of tiers) {
        expect(tier.label).not.toMatch(/\d+\s*h(ours?)?\b/i);
      }
    }
  });

  it('carries the platform percentages per preset', () => {
    const percentages = Object.fromEntries(
      presets.map(([name, tiers]) => [name, tiers.map((tier) => tier.refundPercent)]),
    );
    expect(percentages).toEqual({
      flexible: [100, 75, 50, 0],
      moderate: [100, 50, 25, 0],
      strict: [75, 25, 0, 0],
    });
  });

  it('descends to zero in every preset', () => {
    for (const [, tiers] of presets) {
      for (let index = 1; index < tiers.length; index += 1) {
        expect(tiers[index].refundPercent).toBeLessThanOrEqual(tiers[index - 1].refundPercent);
      }
      expect(tiers[tiers.length - 1].refundPercent).toBe(0);
    }
  });
});

describe('source guard — forbidden concepts stay out of the UI', () => {
  const SRC_ROOT = path.resolve(__dirname, '../..');
  // i18n is included because that is where UI copy actually lives.
  const GUARDED_DIRS = ['components', 'app', 'i18n'].map((dir) => path.join(SRC_ROOT, dir));

  /** Substrings (or regexes) that indicate a rule violation crept back in. */
  const FORBIDDEN: Array<{ label: string; pattern: RegExp }> = [
    { label: 'Change Password', pattern: /Change Password/ },
    { label: 'Two-Factor', pattern: /Two-Factor/ },
    { label: 'Authenticator', pattern: /Authenticator/ },
    { label: 'Batch Review', pattern: /Batch Review/ },
    { label: 'AED', pattern: /\bAED\b/ },
    { label: '(10%)', pattern: /\(10%\)/ },
    { label: 'High Priority', pattern: /High Priority/ },
  ];

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) return sourceFiles(full);
      return /\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry) ? [full] : [];
    });
  }

  it('finds none of the forbidden strings in components, app or i18n', () => {
    const offenders: string[] = [];

    for (const dir of GUARDED_DIRS) {
      for (const file of sourceFiles(dir)) {
        const content = readFileSync(file, 'utf8');
        for (const { label, pattern } of FORBIDDEN) {
          if (pattern.test(content)) {
            offenders.push(`${path.relative(SRC_ROOT, file)} contains "${label}"`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
