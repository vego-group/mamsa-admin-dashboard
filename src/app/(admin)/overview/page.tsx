'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  DollarSign,
  Receipt,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  ChartSkeleton,
  type Column,
  DataTable,
  ErrorState,
  KpiCard,
  KpiGridSkeleton,
  LtrText,
  PageHeader,
  StatusBadge,
} from '@/components/common';
import { RequirePermission } from '@/components/auth';
import {
  BookingStatusChart,
  CategoryBarChart,
  RevenueChart,
  thousandsTick,
} from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { dashboardApi } from '@/lib/api';
import { formatDate, formatPercent, formatSAR } from '@/lib/utils/format';
import type { ApprovalRequest, Cancellation, DashboardSummary } from '@/types';

/** Newest requests first; the full queue lives on the Approvals screen. */
const LATEST_REQUESTS = 5;
/** Newest cancellations first; the full log lives on the Cancellations screen. */
const RECENT_CANCELLATIONS = 5;

export default function OverviewPage() {
  return (
    <RequirePermission permission="dashboard.view">
      <OverviewPageContent />
    </RequirePermission>
  );
}

function OverviewPageContent() {
  const t = useT();
  const router = useRouter();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setSummary(null);
    dashboardApi.summary().then(setSummary).catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  const columns: Array<Column<ApprovalRequest>> = [
    {
      key: 'code',
      header: t.dashboard.requestId,
      width: '18%',
      cell: (row) => <LtrText className="font-semibold text-slate-900">{row.code}</LtrText>,
    },
    {
      key: 'partner',
      header: t.dashboard.partner,
      width: '22%',
      cell: (row) => <span className="font-medium text-slate-800">{row.partnerName}</span>,
    },
    {
      key: 'property',
      header: t.dashboard.property,
      width: '26%',
      cell: (row) => row.unitName,
    },
    {
      key: 'type',
      header: t.dashboard.type,
      width: '16%',
      cell: (row) => <StatusBadge status={row.unitType} dot={false} />,
    },
    {
      key: 'submitted',
      header: t.dashboard.submitted,
      align: 'end',
      cell: (row) => <LtrText className="text-slate-500">{formatDate(row.submittedAt)}</LtrText>,
    },
  ];

  const cancellationColumns: Array<Column<Cancellation>> = [
    {
      key: 'bookingCode',
      header: t.dashboard.booking,
      width: '18%',
      cell: (row) => <LtrText className="font-semibold text-slate-900">{row.bookingCode}</LtrText>,
    },
    {
      key: 'partner',
      header: t.dashboard.partner,
      width: '22%',
      cell: (row) => <span className="font-medium text-slate-800">{row.partnerName}</span>,
    },
    {
      key: 'property',
      header: t.dashboard.property,
      width: '26%',
      cell: (row) => row.unitName,
    },
    {
      key: 'refundStatus',
      header: t.dashboard.refundStatus,
      width: '16%',
      cell: (row) => <StatusBadge status={row.refundStatus} />,
    },
    {
      key: 'cancelledAt',
      header: t.dashboard.cancelledAt,
      align: 'end',
      cell: (row) => <LtrText className="text-slate-500">{formatDate(row.at)}</LtrText>,
    },
  ];

  const header = (
    <PageHeader
      title={t.dashboard.title}
      subtitle={t.dashboard.subtitle}
      actions={
        <>
          <Button variant="secondary">
            <Zap className="h-4 w-4 text-status-green" />
            {t.dashboard.live}
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4" />
            {t.dashboard.exportReport}
          </Button>
        </>
      }
    />
  );

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        {header}
        <KpiGridSkeleton count={4} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ChartSkeleton height={40} />
          <ChartSkeleton height={40} />
          <ChartSkeleton height={40} />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {/*
        Every KPI here is a LIFETIME total; every delta beside it is THIS MONTH'S INFLOW.
        They are different quantities, so each chip is captioned with the one it belongs
        to — `+12%` beside "1,240 users" means 12% more signups than last month, not a
        12% larger user base.

        `activePartners` is the sharpest case: the figure is a stock (how many are active
        right now) and the delta is a flow (how many joined), so a month that suspended
        ten partners and gained five shows a POSITIVE chip above a FALLING number.

        All four are `neutral` rather than colour-graded, because the comparison is
        month-to-date against a *complete* previous month — structurally negative for most
        of every month, fair only on the last day. See KpiCard.deltaTone.
      */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.dashboard.totalUsers}
          value={summary.totalUsers.toLocaleString('en-US')}
          icon={Users}
          delta={summary.deltas.totalUsers}
          deltaLabel={t.dashboard.deltaNewSignups}
          deltaTone="neutral"
        />
        <KpiCard
          label={t.dashboard.platformCommission}
          value={formatSAR(summary.platformCommission, { compact: true })}
          icon={TrendingUp}
          delta={summary.deltas.platformCommission}
          deltaLabel={t.dashboard.deltaEarnedThisMonth}
          deltaTone="neutral"
        />
        <KpiCard
          label={t.dashboard.totalBookings}
          value={summary.totalBookings.toLocaleString('en-US')}
          icon={CalendarDays}
          delta={summary.deltas.totalBookings}
          deltaLabel={t.dashboard.deltaNewBookings}
          deltaTone="neutral"
        />
        <KpiCard
          label={t.dashboard.activePartners}
          value={summary.activePartners.toLocaleString('en-US')}
          icon={Building2}
          delta={summary.deltas.activePartners}
          deltaLabel={t.dashboard.deltaNewPartners}
          deltaTone="neutral"
        />
        <KpiCard
          label={t.dashboard.netRevenue}
          value={formatSAR(summary.netRevenue, { compact: true })}
          hint={t.dashboard.netOfVat}
          icon={DollarSign}
          iconTone="green"
        />
        {/* VAT is visible but never counted as revenue — it is collected for ZATCA,
            not earned. Its own card is what keeps it out of the revenue figure. */}
        <KpiCard
          label={t.dashboard.totalVat}
          value={formatSAR(summary.totalVat, { compact: true })}
          icon={Receipt}
          iconTone="amber"
        />
      </div>

      {/* Operational counts — no deltas: a queue length is a state, not a trend. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t.dashboard.pendingRequests}
          value={summary.pendingRequests.toLocaleString('en-US')}
          icon={Clock}
          iconTone="amber"
        />
        {/*
          Gross revenue booked this month vs last, bucketed by when the booking was MADE,
          not when the stay happens — so a booking taken in August for a December stay
          counts here in August and in the partner report in December. The label has to
          say "booked" or the two screens look like they disagree.

          Same partial-month asymmetry as the deltas above, hence the plain tone.
        */}
        <KpiCard
          label={t.dashboard.monthlyGrowth}
          value={formatPercent(summary.monthlyGrowth)}
          hint={t.dashboard.monthlyGrowthHint}
          icon={TrendingUp}
          iconTone="brand"
        />
        <KpiCard
          label={t.dashboard.avgBookingValue}
          value={formatSAR(summary.avgBookingValue, { compact: true })}
          icon={DollarSign}
          iconTone="blue"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RevenueChart data={summary.revenueSeries} className="xl:col-span-2" />
        <BookingStatusChart data={summary.bookingStatusSlices} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBarChart
          data={summary.revenueByCity}
          title={t.dashboard.cityRevenueTitle}
          description={t.dashboard.cityRevenueSubtitle}
          seriesLabel={t.dashboard.revenue}
          formatLabel={(label) => t.cities[label as keyof typeof t.cities] ?? label}
          formatValue={(value) => formatSAR(value, { compact: true })}
          formatTick={thousandsTick}
          height={240}
        />
        <CategoryBarChart
          data={summary.weeklyBookings}
          title={t.dashboard.weeklyBookingsTitle}
          description={t.dashboard.weeklyBookingsSubtitle}
          seriesLabel={t.dashboard.bookings}
          formatLabel={(label) => t.weekdays[label as keyof typeof t.weekdays] ?? label}
          highlightPeak
          height={240}
        />
      </div>

      <DataTable
        columns={columns}
        rows={summary.latestPendingRequests.slice(0, LATEST_REQUESTS)}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/approvals/${row.id}`)}
        emptyTitle={t.dashboard.pendingEmpty}
        header={
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t.dashboard.pendingTitle}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{t.dashboard.pendingSubtitle}</p>
            </div>
            <Link
              href="/approvals"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-brand"
            >
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t.common.viewAll}
            </Link>
          </div>
        }
      />

      <DataTable
        columns={cancellationColumns}
        rows={summary.recentHostCancellations.slice(0, RECENT_CANCELLATIONS)}
        rowKey={(row) => row.id}
        emptyTitle={t.dashboard.hostCancellationsEmpty}
        header={
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {t.dashboard.hostCancellationsTitle}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">{t.dashboard.hostCancellationsSubtitle}</p>
            </div>
            <Link
              href="/cancellations"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-brand"
            >
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t.common.viewAll}
            </Link>
          </div>
        }
      />
    </div>
  );
}
