'use client';

import { create } from 'zustand';
import { authApi } from '@/lib/api';
import type { AdminProfile } from '@/types';

interface AuthState {
  admin: AdminProfile | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  setAdmin: (admin: AdminProfile | null) => void;
  load: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  status: 'idle',

  setAdmin: (admin) => set({ admin, status: admin ? 'authenticated' : 'anonymous' }),

  load: async () => {
    set({ status: 'loading' });
    try {
      const admin = await authApi.me();
      set({ admin, status: 'authenticated' });
    } catch {
      set({ admin: null, status: 'anonymous' });
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ admin: null, status: 'anonymous' });
  },
}));
