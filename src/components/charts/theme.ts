import type { BookingStatus, RefundStatus } from '@/lib/constants';

/**
 * Chart colours. These mirror the tokens in `tailwind.config.ts` — Recharts needs
 * literal values, so this file is the one place a hex may be repeated. Change a brand
 * colour there and here, nowhere else.
 */
export const CHART = {
  revenue: '#1E4034', // brand
  commission: '#8FBFA6', // brand.rail
  bar: '#1E4034',
  barMuted: '#A9CEBB',
  grid: '#E8EBE9', // hairline
  axis: '#94A3B8',
} as const;

/**
 * A booking status keeps one colour across the whole console. The tones match the
 * ones `StatusBadge` assigns, except `pending_payment`, which uses the Mamsa accent
 * so a small slice still reads as "needs attention" against the greens.
 */
export const STATUS_COLOR: Record<BookingStatus, string> = {
  completed: '#5F8D74', // status.sage
  confirmed: '#16A34A', // status.green
  pending_payment: '#E8590C', // accent
  cancelled: '#DC2626', // status.red
};

/** Matches the tones `StatusBadge` gives each refund state. */
export const REFUND_COLOR: Record<RefundStatus, string> = {
  refunded: '#2563EB', // status.blue
  partial: '#D97706', // status.amber
  none: '#6B7280', // status.grey
  failed: '#DC2626', // status.red
};

/**
 * Axis ticks the way the design draws them: the top gridline sits just above the
 * tallest value on a step that reads as a round number. `1_880_000 → 500K steps`,
 * `252 → 65 steps`.
 */
export function axisTicks(max: number, intervals = 4): number[] {
  if (!Number.isFinite(max) || max <= 0) return [0];

  const rawStep = max / intervals;
  const unit = 5 * 10 ** (Math.floor(Math.log10(rawStep)) - 1);
  const step = Math.ceil(rawStep / unit) * unit;

  return Array.from({ length: intervals + 1 }, (_, index) => Math.round(step * index));
}

/**
 * Money axes are labelled in thousands the whole way up — `0K … 1000K`, never
 * switching to `M` partway, so the ticks stay comparable at a glance. Currency lives
 * in the tooltip, not on the axis.
 */
export function thousandsTick(value: number): string {
  return `${Math.round(value / 1_000)}K`;
}
