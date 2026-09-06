/**
 * Halalas ↔ display.
 *
 * The API stores and sends **integer halalas**. The only arithmetic this module does is
 * divide by 100 for display and multiply by 100 for input — never a split, never a share,
 * never a rate. Partner money on the complaints surface is whatever the server sent
 * (`partnerHalalas`, `partnerShareHalalas`), rendered as is: the booking froze its split
 * at a rate today's constant may not match, and only the server knows which.
 */
import { CURRENCY } from '@/lib/constants';

/** `1,000.00 SAR` — always two decimals, since the source is an integer count of halalas. */
export function formatHalalas(halalas: number): string {
  const safe = Number.isFinite(halalas) ? halalas : 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe / 100);

  return `${formatted} ${CURRENCY}`;
}

/** The `<input>` value for an existing amount: `1000.50` — no grouping, no suffix. */
export function halalasToInput(halalas: number): string {
  return (Number.isFinite(halalas) ? halalas / 100 : 0).toFixed(2);
}

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function toLatinDigits(raw: string): string {
  return Array.from(raw, (char) => {
    const arabic = ARABIC_INDIC_DIGITS.indexOf(char);
    if (arabic >= 0) return String(arabic);
    const eastern = EASTERN_ARABIC_DIGITS.indexOf(char);
    if (eastern >= 0) return String(eastern);
    return char;
  }).join('');
}

/**
 * What an admin typed into a SAR field → integer halalas, or `null` when it is not an
 * unambiguous amount.
 *
 * Arabic-Indic digits and the Arabic decimal separator (٫) are accepted; grouping
 * separators (`,` and ٬) are dropped. More than two decimals, a sign, or anything else is
 * rejected rather than rounded — rounding what an admin typed would approve a figure
 * they never saw.
 */
export function parseSarToHalalas(raw: string): number | null {
  const normalised = toLatinDigits(raw)
    .replace(/[\s,٬_']/g, '')
    .replace(/٫/g, '.');

  if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(normalised)) return null;

  const [whole = '', fraction = ''] = normalised.split('.');
  const halalas = Number(whole || '0') * 100 + Number((fraction + '00').slice(0, 2));

  return Number.isSafeInteger(halalas) ? halalas : null;
}
