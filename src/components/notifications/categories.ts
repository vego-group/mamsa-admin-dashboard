import {
  Banknote,
  Building2,
  CalendarCheck,
  CircleX,
  DollarSign,
  Settings,
  SquareCheck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationCategory } from '@/lib/constants';
import type { ID, NotificationItem } from '@/types';

/**
 * One icon/tone/route table shared by the header bell and the notifications page,
 * so a category can never look like one thing in the panel and another in the list.
 */
export const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  approval: SquareCheck,
  // `booking` is what the backend maps its `new_booking` event onto (source event
  // `event_available`): a confirmed date, not merely a calendar.
  booking: CalendarCheck,
  cancellation: CircleX,
  partner: Building2,
  system: Settings,
  refund: DollarSign,
  payout: Banknote,
  wallet: Wallet,
};

export const CATEGORY_TONE: Record<NotificationCategory, string> = {
  approval: 'bg-status-greenSoft text-status-green',
  booking: 'bg-status-blueSoft text-status-blue',
  cancellation: 'bg-status-redSoft text-status-red',
  partner: 'bg-status-sageSoft text-status-sage',
  system: 'bg-status-greySoft text-status-grey',
  refund: 'bg-status-amberSoft text-status-amber',
  payout: 'bg-status-blueSoft text-status-blue',
  wallet: 'bg-status-sageSoft text-status-sage',
};

/**
 * Where each notification hands off. Approval has a real detail route; booking,
 * partner and cancellation deep-link via `?open=<id>`, which the list page reads
 * on mount to pop the matching row's drawer.
 */
const ENTITY_ROUTE: Partial<
  Record<NonNullable<NotificationItem['entity']>['type'], (id: ID) => string>
> = {
  approval: (id) => `/approvals/${id}`,
  booking: (id) => `/bookings?open=${id}`,
  partner: (id) => `/partners?open=${id}`,
  cancellation: (id) => `/cancellations?open=${id}`,
  report: () => '/reports',
};

/**
 * `null` for a notification with nothing to open — either the backend sent no entity,
 * or it sent a type this build has no route for.
 *
 * `Partial` and the explicit miss are load-bearing. `entity.type` is derived from the
 * notification payload at runtime, so the backend can introduce a new value without a
 * release on our side (their §10.3). Indexing a total Record with an unknown key
 * returned `undefined` and we called it — a TypeError that took down the bell and the
 * notifications page for every notification in the list, not just the unknown one.
 */
export function notificationHref(item: NotificationItem): string | null {
  if (!item.entity) return null;

  const route = ENTITY_ROUTE[item.entity.type];
  if (!route) {
    console.warn('[notifications] no route for entity type %o — rendering it unlinked', item.entity.type);
    return null;
  }

  return route(item.entity.id);
}

/**
 * Icon and tone for a category, tolerating one this build does not know.
 *
 * `category` is keyword-matched server-side against the notification class name, so a
 * class rename can change it with no API change at all (their §10.4). An unknown value
 * previously resolved to `undefined` and React threw on rendering it as a component.
 */
export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON[category as NotificationCategory] ?? CATEGORY_ICON.system;
}

export function categoryTone(category: string): string {
  return CATEGORY_TONE[category as NotificationCategory] ?? CATEGORY_TONE.system;
}
