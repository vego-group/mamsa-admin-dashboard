'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Building2,
  Check,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  Segmented,
  StatCard,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { useDebounced } from '@/hooks/useDebounced';
import { approvalsApi } from '@/lib/api';
import { runBatchDecision, type BatchOutcome } from '@/lib/approvals/batch';
import {
  PARTNER_TYPE,
  REQUEST_TYPE,
  REVIEW_SLA_HOURS,
  UNIT_STATUS,
  type PartnerType,
  type RequestType,
} from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { durationLabel, formatDate, reviewSeverity, waitingTime } from '@/lib/utils/format';
import type {
  ApprovalRequest,
  ApprovalStats,
  ApprovalStatsRange,
  ID,
  Paginated,
} from '@/types';

const PAGE_SIZE = 10;
const STATS_RANGES: ApprovalStatsRange[] = ['today', '7d', '30d'];
const AVG_TONE = { breach: 'red', warn: 'amber', ok: 'green' } as const;

export default function ApprovalsPage() {
  return (
    <RequirePermission permission="approvals.view">
      <ApprovalsPageContent />
    </RequirePermission>
  );
}

function ApprovalsPageContent() {
  const t = useT();
  const router = useRouter();
  const { can } = useCan();
  /** Selection exists to drive decisions; without the permission it is dead weight. */
  const canDecide = can('approvals.manage');

  const [showFilters, setShowFilters] = useState(false);
  const [requestType, setRequestType] = useState<RequestType | 'all'>('all');
  const [partnerType, setPartnerType] = useState<PartnerType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statsRange, setStatsRange] = useState<ApprovalStatsRange>('today');
  const [selected, setSelected] = useState<Set<ID>>(new Set());
  const [bulk, setBulk] = useState<'approve' | 'reject' | null>(null);
  const [batchReport, setBatchReport] = useState<BatchOutcome | null>(null);

  const [result, setResult] = useState<Paginated<ApprovalRequest> | null>(null);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  /** A failed stats call must not pass for a queue of zeroes — the tiles say so. */
  const [statsError, setStatsError] = useState(false);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // The field stays on `search`; only the query trails it, so typing neither floods the
  // API nor restarts the skeleton on every keystroke.
  const debouncedSearch = useDebounced(search);

  useEffect(() => {
    let stale = false;
    setError(false);
    setLoading(true);

    approvalsApi
      .list({ requestType, partnerType, search: debouncedSearch, page, pageSize: PAGE_SIZE })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true))
      .finally(() => !stale && setLoading(false));

    return () => {
      stale = true;
    };
  }, [requestType, partnerType, debouncedSearch, page, reloadToken]);

  useEffect(() => {
    let stale = false;
    setStatsError(false);

    approvalsApi
      .stats(statsRange)
      .then((response) => {
        if (stale) return;
        setStats(response);
      })
      .catch(() => !stale && setStatsError(true));

    return () => {
      stale = true;
    };
  }, [statsRange, reloadToken]);

  useEffect(() => setPage(1), [requestType, partnerType, debouncedSearch]);

  const rows = useMemo(() => result?.items ?? [], [result]);

  // A legacy response is today's regardless of what the switch says, so the captions
  // follow what the API actually answered — not what we asked for.
  const rangeLabel = t.approvals.ranges[stats && !stats.rangeSupported ? 'today' : statsRange];

  // Counted off the debounced term, not the raw field: the tile below reports the
  // filtered total, and mid-keystroke that total still belongs to the previous query.
  const activeFilters =
    Number(requestType !== 'all') +
    Number(partnerType !== 'all') +
    Number(debouncedSearch.trim() !== '');
  const filtered = activeFilters > 0;

  const clearFilters = useCallback(() => {
    setRequestType('all');
    setPartnerType('all');
    setSearch('');
  }, []);

  // `?? null` rather than a numeric fallback — see ApprovalStats.avgReviewHours.
  const avgReviewHours = stats?.avgReviewHours ?? null;

  /**
   * The caption's job is to reconcile this tile with the two beside it. "6 approved" next
   * to "no average" is true but reads as a broken screen, so whenever the average covers
   * fewer decisions than the range holds, the caption says so in those terms.
   */
  const avgReviewHint = (() => {
    if (!stats) return undefined;

    const decisions = stats.approved + stats.rejected;
    const sample = stats.avgReviewSample;
    const target = t.approvals.slaTarget(REVIEW_SLA_HOURS.breach);

    if (avgReviewHours === null) {
      return decisions === 0
        ? t.approvals.avgReviewNoDecisions
        : t.approvals.avgReviewSampleOf(0, decisions);
    }

    if (sample !== null && sample < decisions) {
      return `${target} · ${t.approvals.avgReviewSampleOf(sample, decisions)}`;
    }

    return target;
  })();

  // Selection is scoped to what is on screen. Carrying it across pages would let an
  // admin decide on rows they never saw, which is the opposite of a review.
  const selectedOnPage = useMemo(
    () => rows.filter((request) => selected.has(request.id)),
    [rows, selected],
  );
  const allOnPageSelected = rows.length > 0 && selectedOnPage.length === rows.length;

  const toggleAllOnPage = useCallback(
    (next: boolean) =>
      setSelected(() => (next ? new Set(rows.map((request) => request.id)) : new Set())),
    [rows],
  );

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // A page that changed under the selection can no longer vouch for it.
  useEffect(() => clearSelection(), [requestType, partnerType, debouncedSearch, page, clearSelection]);

  const runBulk = useCallback(
    async (decide: (id: ID) => Promise<unknown>) => {
      const outcome = await runBatchDecision(
        selectedOnPage.map((request) => request.id),
        decide,
      );
      setBatchReport(outcome);
      clearSelection();
      reload();
    },
    [selectedOnPage, clearSelection, reload],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.approvals.title}
        subtitle={t.approvals.subtitle}
        actions={
          <div className="flex items-center gap-2">
            {/* Collapsing the panel must not hide that a filter is on. */}
            {filtered && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4" />
                {t.approvals.clearFilters}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowFilters((open) => !open)}
              aria-pressed={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t.approvals.filters}
              {filtered && (
                <span className="ms-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-semibold text-white tabular-nums">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>
        }
      />

      {/*
        Hidden while the API answers in the legacy today-only shape: a switch that
        silently relabels today's numbers as a month's is worse than no switch.
      */}
      {stats?.rangeSupported && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{t.approvals.statsRange}</span>
          <Segmented
            items={STATS_RANGES.map((value) => ({ value, label: t.approvals.ranges[value] }))}
            value={statsRange}
            onChange={(value) => setStatsRange(value as ApprovalStatsRange)}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/*
          Under an active filter the queue on screen IS the filtered pending count, so
          the tile reports that instead of the global figure — the two disagreeing was
          the page's oldest lie.
        */}
        <StatCard
          icon={Clock}
          tone="accent"
          value={
            filtered
              ? result
                ? String(result.total)
                : '—'
              : stats
                ? String(stats.pendingReview)
                : '—'
          }
          label={filtered ? t.approvals.pendingReviewFiltered : t.approvals.pendingReview}
          onClick={filtered ? clearFilters : undefined}
          actionLabel={filtered ? t.approvals.clearFilters : undefined}
        />
        <StatCard
          icon={CircleCheck}
          tone="green"
          value={stats ? String(stats.approved) : '—'}
          label={t.approvals.approvedIn(rangeLabel)}
          onClick={() => router.push(`/units?status=${UNIT_STATUS.APPROVED}`)}
          actionLabel={t.approvals.viewApprovedUnits}
        />
        <StatCard
          icon={CircleX}
          tone="red"
          value={stats ? String(stats.rejected) : '—'}
          label={t.approvals.rejectedIn(rangeLabel)}
          onClick={() => router.push(`/units?status=${UNIT_STATUS.REJECTED}`)}
          actionLabel={t.approvals.viewRejectedUnits}
        />
        {/*
          Now measured submission → decision, so it is real review time again and carries
          the 48h verdict. But only when there is a sample: `null` means nothing has been
          measured, and grading "no data" green would read as ample headroom.
        */}
        <StatCard
          icon={Clock}
          tone={avgReviewHours === null ? 'slate' : AVG_TONE[reviewSeverity(avgReviewHours)]}
          value={avgReviewHours === null ? '—' : durationLabel(avgReviewHours)}
          label={t.approvals.avgReviewTimeIn(rangeLabel)}
          hint={avgReviewHint}
        />
      </div>

      {/* A silent catch left the tiles reading "—" forever with nothing to act on. */}
      {statsError && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {t.approvals.statsUnavailable}
          <Button variant="link" size="sm" onClick={reload}>
            {t.common.retry}
          </Button>
        </p>
      )}

      {showFilters && (
        <Card className="flex flex-wrap items-end gap-3 p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t.approvals.searchPlaceholder}
            className="w-full min-w-0 flex-1 sm:max-w-sm"
          />

          <FilterSelect
            label={t.approvals.requestType}
            value={requestType}
            onChange={(value) => setRequestType(value as RequestType | 'all')}
            options={Object.values(REQUEST_TYPE).map((value) => ({
              value,
              label: t.status[value],
            }))}
            allLabel={t.common.all}
          />

          <FilterSelect
            label={t.approvals.partnerType}
            value={partnerType}
            onChange={(value) => setPartnerType(value as PartnerType | 'all')}
            options={Object.values(PARTNER_TYPE).map((value) => ({
              value,
              label: t.status[value],
            }))}
            allLabel={t.common.all}
          />
        </Card>
      )}

      {/*
        Filtering and searching swap the queue underneath a screen reader with nothing
        spoken. This is the announcement — polite, so it waits for a pause in typing.
      */}
      <p aria-live="polite" className="sr-only">
        {loading
          ? t.common.loading
          : error
            ? t.common.errorTitle
            : t.approvals.resultCount(result?.total ?? 0)}
      </p>

      {error ? (
        <Card>
          <ErrorState onRetry={reload} />
        </Card>
      ) : !result ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="flex items-center gap-4 p-5" aria-busy>
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-3 w-48" />
              </div>
            </Card>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          {/*
            An empty queue and an over-narrow filter are different problems. Saying
            "nothing is waiting" to someone who just typed a search hides their own
            filter from them.
          */}
          <EmptyState
            title={filtered ? t.approvals.emptyFiltered : t.approvals.empty}
            action={
              filtered ? (
                <Button variant="secondary" onClick={clearFilters}>
                  {t.approvals.clearFilters}
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        // Refetches keep the current page on screen, dimmed — the skeleton only ever
        // stands in for a first load.
        <div className={cn('space-y-4 transition-opacity', loading && 'opacity-60')}>
          {canDecide && (
            <div className="flex items-center gap-3 px-1">
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={selectedOnPage.length > 0}
                onCheckedChange={toggleAllOnPage}
                label={t.approvals.selectAllOnPage}
                showLabel
              />
            </div>
          )}

          {rows.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onReview={() => router.push(`/approvals/${request.id}`)}
              selectable={canDecide}
              selected={selected.has(request.id)}
              onSelectedChange={(next) =>
                setSelected((current) => {
                  const updated = new Set(current);
                  if (next) updated.add(request.id);
                  else updated.delete(request.id);
                  return updated;
                })
              }
            />
          ))}

          <Card className="p-4">
            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              onPageChange={setPage}
            />
          </Card>
        </div>
      )}

      {/*
        Appears only with a selection, and stays out of the scroll flow, so the queue
        never reserves space for a bar most sessions never open.
      */}
      {canDecide && selectedOnPage.length > 0 && (
        <div className="sticky bottom-0 z-30 -mx-4 -mb-6 border-t border-hairline bg-white/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">
              {t.approvals.selectedCount(selectedOnPage.length)}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={clearSelection}>
                {t.approvals.clearSelection}
              </Button>
              <Button variant="destructive" onClick={() => setBulk('reject')}>
                <X className="h-4 w-4" />
                {t.approvalDetail.reject}
              </Button>
              <Button variant="success" onClick={() => setBulk('approve')}>
                <Check className="h-4 w-4" />
                {t.approvalDetail.approve}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/*
        The per-unit review checklist lives on the detail page; deciding from the queue
        skips it. The admin is told that before confirming rather than after, and the
        units are named — a bare count is not informed consent.
      */}
      <ConfirmDialog
        open={bulk === 'approve'}
        onOpenChange={(open) => !open && setBulk(null)}
        title={t.approvals.bulkApproveTitle}
        icon={CircleCheck}
        variant="success"
        description={
          <>
            <span className="block font-semibold text-slate-900">
              {t.approvals.bulkApproveQuestion(selectedOnPage.length)}
            </span>
            <span className="mt-1 block text-sm">{t.approvals.bulkApproveBody}</span>
          </>
        }
        banner={<SelectionSummary requests={selectedOnPage} />}
        warning={t.approvals.bulkApproveWarning}
        confirmLabel={t.approvals.bulkApproveConfirm(selectedOnPage.length)}
        onConfirm={() => runBulk((id) => approvalsApi.approve(id))}
      />

      {/*
        One reason for the whole batch: it reaches every partner in it, so it has to be
        true of all of them — not just of the worst one.
      */}
      <ConfirmDialog
        open={bulk === 'reject'}
        onOpenChange={(open) => !open && setBulk(null)}
        title={t.approvals.bulkRejectTitle}
        variant="destructive"
        description={
          <span className="block font-semibold text-slate-900">
            {t.approvals.bulkRejectQuestion(selectedOnPage.length)}
          </span>
        }
        banner={<SelectionSummary requests={selectedOnPage} />}
        requireReason
        reasonMultiline={false}
        reasonLabel={t.approvals.bulkRejectReason}
        warning={t.approvals.bulkRejectWarning}
        withNotes
        notesPlaceholder={t.approvalDetail.rejectionNotes}
        confirmLabel={t.approvals.bulkRejectConfirm(selectedOnPage.length)}
        onConfirm={({ reason, notes }) =>
          runBulk((id) => approvalsApi.reject(id, reason ?? '', notes))
        }
      />

      {/*
        Held back until the confirm dialog has closed. Two modals mounted at once is how
        Radix ends up leaving `pointer-events: none` on the body and freezing the page.
      */}
      {bulk === null && (
        <BatchReportDialog report={batchReport} onClose={() => setBatchReport(null)} />
      )}
    </div>
  );
}

/** Names what a batch is about to act on — a count alone is not informed consent. */
function SelectionSummary({ requests }: { requests: ApprovalRequest[] }) {
  const t = useT();
  const shown = requests.slice(0, 5);
  const rest = requests.length - shown.length;

  return (
    <span className="block text-start">
      <ul className="space-y-1">
        {shown.map((request) => (
          <li key={request.id} className="truncate text-sm">
            <LtrText className="font-semibold">{request.code}</LtrText> — {request.unitName}
          </li>
        ))}
      </ul>
      {rest > 0 && <span className="mt-1 block text-sm">{t.approvals.andMore(rest)}</span>}
    </span>
  );
}

/**
 * What a batch actually did. N independent calls produce N independent results, so
 * "done" is not an answer — a partner left waiting by a silently failed call is the
 * whole reason this exists. An acknowledgement, not a decision: one button, no cancel.
 */
function BatchReportDialog({
  report,
  onClose,
}: {
  report: BatchOutcome | null;
  onClose: () => void;
}) {
  const t = useT();
  if (!report) return null;

  const broken = report.failed.length > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.approvals.batchReportTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-6">
          <span
            className={cn(
              'mx-auto grid h-14 w-14 place-items-center rounded-full',
              broken ? 'bg-status-redSoft text-status-red' : 'bg-status-greenSoft text-status-green',
            )}
          >
            {broken ? <TriangleAlert className="h-6 w-6" /> : <CircleCheck className="h-6 w-6" />}
          </span>

          <ul className="space-y-1.5 text-center text-sm">
            <li className="font-semibold text-slate-900">
              {t.approvals.batchApplied(report.succeeded.length)}
            </li>
            {report.alreadyDecided.length > 0 && (
              <li className="text-slate-600">
                {t.approvals.batchAlreadyDecided(report.alreadyDecided.length)}
              </li>
            )}
            {broken && (
              <li className="font-medium text-status-red">
                {t.approvals.batchFailed(report.failed.length)}
              </li>
            )}
          </ul>

          {/* Named, so the admin can retry exactly the ones that did not go through. */}
          {broken && (
            <ul className="space-y-1 rounded-xl bg-status-redSoft px-3.5 py-3 text-start text-sm text-status-red">
              {report.failed.map((failure) => (
                <li key={failure.id}>
                  <LtrText className="font-semibold">{failure.id}</LtrText> — {failure.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="justify-stretch">
          <Button className="flex-1" onClick={onClose}>
            {t.approvals.batchReportDismiss}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const WAITING_TONE = {
  ok: 'bg-surface-muted text-slate-600',
  warn: 'bg-status-amberSoft text-status-amber',
  breach: 'bg-status-redSoft text-status-red',
} as const;

function RequestCard({
  request,
  onReview,
  selectable,
  selected,
  onSelectedChange,
}: {
  request: ApprovalRequest;
  onReview: () => void;
  selectable: boolean;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}) {
  const t = useT();
  const waiting = waitingTime(request.submittedAt);
  const city = t.cities[request.city as keyof typeof t.cities] ?? request.city;

  return (
    <Card
      className={cn(
        'flex flex-wrap items-center gap-4 p-4 transition-colors',
        selected && 'border-brand/50 bg-brand-soft/30',
      )}
    >
      {selectable && (
        <Checkbox
          checked={selected}
          onCheckedChange={onSelectedChange}
          label={t.approvals.selectRequest(request.code)}
        />
      )}

      {/*
        The cover photo is the fastest way to tell two listings apart in a queue; the
        tinted placeholder only stands in until the list endpoint sends one.
      */}
      <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-soft text-brand">
        {request.coverImage ? (
          <Image src={request.coverImage} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <Building2 className="h-6 w-6" aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <LtrText className="text-sm font-semibold text-slate-900">{request.code}</LtrText>
          <StatusBadge status={request.unitType} dot={false} />
          {/*
            'new' is what almost every row is, so badging it says nothing. A
            resubmission or a re-approval is the row that needs a second look.
          */}
          {request.requestType !== REQUEST_TYPE.NEW && (
            <StatusBadge status={request.requestType} />
          )}
        </div>

        <p className="mt-1 truncate text-base font-semibold text-slate-900">
          {request.unitName} — {city}
        </p>

        <p className="mt-0.5 truncate text-sm text-slate-500">
          <LtrText>{formatDate(request.submittedAt)}</LtrText> · {request.partnerName}
        </p>
      </div>

      {/*
        One SLA element, not two. The old row printed the breach badge next to the very
        figure that proved it — with the whole queue breached, both read as wallpaper.
        The waiting time itself carries the grade, and the label spells it out for
        anyone who cannot use the colour.
      */}
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
          WAITING_TONE[waiting.severity],
        )}
        title={
          waiting.severity === 'breach'
            ? t.approvals.slaBreached(REVIEW_SLA_HOURS.breach)
            : waiting.severity === 'warn'
              ? t.approvals.slaWarning(REVIEW_SLA_HOURS.warn)
              : undefined
        }
      >
        <Clock className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">{t.approvals.waiting} </span>
        <LtrText>{waiting.label}</LtrText>
      </span>

      <Button onClick={onReview}>
        <Eye className="h-4 w-4" />
        {t.approvals.review}
      </Button>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  allLabel: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
