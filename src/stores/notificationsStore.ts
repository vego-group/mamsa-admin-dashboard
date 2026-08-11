'use client';

import { create } from 'zustand';
import { notificationsApi } from '@/lib/api';
import type { ID, NotificationItem } from '@/types';

/**
 * The feed lives in the store rather than in the page, because two surfaces read it
 * — the header bell (on every screen) and the notifications page — and marking one
 * item read from either must be visible in the other immediately.
 */
interface NotificationsState {
  items: NotificationItem[] | null;
  unreadCount: number;
  /** True only after a feed load failed; the badge failing silently is fine. */
  failed: boolean;
  /** Badge only. Cheap enough to poll while a booking notification may be landing. */
  refresh: () => Promise<void>;
  /** The feed itself. Keeps whatever is already on screen while it reloads. */
  loadFeed: () => Promise<void>;
  markRead: (id: ID) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: null,
  unreadCount: 0,
  failed: false,

  refresh: async () => {
    const previous = get().unreadCount;

    try {
      const unreadCount = await notificationsApi.unreadCount();
      set({ unreadCount });

      // The badge moved on its own — a booking landed, or another tab read something.
      // Whoever is already looking at the feed should see it, not a stale copy.
      if (unreadCount !== previous && get().items) void get().loadFeed();
    } catch {
      // A failed badge refresh must never break the shell.
    }
  },

  loadFeed: async () => {
    try {
      const items = await notificationsApi.list();
      // The list is authoritative about what is unread, so the badge can be derived
      // from it instead of costing a second round trip.
      set({ items, unreadCount: items.filter((item) => !item.read).length, failed: false });
    } catch {
      set({ failed: true });
    }
  },

  markRead: async (id) => {
    const target = get().items?.find((item) => item.id === id);
    if (target?.read) return;

    // Optimistic: the row should stop shouting the moment it is opened.
    set((state) => ({
      items: state.items?.map((item) => (item.id === id ? { ...item, read: true } : item)) ?? null,
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationsApi.markRead(id);
    } catch {
      // The deep-link still navigated; re-sync rather than strand a wrong badge.
    }
    void get().refresh();
  },

  markAllRead: async () => {
    set((state) => ({
      items: state.items?.map((item) => ({ ...item, read: true })) ?? null,
      unreadCount: 0,
    }));
    await notificationsApi.markAllRead();
  },
}));
