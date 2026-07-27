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
import type { ApprovalRequest, DashboardSummary } from '@/types';

/** Newest requests first; the full queue lives on the Approvals screen. */
const LATEST_REQUESTS = 5;

export default function OverviewPage() {
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t.dashboard.totalUsers}
          value={summary.totalUsers.toLocaleString('en-US')}
          icon={Users}
          delta={summary.deltas.totalUsers}
        />
        <KpiCard
          label={t.dashboard.platformCommission}
          value={formatSAR(summary.platformCommission, { compact: true })}
          icon={TrendingUp}
          delta={summary.deltas.platformCommission}
        />
        <KpiCard
          label={t.dashboard.totalBookings}
          value={summary.totalBookings.toLocaleString('en-US')}
          icon={CalendarDays}
          delta={summary.deltas.totalBookings}
        />
        <KpiCard
          label={t.dashboard.activePartners}
          value={summary.activePartners.toLocaleString('en-US')}
          icon={Building2}
          delta={summary.deltas.activePartners}
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
        <KpiCard
          label={t.dashboard.monthlyGrowth}
          value={formatPercent(summary.monthlyGrowth)}
          icon={TrendingUp}
          iconTone="green"
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
    </div>
  );
}
