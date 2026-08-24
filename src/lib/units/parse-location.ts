import { isValidLatLng, roundCoord } from '@/lib/units/geo';
import { looksLikePlusCode, recoverPlusCode } from '@/lib/units/plus-code';
import type { LatLng } from '@/types';

export type ParsedLocation =
  | { kind: 'point'; point: LatLng; source: 'url' | 'coords' | 'plusCode' }
  | { kind: 'query'; query: string };

/**
 * Reads whatever the admin pasted.
 *
 * The realistic workflow is not "type a district and hope the geocoder knows it" — it is
 * "find the place in Google Maps, then bring it here". So the one box accepts the three
 * things that carry an exact position (a Maps link, raw coordinates, a Plus Code) and
 * treats anything else as a search term. Only the last one needs the network, which is
 * also the only one that can fail to find a building.
 */
export function parseLocationInput(value: string, reference: LatLng): ParsedLocation {
  const input = value.trim();
  if (!input) return { kind: 'query', query: '' };

  const fromUrl = pointFromMapsUrl(input);
  if (fromUrl) return { kind: 'point', point: fromUrl, source: 'url' };

  const fromCoords = pointFromCoordinatePair(input);
  if (fromCoords) return { kind: 'point', point: fromCoords, source: 'coords' };

  if (looksLikePlusCode(input)) {
    const recovered = recoverPlusCode(input, reference);
    if (recovered && isValidLatLng(recovered)) {
      return { kind: 'point', point: round(recovered), source: 'plusCode' };
    }
  }

  return { kind: 'query', query: input };
}

/**
 * A Google Maps URL carries the position twice: `!3d…!4d…` is the **place**, while `@…`
 * is only where the viewport happened to be. Prefer the place — they differ by a few
 * hundred metres whenever the map was panned before sharing, which is most of the time.
 */
function pointFromMapsUrl(input: string): LatLng | null {
  if (!/https?:\/\//i.test(input)) return null;

  const place = input.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (place) return round({ lat: Number(place[1]), lng: Number(place[2]) });

  const query = input.match(/[?&]q=(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (query) return round({ lat: Number(query[1]), lng: Number(query[2]) });

  const viewport = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (viewport) return round({ lat: Number(viewport[1]), lng: Number(viewport[2]) });

  return null;
}

/** `24.8544625, 46.656097` — with or without the space, comma or semicolon. */
function pointFromCoordinatePair(input: string): LatLng | null {
  const match = input.match(/^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
  if (!match) return null;

  const point = { lat: Number(match[1]), lng: Number(match[2]) };
  if (Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) return null;

  return round(point);
}

function round(point: LatLng): LatLng {
  return { lat: roundCoord(point.lat), lng: roundCoord(point.lng) };
}
