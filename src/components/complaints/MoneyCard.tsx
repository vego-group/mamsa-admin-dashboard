'use client';

import { Building2 } from 'lucide-react';
import { LtrText } from '@/components/common';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { formatRiyadhDate, formatRiyadhDateTime } from '@/lib/complaints/dates';
import { formatHalalas } from '@/lib/complaints/money';
import { cn } from '@/lib/utils/cn';
import type { ComplaintDetail } from '@/types';

/**
 * Area C. Every figure is the API's, rendered as sent — `commissionHalalas`,
 * `partnerShareHalalas`, `alreadyRefundedHalalas`, `maxRefundableHalalas` — with no
 * arithmetic on a commission rate anywhere in this file or under it. The booking froze
 * its split at a rate today's constant may not match, and the server is the only party
 * that knows which one.
 */
export function MoneyCard({ detail }: { detail: ComplaintDetail }) {
  const t = useT();
  const { booking, complaint } = detail;

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-slate-900">{t.complaints.moneySection}</h2>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Tile label={t.complaints.checkIn} value={formatRiyadhDate(booking.checkIn)} />
        <Tile label={t.complaints.checkOut} value={formatRiyadhDate(booking.checkOut)} />
      </div>

      <dl className="mt-4 divide-y divide-hairline">
        <Row label={t.complaints.bookingGross} halalas={booking.grossHalalas} />
        <Row label={t.complaints.ofWhichVat} halalas={booking.vatHalalas} muted />
        <Row label={t.complaints.mamsaCommission} halalas={booking.commissionHalalas} muted />
        <Row label={t.complaints.partnerShare} halalas={booking.partnerShareHalalas} muted />
        <Row label={t.complaints.alreadyRefunded} halalas={booking.alreadyRefundedHalalas} />
        {/* In-flight money is neither refunded nor available. The line exists only while
            there is some, in the same neutral tone as the pending badge, so a ceiling
            that dropped explains itself. */}
        {booking.pendingRefundHalalas > 0 && (
          <Row
            label={t.complaints.pendingSettlement}
            halalas={booking.pendingRefundHalalas}
            muted
          />
        )}
        <Row
          label={t.complaints.maxRefundable}
          halalas={booking.maxRefundableHalalas}
          hint={t.complaints.inputCeiling}
          emphasise
        />
      </dl>

      {booking.mamsaOwned && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-status-blueSoft px-3.5 py-2.5 text-sm text-status-blue">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {t.complaints.mamsaOwnedBadge}
        </p>
      )}

      <div className="mt-4 rounded-2xl bg-surface-page px-4 py-3">
        <p className="text-xs text-slate-500">{t.complaints.approvedAmount}</p>
        {complaint.approvedRefundHalalas === null ? (
          <p className="mt-1 text-sm text-slate-500">{t.complaints.notApprovedYet}</p>
        ) : (
          <>
            <LtrText className="mt-1 block text-2xl font-semibold text-slate-900">
              {formatHalalas(complaint.approvedRefundHalalas)}
            </LtrText>
            {complaint.approvedAt && (
              <p className="mt-0.5 text-xs text-slate-500">
                {t.complaints.approvedOn(formatRiyadhDateTime(complaint.approvedAt))}
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-page px-3.5 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <LtrText className="mt-1 block font-semibold text-slate-900">{value}</LtrText>
    </div>
  );
}

function Row({
  label,
  halalas,
  hint,
  muted,
  emphasise,
}: {
  label: string;
  halalas: number;
  hint?: string;
  muted?: boolean;
  emphasise?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className={cn('text-sm', muted ? 'text-slate-500' : 'text-slate-600')}>
        {label}
        {hint && <span className="block text-xs text-slate-400">{hint}</span>}
      </dt>
      <dd>
        <LtrText
          className={cn(
            'font-semibold',
            muted ? 'text-sm text-slate-600' : 'text-slate-900',
            emphasise && 'text-lg',
          )}
        >
          {formatHalalas(halalas)}
        </LtrText>
      </dd>
    </div>
  );
}
