'use client';

import { AlertTriangle, Hourglass, Play, RotateCcw, Search, X } from 'lucide-react';
import { LtrText, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { availableActions, type ComplaintAction } from '@/lib/complaints/actions';
import { formatRiyadhDateTime } from '@/lib/complaints/dates';
import { formatHalalas } from '@/lib/complaints/money';
import { newestFirst, refundGate } from '@/lib/complaints/refund-state';
import { refundStatusBadge } from '@/lib/complaints/status';
import { COMPLAINT_REFUND_STATUS, COMPLAINT_STATUS } from '@/lib/constants';
import type { ComplaintDetail, ComplaintRefund, Permission } from '@/types';

export interface RefundPathProps {
  detail: ComplaintDetail;
  can: (permission: Permission) => boolean;
  onAction: (action: ComplaintAction) => void;
}

/**
 * Area D: the refund attempts, and the buttons this admin gets for this status.
 *
 * The execute button has exactly four states, taken from `refundGate` (§4.6): ready,
 * blocked on a pending attempt (disabled — not hidden — with the time it has been
 * pending), retry after a failure (with a fresh idempotency key, minted by the dialog),
 * and settled (nothing to do). Which buttons exist at all is `availableActions` (§4.5).
 */
export function RefundPath({ detail, can, onAction }: RefundPathProps) {
  const t = useT();
  const { complaint, booking, refunds } = detail;
  const actions = availableActions(complaint, can);
  const gate = refundGate(refunds);
  const rows = newestFirst(refunds);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{t.complaints.pathSection}</h2>
        {complaint.approvedRefundHalalas !== null && (
          <p className="text-sm text-slate-600">
            {t.complaints.approvedAmount}{' '}
            <LtrText className="font-semibold text-slate-900">
              {formatHalalas(complaint.approvedRefundHalalas)}
            </LtrText>
          </p>
        )}
      </div>

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {t.complaints.refundAttempts}
      </h3>

      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{t.complaints.noRefunds}</p>
      ) : (
        <ul className="mt-2 space-y-2.5">
          {rows.map((row) => (
            <RefundRow key={row.id} refund={row} mamsaOwned={booking.mamsaOwned} />
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-hairline pt-4">
        <ActionBar
          status={complaint.status}
          actions={actions}
          gate={gate}
          onAction={onAction}
        />
      </div>
    </Card>
  );
}

function RefundRow({ refund, mamsaOwned }: { refund: ComplaintRefund; mamsaOwned: boolean }) {
  const t = useT();
  const failed = refund.status === COMPLAINT_REFUND_STATUS.FAILED;

  return (
    <li className="rounded-2xl border border-hairline px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={refundStatusBadge(refund.status)} />
        <LtrText className="text-xs text-slate-500">{formatRiyadhDateTime(refund.createdAt)}</LtrText>
      </div>

      <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
        <Fact label={t.complaints.refundAmount} value={formatHalalas(refund.amountHalalas)} />
        <Fact
          label={t.complaints.partnerDeduction}
          value={
            mamsaOwned || refund.partnerHalalas === 0
              ? t.complaints.noPartnerDeduction
              : formatHalalas(refund.partnerHalalas)
          }
          ltr={!(mamsaOwned || refund.partnerHalalas === 0)}
        />
        {refund.moyasarRefundId && (
          <Fact label={t.complaints.moyasarRefund} value={refund.moyasarRefundId} ltr />
        )}
      </dl>

      {/* The one line an admin needs before deciding whether to retry — never folded away. */}
      {failed && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-status-redSoft px-3.5 py-2.5 text-sm text-status-red">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">{t.complaints.failureReason}: </span>
            {refund.failureReason ?? '—'}
          </span>
        </p>
      )}
    </li>
  );
}

function Fact({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{ltr ? <LtrText>{value}</LtrText> : value}</dd>
    </div>
  );
}

function ActionBar({
  status,
  actions,
  gate,
  onAction,
}: {
  status: ComplaintDetail['complaint']['status'];
  actions: ComplaintAction[];
  gate: ReturnType<typeof refundGate>;
  onAction: (action: ComplaintAction) => void;
}) {
  const t = useT();
  const has = (action: ComplaintAction) => actions.includes(action);

  if (status === COMPLAINT_STATUS.RESOLVED_REFUNDED || status === COMPLAINT_STATUS.RESOLVED_REJECTED) {
    return <Note>{t.complaints.readOnly}</Note>;
  }

  if (status === COMPLAINT_STATUS.SUBMITTED) {
    return has('review') ? (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onAction('review')}>
          <Search className="h-4 w-4" aria-hidden />
          {t.complaints.startReview}
        </Button>
      </div>
    ) : (
      <Note>{t.complaints.awaitingReview}</Note>
    );
  }

  if (status === COMPLAINT_STATUS.UNDER_REVIEW) {
    return has('approve') ? (
      <div className="flex flex-wrap gap-2">
        <Button variant="success" onClick={() => onAction('approve')}>
          {t.complaints.approveAmount}
        </Button>
        <Button variant="destructive" onClick={() => onAction('reject')}>
          <X className="h-4 w-4" aria-hidden />
          {t.complaints.reject}
        </Button>
      </div>
    ) : (
      <Note>{t.complaints.awaitingApproval}</Note>
    );
  }

  // approved
  return (
    <div className="space-y-3">
      {gate.kind === 'blocked' && (
        <div className="rounded-xl bg-surface-muted px-3.5 py-3">
          {/* Disabled, not hidden: the admin must see that something is in flight. */}
          <Button disabled className="w-full sm:w-auto">
            <Hourglass className="h-4 w-4" aria-hidden />
            {t.complaints.executeBlocked}
          </Button>
          <p className="mt-2 text-xs font-medium text-slate-700">
            {t.complaints.pendingSince(formatRiyadhDateTime(gate.pending.createdAt))}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{t.complaints.pendingHint}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {has('amend') && (
          <Button variant="secondary" onClick={() => onAction('amend')}>
            {t.complaints.amendAmount}
          </Button>
        )}

        {/* Withdraws a standing approval — open only while nothing has been executed. */}
        {has('reject') && (
          <Button variant="destructive" onClick={() => onAction('reject')}>
            <X className="h-4 w-4" aria-hidden />
            {t.complaints.reject}
          </Button>
        )}

        {has('execute') && gate.kind === 'ready' && (
          <Button onClick={() => onAction('execute')}>
            <Play className="h-4 w-4" aria-hidden />
            {t.complaints.execute}
          </Button>
        )}

        {has('execute') && gate.kind === 'retry' && (
          <Button onClick={() => onAction('execute')}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t.complaints.retry}
          </Button>
        )}
      </div>

      {!has('execute') && gate.kind !== 'blocked' && <Note>{t.complaints.awaitingExecution}</Note>}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
