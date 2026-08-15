'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ExternalLink, Info, Loader2, Mail, MailX } from 'lucide-react';
import { Avatar, ErrorState, LtrText, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { ApiError, payoutsApi } from '@/lib/api';
import { PAYOUT_STATUS } from '@/lib/constants';
import { reconcilePayout } from '@/lib/payouts/reconcile';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatDateTime, formatSAR } from '@/lib/utils/format';
import type { ID, PayoutDetail } from '@/types';

export interface PayoutDetailDrawerProps {
  payoutId: ID | null;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

export function PayoutDetailDrawer({
  payoutId,
  onOpenChange,
  onChanged,
}: PayoutDetailDrawerProps) {
  const t = useT();
  const { can } = useCan();
  const [detail, setDetail] = useState<PayoutDetail | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [reversing, setReversing] = useState(false);
  const [resending, setResending] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!payoutId) return;

    let stale = false;
    setDetail(null);
    setError(false);
    setErrorMessage(undefined);

    payoutsApi
      .get(payoutId)
      .then((result) => !stale && setDetail(result))
      .catch((err) => {
        if (stale) return;
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : undefined);
      });

    return () => {
      stale = true;
    };
  }, [payoutId, reloadToken]);

  const reversed = detail?.status === PAYOUT_STATUS.REVERSED;
  const reconciliation = detail ? reconcilePayout(detail) : null;

  async function resend() {
    if (!detail) return;
    setResending(true);
    try {
      await payoutsApi.resendNotification(detail.id);
      reload();
    } finally {
      setResending(false);
    }
  }

  return (
    <Drawer open={Boolean(payoutId)} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title={t.payouts.detailTitle} />

        {error ? (
          <DrawerBody>
            <ErrorState description={errorMessage} onRetry={reload} />
          </DrawerBody>
        ) : !detail ? (
          <DrawerBody aria-busy>
            <div className="space-y-4 px-5 py-6">
              <Skeleton className="h-20 w-full rounded-2xl" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          </DrawerBody>
        ) : (
          <>
            <DrawerBody>
              <div
                className={cn(
                  'border-b border-hairline px-5 py-6',
                  reversed ? 'bg-surface-muted' : 'bg-surface-page',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <LtrText className="block truncate text-sm text-slate-500">
                      {detail.reference}
                    </LtrText>
                    <p
                      className={cn(
                        'mt-1 text-2xl font-semibold tabular-nums',
                        reversed ? 'text-slate-400 line-through' : 'text-slate-900',
                      )}
                    >
                      {formatSAR(detail.amount)}
                    </p>
                  </div>
                  <StatusBadge status={detail.status} />
                </div>

                {/* A reversal is the headline, not a timeline footnote. */}
                {reversed && detail.reversalReason && (
                  <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-status-redSoft px-3.5 py-3 text-sm text-status-red">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      <span className="block font-semibold">{t.payouts.reversalReason}</span>
                      <span className="mt-0.5 block">{detail.reversalReason}</span>
                    </span>
                  </p>
                )}
              </div>

              <DrawerSection title={t.payouts.partner}>
                <div className="flex items-center gap-3">
                  <Avatar name={detail.partnerName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">
                      {detail.partnerName}
                    </span>
                    <span className="block text-sm text-slate-500">
                      {t.status[detail.partnerType]}
                    </span>
                  </span>
                  <Link
                    href={`/wallets?open=${detail.partnerId}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    {t.wallets.detailTitle}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </DrawerSection>

              {/* Labelled explicitly: the operator must never wonder whether these are the
                  partner's current bank details or the ones used on the day. */}
              <DrawerSection title={t.payouts.frozenSnapshot}>
                <dl className="divide-y divide-hairline">
                  <DetailRow label={t.payouts.iban} value={detail.iban} ltr />
                  <DetailRow label={t.payouts.accountHolder} value={detail.accountHolderName} />
                  <DetailRow label={t.bank.bankName} value={detail.bankName ?? '—'} />
                </dl>
              </DrawerSection>

              <DrawerSection title={t.payouts.transferRecord}>
                <dl className="divide-y divide-hairline">
                  <DetailRow label={t.payouts.bankReference} value={detail.bankReference} ltr />
                  <DetailRow label={t.payouts.paidAt} value={formatDate(detail.paidAt)} ltr />
                  <DetailRow label={t.payouts.period} value={detail.periodMonth} ltr />
                  <DetailRow label={t.payouts.recordedBy} value={detail.recordedByAdminName} />
                  {detail.note && <DetailRow label={t.payouts.note} value={detail.note} />}
                </dl>

                {detail.notifiedAt ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-status-green">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    {t.payouts.notified} · <LtrText>{formatDateTime(detail.notifiedAt)}</LtrText>
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-status-amberSoft px-3.5 py-3">
                    <MailX className="h-4 w-4 shrink-0 text-status-amber" aria-hidden />
                    <span className="flex-1 text-sm text-status-amber">
                      {t.payouts.notifyFailed}
                    </span>
                    {can('payouts.execute') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={resending}
                        onClick={() => void resend()}
                      >
                        {resending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t.payouts.resendNotification}
                      </Button>
                    )}
                  </div>
                )}
              </DrawerSection>

              <DrawerSection title={t.payouts.bookingLines}>
                {/* Not an error state: a payout covers the whole balance, which can carry
                    adjustments no booking explains. Say which part, and why. */}
                {reconciliation && !reconciliation.reconciles && (
                  <p className="mb-3 flex items-start gap-2.5 rounded-xl bg-status-amberSoft px-3.5 py-3 text-sm text-status-amber">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {t.payouts.reconciliationNote(
                      formatSAR(Math.abs(reconciliation.difference)),
                    )}
                  </p>
                )}

                {detail.bookings.length === 0 ? (
                  <p className="rounded-xl bg-surface-muted px-3.5 py-3 text-sm text-slate-600">
                    {t.payouts.noBookingLines}
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-hairline">
                      {detail.bookings.map((line) => (
                        <li
                          key={line.bookingId}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <span className="min-w-0 flex-1">
                            <LtrText className="block text-sm font-medium text-slate-800">
                              {line.bookingCode}
                            </LtrText>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">
                              {line.unitName}
                            </span>
                            <LtrText className="mt-0.5 block text-xs text-slate-400">
                              {formatDate(line.checkOut)}
                            </LtrText>
                          </span>
                          <span className="shrink-0 text-end">
                            <span className="block font-semibold tabular-nums text-slate-900">
                              {formatSAR(line.partnerShare)}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-400">
                              {formatSAR(line.gross)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3.5 py-3">
                      <span className="text-sm font-medium text-slate-700">
                        {t.payouts.linesTotal}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {formatSAR(reconciliation?.linesTotal ?? 0)}
                      </span>
                    </div>
                  </>
                )}
              </DrawerSection>

              <DrawerSection title={t.payouts.timeline}>
                <ol className="space-y-3">
                  {detail.timeline.map((event, index) => (
                    <li key={`${event.at}-${index}`} className="flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          event.event === 'reversed' ? 'bg-status-red' : 'bg-brand-rail',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-800">
                          {t.payouts.event[event.event]}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {event.actor}
                          {event.detail ? ` · ${event.detail}` : ''}
                        </span>
                        <LtrText className="mt-0.5 block text-xs text-slate-400">
                          {formatDateTime(event.at)}
                        </LtrText>
                      </span>
                    </li>
                  ))}
                </ol>
              </DrawerSection>
            </DrawerBody>

            {can('payouts.reverse') && detail.status === PAYOUT_STATUS.PAID && (
              <DrawerFooter>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setReversing(true)}
                >
                  {t.payouts.reverse}
                </Button>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>

      <ReverseDialog
        payout={detail}
        open={reversing}
        onOpenChange={setReversing}
        onReversed={() => {
          reload();
          onChanged?.();
        }}
      />
    </Drawer>
  );
}

const REVERSAL_REASON_MIN = 10;

function ReverseDialog({
  payout,
  open,
  onOpenChange,
  onReversed,
}: {
  payout: PayoutDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReversed: () => void;
}) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason('');
      setAcknowledged(false);
      setPending(false);
      setError(null);
    }
  }, [open]);

  const reasonValid = reason.trim().length >= REVERSAL_REASON_MIN;
  const canSubmit = reasonValid && acknowledged && !pending;

  async function submit() {
    if (!payout || !canSubmit) return;

    setPending(true);
    setError(null);
    try {
      await payoutsApi.reverse(payout.id, { reason: reason.trim() });
      onOpenChange(false);
      onReversed();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.payouts.reverseTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          {payout && (
            <p className="rounded-xl bg-brand-soft/60 px-3.5 py-3 text-sm text-slate-700">
              {t.payouts.restores(formatSAR(payout.amount))}
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="reverse-reason" className="text-sm font-medium text-slate-700">
              {t.payouts.reversalReason}
            </label>
            <Textarea
              id="reverse-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface-page px-3.5 py-3">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            />
            <span className="text-sm text-slate-700">{t.payouts.confirmReverse}</span>
          </label>

          {error && <p className="text-sm text-status-red">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={() => void submit()} disabled={!canSubmit}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.payouts.reverse}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="shrink-0 text-sm text-slate-600">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-slate-900">
        {ltr ? <LtrText className="block truncate">{value}</LtrText> : <span className="block truncate">{value}</span>}
      </dd>
    </div>
  );
}
