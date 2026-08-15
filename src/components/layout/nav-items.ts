import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CircleX,
  LayoutDashboard,
  LayoutGrid,
  SquareCheckBig,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Dictionary } from '@/i18n';
import type { Permission } from '@/types';

export type BadgeSource = 'approvals' | 'notifications' | null;

export interface NavItem {
  href: string;
  labelKey: keyof Dictionary['nav'];
  icon: LucideIcon;
  badge: BadgeSource;
  /**
   * The capability that opens this route. An item the admin lacks is not rendered
   * at all — a greyed-out entry would still disclose that the screen exists.
   */
  permission: Permission;
}

export interface NavGroup {
  titleKey: keyof Dictionary['nav'];
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'core',
    items: [
      {
        href: '/overview',
        labelKey: 'dashboard',
        icon: LayoutDashboard,
        badge: null,
        permission: 'dashboard.view',
      },
      { href: '/users', labelKey: 'users', icon: Users, badge: null, permission: 'users.view' },
      {
        href: '/partners',
        labelKey: 'partners',
        icon: Building2,
        badge: null,
        permission: 'partners.view',
      },
      {
        href: '/approvals',
        labelKey: 'approvals',
        icon: SquareCheckBig,
        badge: 'approvals',
        permission: 'approvals.view',
      },
    ],
  },
  {
    titleKey: 'operations',
    items: [
      { href: '/units', labelKey: 'units', icon: LayoutGrid, badge: null, permission: 'units.view' },
      {
        href: '/bookings',
        labelKey: 'bookings',
        icon: CalendarDays,
        badge: null,
        permission: 'bookings.view',
      },
      {
        href: '/cancellations',
        labelKey: 'cancellations',
        icon: CircleX,
        badge: null,
        permission: 'cancellations.view',
      },
      {
        href: '/wallets',
        labelKey: 'wallets',
        icon: Wallet,
        badge: null,
        permission: 'wallets.view',
      },
      {
        href: '/payouts',
        labelKey: 'payouts',
        icon: Banknote,
        badge: null,
        permission: 'payouts.view',
      },
    ],
  },
  {
    titleKey: 'insights',
    items: [
      {
        href: '/reports',
        labelKey: 'reports',
        icon: BarChart3,
        badge: null,
        permission: 'reports.financial',
      },
      {
        href: '/notifications',
        labelKey: 'notifications',
        icon: Bell,
        badge: 'notifications',
        permission: 'notifications.view',
      },
    ],
  },
  {
    titleKey: 'account',
    items: [
      { href: '/profile', labelKey: 'profile', icon: User, badge: null, permission: 'profile.view' },
    ],
  },
];
