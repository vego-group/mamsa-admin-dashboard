'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader2, Mail } from 'lucide-react';
import { LtrText } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n';
import { ApiError, payoutsApi } from '@/lib/api';
import { cn } from '@/lib/utils/cn';
import { formatSAR } from '@/lib/utils/format';
import type { EligiblePartner } from '@/types';

const REFERENCE_MIN = 4;
const REFERENCE_MAX = 64;

export interface RecordTransferDialogProps {
  partner: EligiblePartner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecorded: (reference: string) => void;
  /** The list was stale — the caller re-syncs and explains why. */
  onStale: (message: string) => void;
}

/**
 * Records a transfer the accountant has *already* made in their banking channel.
 *
 * The amount and the IBAN are rendered as text, never as inputs — not even disabled
 * ones, which still read as "editable but not right now". The only free-text fields in
 * the whole payout flow are the bank reference, the date and an optional note.
 */
export function RecordTransferDialog({
  partner,
  open,
  onOpenChange,
  onRecorded,
  onStale,
}: RecordTransferDialogProps) {
  const t = useT();
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Guards the gap between click and state flush — a double click must not pay twice.
  const submitting = useRef(false);

  useEffect(() => {
    if (!open) {
      setReference('');
      setPaidAt('');
      setNote('');
      setConfirmed(false);
      setPending(false);
      setReferenceError(null);
      setError(null);
      setCopied(false);
      submitting.current = false;
    }
  }, [open]);

  const trimmed = reference.trim();
  const referenceValid = trimmed.length >= REFERENCE_MIN && trimmed.length <= REFERENCE_MAX;
  const canSubmit = referenceValid && confirmed && !pending;
  const today = new Date().toISOString().slice(0, 10);

  function copyTransferData() {
    if (!partner) return;
    const block = [
      partner.accountHolderName,
      partner.iban,
      formatSAR(partner.amount),
    ].join('\n');
    void navigator.clipboard?.writeText(block);
    setCopied(true);
  }

  async function submit() {
    if (!partner || !canSubmit || submitting.current) return;

    submitting.current = true;
    setPending(true);
    setReferenceError(null);
    setError(null);

    try {
      const result = await payoutsApi.record({
        partnerId: partner.partnerId,
        bankReference: trimmed,
        // Only sent when the operator deliberately picked a date; otherwise the server
        // stamps its own clock, which is the one that decides the payout period.
        paidAt: paidAt ? new Date(paidAt).toISOString() : undefined,
        note: note.trim() || undefined,
      });

      onOpenChange(false);
      onRecorded(result.reference);
    } catch (err) {
      submitting.current = false;

      if (err instanceof ApiError && err.code === 'DUPLICATE_BANK_REFERENCE') {
        // Belongs on the field that caused it, not in a toast the operator must map back.
        setReferenceError(t.errors.duplicateBankReference);
        return;
      }

      if (
        err instanceof ApiError &&
        (err.code === 'NOT_ELIGIBLE' || err.code === 'ALREADY_PAID_THIS_MONTH')
      ) {
        // The list was stale. Re-sync rather than argue with the operator.
        onOpenChange(false);
        onStale(err.message);
        return;
      }

      setError(err instanceof ApiError ? err.message : t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.payouts.recordTitle}</DialogTitle>
        </DialogHeader>

        {partner && (
          <div className="space-y-4 px-5 py-5">
            {/* Read-only block, deliberately styled as a statement rather than a form. */}
            <dl className="divide-y divide-hairline rounded-xl bg-surface-muted px-4 py-1">
              <SummaryRow label={t.payouts.partner} value={partner.partnerName} />
              <SummaryRow
                label={t.payouts.amount}
                value={formatSAR(partner.amount)}
                emphasise
              />
              <SummaryRow label={t.payouts.accountHolder} value={partner.accountHolderName} />
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="shrink-0 text-sm text-slate-600">{t.payouts.iban}</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <LtrText className="truncate text-sm font-semibold text-slate-900">
                    {partner.iban}
                  </LtrText>
                  <button
                    type="button"
                    onClick={copyTransferData}
                    title={t.payouts.copyTransferData}
                    aria-label={t.payouts.copyTransferData}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-brand"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-status-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </dd>
              </div>
              <SummaryRow
                label={t.payouts.bookingsCount}
                value={t.payouts.bookingsWithCount(partner.bookingsCount)}
              />
            </dl>

            <div className="space-y-1.5">
              <label htmlFor="payout-reference" className="text-sm font-medium text-slate-700">
                {t.payouts.bankReference}
              </label>
              <Input
                id="payout-reference"
                dir="ltr"
                value={reference}
                maxLength={REFERENCE_MAX}
                onChange={(event) => {
                  setReference(event.target.value);
                  setReferenceError(null);
                }}
                className={cn('tabular-nums', referenceError && 'border-status-red')}
                aria-invalid={Boolean(referenceError)}
                aria-describedby="payout-reference-hint"
              />
              <p
                id="payout-reference-hint"
                className={cn('text-xs', referenceError ? 'text-status-red' : 'text-slate-500')}
              >
                {referenceError ?? t.payouts.bankReferenceHint}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="payout-date" className="text-sm font-medium text-slate-700">
                  {t.payouts.paidAt}
                </label>
                <Input
                  id="payout-date"
                  type="date"
                  dir="ltr"
                  value={paidAt}
                  max={today}
                  onChange={(event) => setPaidAt(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="payout-note" className="text-sm font-medium text-slate-700">
                {t.payouts.note}
              </label>
              <Textarea
                id="payout-note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface-page px-3.5 py-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              />
              <span className="text-sm text-slate-700">{t.payouts.confirmTransfer}</span>
            </label>

            {/* Not decoration: this fires an irreversible email to a real person, and the
                operator must know that before clicking, not discover it afterwards. */}
            <p className="flex items-start gap-2.5 rounded-xl bg-status-amberSoft px-3.5 py-3 text-sm text-status-amber">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {t.payouts.notifyWarning}
            </p>

            {error && <p className="text-sm text-status-red">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.payouts.record}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({
  label,
  value,
  emphasise,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="shrink-0 text-sm text-slate-600">{label}</dt>
      <dd
        className={cn(
          'min-w-0 truncate font-semibold text-slate-900',
          emphasise ? 'text-lg tabular-nums' : 'text-sm',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
