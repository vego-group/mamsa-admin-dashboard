'use client';

import { useCallback, useEffect, useState } from 'react';
import { CircleCheck, Clock, MapPin, XCircle } from 'lucide-react';
import { Avatar, ErrorState, LtrText, StatusBadge, Timeline } from '@/components/common';
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
import { PARTNER_SHARE_RATE, PLATFORM_COMMISSION_RATE } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatPercent, formatPhone, formatSAR } from '@/lib/utils/format';
import type { BookingDetail, ID } from '@/types';

export interface BookingDetailDrawerProps {
  bookingId: ID | null;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDrawer({ bookingId, onOpenChange }: BookingDetailDrawerProps) {
  const t = useT();
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!bookingId) return;

    let stale = false;
    setDetail(null);
    setError(false);

    bookingsApi
      .get(bookingId)
      .then((result) => !stale && setDetail(result))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [bookingId, reloadToken]);

  // Both labels carry the live rates, so the screen can never disagree with the split.
  const commissionRateLabel = formatPercent(PLATFORM_COMMISSION_RATE * 100, 0);
  const partnerRateLabel = formatPercent(PARTNER_SHARE_RATE * 100, 0);

  return (
    <Drawer open={Boolean(bookingId)} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title={t.bookings.detailTitle} />

        {error ? (
          <DrawerBody>
            <ErrorState onRetry={reload} />
          </DrawerBody>
        ) : !detail ? (
          <DrawerBody aria-busy>
            <div className="space-y-4 px-5 py-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-3 w-24" />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </DrawerBody>
        ) : (
          <DrawerBody>
            <div className="border-b border-hairline bg-surface-page px-5 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LtrText className="font-semibold text-slate-900">{detail.code}</LtrText>
                <StatusBadge status={detail.status} />
              </div>

              <p className="mt-3 text-lg font-semibold text-slate-900">{detail.unitName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4" aria-hidden />
                {t.cities[detail.unitCity as keyof typeof t.cities] ?? detail.unitCity}
              </p>
            </div>

            <DrawerSection title={t.bookings.stayDetails}>
              <div className="grid gap-3 sm:grid-cols-2">
                <DateTile label={t.bookings.checkIn} value={formatDate(detail.checkIn)} />
                <DateTile label={t.bookings.checkOut} value={formatDate(detail.checkOut)} />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-brand-soft/60 px-3.5 py-3">
                <span className="text-sm text-slate-600">{t.bookings.duration}</span>
                <span className="font-semibold text-slate-900">{t.bookings.nights(detail.nights)}</span>
              </div>
            </DrawerSection>

            <DrawerSection title={t.bookings.guestSection}>
              <Party
                name={detail.guestName}
                role={t.bookings.guestSection}
                phone={formatPhone(detail.guestPhone)}
              />
            </DrawerSection>

            <DrawerSection title={t.bookings.partnerSection}>
              <Party name={detail.partnerName} role={t.bookings.partnerRole} />
            </DrawerSection>

            <DrawerSection title={t.bookings.revenueBreakdown}>
              <dl className="divide-y divide-hairline">
                <DrawerStatRow
                  label={t.bookings.totalBookingAmount}
                  value={formatSAR(detail.total)}
                />
                {/* Mamsa-owned units have no partner split — the 2%/98% lines would
                    be a lie there, so the note replaces them. */}
                {!detail.mamsaOwned && (
                  <>
                    <DrawerStatRow
                      label={t.bookings.commissionWithRate(commissionRateLabel)}
                      value={formatSAR(detail.commission)}
                    />
                    <DrawerStatRow
                      label={t.bookings.partnerEarningWithRate(partnerRateLabel)}
                      value={formatSAR(detail.partnerShare)}
                    />
                  </>
                )}
                <DrawerStatRow
                  label={t.bookings.nightlyRate}
                  value={`${formatSAR(detail.nightlyRate)} ${t.bookings.perNight}`}
                />
              </dl>

              {detail.mamsaOwned && (
                <p className="mt-3 rounded-xl bg-status-blueSoft px-3.5 py-2.5 text-sm text-status-blue">
                  {t.bookings.mamsaOwned}
                </p>
              )}
            </DrawerSection>

            <DrawerSection title={t.bookings.paymentSection}>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-page px-3.5 py-3">
                <span className="font-medium text-slate-800">{detail.paymentMethod}</span>
                <StatusBadge status={detail.paymentStatus} />
              </div>

              {detail.moyasarRef && (
                <p className="mt-2 flex items-center justify-between gap-3 px-1 text-sm">
                  <span className="text-slate-500">{t.bookings.moyasarRef}</span>
                  <LtrText className="text-slate-700">{detail.moyasarRef}</LtrText>
                </p>
              )}
            </DrawerSection>

            <DrawerSection title={t.bookings.timeline}>
              <Timeline items={detail.timeline} />
            </DrawerSection>

            <DrawerSection title={t.bookings.cancellationPolicy}>
              <p className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                {t.bookings.policyCaptured}
                <LtrText>{formatDate(detail.policySnapshot.capturedAt)}</LtrText>
              </p>
              <ul className="space-y-3 rounded-2xl bg-surface-page p-4">
                {detail.policySnapshot.tiers.map((tier) => (
                  <PolicyLine key={tier.label} label={tier.label} refundPercent={tier.refundPercent} />
                ))}
              </ul>
            </DrawerSection>
          </DrawerBody>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function DateTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-page px-3.5 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <LtrText className="mt-1 block font-semibold text-slate-900">{value}</LtrText>
    </div>
  );
}

function Party({ name, role, phone }: { name: string; role: string; phone?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">{role}</p>
        {phone && <LtrText className="block text-sm text-slate-500">{phone}</LtrText>}
      </div>
    </div>
  );
}

/** Full refund reads as safe, partial as caution, none as a hard stop. */
function PolicyLine({ label, refundPercent }: { label: string; refundPercent: number }) {
  const Icon = refundPercent === 100 ? CircleCheck : refundPercent > 0 ? Clock : XCircle;
  const tone =
    refundPercent === 100
      ? 'text-status-green'
      : refundPercent > 0
        ? 'text-status-amber'
        : 'text-status-red';

  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-700">
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone)} aria-hidden />
      {label}
    </li>
  );
}
