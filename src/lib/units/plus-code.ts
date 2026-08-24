import type { LatLng } from '@/types';

/**
 * Open Location Code — the "Plus Code" Google Maps shows for a place.
 *
 * Decoded here rather than looked up, because it is pure arithmetic: a code *is* the
 * coordinates, base-20 encoded. No key, no request, no rate limit, and it works for the
 * one thing address search cannot do — a building with no street address, which is most
 * of what a short code gets used for in the first place.
 *
 * Reference: https://github.com/google/open-location-code
 */

const ALPHABET = '23456789CFGHJMPQRVWX';
const SEPARATOR = '+';
const SEPARATOR_POSITION = 8;
const BASE = 20;
const PAIR_DIGITS = 10;
const GRID_COLUMNS = 4;
const GRID_ROWS = 5;
const GRID_DIGITS = 5;

/** A full code (`7HP8VM35+QFM`) or a short one (`VM35+QFM`). */
const CODE_PATTERN = /^[23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{0,7}$/i;

export function looksLikePlusCode(value: string): boolean {
  return CODE_PATTERN.test(value.trim());
}

/**
 * Pulls a code out of a longer line — Google's own copy button hands you
 * `VM35+QFM, An Narjis, Riyadh Saudi Arabia`, not a bare code.
 *
 * The alphabet omits vowels and every look-alike character, so a token of these letters
 * around a `+` is not something ordinary text produces by accident.
 */
export function findPlusCode(text: string): string | null {
  const match = text.match(
    /(^|[\s,;(])([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,7})(?=$|[\s,;)])/i,
  );

  return match ? match[2] : null;
}

/** A code carrying its own position, rather than one needing a nearby reference. */
export function isFullPlusCode(value: string): boolean {
  const code = value.trim();
  return looksLikePlusCode(code) && code.indexOf(SEPARATOR) === SEPARATOR_POSITION;
}

/** The centre of the cell a code names. */
export function decodePlusCode(value: string): LatLng | null {
  const clean = value
    .trim()
    .toUpperCase()
    .replace(/\+/g, '')
    .replace(/0+$/, '');

  if (clean.length < 2 || clean.split('').some((char) => !ALPHABET.includes(char))) return null;

  let lat = -90;
  let lng = -180;
  // Each pair of digits refines by a factor of 20: 20°, 1°, 0.05°, 0.0025°, 0.000125°.
  let latResolution = BASE * BASE;
  let lngResolution = BASE * BASE;

  const pairs = Math.min(clean.length, PAIR_DIGITS);
  for (let index = 0; index + 1 < pairs; index += 2) {
    latResolution /= BASE;
    lngResolution /= BASE;
    lat += ALPHABET.indexOf(clean[index]) * latResolution;
    lng += ALPHABET.indexOf(clean[index + 1]) * lngResolution;
  }

  // Past ten digits the cell is subdivided on a 5×4 grid instead of in pairs.
  for (let index = PAIR_DIGITS; index < Math.min(clean.length, PAIR_DIGITS + GRID_DIGITS); index += 1) {
    const digit = ALPHABET.indexOf(clean[index]);
    latResolution /= GRID_ROWS;
    lngResolution /= GRID_COLUMNS;
    lat += Math.floor(digit / GRID_COLUMNS) * latResolution;
    lng += (digit % GRID_COLUMNS) * lngResolution;
  }

  return { lat: lat + latResolution / 2, lng: lng + lngResolution / 2 };
}

/** The full code for a point, used to supply the prefix a short code omits. */
export function encodePlusCode(point: LatLng, length = 11): string {
  const lat = Math.min(90, Math.max(-90, point.lat));
  const lng = ((((point.lng + 180) % 360) + 360) % 360) - 180;

  let latValue = Math.floor((lat + 90) * 8000 * GRID_ROWS ** GRID_DIGITS);
  let lngValue = Math.floor((lng + 180) * 8000 * GRID_COLUMNS ** GRID_DIGITS);

  let code = '';
  for (let index = 0; index < GRID_DIGITS; index += 1) {
    const digit =
      (latValue % GRID_ROWS) * GRID_COLUMNS + (lngValue % GRID_COLUMNS);
    code = ALPHABET.charAt(digit) + code;
    latValue = Math.floor(latValue / GRID_ROWS);
    lngValue = Math.floor(lngValue / GRID_COLUMNS);
  }

  for (let index = 0; index < PAIR_DIGITS / 2; index += 1) {
    code = ALPHABET.charAt(lngValue % BASE) + code;
    code = ALPHABET.charAt(latValue % BASE) + code;
    latValue = Math.floor(latValue / BASE);
    lngValue = Math.floor(lngValue / BASE);
  }

  const full = `${code.slice(0, SEPARATOR_POSITION)}${SEPARATOR}${code.slice(SEPARATOR_POSITION)}`;
  return full.slice(0, length + 1);
}

/**
 * Expands a short code against a nearby point — what Google means by
 * "VM35+QFM, An Narjis, Riyadh".
 *
 * A short code drops the leading digits, which is only unambiguous within about half the
 * resolution those digits carried. The reference is the map's current centre, so the
 * answer is the matching cell nearest to what the admin is already looking at.
 */
export function recoverPlusCode(value: string, reference: LatLng): LatLng | null {
  const code = value.trim().toUpperCase();
  if (!looksLikePlusCode(code)) return null;
  if (isFullPlusCode(code)) return decodePlusCode(code);

  const missing = SEPARATOR_POSITION - code.indexOf(SEPARATOR);
  if (missing <= 0 || missing % 2 !== 0) return null;

  const resolution = BASE ** (2 - missing / 2);
  const prefix = encodePlusCode(reference).replace(SEPARATOR, '').slice(0, missing);

  const candidate = decodePlusCode(prefix + code.replace(SEPARATOR, ''));
  if (!candidate) return null;

  // The prefix borrowed from the reference can land the cell one step the wrong side of
  // it; step back onto whichever neighbour is actually nearest.
  const half = resolution / 2;
  let { lat, lng } = candidate;
  if (reference.lat + half < lat && lat - resolution >= -90) lat -= resolution;
  else if (reference.lat - half > lat && lat + resolution <= 90) lat += resolution;
  if (reference.lng + half < lng) lng -= resolution;
  else if (reference.lng - half > lng) lng += resolution;

  return { lat, lng };
}

