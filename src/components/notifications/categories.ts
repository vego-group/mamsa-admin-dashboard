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
const ENTITY_ROUTE: Record<NonNullable<NotificationItem['entity']>['type'], (id: ID) => string> = {
  approval: (id) => `/approvals/${id}`,
  booking: (id) => `/bookings?open=${id}`,
  partner: (id) => `/partners?open=${id}`,
  cancellation: (id) => `/cancellations?open=${id}`,
  report: () => '/reports',
};

/** `null` for a notification the backend sent without an entity — nothing to open. */
export function notificationHref(item: NotificationItem): string | null {
  return item.entity ? ENTITY_ROUTE[item.entity.type](item.entity.id) : null;
}
