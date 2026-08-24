import type { LatLng } from '@/types';

/**
 * The bounding box Mamsa operates inside — the same one the partner dashboard uses, so
 * a pin accepted there is accepted here.
 *
 * It is a rectangle, not a border. Saudi Arabia's eastern edge reaches ~55.6°E, so a box
 * wide enough to hold Jubail and the Empty Quarter also holds Doha, Manama and Dubai.
 * That is a deliberate false-accept: the check exists to catch a mis-drag onto another
 * continent, and a listing in the wrong Gulf city is caught by the human reviewing it.
 * Tightening this needs a real polygon, not a narrower rectangle — narrowing it would
 * start rejecting genuine eastern-province addresses.
 */
export const SAUDI_BOUNDS = {
  minLat: 16.0,
  maxLat: 32.2,
  minLng: 34.5,
  maxLng: 55.7,
  /** Riyadh — where the map opens when there is no pin yet. */
  center: { lat: 24.7136, lng: 46.6753 } as LatLng,
} as const;

/**
 * A point the map can safely render.
 *
 * A draft saved before anyone touched the map comes back with `lat: null, lng: null`
 * even though the field is typed `number`, and `0,0` is null island rather than a
 * Saudi address — both have to be treated as "no pin", not as a location.
 */
export function isValidLatLng(point: Partial<LatLng> | null | undefined): point is LatLng {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return false;
  return !(point.lat === 0 && point.lng === 0);
}

export function isInsideSaudi(point: Partial<LatLng> | null | undefined): boolean {
  if (!isValidLatLng(point)) return false;

  return (
    point.lat >= SAUDI_BOUNDS.minLat &&
    point.lat <= SAUDI_BOUNDS.maxLat &&
    point.lng >= SAUDI_BOUNDS.minLng &&
    point.lng <= SAUDI_BOUNDS.maxLng
  );
}

/** Six decimals is roughly 11cm — more than a building needs, and stable to compare. */
export function roundCoord(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
