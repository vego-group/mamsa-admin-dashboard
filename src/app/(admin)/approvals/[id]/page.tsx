'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Info,
  MapPin,
  Maximize,
  Star,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Avatar,
  ConfirmDialog,
  ErrorState,
  LtrText,
  PdfViewer,
  RichText,
  Segmented,
  StatusBadge,
  Timeline,
  type TimelineItem,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { ImageGallery } from '@/components/approvals/ImageGallery';
import {
  CHECKLIST_STEPS,
  type ChecklistStep,
  ReviewChecklist,
} from '@/components/approvals/ReviewChecklist';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { ApiError, approvalsApi } from '@/lib/api';
import { REVIEW_SLA_HOURS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatSAR, waitingTime } from '@/lib/utils/format';
import type { ApprovalDetail } from '@/types';

type Tab = 'property' | 'amenities' | 'documents' | 'timeline';

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  return (
    <RequirePermission permission="approvals.view">
      <ApprovalDetailPageContent params={params} />
    </RequirePermission>
  );
}

function ApprovalDetailPageContent({ params }: { params: { id: string } }) {
  const t = useT();
  const router = useRouter();

  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('property');
  const [done, setDone] = useState<Set<ChecklistStep>>(new Set());
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  /**
   * A review queue is worked through, not dipped into. Landing on the next request
   * rather than back on the list is what removes a full round trip from every single
   * decision — the queue is SLA-ordered, so "next" is simply the one waiting longest.
   *
   * The decided request is excluded by id: it leaves `pending_review` server-side, but
   * a read that races the write would otherwise hand it straight back.
   */
  const goToNextInQueue = useCallback(
    async (decidedId: string) => {
      setAdvancing(true);
      try {
        const queue = await approvalsApi.list({ page: 1, pageSize: 2 });
        const next = queue.items.find((request) => request.id !== decidedId);
        router.push(next ? `/approvals/${next.id}` : '/approvals');
      } catch {
        // Losing the queue is not a reason to strand the reviewer on a decided request.
        router.push('/approvals');
      }
    },
    [router],
  );

  useEffect(() => {
    let stale = false;
    setError(false);
    setErrorMessage(undefined);
    setDetail(null);
    approvalsApi
      .get(params.id)
      .then((result) => !stale && setDetail(result))
      .catch((err) => {
        if (stale) return;
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : undefined);
      });
    return () => {
      stale = true;
    };
  }, [params.id, reloadToken]);

  const timeline: TimelineItem[] = useMemo(() => {
    if (!detail) return [];

    const events: TimelineItem[] = [];
    if (detail.previousRejection) {
      events.push({
        id: 'rejected',
        label: t.approvalDetail.rejectedEvent,
        at: detail.previousRejection.at,
        state: 'cancelled',
        description: detail.previousRejection.reason,
      });
      events.push({
        id: 'resubmitted',
        label: t.approvalDetail.resubmittedEvent,
        at: detail.submittedAt,
        state: 'current',
      });
      return events;
    }

    return [
      { id: 'submitted', label: t.approvalDetail.submittedEvent, at: detail.submittedAt, state: 'current' },
    ];
  }, [detail, t]);

  if (error) {
    return (
      <Card>
        <ErrorState
          title={t.approvalDetail.notFound}
          description={errorMessage}
          onRetry={() => setReloadToken((token) => token + 1)}
        />
      </Card>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6" aria-busy>
        <Skeleton className="h-5 w-72" />
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <Card className="space-y-3 p-5">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="space-y-3 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { unit } = detail;
  const city = t.cities[detail.city as keyof typeof t.cities] ?? detail.city;
  const waiting = waitingTime(detail.submittedAt);
  const checklistComplete = CHECKLIST_STEPS.every((step) => done.has(step));

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t.approvalDetail.back}
        </Link>
        <span className="text-slate-300">/</span>
        <LtrText className="font-semibold text-slate-900">{detail.code}</LtrText>
        <StatusBadge status={detail.requestType} />
        {waiting.severity === 'warn' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-status-amberSoft px-2.5 py-1 text-xs font-medium text-status-amber">
            <Clock className="h-3 w-3" aria-hidden />
            {t.approvals.slaWarning(REVIEW_SLA_HOURS.warn)}
          </span>
        )}
        {waiting.severity === 'breach' && (
          <span className="rounded-full bg-status-redSoft px-2.5 py-1 text-xs font-medium text-status-red">
            {t.approvals.slaBreached(REVIEW_SLA_HOURS.breach)}
          </span>
        )}
      </nav>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* The one surface where "no photos" is evidence rather than a detail. */}
          <ImageGallery images={unit.images} alt={unit.name} emptyTone="finding" />

          {detail.previousRejection && (
            <Card className="border-status-red/25 bg-status-redSoft/40 p-4">
              <p className="flex items-center gap-2 font-semibold text-status-red">
                <CircleX className="h-4 w-4 shrink-0" aria-hidden />
                {t.approvalDetail.previousRejectionTitle}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                {detail.previousRejection.reason}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                <LtrText>{formatDate(detail.previousRejection.at)}</LtrText>
              </p>
            </Card>
          )}

          <Card className="p-5">
            <Segmented
              items={(['property', 'amenities', 'documents', 'timeline'] as const).map((value) => ({
                value,
                label: t.approvalDetail.tabs[value],
              }))}
              value={tab}
              onChange={(value) => setTab(value as Tab)}
            />

            <div className="mt-5">
              {tab === 'property' && (
                <>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {unit.name} — {city}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {unit.district}, {city}
                  </p>

                  <p className="mt-4 leading-relaxed text-slate-600">{unit.description}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FactTile icon={BedDouble} value={String(unit.bedrooms)} label={t.approvalDetail.bedrooms} />
                    <FactTile icon={Bath} value={String(unit.bathrooms)} label={t.approvalDetail.bathrooms} />
                    <FactTile
                      icon={Users}
                      value={t.approvalDetail.guests(unit.capacity)}
                      label={t.approvalDetail.capacity}
                    />
                    <FactTile
                      icon={Maximize}
                      value={`${unit.sizeSqm} m²`}
                      label={t.approvalDetail.size}
                    />
                  </div>

                  {/* Placeholder until a maps provider is wired up in Phase 4. */}
                  <div className="mt-5 grid place-items-center gap-2 rounded-2xl bg-brand-soft/50 px-6 py-14 text-center">
                    <MapPin className="h-7 w-7 text-brand" aria-hidden />
                    <p className="font-medium text-slate-800">
                      {unit.district}, {city}
                    </p>
                    <p className="text-sm text-slate-500">{t.approvalDetail.mapPreview}</p>
                  </div>
                </>
              )}

              {tab === 'amenities' &&
                (unit.amenities.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    {t.approvalDetail.noAmenities}
                  </p>
                ) : (
                  <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {unit.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-center gap-2.5 rounded-xl bg-surface-page px-3.5 py-2.5 text-sm text-slate-700"
                      >
                        <CircleCheck className="h-4 w-4 shrink-0 text-status-green" aria-hidden />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === 'documents' && (
                <div className="space-y-4">
                  <dl className="divide-y divide-hairline rounded-2xl border border-hairline px-4">
                    <Record label={t.approvalDetail.tourismPermit} value={unit.tourismPermitNo} />
                    <Record label={t.approvalDetail.ownerId} value={unit.ownerIdNumber} />
                  </dl>
                  <PdfViewer url={unit.permitFileUrl} title={t.approvalDetail.permitFile} />
                </div>
              )}

              {tab === 'timeline' && <Timeline items={timeline} />}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="text-base font-semibold text-slate-900">{t.approvalDetail.pricing}</h3>
            <p className="mt-3 flex flex-wrap items-baseline gap-2">
              <LtrText className="text-4xl font-semibold tabular-nums text-slate-900">
                {formatSAR(unit.pricePerNight)}
              </LtrText>
              <span className="text-slate-500">{t.approvalDetail.perNight}</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {t.approvalDetail.basedOnGuests(unit.capacity)}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-semibold text-slate-900">{t.approvalDetail.partner}</h3>

            <div className="mt-4 flex items-center gap-3">
              <Avatar name={detail.partnerName} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{detail.partnerName}</p>
                <p className="truncate text-sm text-slate-500">
                  {t.status[detail.partnerType]} · {city}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge
                status={detail.partnerVerified ? 'verified' : 'unverified'}
                dot={false}
              />
              <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums text-slate-700">
                <Star className="h-4 w-4 fill-status-amber text-status-amber" aria-hidden />
                {detail.partnerRating.toFixed(1)}
              </span>
            </div>

            <dl className="mt-4 divide-y divide-hairline border-t border-hairline">
              <Record label={t.approvalDetail.submitted} value={formatDate(detail.submittedAt)} ltr />
              <Record label={t.approvalDetail.requestType} value={t.status[detail.requestType]} />
              <Record label={t.approvalDetail.waiting} value={waiting.label} ltr />
            </dl>
          </Card>

          <ReviewChecklist
            done={done}
            onToggle={(step) =>
              setDone((current) => {
                const next = new Set(current);
                if (next.has(step)) next.delete(step);
                else next.add(step);
                return next;
              })
            }
          />
        </aside>
      </div>

      {/* Sticky rather than fixed: it stays inside the content column, so it lines up
          whether the sidebar is expanded or collapsed. */}
      <div className="sticky bottom-0 z-30 -mx-4 -mb-6 border-t border-hairline bg-white/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            {t.approvalDetail.reviewAllSections}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/approvals')}>
              {t.approvalDetail.backToList}
            </Button>
            {/*
              An undecidable request — waiting on the partner, needs a second opinion —
              must not force a decision or a trip back to the list to move past it.
            */}
            <Button
              variant="secondary"
              onClick={() => goToNextInQueue(detail.id)}
              disabled={advancing}
            >
              {t.approvalDetail.skipToNext}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
            <Button variant="destructive" onClick={() => setDecision('reject')}>
              <X className="h-4 w-4" />
              {t.approvalDetail.reject}
            </Button>
            <Button
              variant="success"
              onClick={() => setDecision('approve')}
              disabled={!checklistComplete}
              title={checklistComplete ? undefined : t.approvalDetail.completeChecklist}
            >
              <Check className="h-4 w-4" />
              {t.approvalDetail.approve}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={decision === 'approve'}
        onOpenChange={(open) => !open && setDecision(null)}
        title={t.approvalDetail.approveTitle}
        icon={CircleCheck}
        variant="success"
        description={
          <>
            <span className="block font-semibold text-slate-900">
              {t.approvalDetail.approveQuestion}
            </span>
            <span className="mt-1 block text-sm">
              <RichText template={t.approvalDetail.approveBody} values={{ name: unit.name }} />
            </span>
          </>
        }
        confirmLabel={t.approvalDetail.confirmApproval}
        onConfirm={async () => {
          try {
            await approvalsApi.approve(detail.id);
            await goToNextInQueue(detail.id);
          } catch (err) {
            // The unit moved out of pending_review under us — the queue is the source of truth now.
            if (err instanceof ApiError && err.code === 'CONFLICT') {
              await goToNextInQueue(detail.id);
              return;
            }
            throw err;
          }
        }}
      />

      <ConfirmDialog
        open={decision === 'reject'}
        onOpenChange={(open) => !open && setDecision(null)}
        title={t.approvalDetail.rejectTitle}
        variant="destructive"
        banner={
          <span className="flex items-start gap-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              <span className="block font-semibold">
                <RichText template={t.approvalDetail.rejectingBanner} values={{ name: unit.name }} />
              </span>
              <span className="mt-0.5 block">{t.approvalDetail.rejectingNote}</span>
            </span>
          </span>
        }
        requireReason
        reasonMultiline={false}
        reasonLabel={t.approvalDetail.rejectionReason}
        withNotes
        notesPlaceholder={t.approvalDetail.rejectionNotes}
        confirmLabel={t.approvalDetail.confirmRejection}
        onConfirm={async ({ reason, notes }) => {
          try {
            await approvalsApi.reject(detail.id, reason ?? '', notes);
            await goToNextInQueue(detail.id);
          } catch (err) {
            // The unit moved out of pending_review under us — the queue is the source of truth now.
            if (err instanceof ApiError && err.code === 'CONFLICT') {
              await goToNextInQueue(detail.id);
              return;
            }
            throw err;
          }
        }}
      />
    </div>
  );
}

function FactTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-surface-page px-4 py-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-slate-400" aria-hidden />
      <p className="mt-2 font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Record({ label, value, ltr }: { label: string; value: string | null; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={cn('text-sm font-semibold text-slate-900', ltr && 'tabular-nums')}>
        {value ? ltr ? <LtrText>{value}</LtrText> : value : '—'}
      </dd>
    </div>
  );
}
