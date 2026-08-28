/**
 * LOCKED PLATFORM RULES.
 *
 * These are business decisions, not implementation details. Nothing in the app may
 * hardcode an equivalent value inline — always import from here so a rule change is
 * a one-line edit.
 */

/** The only currency Mamsa transacts in. Never AED, never USD. */
export const CURRENCY = 'SAR' as const;

/** Saudi mobile prefix. Nine digits follow it and the first of those must be 5. */
export const PHONE_PREFIX = '+966' as const;
export const PHONE_NATIONAL_LENGTH = 9;

/** Authentication is OTP-only across the whole platform. There are no passwords. */
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 3;

/**
 * Revenue split: Mamsa keeps 10%, the partner receives 90%.
 *
 * Moved from 2% by owner decision, deployed to the backend on 2026-08-27. The partner
 * share is derived, never declared independently, so the pair cannot drift apart on a
 * future rate edit — and it is a label value only: partner money is always computed by
 * subtraction in `src/lib/utils/format.ts`, never by multiplying this.
 */
export const PLATFORM_COMMISSION_RATE = 0.10;
export const PARTNER_SHARE_RATE = 1 - PLATFORM_COMMISSION_RATE;

/**
 * Saudi VAT. The price a guest pays is VAT-inclusive, so the commission split applies
 * to the net base — never to the gross.
 */
export const VAT_RATE = 0.15;

/** A partner is only payable once their available balance reaches this. */
export const PAYOUT_MIN_BALANCE = 2000;

/** Payouts run once per Gregorian calendar month; the day itself is not enforced. */
export const PAYOUT_CYCLE_DAY = 1;
export const PAYOUT_TIMEZONE = 'Asia/Riyadh';

/**
 * Unit review service level: amber at 24h, breached past 48h — two days.
 *
 * 48h is Mamsa's internal target for turning a submitted unit around; it is an operations
 * goal, not a contractual commitment to partners.
 *
 * **Continuous hours, deliberately — not business days.** Saudi Arabia's weekend is
 * Friday–Saturday, so a business-day rule would leave a Wednesday-evening submission
 * green until Sunday. Since this target exists to expose where reviews are running late,
 * excluding the weekend would hide the single gap most likely to justify weekend cover.
 * A partner waiting four days is late whether or not the office was open, and on a rental
 * platform the weekend is peak booking demand.
 *
 * The clock runs from **submission**, not from unit creation: a partner may draft a
 * listing for a week before submitting it, and that week is theirs, not ours. That is why
 * the API stamps `submitted_at` rather than measuring from `created_at`.
 */
export const REVIEW_SLA_HOURS = { warn: 24, breach: 48 } as const;

/** Mamsa operates in Saudi Arabia only. */
export const SAUDI_CITIES = [
  'Riyadh',
  'Jeddah',
  'Makkah',
  'Madinah',
  'Dammam',
  'Khobar',
  'Taif',
  'Abha',
] as const;
export type SaudiCity = (typeof SAUDI_CITIES)[number];

/** Gregorian, day-first, Latin digits — even inside an Arabic layout. */
export const DATE_FORMAT = 'DD/MM/YYYY' as const;

/** Payments settle immediately through Moyasar. */
export const PAYMENT_PROVIDER = 'Moyasar' as const;
