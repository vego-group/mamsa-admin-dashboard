'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CircleCheck, Hourglass, Loader2 } from 'lucide-react';
import { LtrText, RichText } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/i18n';
import { ApiError, complaintsApi } from '@/lib/api';
import { newIdempotencyKey } from '@/lib/complaints/idempotency';
import { formatHalalas } from '@/lib/complaints/money';
import type { ComplaintDetail, RefundComplaintResult } from '@/types';

export interface ExecuteRefundDialogProps {
  open: boolean;
  /** `retry` follows a confirmed failure; the copy says so, and the key is fresh. */
  mode: 'execute' | 'retry';
  detail: ComplaintDetail;
  onOpenChange: (open: boolean) => void;
  /** The server accepted the request. The caller re-fetches the detail. */
  onExecuted: (result: RefundComplaintResult) => void;
  /** The complaint changed under us — the caller re-fetches and explains why. */
  onStale: (message: string) => void;
  /**
   * `409 REFUND_IN_FLIGHT`: a refund is already at the gateway. Not a failure and not
   * something to retry — the caller re-fetches and shows the attempt in flight, in a
   * neutral tone. Kept apart from `onStale` so the page cannot paint it as a warning.
   */
  onInFlight: (message: string) => void;
}

/**
 * The one dialog in the feature that moves money.
 *
 * Four rules, each from the spec and each a way to refund a guest twice if broken:
 *
 * 1. The amount is **read-only** — the approved figure, rendered as text and sent as is.
 *    The server compares by strict equality; a different number is an amendment, which is
 *    a different dialog under a different permission.
 * 2. One idempotency key per attempt, minted when the dialog opens and held until it
 *    closes. An interrupted request is retried **with the same key**, so the server can
 *    answer with the original outcome (`replayed: true`) instead of a second refund.
 * 3. `status: 'pending'` is not a success to celebrate. The gateway accepted the request;
 *    settlement lands later. The copy and the colour say "processing", never "refunded".
 * 4. `REFUND_IN_FLIGHT` is the server's guard behind the page's own gate. It is answered
 *    by re-fetching, never by an error — an error is an invitation to click again.
 */
export function ExecuteRefundDialog({
  open,
  mode,
  detail,
  onOpenChange,
  onExecuted,
  onStale,
  onInFlight,
}: ExecuteRefundDialogProps) {
  const t = useT();
  const approved = detail.complaint.approvedRefundHalalas;

  const [attemptKey, setAttemptKey] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RefundComplaintResult | null>(null);
  // Guards the gap between click and state flush — a double click must not execute twice.
  const submitting = useRef(false);

  useEffect(() => {
    if (open) {
      // A new attempt starts here and only here. The gate on the page guarantees no
      // pending refund exists at this moment, which is the precondition for a new key.
      setAttemptKey(newIdempotencyKey());
      return;
    }
    setAttemptKey(null);
    setConfirmed(false);
    setPending(false);
    setInterrupted(false);
    setError(null);
    setResult(null);
    submitting.current = false;
  }, [open]);

  const canSubmit = approved !== null && attemptKey !== null && confirmed && !pending;

  async function submit() {
    if (!canSubmit || approved === null || attemptKey === null || submitting.current) return;

    submitting.current = true;
    setPending(true);
    setError(null);
    setInterrupted(false);

    try {
      const outcome = await complaintsApi.refund(String(detail.complaint.id), {
        amountHalalas: approved,
        idempotencyKey: attemptKey,
      });
      setResult(outcome);
      onExecuted(outcome);
    } catch (err) {
      submitting.current = false;

      if (err instanceof ApiError) {
        // A refund is already at the gateway — the server's guard fired behind ours.
        // Nothing failed and nothing may be retried: close, re-fetch, show the attempt.
        if (err.code === 'REFUND_IN_FLIGHT') {
          onOpenChange(false);
          onInFlight(err.message);
          return;
        }
        // The approval moved under us: the server's field message names the amount it
        // holds now. Re-sync rather than let the admin resend against a stale figure.
        if (err.code === 'AMOUNT_NOT_APPROVED' || err.code === 'AMOUNT_EXCEEDS_REFUNDABLE') {
          onOpenChange(false);
          onStale(err.fields?.amountHalalas ?? err.message);
          return;
        }
        if (err.code === 'CONFLICT' || err.status === 403) {
          onOpenChange(false);
          onStale(err.message);
          return;
        }
        // The server answered, but with no verdict on the refund (5xx, 429). The key
        // stays: if the refund was created, a retry replays it; if not, it runs once.
        setError(err.message);
        setInterrupted(true);
        return;
      }

      // No reply at all. The request may or may not have arrived — same key, try again.
      setInterrupted(true);
    } finally {
      setPending(false);
    }
  }

  const retry = mode === 'retry';

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-lg" hideClose={pending}>
        <DialogHeader>
          <DialogTitle>{retry ? t.complaints.retryTitle : t.complaints.executeTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          {/* Read-only by construction: text, never an input — not even a disabled one. */}
          <dl className="divide-y divide-hairline rounded-xl bg-surface-muted px-4 py-1">
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-sm text-slate-600">{t.complaints.executeToGuest}</dt>
              <dd>
                <LtrText className="text-lg font-semibold text-slate-900">
                  {approved === null ? '—' : formatHalalas(approved)}
                </LtrText>
              </dd>
            </div>
            {attemptKey && (
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="shrink-0 text-xs text-slate-500">{t.complaints.attemptKey}</dt>
                <dd className="min-w-0">
                  <LtrText className="block truncate text-xs text-slate-500">{attemptKey}</LtrText>
                </dd>
              </div>
            )}
          </dl>

          <p className="text-sm text-slate-600">
            {detail.booking.mamsaOwned
              ? t.complaints.executeNoPartner
              : t.complaints.executePartnerNote}
          </p>
          <p className="text-sm text-slate-600">{t.complaints.executeFixedNote}</p>

          {result ? (
            <ResultPanel result={result} />
          ) : (
            <>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface-page px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                />
                <span className="text-sm text-slate-700">{t.complaints.executeCheck}</span>
              </label>

              <p className="flex items-start gap-2.5 rounded-xl bg-status-amberSoft px-3.5 py-3 text-sm text-status-amber">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {retry ? t.complaints.retryWarning : t.complaints.executeWarning}
              </p>

              {interrupted && (
                <p className="rounded-xl bg-status-amberSoft px-3.5 py-3 text-sm text-status-amber">
                  {t.complaints.executeNetworkError}
                </p>
              )}
              {error && <p className="text-sm text-status-red">{error}</p>}
            </>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={() => onOpenChange(false)}>{t.complaints.executeDone}</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
                {t.common.cancel}
              </Button>
              <Button onClick={() => void submit()} disabled={!canSubmit}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {retry ? t.complaints.retryConfirm : t.complaints.executeConfirm}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * `pending` renders neutral — grey, an hourglass, "processing" — because that is what it
 * is. Green and a tick are reserved for `succeeded`, the only state in which money moved.
 */
function ResultPanel({ result }: { result: RefundComplaintResult }) {
  const t = useT();
  const settled = result.status === 'succeeded';

  return (
    <div
      role="status"
      className={
        settled
          ? 'rounded-xl bg-status-greenSoft px-3.5 py-3 text-sm text-status-green'
          : 'rounded-xl bg-surface-muted px-3.5 py-3 text-sm text-slate-700'
      }
    >
      {result.replayed && <p className="mb-2 text-xs text-slate-500">{t.complaints.executeReplayed}</p>}
      <p className="flex items-start gap-2.5">
        {settled ? (
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        )}
        <span>
          {settled ? (
            t.complaints.executeSucceeded
          ) : (
            <RichText template={t.complaints.executePending} />
          )}
        </span>
      </p>
    </div>
  );
}
