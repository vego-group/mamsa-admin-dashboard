import type { City } from '@/types';

/**
 * Does the place the geocoder recognised agree with the city the admin picked?
 *
 * This exists because a pin can be wrong in ways nothing else catches. The unit that
 * prompted it sat 150km from its declared city and passed every check: it was inside the
 * national bounding box, its coordinates were well-formed, and its address resolved
 * cleanly — to the wrong governorate.
 *
 * **Matching on the whole address does not work.** That unit's address was
 * `محافظة الخرج, منطقة الرياض, السعودية`, which contains "الرياض" — because Al-Kharj is
 * *in* Riyadh Province. A substring test on the full string passes it. So the comparison
 * has to be against the city-level component alone.
 */

/** Administrative words that wrap a name without changing which place it is. */
const ADMIN_WORDS = [
  'محافظة',
  'منطقة',
  'أمانة',
  'مدينة',
  'بلدية',
  'governorate',
  'province',
  'region',
  'municipality',
  'city of',
  'city',
];

/** Arabic letters that are written more than one way and compare as the same one. */
function foldArabic(value: string): string {
  return value
    .replace(/[أإآٱ]/g, 'ا') // أ إ آ ٱ → ا
    .replace(/ى/g, 'ي') // ى → ي
    .replace(/ة/g, 'ه') // ة → ه
    .replace(/[ً-ْـ]/g, ''); // diacritics and tatweel
}

export function normaliseLocality(value: string): string {
  let text = foldArabic(value.trim().toLowerCase());

  // Whitespace bounds, not `\b`: Arabic letters are not word characters in JavaScript
  // regex, so `\bمحافظة\b` never matches anything and the stripping silently does nothing.
  for (const word of ADMIN_WORDS) {
    text = text.replace(new RegExp(`(^|\\s)${foldArabic(word)}(\\s|$)`, 'gi'), ' ');
  }

  // "Al Kharj", "al-kharj" and "الخرج" all reduce to the same comparable core.
  return text
    .trim()
    .replace(/^al[- ]/i, '')
    .replace(/^ال/, '')
    .replace(/[\s\-_.,'’]+/g, '');
}

/**
 * `true` when the two name the same city, or when there is not enough to judge.
 *
 * Silence is treated as agreement on purpose: a geocoder that returned nothing is not
 * evidence of a wrong pin, and blocking on it would strand an admin behind a failed
 * third-party lookup.
 */
export function localityMatchesCity(
  locality: string | null | undefined,
  city: City | undefined,
): boolean {
  if (!locality || !city) return true;

  const found = normaliseLocality(locality);
  if (!found) return true;

  return [city.ar, city.en, city.key].some((label) => {
    const expected = normaliseLocality(label.replace(/_/g, ' '));
    if (!expected) return false;
    // Containment either way, so "الرياض" matches "مدينة الرياض" without matching "الخرج".
    return found.includes(expected) || expected.includes(found);
  });
}

/**
 * The city-level name out of a Nominatim `address` object.
 *
 * Ordered most specific first. `county` is last and is what catches a pin that landed in
 * a neighbouring governorate — the case that started this.
 */
export function localityOf(address: Record<string, string> | undefined): string | null {
  if (!address) return null;

  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    null
  );
}
