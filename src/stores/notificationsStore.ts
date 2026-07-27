'use client';

import { create } from 'zustand';
import { notificationsApi } from '@/lib/api';

interface NotificationsState {
  unreadCount: number;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,

  refresh: async () => {
    try {
      set({ unreadCount: await notificationsApi.unreadCount() });
    } catch {
      // A failed badge refresh must never break the shell.
    }
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    set({ unreadCount: 0 });
  },
}));
