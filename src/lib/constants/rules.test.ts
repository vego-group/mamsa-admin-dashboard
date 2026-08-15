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
  PAYOUT_MIN_BALANCE,
  PAYOUT_STATUS,
  PLATFORM_COMMISSION_RATE,
  REFUND_STATUS,
  UNIT_STATUS,
  VAT_RATE,
} from '@/lib/constants';
import { splitCommission, splitForUnit, splitPrice, splitPriceForUnit } from '@/lib/utils/format';
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

  /**
   * CHANGED DELIBERATELY — src/lib/constants/rules.test.ts, 2026-08-13, owner-approved.
   *
   * This used to assert `commission + partnerShare === total`. That predates VAT
   * separation and is now mathematically impossible: `total` is VAT-inclusive and
   * decomposes into `netBase + vat`, so commission and partnerShare sum to `netBase`,
   * never to `total`. The identity below is the same rule stated correctly — do not
   * "restore" the two-way version.
   */
  it('sums commission + partnerShare + VAT back to the gross for every seeded booking', () => {
    expect(bookings.length).toBeGreaterThan(0);

    // Each part is exact to the halala; only their *addition* is not representable in
    // binary (0.58 + 28.4 → 28.979999999999997). Rounding the sum compares money at the
    // precision money has — it does not weaken the identity.
    const sum2 = (...parts: number[]) =>
      Math.round((parts.reduce((a, b) => a + b, 0) + Number.EPSILON) * 100) / 100;

    for (const booking of bookings) {
      expect(sum2(booking.commission, booking.partnerShare, booking.vat)).toBe(booking.total);
      expect(sum2(booking.netBase, booking.vat)).toBe(booking.total);
      expect(sum2(booking.commission, booking.partnerShare)).toBe(booking.netBase);
    }
  });

  it('keeps every seeded booking on the locked rate, charged on the net base', () => {
    for (const booking of bookings) {
      if (booking.mamsaOwned) {
        // No partner split: the platform keeps the whole base. VAT is still not revenue.
        expect(booking.commission).toBe(booking.netBase);
        expect(booking.partnerShare).toBe(0);
      } else {
        // 2% of netBase, never of the gross — VAT is collected for ZATCA, not earned.
        expect(
          Math.abs(booking.commission - booking.netBase * PLATFORM_COMMISSION_RATE),
        ).toBeLessThanOrEqual(0.01);
      }
    }
  });
});

describe('VAT — 15%, and the guest price already contains it', () => {
  /**
   * The invariant that matters. It holds only because `partnerShare` is derived by
   * SUBTRACTION; computing it as `netBase * 0.98` lets the halves miss each other by a
   * halala at exactly the values a real booking produces.
   */
  const GROSS_VALUES = [
    0.01, 1, 33.33, 100, 999.99, 1000, 1234.56, 2550, 4310.75, 7777.77, 16000, 100000,
  ];

  it('locks the rate and the payout floor', () => {
    expect(VAT_RATE).toBe(0.15);
    expect(PAYOUT_MIN_BALANCE).toBe(2000);
  });

  it('splits every gross value back to itself exactly', () => {
    expect(GROSS_VALUES.length).toBeGreaterThanOrEqual(12);

    // The locked rule is the three-way sum; it holds exactly. The two decomposition
    // checks below are rounded because adding two 2-decimal floats can land a machine
    // epsilon off (0.58 + 28.4 → 28.979999999999997) — an artifact of binary floats,
    // not of the split.
    const sum2 = (...parts: number[]) =>
      Math.round((parts.reduce((a, b) => a + b, 0) + Number.EPSILON) * 100) / 100;

    for (const gross of GROSS_VALUES) {
      const { netBase, vat, commission, partnerShare } = splitPrice(gross);

      expect(commission + partnerShare + vat).toBe(gross);
      expect(sum2(commission, partnerShare)).toBe(netBase);
      expect(sum2(netBase, vat)).toBe(gross);
    }
  });

  it('charges commission on the net base, never on the gross', () => {
    const { netBase, commission } = splitPrice(1150);
    expect(netBase).toBe(1000);
    expect(commission).toBe(20);
  });

  it('gives a Mamsa-owned unit the whole net base and the partner nothing', () => {
    const split = splitPriceForUnit(1000, true);
    expect(split.partnerShare).toBe(0);
    expect(split.commission).toBe(split.netBase);
    // VAT is the guest's tax either way — never Mamsa's to keep.
    expect(split.vat).toBe(splitPrice(1000).vat);
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

  /**
   * A payout is recorded after the transfer already happened, so it is created `paid`.
   * There is no pending state, and a bounced transfer is `reversed` — a distinct
   * accounting event, not a failed attempt. Adding a third value fails here first.
   */
  it('payouts have exactly two states', () => {
    expect(Object.values(PAYOUT_STATUS)).toEqual(['paid', 'reversed']);
    expect(Object.values(PAYOUT_STATUS)).not.toContain('pending');
    expect(Object.values(PAYOUT_STATUS)).not.toContain('failed');
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
