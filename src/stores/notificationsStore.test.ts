import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationItem } from '@/types';
import { useNotificationsStore } from './notificationsStore';

const list = vi.fn();
const unreadCount = vi.fn();
const markRead = vi.fn();
const markAllRead = vi.fn();

vi.mock('@/lib/api', () => ({
  notificationsApi: {
    list: () => list(),
    unreadCount: () => unreadCount(),
    markRead: (id: string) => markRead(id),
    markAllRead: () => markAllRead(),
  },
}));

/** A super admin's new-booking notification on a Mamsa-owned unit. */
function booking(id: string, read = false): NotificationItem {
  return {
    id,
    category: 'booking',
    title: 'حجز جديد',
    body: 'تم تأكيد حجز جديد على وحدة MAMWYAO7',
    at: '2026-08-11T13:20:05+03:00',
    read,
    entity: { type: 'booking', id: '482' },
  };
}

describe('useNotificationsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markRead.mockResolvedValue({ ok: true });
    markAllRead.mockResolvedValue({ ok: true });
    useNotificationsStore.setState({ items: null, unreadCount: 0, failed: false });
  });

  it('derives the badge from the feed it just loaded', async () => {
    list.mockResolvedValue([booking('n1'), booking('n2', true)]);

    await useNotificationsStore.getState().loadFeed();

    expect(useNotificationsStore.getState().unreadCount).toBe(1);
    expect(useNotificationsStore.getState().failed).toBe(false);
  });

  it('keeps the cached feed when a reload fails', async () => {
    list.mockResolvedValueOnce([booking('n1')]);
    await useNotificationsStore.getState().loadFeed();

    list.mockRejectedValueOnce(new Error('offline'));
    await useNotificationsStore.getState().loadFeed();

    expect(useNotificationsStore.getState().items).toHaveLength(1);
    expect(useNotificationsStore.getState().failed).toBe(true);
  });

  it('pulls the feed when a poll finds the badge has moved', async () => {
    list.mockResolvedValue([booking('n1')]);
    unreadCount.mockResolvedValue(1);
    await useNotificationsStore.getState().loadFeed();

    // A booking is confirmed elsewhere: the badge climbs, so the feed is stale.
    unreadCount.mockResolvedValue(2);
    list.mockResolvedValue([booking('n2'), booking('n1')]);
    await useNotificationsStore.getState().refresh();

    expect(useNotificationsStore.getState().items).toHaveLength(2);
    expect(useNotificationsStore.getState().unreadCount).toBe(2);
  });

  it('leaves the feed alone while the badge holds steady', async () => {
    list.mockResolvedValue([booking('n1')]);
    unreadCount.mockResolvedValue(1);
    await useNotificationsStore.getState().loadFeed();

    list.mockClear();
    await useNotificationsStore.getState().refresh();

    expect(list).not.toHaveBeenCalled();
  });

  it('marks one read optimistically and only calls the backend once', async () => {
    list.mockResolvedValue([booking('n1'), booking('n2')]);
    unreadCount.mockResolvedValue(1);
    await useNotificationsStore.getState().loadFeed();

    await useNotificationsStore.getState().markRead('n1');

    expect(useNotificationsStore.getState().items?.find((i) => i.id === 'n1')?.read).toBe(true);
    expect(useNotificationsStore.getState().unreadCount).toBe(1);
    expect(markRead).toHaveBeenCalledTimes(1);

    // Re-opening an already-read row must not spend another request.
    await useNotificationsStore.getState().markRead('n1');
    expect(markRead).toHaveBeenCalledTimes(1);
  });

  it('clears every unread flag on mark-all-read', async () => {
    list.mockResolvedValue([booking('n1'), booking('n2')]);
    await useNotificationsStore.getState().loadFeed();

    await useNotificationsStore.getState().markAllRead();

    expect(useNotificationsStore.getState().items?.every((i) => i.read)).toBe(true);
    expect(useNotificationsStore.getState().unreadCount).toBe(0);
  });
});
