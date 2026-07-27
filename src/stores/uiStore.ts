'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'ar' | 'en';

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  locale: Locale;
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  setLocale: (locale: Locale) => void;
}

export const dirOf = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      locale: 'en',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'mamsa-admin-ui' },
  ),
);
