'use client';

import { useUiStore, type Locale } from '@/stores/uiStore';
import { ar } from './ar';
import { en, type Dictionary } from './en';

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Locale-aware copy for client components. */
export function useT(): Dictionary {
  const locale = useUiStore((state) => state.locale);
  return dictionaries[locale];
}

export type { Dictionary };
export { ar, en };
