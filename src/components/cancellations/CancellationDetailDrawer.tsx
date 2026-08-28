'use client';

import { useCallback, useEffect, useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { Avatar, ErrorState, LtrText, StatusBadge } from '@/components/common';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerSection,
  DrawerStatRow,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { bookingsApi } from '@/lib/api';
import { CANCELLED_BY, PARTNER_SHARE_RATE, PLATFORM_COMMISSION_RATE } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatPercent, formatSAR, splitForUnit } from '@/lib/utils/format';
import type { BookingDetail, Cancellation } from '@/types';

export interface CancellationDetailDrawerProps {
  cancellation: Cancellation | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * A host cancellation has one fixed outcome: the guest is refunded in full, the
 * partner forfeits their 90% and Mamsa forfeits its 10% — all from the constants.
 * A guest cancellation instead pays out whatever tier of the booking's frozen
 * policy snapshot applied, so that branch reads the snapshot off the booking.
 */
export function CancellationDetailDrawer({
  cancellation,
  onOpenChange,
}: CancellationDetailDrawerProps) {
  const t = useT();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const isGuestCancellation = cancellation?.cancelledBy === CANCELLED_BY.GUEST;

  useEffect(() => {
    if (!cancellation || cancellation.cancelledBy !== CANCELLED_BY.GUEST) return;

    let stale = false;
    setBooking(null);
    setError(false);

    bookingsApi
      .get(cancellation.bookingId)
      .then((result) => !stale && setBooking(result))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [cancellation, reloadToken]);

  return (
    <Drawer open={Boolean(cancellation)} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title={t.cancellations.detailTitle} />

        {cancellation && (
          <DrawerBody>
            <div className="border-b border-hairline bg-surface-page px-5 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LtrText className="font-semibold text-slate-900">{cancellation.id}</LtrText>
                <StatusBadge status={cancellation.refundStatus} />
              </div>

              <p className="mt-3 text-lg font-semibold text-slate-900">{cancellation.unitName}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <LtrText>{cancellation.bookingCode}</LtrText>
                <span aria-hidden>·</span>
                <LtrText>{formatDate(cancellation.at)}</LtrText>
                <StatusBadge status={cancellation.cancelledBy} dot={false} />
              </p>

              <div className="mt-4 flex items-center gap-3">
                <Avatar name={cancellation.guestName} size="sm" />
                <p className="truncate text-sm font-medium text-slate-800">
                  {cancellation.guestName}
                </p>
              </div>
            </div>

            <DrawerSection title={t.common.reason}>
              <p className="rounded-xl bg-surface-page px-3.5 py-3 text-sm leading-relaxed text-slate-700">
                {cancellation.reason}
              </p>
            </DrawerSection>

            <DrawerSection title={t.cancellations.impactPanel}>
              {isGuestCancellation ? (
                <GuestImpact cancellation={cancellation} booking={booking} error={error} onRetry={reload} />
              ) : (
                <HostImpact cancellation={cancellation} />
              )}
            </DrawerSection>
          </DrawerBody>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/** Fixed 100 / 90 / 10 split, computed live from the platform constants. */
function HostImpact({ cancellation }: { cancellation: Cancellation }) {
  const t = useT();
  const split = splitForUnit(cancellation.bookingTotal, cancellation.mamsaOwned);
  const fullRateLabel = formatPercent(100, 0);
  const partnerRateLabel = formatPercent(PARTNER_SHARE_RATE * 100, 0);
  const commissionRateLabel = formatPercent(PLATFORM_COMMISSION_RATE * 100, 0);

  return (
    <>
      <dl className="divide-y divide-hairline">
        <DrawerStatRow
          label={t.cancellations.guestRefunded(fullRateLabel)}
          value={formatSAR(cancellation.bookingTotal)}
        />
        {cancellation.mamsaOwned ? (
          <DrawerStatRow
            label={t.cancellations.mamsaLoses(fullRateLabel)}
            value={formatSAR(split.commission)}
          />
        ) : (
          <>
            <DrawerStatRow
              label={t.cancellations.partnerLoses(partnerRateLabel)}
              value={formatSAR(split.partnerShare)}
            />
            <DrawerStatRow
              label={t.cancellations.mamsaLoses(commissionRateLabel)}
              value={formatSAR(split.commission)}
            />
          </>
        )}
      </dl>

      <p className="mt-3 rounded-xl bg-status-amberSoft px-3.5 py-2.5 text-sm text-status-amber">
        {t.cancellations.hostImpactNote}
      </p>
      {cancellation.mamsaOwned && (
        <p className="mt-2 rounded-xl bg-status-blueSoft px-3.5 py-2.5 text-sm text-status-blue">
          {t.bookings.mamsaOwned}
        </p>
      )}
    </>
  );
}

/** Refund derived from the tiers frozen on the booking, never the unit's policy. */
function GuestImpact({
  cancellation,
  booking,
  error,
  onRetry,
}: {
  cancellation: Cancellation;
  booking: BookingDetail | null;
  error: boolean;
  onRetry: () => void;
}) {
  const t = useT();

  if (error) return <ErrorState onRetry={onRetry} />;

  if (!booking) {
    return (
      <div className="space-y-2" aria-busy>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const appliedPercent = cancellation.bookingTotal
    ? Math.round((cancellation.refundAmount / cancellation.bookingTotal) * 100)
    : 0;
  const appliedIndex = booking.policySnapshot.tiers.findIndex(
    (tier) => tier.refundPercent === appliedPercent,
  );

  return (
    <>
      <p className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        {t.bookings.policyCaptured}
        <LtrText>{formatDate(booking.policySnapshot.capturedAt)}</LtrText>
      </p>

      <ul className="space-y-2.5 rounded-2xl bg-surface-page p-4">
        {booking.policySnapshot.tiers.map((tier, index) => {
          const applied = index === appliedIndex;
          return (
            <li
              key={tier.label}
              className={cn(
                'flex items-center justify-between gap-3 text-sm',
                applied ? 'font-semibold text-slate-900' : 'text-slate-600',
              )}
            >
              <span className="flex items-center gap-2">
                {applied && (
                  <CircleCheck className="h-4 w-4 shrink-0 text-status-green" aria-hidden />
                )}
                {tier.label}
                {applied && (
                  <span className="rounded-full bg-status-greenSoft px-2 py-0.5 text-xs font-medium text-status-green">
                    {t.cancellations.appliedTier}
                  </span>
                )}
              </span>
              <span className="tabular-nums">{formatPercent(tier.refundPercent, 0)}</span>
            </li>
          );
        })}
      </ul>

      <dl className="mt-3 divide-y divide-hairline">
        <DrawerStatRow
          label={t.cancellations.bookingTotal}
          value={formatSAR(cancellation.bookingTotal)}
        />
        <DrawerStatRow
          label={t.cancellations.guestRefunded(formatPercent(appliedPercent, 0))}
          value={formatSAR(cancellation.refundAmount)}
        />
      </dl>

      <p className="mt-3 rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-slate-600">
        {t.cancellations.guestImpactNote}
      </p>
    </>
  );
}
