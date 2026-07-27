'use client';

import { useCallback, useEffect, useState } from 'react';
import { Ban, CalendarDays, CheckCircle2, Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import { Avatar, ErrorState, LtrText, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContactRow,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
  DrawerStatRow,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { usersApi } from '@/lib/api';
import { ACCOUNT_STATUS } from '@/lib/constants';
import { formatDate, formatPhone, formatSAR } from '@/lib/utils/format';
import type { ID, User, UserDetail } from '@/types';

export interface UserDetailDrawerProps {
  /** The row being inspected; `null` keeps the drawer closed. */
  userId: ID | null;
  onOpenChange: (open: boolean) => void;
  onToggleStatus: (user: User) => void;
  onRemove: (user: User) => void;
}

export function UserDetailDrawer({
  userId,
  onOpenChange,
  onToggleStatus,
  onRemove,
}: UserDetailDrawerProps) {
  const t = useT();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!userId) return;

    let stale = false;
    setDetail(null);
    setError(false);

    usersApi
      .get(userId)
      .then((result) => !stale && setDetail(result))
      .catch(() => !stale && setError(true));

    // A quick second click must not let the first response land on the new user.
    return () => {
      stale = true;
    };
  }, [userId, reloadToken]);

  const disabled = detail?.status === ACCOUNT_STATUS.DISABLED;

  return (
    <Drawer open={Boolean(userId)} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title={detail?.name ?? ''} />

        {error ? (
          <DrawerBody>
            <ErrorState onRetry={reload} />
          </DrawerBody>
        ) : !detail ? (
          <DrawerBody aria-busy>
            <div className="space-y-4 px-5 py-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </DrawerBody>
        ) : (
          <>
            <DrawerBody>
              <div className="flex items-center gap-4 border-b border-hairline bg-surface-page px-5 py-6">
                <Avatar name={detail.name} size="lg" className="text-base" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900">{detail.name}</p>
                  <LtrText className="text-sm text-slate-500">{detail.code}</LtrText>
                  <p className="mt-1.5">
                    <StatusBadge status={detail.status} />
                  </p>
                </div>
              </div>

              <DrawerSection title={t.users.contactInformation}>
                <DrawerContactRow icon={Mail}>
                  {detail.email ? (
                    <LtrText className="truncate">{detail.email}</LtrText>
                  ) : (
                    <span className="text-slate-400">{t.users.noEmail}</span>
                  )}
                </DrawerContactRow>
                <DrawerContactRow icon={Phone}>
                  <LtrText>{formatPhone(detail.phone)}</LtrText>
                </DrawerContactRow>
                <DrawerContactRow icon={MapPin}>
                  {t.cities[detail.city as keyof typeof t.cities] ?? detail.city}, {t.common.country}
                </DrawerContactRow>
                <DrawerContactRow icon={CalendarDays}>
                  {t.users.joinedOn} <LtrText>{formatDate(detail.joinedAt)}</LtrText>
                </DrawerContactRow>
              </DrawerSection>

              <DrawerSection title={t.users.bookingStatistics}>
                <dl className="divide-y divide-hairline">
                  <DrawerStatRow label={t.users.totalBookings} value={detail.bookingsCount} />
                  <DrawerStatRow label={t.users.totalSpent} value={formatSAR(detail.totalSpent)} />
                  <DrawerStatRow
                    label={t.users.avgBookingValue}
                    value={formatSAR(detail.avgBookingValue)}
                  />
                </dl>
              </DrawerSection>

              <DrawerSection title={t.users.recentActivity}>
                <ol className="space-y-4">
                  {detail.activity.map((item) => (
                    <li key={item.id}>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <LtrText className="text-xs text-slate-500">{formatDate(item.at)}</LtrText>
                    </li>
                  ))}
                </ol>
              </DrawerSection>
            </DrawerBody>

            <DrawerFooter>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => onToggleStatus(detail)}
              >
                {disabled ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {disabled ? t.users.enable : t.users.disable}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => onRemove(detail)}>
                <Trash2 className="h-4 w-4" />
                {t.users.remove}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

