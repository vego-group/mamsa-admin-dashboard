import {
  CURRENCY,
  PARTNER_SHARE_RATE,
  PHONE_PREFIX,
  PLATFORM_COMMISSION_RATE,
  REVIEW_SLA_HOURS,
  VAT_RATE,
} from '@/lib/constants';

/** Always Latin digits, grouped thousands, SAR suffix. */
export function formatSAR(amount: number, opts?: { compact?: boolean }): string {
  if (!Number.isFinite(amount)) return `0 ${CURRENCY}`;

  if (opts?.compact && Math.abs(amount) >= 1000) {
    const units: Array<[number, string]> = [
      [1_000_000_000, 'B'],
      [1_000_000, 'M'],
      [1_000, 'K'],
    ];
    for (const [size, suffix] of units) {
      if (Math.abs(amount) >= size) {
        const value = amount / size;
        const rounded = Math.abs(value) >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
        return `${rounded}${suffix} ${CURRENCY}`;
      }
    }
  }

  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${CURRENCY}`;
}

/** Gregorian DD/MM/YYYY with Latin digits, regardless of UI language. */
export function formatDate(iso: string | Date): string {
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Latin digits on a 12-hour clock, matching every other timestamp in the console. */
export function formatTime(iso: string | Date): string {
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateTime(iso: string | Date): string {
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(date)} · ${formatTime(date)}`;
}

/** +966 55 123 4567 — render inside a dir="ltr" island. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  const national = digits.startsWith('966') ? digits.slice(3) : digits;
  if (national.length !== 9) return e164;
  return `${PHONE_PREFIX} ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
}

export interface CommissionSplit {
  total: number;
  commission: number;
  partnerShare: number;
}

/**
 * Split a booking total into Mamsa's 2% and the partner's 98%.
 * The two parts are guaranteed to sum back to the total exactly.
 */
export function splitCommission(total: number): CommissionSplit {
  const safeTotal = round2(total);
  const commission = round2(safeTotal * PLATFORM_COMMISSION_RATE);
  const partnerShare = round2(safeTotal - commission);
  return { total: safeTotal, commission, partnerShare };
}

/** Mamsa-owned units are not split — the platform keeps the full amount. */
export function splitForUnit(total: number, mamsaOwned: boolean): CommissionSplit {
  if (mamsaOwned) {
    const safeTotal = round2(total);
    return { total: safeTotal, commission: safeTotal, partnerShare: 0 };
  }
  return splitCommission(total);
}

export interface PriceSplit {
  gross: number;
  netBase: number;
  vat: number;
  commission: number;
  partnerShare: number;
}

/**
 * The full VAT-inclusive split of a booking total.
 *
 * The guest pays `gross`, which already contains 15% VAT. Commission is charged on the
 * net base, never on the gross — charging it on the gross would quietly take a cut of
 * tax that belongs to ZATCA.
 *
 * `partnerShare` is derived by **subtraction**, never `netBase * 0.98`. Subtraction is
 * what makes `commission + partnerShare + vat === gross` hold exactly under rounding;
 * multiplying twice and hoping the halves meet does not.
 */
export function splitPrice(gross: number): PriceSplit {
  const safeGross = round2(gross);
  const netBase = round2(safeGross / (1 + VAT_RATE));
  const vat = round2(safeGross - netBase);
  const commission = round2(netBase * PLATFORM_COMMISSION_RATE);
  const partnerShare = round2(netBase - commission);

  return { gross: safeGross, netBase, vat, commission, partnerShare };
}

/**
 * Mamsa-owned units keep the whole net base as platform revenue. VAT is unchanged —
 * it is the guest's tax either way, and never Mamsa's to keep.
 */
export function splitPriceForUnit(gross: number, mamsaOwned: boolean): PriceSplit {
  const split = splitPrice(gross);
  if (!mamsaOwned) return split;

  return { ...split, commission: split.netBase, partnerShare: 0 };
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}

export interface WaitingTime {
  hours: number;
  label: string;
  severity: 'ok' | 'warn' | 'breach';
}

/**
 * A span of hours as `3d 18h`. Every duration on the review screens reads through this,
 * so a queue figure and a summary figure can never be written in different units.
 */
export function durationLabel(hours: number): string {
  const whole = Math.max(0, Math.floor(hours));
  if (whole < 1) return '< 1h';
  if (whole < 24) return `${whole}h`;
  return `${Math.floor(whole / 24)}d ${whole % 24}h`;
}

/** Grades a duration against the 24/48h review SLA. */
export function reviewSeverity(hours: number): WaitingTime['severity'] {
  if (hours >= REVIEW_SLA_HOURS.breach) return 'breach';
  return hours >= REVIEW_SLA_HOURS.warn ? 'warn' : 'ok';
}

/** Hours a review request has been waiting, graded against the 24/48h SLA. */
export function waitingTime(submittedAt: string | Date, now: Date = new Date()): WaitingTime {
  const submitted = submittedAt instanceof Date ? submittedAt : new Date(submittedAt);
  const hours = Math.max(0, Math.floor((now.getTime() - submitted.getTime()) / 3_600_000));

  return { hours, label: durationLabel(hours), severity: reviewSeverity(hours) };
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const a = checkIn instanceof Date ? checkIn : new Date(checkIn);
  const b = checkOut instanceof Date ? checkOut : new Date(checkOut);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const RATES = { PLATFORM_COMMISSION_RATE, PARTNER_SHARE_RATE } as const;
