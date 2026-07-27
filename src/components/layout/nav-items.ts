import {
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Dictionary } from '@/i18n';

export type BadgeSource = 'approvals' | 'notifications' | null;

export interface NavItem {
  href: string;
  labelKey: keyof Dictionary['nav'];
  icon: LucideIcon;
  badge: BadgeSource;
}

export interface NavGroup {
  titleKey: keyof Dictionary['nav'];
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'core',
    items: [
      { href: '/overview', labelKey: 'dashboard', icon: LayoutDashboard, badge: null },
      { href: '/users', labelKey: 'users', icon: Users, badge: null },
      { href: '/partners', labelKey: 'partners', icon: Building2, badge: null },
      { href: '/approvals', labelKey: 'approvals', icon: SquareCheckBig, badge: 'approvals' },
    ],
  },
  {
    titleKey: 'operations',
    items: [
      { href: '/units', labelKey: 'units', icon: LayoutGrid, badge: null },
      { href: '/bookings', labelKey: 'bookings', icon: CalendarDays, badge: null },
      { href: '/cancellations', labelKey: 'cancellations', icon: CircleX, badge: null },
    ],
  },
  {
    titleKey: 'insights',
    items: [
      { href: '/reports', labelKey: 'reports', icon: BarChart3, badge: null },
      { href: '/notifications', labelKey: 'notifications', icon: Bell, badge: 'notifications' },
    ],
  },
  {
    titleKey: 'account',
    items: [{ href: '/profile', labelKey: 'profile', icon: User, badge: null }],
  },
];
