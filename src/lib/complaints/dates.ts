/**
 * Riyadh-time rendering for the complaints screens: `DD/MM/YYYY` and `DD/MM/YYYY HH:mm`.
 *
 * The API sends ISO-8601 Zulu. The console's older `formatDate` renders in the browser's
 * own zone, which is wrong for an admin abroad and off by a day around midnight; these
 * read the zone from `PAYOUT_TIMEZONE`, the one place the platform's zone is written.
 * Assembled from `formatToParts` rather than a locale string, so no engine can slip a
 * `24:00` or a locale-specific separator into a timestamp an admin quotes to support.
 */
import { PAYOUT_TIMEZONE } from '@/lib/constants';

interface RiyadhParts {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
}

function riyadhParts(iso: string | null | undefined): RiyadhParts | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PAYOUT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    day: pick('day'),
    month: pick('month'),
    year: pick('year'),
    hour: pick('hour'),
    minute: pick('minute'),
  };
}

/** `27/07/2026` in Riyadh, or `—` for a missing or unparseable value. */
export function formatRiyadhDate(iso: string | null | undefined): string {
  const parts = riyadhParts(iso);
  return parts ? `${parts.day}/${parts.month}/${parts.year}` : '—';
}

/** `27/07/2026 12:00` in Riyadh, 24-hour clock. */
export function formatRiyadhDateTime(iso: string | null | undefined): string {
  const parts = riyadhParts(iso);
  return parts ? `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}` : '—';
}
