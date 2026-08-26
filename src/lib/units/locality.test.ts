import { describe, expect, it } from 'vitest';
import { localityMatchesCity, localityOf, normaliseLocality } from './locality';
import type { City } from '@/types';

const RIYADH: City = { key: 'riyadh', en: 'Riyadh', ar: 'الرياض' };
const JEDDAH: City = { key: 'jeddah', en: 'Jeddah', ar: 'جدة' };
const KHAMIS: City = { key: 'khamis_mushait', en: 'Khamis Mushait', ar: 'خميس مشيط' };

describe('localityMatchesCity', () => {
  it('catches the pin that started this — Al-Kharj declared as Riyadh', () => {
    // The unit sat 150km from its declared city and passed every other check.
    expect(localityMatchesCity('محافظة الخرج', RIYADH)).toBe(false);
  });

  it('is not fooled by the province sharing the city name', () => {
    // The full address was `محافظة الخرج, منطقة الرياض, السعودية` — a substring test on
    // the whole string passes it, because Al-Kharj is in Riyadh Province. Comparing the
    // city-level component alone is the whole point.
    expect(localityMatchesCity('منطقة الرياض', RIYADH)).toBe(true);
    expect(localityMatchesCity('محافظة الخرج', RIYADH)).toBe(false);
  });

  it('accepts the same city however it is written', () => {
    for (const spelling of ['الرياض', 'مدينة الرياض', 'Riyadh', 'Ar Riyadh', 'riyadh']) {
      expect(localityMatchesCity(spelling, RIYADH)).toBe(true);
    }
  });

  it('accepts a multi-word city against its slug', () => {
    expect(localityMatchesCity('خميس مشيط', KHAMIS)).toBe(true);
    expect(localityMatchesCity('Khamis Mushait', KHAMIS)).toBe(true);
  });

  it('rejects a different city', () => {
    expect(localityMatchesCity('جدة', RIYADH)).toBe(false);
    expect(localityMatchesCity('الرياض', JEDDAH)).toBe(false);
  });

  it('treats a missing answer as agreement rather than as a fault', () => {
    // A geocoder that returned nothing is not evidence of a wrong pin.
    expect(localityMatchesCity(null, RIYADH)).toBe(true);
    expect(localityMatchesCity('', RIYADH)).toBe(true);
    expect(localityMatchesCity('الرياض', undefined)).toBe(true);
  });
});

describe('normaliseLocality', () => {
  it('strips the administrative wrapper without changing the place', () => {
    expect(normaliseLocality('محافظة الخرج')).toBe(normaliseLocality('الخرج'));
    expect(normaliseLocality('Riyadh Governorate')).toBe(normaliseLocality('Riyadh'));
  });

  it('folds the letters Arabic writes more than one way', () => {
    expect(normaliseLocality('الأحساء')).toBe(normaliseLocality('الاحساء'));
  });
});

describe('localityOf', () => {
  it('prefers the most specific name available', () => {
    expect(localityOf({ city: 'الرياض', county: 'محافظة الرياض' })).toBe('الرياض');
  });

  it('falls back to the county — the field that catches a neighbouring governorate', () => {
    expect(localityOf({ county: 'محافظة الخرج', state: 'منطقة الرياض' })).toBe('محافظة الخرج');
  });

  it('returns null when the geocoder gave no place at all', () => {
    expect(localityOf({ country: 'السعودية' })).toBeNull();
    expect(localityOf(undefined)).toBeNull();
  });
});
