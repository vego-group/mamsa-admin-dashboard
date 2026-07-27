'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  LtrText,
  PageHeader,
  Pagination,
  SearchInput,
  StatCard,
  StatusBadge,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { approvalsApi } from '@/lib/api';
import {
  PARTNER_TYPE,
  REQUEST_TYPE,
  REVIEW_SLA_HOURS,
  type PartnerType,
  type RequestType,
} from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDate, waitingTime } from '@/lib/utils/format';
import type { ApprovalRequest, ApprovalStats, Paginated } from '@/types';

const PAGE_SIZE = 10;

export default function ApprovalsPage() {
  const t = useT();
  const router = useRouter();

  const [showFilters, setShowFilters] = useState(false);
  const [requestType, setRequestType] = useState<RequestType | 'all'>('all');
  const [partnerType, setPartnerType] = useState<PartnerType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<ApprovalRequest> | null>(null);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setResult(null);

    approvalsApi
      .list({ requestType, partnerType, search, page, pageSize: PAGE_SIZE })
      .then((response) => !stale && setResult(response))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [requestType, partnerType, search, page, reloadToken]);

  useEffect(() => {
    let stale = false;
    approvalsApi
      .stats()
      .then((response) => !stale && setStats(response))
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [reloadToken]);

  useEffect(() => setPage(1), [requestType, partnerType, search]);

  const rows = useMemo(() => result?.items ?? [], [result]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.approvals.title}
        subtitle={t.approvals.subtitle}
        actions={
          <Button
            variant="secondary"
            onClick={() => setShowFilters((open) => !open)}
            aria-pressed={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t.approvals.filters}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          tone="accent"
          value={stats ? String(stats.pendingReview) : '—'}
          label={t.approvals.pendingReview}
        />
        <StatCard
          icon={CircleCheck}
          tone="green"
          value={stats ? String(stats.approvedToday) : '—'}
          label={t.approvals.approvedToday}
        />
        <StatCard
          icon={CircleX}
          tone="red"
          value={stats ? String(stats.rejectedToday) : '—'}
          label={t.approvals.rejectedToday}
        />
        <StatCard
          icon={Clock}
          tone="slate"
          value={stats ? `${stats.avgReviewHours}h` : '—'}
          label={t.approvals.avgReviewTime}
        />
      </div>

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
          <EmptyState title={t.approvals.empty} />
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onReview={() => router.push(`/approvals/${request.id}`)}
            />
          ))}

          {result.total > result.pageSize && (
            <Card className="p-4">
              <Pagination
                page={result.page}
                pageSize={result.pageSize}
                total={result.total}
                onPageChange={setPage}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onReview }: { request: ApprovalRequest; onReview: () => void }) {
  const t = useT();
  const waiting = waitingTime(request.submittedAt);
  const city = t.cities[request.city as keyof typeof t.cities] ?? request.city;

  return (
    <Card className="flex flex-wrap items-center gap-4 p-5 transition-colors">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Building2 className="h-6 w-6" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <LtrText className="text-sm font-semibold text-slate-900">{request.code}</LtrText>
          <StatusBadge status={request.requestType} />
          {waiting.severity === 'warn' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-status-amberSoft px-2.5 py-1 text-xs font-medium text-status-amber">
              <Clock className="h-3 w-3" aria-hidden />
              {t.approvals.slaWarning(REVIEW_SLA_HOURS.warn)}
            </span>
          )}
          {waiting.severity === 'breach' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-status-redSoft px-2.5 py-1 text-xs font-medium text-status-red">
              <Clock className="h-3 w-3" aria-hidden />
              {t.approvals.slaBreached(REVIEW_SLA_HOURS.breach)}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-base font-semibold text-slate-900">
          {request.unitName} — {city}
        </p>

        <p className="mt-0.5 truncate text-sm text-slate-500">
          <LtrText>{formatDate(request.submittedAt)}</LtrText> · {request.partnerName} ·{' '}
          {t.approvals.waiting}{' '}
          <span
            className={cn(
              'font-medium',
              waiting.severity === 'warn' && 'text-status-amber',
              waiting.severity === 'breach' && 'text-status-red',
            )}
          >
            <LtrText>{waiting.label}</LtrText>
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={request.unitType} dot={false} />
        <Button onClick={onReview}>
          <Eye className="h-4 w-4" />
          {t.approvals.review}
        </Button>
      </div>
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
