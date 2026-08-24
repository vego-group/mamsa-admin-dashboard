'use client';

import { useEffect, useState } from 'react';
import { citiesApi } from '@/lib/api';
import { useUiStore } from '@/stores/uiStore';
import type { City } from '@/types';

export interface CitiesApi {
  cities: City[] | null;
  /** The label for a stored city value, in the current locale. */
  labelOf: (value: string) => string;
}

/**
 * The cities the platform serves, from the API rather than a constant.
 *
 * The console shipped with eight hardcoded names against an API that serves twenty,
 * which left units in the other twelve unreachable from every city filter — silently,
 * as an empty result rather than an error.
 *
 * A failed fetch resolves to an empty list, not a retry loop: a filter that cannot list
 * its options is a missing filter, and the screen behind it still works.
 */
export function useCities(): CitiesApi {
  const locale = useUiStore((state) => state.locale);
  const [cities, setCities] = useState<City[] | null>(null);

  useEffect(() => {
    let stale = false;
    citiesApi
      .list()
      .then((list) => !stale && setCities(list))
      .catch(() => !stale && setCities([]));

    return () => {
      stale = true;
    };
  }, []);

  return {
    cities,
    /**
     * Matched on the key **or** either label, because the write side takes a key and the
     * read side is normalised server-side — a unit can come back as `riyadh` or as
     * `الرياض` and both have to resolve to one name in the current locale.
     *
     * Falls back to the raw value so a city the list does not know renders as itself
     * rather than as a blank.
     */
    labelOf: (value: string) => {
      const match = cities?.find(
        (city) => city.key === value || city.en === value || city.ar === value,
      );
      if (!match) return value;
      return locale === 'ar' ? match.ar : match.en;
    },
  };
}
