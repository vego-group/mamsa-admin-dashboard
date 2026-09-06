'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ChevronLeft,
  CircleCheck,
  Hourglass,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { ConfirmDialog, ErrorState, LtrText, RichText, StatusBadge } from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { ApproveAmountDialog } from '@/components/complaints/ApproveAmountDialog';
import { AttachmentGrid } from '@/components/complaints/AttachmentGrid';
import { ExecuteRefundDialog } from '@/components/complaints/ExecuteRefundDialog';
import { MoneyCard } from '@/components/complaints/MoneyCard';
import { PartiesCard } from '@/components/complaints/PartiesCard';
import { RefundPath } from '@/components/complaints/RefundPath';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { ApiError, complaintsApi } from '@/lib/api';
import type { ComplaintAction } from '@/lib/complaints/actions';
import { formatRiyadhDateTime } from '@/lib/complaints/dates';
import { refundGate } from '@/lib/complaints/refund-state';
import { complaintStatusBadge } from '@/lib/complaints/status';
import { cn } from '@/lib/utils/cn';
import type { ComplaintDetail } from '@/types';

/** A third of the 15-minute life of the signed attachment URLs. */
const STALE_AFTER_MS = 5 * 60_000;

interface Notice {
  /**
   * `info` is for `REFUND_IN_FLIGHT`: the server's guard refused a second execution
   * because one is already at the gateway. Nothing failed, so it is neither green nor
   * amber — the same neutral tone as the pending badge it points at.
   */
  tone: 'success' | 'warning' | 'info';
  text: string;
}

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
  return (
    <RequirePermission permission="complaints.view">
      <ComplaintDetailContent id={params.id} />
    </RequirePermission>
  );
}

/**
 * Four areas — the complaint, the parties, the money, the path — and one rule that binds
 * every action on the page: the reply says "ok", not what changed, so after any success
 * the detail is **re-fetched**, never patched from the reply. Status, `canAmendApproval`,
 * the refund rows and the ceiling all move at once, and the same fetch renews the signed
 * attachment URLs.
 */
function ComplaintDetailContent({ id }: { id: string }) {
  const t = useT();
  const { can } = useCan();

  const [detail, setDetail] = useState<ComplaintDetail | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, setDialog] = useState<ComplaintAction | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const loadedAt = useRef(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // A different complaint starts from a blank frame. A refetch of the same one keeps the
  // current frame on screen and swaps it when the fresh copy lands.
  useEffect(() => {
    setDetail(null);
    setDialog(null);
    setNotice(null);
  }, [id]);

  useEffect(() => {
    let stale = false;
    setError(false);
    setRefreshing(true);

    complaintsApi
      .get(id)
      .then((result) => {
        if (stale) return;
        setDetail(result);
        loadedAt.current = Date.now();
      })
      .catch((err) => {
        if (stale) return;
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : undefined);
      })
      .finally(() => {
        if (!stale) setRefreshing(false);
      });

    return () => {
      stale = true;
    };
  }, [id, reloadToken]);

  // The attachment URLs expire 15 minutes after the fetch. An admin who tabbed away to
  // phone the partner comes back to a screen that refetches itself rather than to a grid
  // of broken images — and to a refund list that may have settled in the meantime.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - loadedAt.current > STALE_AFTER_MS) reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);

  const afterAction = useCallback(
    (text: string, tone: Notice['tone'] = 'success') => {
      setNotice({ tone, text });
      reload();
    },
    [reload],
  );

  const onStale = useCallback(
    (message: string) => afterAction(message || t.complaints.conflict, 'warning'),
    [afterAction, t],
  );

  // A refund is already at the gateway: re-fetch so the pending attempt and the disabled
  // button take over the screen. The notice carries the server's words and never a
  // "try again" — that wording is the click this whole page exists to prevent.
  const onInFlight = useCallback(
    (message: string) => afterAction(message || t.complaints.inFlight, 'info'),
    [afterAction, t],
  );

  const closeDialog = (open: boolean) => {
    if (!open) setDialog(null);
  };

  if (error) {
    return (
      <Card>
        <ErrorState title={t.complaints.notFound} description={errorMessage} onRetry={reload} />
      </Card>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6" aria-busy>
        <Skeleton className="h-5 w-72" />
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card className="space-y-3 p-5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </Card>
            <Card className="space-y-3 p-5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="space-y-3 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-28 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { complaint, booking } = detail;
  const complaintId = String(complaint.id);
  const code = booking.code ?? t.complaints.detailTitle(complaint.id);
  const gate = refundGate(detail.refunds);

  /** Runs an action, re-syncs on success, and re-syncs with an explanation on 409/403. */
  async function runAndReload(action: () => Promise<unknown>) {
    try {
      await action();
      afterAction(t.complaints.reloaded);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'REFUND_IN_FLIGHT') {
        onInFlight(err.message);
        return;
      }
      if (err instanceof ApiError && (err.code === 'CONFLICT' || err.status === 403)) {
        onStale(err.message);
        return;
      }
      throw err;
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t.complaints.back}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900">{t.complaints.detailTitle(complaint.id)}</span>
        <StatusBadge status={complaintStatusBadge(complaint.status)} />
        {complaint.createdAt && (
          <LtrText className="text-slate-500">{formatRiyadhDateTime(complaint.createdAt)}</LtrText>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="ms-auto"
          onClick={reload}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} aria-hidden />
          {t.complaints.refresh}
        </Button>
      </nav>

      {notice && (
        <p
          role="status"
          className={cn(
            'flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium',
            notice.tone === 'success' && 'bg-status-greenSoft text-status-green',
            notice.tone === 'warning' && 'bg-status-amberSoft text-status-amber',
            notice.tone === 'info' && 'bg-surface-muted text-slate-700',
          )}
        >
          {notice.tone === 'success' && (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          {notice.tone === 'warning' && (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          {notice.tone === 'info' && (
            <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          )}
          {notice.text}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* A. the complaint */}
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">{t.complaints.complaintSection}</h2>
              <p className="text-sm text-slate-600">
                {t.complaints.contactedPartner}:{' '}
                <span className="font-semibold text-slate-900">
                  {complaint.contactedPartner ? t.complaints.yes : t.complaints.no}
                </span>
              </p>
            </div>

            <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-page px-3.5 py-3 text-sm leading-relaxed text-slate-700">
              {complaint.description}
            </p>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {t.complaints.attachments}
            </h3>
            <div className="mt-2">
              <AttachmentGrid attachments={detail.attachments} onRefresh={reload} />
            </div>

            {complaint.guestMessage && (
              <Callout label={t.complaints.guestMessage} text={complaint.guestMessage} tone="blue" />
            )}
            {complaint.internalNote && (
              <Callout label={t.complaints.internalNote} text={complaint.internalNote} tone="amber" />
            )}
          </Card>

          {/* D. the path */}
          <RefundPath detail={detail} can={can} onAction={setDialog} />
        </div>

        <aside className="space-y-4">
          {/* B. the parties */}
          <PartiesCard detail={detail} />
          {/* C. the money */}
          <MoneyCard detail={detail} />
        </aside>
      </div>

      <ConfirmDialog
        open={dialog === 'review'}
        onOpenChange={closeDialog}
        title={t.complaints.reviewTitle}
        icon={Search}
        description={<RichText template={t.complaints.reviewBody} values={{ code }} />}
        confirmLabel={t.complaints.reviewConfirm}
        onConfirm={() => runAndReload(() => complaintsApi.review(complaintId))}
      />

      <ApproveAmountDialog
        mode="approve"
        open={dialog === 'approve'}
        detail={detail}
        onOpenChange={closeDialog}
        onSaved={() => afterAction(t.complaints.reloaded)}
        onStale={onStale}
        onInFlight={onInFlight}
      />

      <ApproveAmountDialog
        mode="amend"
        open={dialog === 'amend'}
        detail={detail}
        onOpenChange={closeDialog}
        onSaved={() => afterAction(t.complaints.reloaded)}
        onStale={onStale}
        onInFlight={onInFlight}
      />

      <ConfirmDialog
        open={dialog === 'reject'}
        onOpenChange={closeDialog}
        title={t.complaints.rejectTitle}
        variant="destructive"
        banner={
          <span className="flex items-start gap-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <RichText template={t.complaints.rejectBanner} values={{ code }} />
          </span>
        }
        requireReason
        reasonLabel={t.complaints.rejectGuestMessage}
        reasonPlaceholder={t.complaints.rejectGuestMessagePlaceholder}
        withNotes
        notesLabel={t.complaints.rejectInternalNote}
        confirmLabel={t.complaints.rejectConfirm}
        onConfirm={({ reason, notes }) =>
          runAndReload(() =>
            complaintsApi.reject(complaintId, {
              guestMessage: reason ?? '',
              internalNote: notes || undefined,
            }),
          )
        }
      />

      <ExecuteRefundDialog
        open={dialog === 'execute'}
        mode={gate.kind === 'retry' ? 'retry' : 'execute'}
        detail={detail}
        onOpenChange={closeDialog}
        onExecuted={() => reload()}
        onStale={onStale}
        onInFlight={onInFlight}
      />
    </div>
  );
}

function Callout({ label, text, tone }: { label: string; text: string; tone: 'blue' | 'amber' }) {
  return (
    <div
      className={cn(
        'mt-4 rounded-xl px-3.5 py-3 text-sm',
        tone === 'blue' ? 'bg-status-blueSoft text-status-blue' : 'bg-status-amberSoft text-status-amber',
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  );
}
