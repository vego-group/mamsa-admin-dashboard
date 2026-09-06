'use client';

import type { ReactNode } from 'react';
import { Phone, Wallet } from 'lucide-react';
import { Avatar, LtrText } from '@/components/common';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { formatHalalas } from '@/lib/complaints/money';
import { formatPhone } from '@/lib/utils/format';
import type { ComplaintDetail } from '@/types';

/**
 * Area B. Both mobiles are on the screen on purpose: the admin phones the guest and the
 * partner before deciding, and a number they have to look up elsewhere is a call they
 * skip.
 */
export function PartiesCard({ detail }: { detail: ComplaintDetail }) {
  const t = useT();

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-slate-900">{t.complaints.partiesSection}</h2>

      <div className="mt-4 space-y-5">
        <Party
          role={t.complaints.guestParty}
          name={detail.guest.name ?? t.complaints.unknown}
          phone={detail.guest.phone}
        />
        <Party
          role={t.complaints.partnerParty}
          name={detail.partner.name ?? t.complaints.unknown}
          phone={detail.partner.phone}
        >
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            {t.complaints.availableBalance}
            <LtrText className="font-semibold text-slate-900">
              {formatHalalas(detail.partner.availableBalanceHalalas)}
            </LtrText>
          </p>
        </Party>
      </div>

      <p className="mt-4 rounded-xl bg-surface-muted px-3.5 py-2.5 text-xs text-slate-600">
        {t.complaints.partiesNote}
      </p>
    </Card>
  );
}

function Party({
  role,
  name,
  phone,
  children,
}: {
  role: string;
  name: string;
  phone: string | null;
  children?: ReactNode;
}) {
  const t = useT();

  return (
    <div className="flex items-start gap-3">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">{role}</p>
        <p className="truncate font-semibold text-slate-900">{name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="sr-only">{t.complaints.mobile}</span>
          {phone ? (
            <a href={`tel:${phone}`} className="transition-colors hover:text-brand">
              <LtrText>{formatPhone(phone)}</LtrText>
            </a>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </p>
        {children}
      </div>
    </div>
  );
}
