'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { ApiError, complaintsApi } from '@/lib/api';
import { formatHalalas, halalasToInput, parseSarToHalalas } from '@/lib/complaints/money';
import { cn } from '@/lib/utils/cn';
import type { ComplaintDetail } from '@/types';

export interface ApproveAmountDialogProps {
  /** `approve` fixes a first amount; `amend` changes it before any money moves. */
  mode: 'approve' | 'amend';
  open: boolean;
  detail: ComplaintDetail;
  onOpenChange: (open: boolean) => void;
  /** Saved — the caller re-fetches the detail. */
  onSaved: () => void;
  /** The complaint changed under us — the caller re-fetches and explains why. */
  onStale: (message: string) => void;
  /** `REFUND_IN_FLIGHT` on an amendment: money is moving — re-fetch, neutral tone. */
  onInFlight: (message: string) => void;
}

/**
 * The decision, as opposed to the money. Approving fixes an amount and moves nothing;
 * a different admin with `complaints.execute_refund` sends it. The ceiling is the API's
 * `maxRefundableHalalas`, and the amount is typed in SAR and sent as integer halalas.
 */
export function ApproveAmountDialog({
  mode,
  open,
  detail,
  onOpenChange,
  onSaved,
  onStale,
  onInFlight,
}: ApproveAmountDialogProps) {
  const t = useT();
  const max = detail.booking.maxRefundableHalalas;
  const approved = detail.complaint.approvedRefundHalalas;

  const [amount, setAmount] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  // The starting value is read when the dialog opens, not on every detail refresh — a
  // background refetch must not wipe an amount the admin is halfway through typing.
  const initialRef = useRef('');
  initialRef.current = mode === 'amend' && approved !== null ? halalasToInput(approved) : '';

  useEffect(() => {
    if (!open) return;
    setAmount(initialRef.current);
    setGuestMessage('');
    setInternalNote('');
    setTouched(false);
    setPending(false);
    setFieldError(null);
    setError(null);
    submitting.current = false;
  }, [open]);

  const parsed = parseSarToHalalas(amount);
  const validation =
    amount.trim() === '' || parsed === null
      ? t.complaints.amountInvalid
      : parsed <= 0
        ? t.complaints.amountZero
        : parsed > max
          ? t.complaints.amountTooHigh(formatHalalas(max))
          : null;
  const shownError = fieldError ?? (touched ? validation : null);
  const canSubmit = validation === null && !pending;

  async function submit() {
    setTouched(true);
    if (!canSubmit || parsed === null || submitting.current) return;

    submitting.current = true;
    setPending(true);
    setFieldError(null);
    setError(null);

    const id = String(detail.complaint.id);
    try {
      if (mode === 'approve') {
        await complaintsApi.approve(id, { amountHalalas: parsed, guestMessage, internalNote });
      } else {
        await complaintsApi.amendApproval(id, parsed);
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      submitting.current = false;

      if (err instanceof ApiError) {
        // Belongs on the field: the server's message carries the ceiling it applied.
        if (err.code === 'AMOUNT_EXCEEDS_REFUNDABLE' || err.fields?.amountHalalas) {
          setFieldError(err.fields?.amountHalalas ?? err.message);
          return;
        }
        // Money is already moving on this complaint: not a failure, and not ours to
        // argue with — the screen re-syncs and shows the attempt in flight.
        if (err.code === 'REFUND_IN_FLIGHT') {
          onOpenChange(false);
          onInFlight(err.message);
          return;
        }
        // The state moved under us (409), or this admin may not do this (403) — the
        // screen re-syncs rather than arguing in place.
        if (err.code === 'CONFLICT' || err.status === 403) {
          onOpenChange(false);
          onStale(err.message);
          return;
        }
        setError(err.message);
        return;
      }

      setError(t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  const amendMode = mode === 'amend';

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{amendMode ? t.complaints.amendTitle : t.complaints.approveTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <dl className="divide-y divide-hairline rounded-xl bg-surface-muted px-4 py-1">
            {amendMode && approved !== null && (
              <SummaryRow label={t.complaints.currentApproved} value={formatHalalas(approved)} />
            )}
            <SummaryRow label={t.complaints.maxRefundable} value={formatHalalas(max)} emphasise />
          </dl>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="complaint-amount" className="text-sm font-medium text-slate-700">
                {t.complaints.amountLabel}
              </label>
              <button
                type="button"
                onClick={() => {
                  setAmount(halalasToInput(max));
                  setFieldError(null);
                }}
                className="text-xs font-medium text-brand hover:underline"
              >
                {t.complaints.useMax}
              </button>
            </div>
            <Input
              id="complaint-amount"
              dir="ltr"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setFieldError(null);
              }}
              onBlur={() => setTouched(true)}
              className={cn('tabular-nums', shownError && 'border-status-red')}
              aria-invalid={Boolean(shownError)}
              aria-describedby="complaint-amount-hint"
            />
            <p
              id="complaint-amount-hint"
              className={cn('text-xs', shownError ? 'text-status-red' : 'text-slate-500')}
            >
              {shownError ?? t.complaints.amountHint(formatHalalas(max))}
            </p>
          </div>

          {!amendMode && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="complaint-guest-message" className="text-sm font-medium text-slate-700">
                  {t.complaints.guestMessageLabel}
                </label>
                <Textarea
                  id="complaint-guest-message"
                  rows={2}
                  value={guestMessage}
                  placeholder={t.complaints.guestMessagePlaceholder}
                  onChange={(event) => setGuestMessage(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="complaint-internal-note" className="text-sm font-medium text-slate-700">
                  {t.complaints.internalNoteLabel}
                </label>
                <Textarea
                  id="complaint-internal-note"
                  rows={2}
                  value={internalNote}
                  placeholder={t.complaints.internalNotePlaceholder}
                  onChange={(event) => setInternalNote(event.target.value)}
                />
              </div>
            </>
          )}

          <p className="rounded-xl bg-surface-page px-3.5 py-3 text-sm text-slate-600">
            {amendMode ? t.complaints.amendNote : t.complaints.approveNote}
          </p>

          {error && <p className="text-sm text-status-red">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void submit()} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {amendMode ? t.complaints.amendConfirm : t.complaints.approveConfirm}
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
      <dd className="min-w-0">
        <LtrText
          className={cn('font-semibold text-slate-900', emphasise ? 'text-lg' : 'text-sm')}
        >
          {value}
        </LtrText>
      </dd>
    </div>
  );
}
