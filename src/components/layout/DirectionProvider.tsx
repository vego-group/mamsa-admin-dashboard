'use client';

import { useEffect } from 'react';
import { dirOf, useUiStore } from '@/stores';

/**
 * Keeps <html lang/dir> in sync with the chosen locale so every logical property in
 * the design system mirrors without per-component work.
 */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const locale = useUiStore((state) => state.locale);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirOf(locale);
    root.classList.toggle('font-arabic', locale === 'ar');
  }, [locale]);

  return <>{children}</>;
}
