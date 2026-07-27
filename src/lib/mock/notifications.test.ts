import { describe, expect, it } from 'vitest';
import { NOTIFICATION_CATEGORY } from '@/lib/constants';
import { mockNotifications } from './index';

describe('mockNotifications', () => {
  it('agrees with the badge on how many are unread', async () => {
    const [items, count] = await Promise.all([
      mockNotifications.list(),
      mockNotifications.unreadCount(),
    ]);

    expect(items.filter((item) => !item.read)).toHaveLength(count);
  });

  it('tags every notification with a category from the vocabulary', async () => {
    const items = await mockNotifications.list();
    const allowed = Object.values(NOTIFICATION_CATEGORY);

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(allowed).toContain(item.category);
    }
  });

  it('points every linked notification at a routable entity', async () => {
    const items = await mockNotifications.list();
    const routable = ['approval', 'booking', 'partner', 'cancellation', 'report'];

    for (const item of items) {
      if (item.entity) {
        expect(routable).toContain(item.entity.type);
        expect(item.entity.id).toBeTruthy();
      }
    }
  });

  it('leaves the newest notifications unread', async () => {
    const items = await mockNotifications.list();
    const newest = [...items].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    expect(newest[0]?.read).toBe(false);
  });
});
