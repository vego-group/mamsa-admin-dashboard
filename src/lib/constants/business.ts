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

/** Revenue split: Mamsa keeps 2%, the partner receives 98%. */
export const PLATFORM_COMMISSION_RATE = 0.02;
export const PARTNER_SHARE_RATE = 0.98;

/** Unit review service level: amber at 24h, breached past 48h. */
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
