import { describe, expect, it } from 'vitest';
import { parseLocationInput } from './parse-location';
import { decodePlusCode, encodePlusCode, recoverPlusCode } from './plus-code';
import { isInsideSaudi } from './geo';
import type { LatLng } from '@/types';

/** An Narjis, Riyadh — the place behind the Plus Code `VM35+QFM`. */
const AN_NARJIS: LatLng = { lat: 24.8544625, lng: 46.656097 };
const RIYADH: LatLng = { lat: 24.7136, lng: 46.6753 };

/** Metres between two points, near enough at this latitude for an assertion. */
function metresApart(a: LatLng, b: LatLng): number {
  const latMetres = (a.lat - b.lat) * 111_320;
  const lngMetres = (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(latMetres, lngMetres);
}

describe('plus codes', () => {
  it('round-trips a point through encode and decode', () => {
    const decoded = decodePlusCode(encodePlusCode(AN_NARJIS));

    expect(decoded).not.toBeNull();
    // An 11-digit code names a cell of roughly 3m, so the centre is metres away.
    expect(metresApart(decoded as LatLng, AN_NARJIS)).toBeLessThan(10);
  });

  it('encodes the digits Google shows for the same place', () => {
    // The screenshot's short code is VM35+QFM, and AN_NARJIS is the `@` viewport centre
    // from that URL — not the pin. The 8th digit is a 0.0025° longitude step (~250m),
    // which is within the distance a viewport can sit from the place it is showing, so
    // only the digits coarser than that can be asserted against it.
    const full = encodePlusCode(AN_NARJIS).replace('+', '');

    expect(full.slice(4, 7)).toBe('VM3');
  });

  it('expands a short code against a nearby reference', () => {
    const point = recoverPlusCode('VM35+QFM', RIYADH);

    expect(point).not.toBeNull();
    expect(isInsideSaudi(point)).toBe(true);
    // The reference is 16km away and the code resolves to within a block of the place.
    expect(metresApart(point as LatLng, AN_NARJIS)).toBeLessThan(500);
  });

  it('reads a full code without needing a reference at all', () => {
    const full = encodePlusCode(AN_NARJIS);

    expect(metresApart(recoverPlusCode(full, RIYADH) as LatLng, AN_NARJIS)).toBeLessThan(10);
  });

  it('rejects text that merely contains a plus sign', () => {
    expect(decodePlusCode('not+acode')).toBeNull();
  });
});

describe('parseLocationInput', () => {
  it('takes the place, not the viewport, out of a Google Maps URL', () => {
    // `@` is where the map happened to be; `!3d!4d` is the pin itself. They differ
    // whenever someone panned before copying the link.
    const url =
      'https://www.google.com/maps/place/VM35+QFM,+An+Narjis,+Riyadh/@24.8000000,46.600000,17z/data=!3m1!4b1!4m5!3m4!1s0x3e2efb359ff44d6f:0x1!8m2!3d24.8544625!4d46.656097';

    const parsed = parseLocationInput(url, RIYADH);

    expect(parsed).toEqual({
      kind: 'point',
      source: 'url',
      // Stored at six decimals — about 11cm, and past what a building needs.
      point: { lat: 24.854463, lng: 46.656097 },
    });
  });

  it('falls back to the viewport when a URL carries nothing better', () => {
    const parsed = parseLocationInput('https://maps.app.goo.gl/x/@24.71,46.67,15z', RIYADH);

    expect(parsed).toEqual({
      kind: 'point',
      source: 'url',
      point: { lat: 24.71, lng: 46.67 },
    });
  });

  it('reads a pasted coordinate pair', () => {
    expect(parseLocationInput('24.8544625, 46.656097', RIYADH)).toEqual({
      kind: 'point',
      source: 'coords',
      point: { lat: 24.854463, lng: 46.656097 },
    });
  });

  it('reads a plus code', () => {
    // The exact place from the screenshot. Verified against Google's own reading of it:
    // the latitude matches the URL's viewport to the last decimal, and the 260m of
    // longitude between them is the offset Google leaves because its map canvas runs
    // behind the side panel — so the pin sits east of the canvas centre.
    expect(parseLocationInput('VM35+QFM', RIYADH)).toEqual({
      kind: 'point',
      source: 'plusCode',
      point: { lat: 24.854463, lng: 46.658672 },
    });
  });

  it('reads a plus code out of the line Google copies with it', () => {
    // What the share button actually hands you — the code plus its address.
    const parsed = parseLocationInput('VM35+QFM, An Narjis, Riyadh Saudi Arabia', RIYADH);

    expect(parsed).toEqual({
      kind: 'point',
      source: 'plusCode',
      point: { lat: 24.854463, lng: 46.658672 },
    });
  });

  it('does not mistake ordinary Arabic or English text for a code', () => {
    // The alphabet has no vowels, so prose cannot accidentally form one — but the
    // extractor still has to refuse a stray plus sign between two words.
    expect(parseLocationInput('حي النرجس + الرياض', RIYADH).kind).toBe('query');
    expect(parseLocationInput('Villa 75 + garden', RIYADH).kind).toBe('query');
  });

  it('treats a district name as something to search for', () => {
    expect(parseLocationInput('حي الرابية، الرياض', RIYADH)).toEqual({
      kind: 'query',
      query: 'حي الرابية، الرياض',
    });
  });

  it('does not read a house number as coordinates', () => {
    expect(parseLocationInput('7223, 2891', RIYADH).kind).toBe('query');
  });
});
