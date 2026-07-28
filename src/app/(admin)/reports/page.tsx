'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Download, DollarSign, FileText, TrendingUp } from 'lucide-react';
import {
  Avatar,
  EmptyState,
  ErrorState,
  PageHeader,
  Segmented,
  StatCard,
} from '@/components/common';
import {
  BookingStatusChart,
  CategoryBarChart,
  HorizontalBarChart,
  OccupancyChart,
  RevenueChart,
  thousandsTick,
} from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { reportsApi } from '@/lib/api';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatSAR } from '@/lib/utils/format';
import type { ReportRange, ReportsSummary } from '@/types';

const TABS = ['revenue', 'bookings', 'partners', 'occupancy'] as const;
type Tab = (typeof TABS)[number];

const RANGES: ReportRange[] = ['6m', '1y', 'all'];

export default function ReportsPage() {
  const t = useT();

  const [tab, setTab] = useState<Tab>('revenue');
  const [range, setRange] = useState<ReportRange>('1y');
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setSummary(null);
    reportsApi.summary(range).then(setSummary).catch(() => setError(true));
  }, [range]);

  useEffect(load, [load]);

  const month = (label: string) => t.months[label as keyof typeof t.months] ?? label;
  const city = (label: string) => t.cities[label as keyof typeof t.cities] ?? label;
  const money = (value: number) => formatSAR(value, { compact: true });
  /** Millions on the axis: city revenue spans 0.3M–1.9M, so `K` would be noise. */
  const millions = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

  function exportCsv() {
    if (!summary) return;

    const csv = toCsv(summary.revenueSeries, [
      { header: 'Month', value: (row) => row.label },
      { header: 'Revenue (SAR)', value: (row) => row.revenue },
      { header: 'Commission (SAR)', value: (row) => row.commission },
    ]);

    downloadCsv(`mamsa-revenue-${range}.csv`, csv);
  }

  const header = (
    <PageHeader
      title={t.reports.title}
      subtitle={t.reports.subtitle}
      actions={
        <>
          <Button variant="secondary" onClick={exportCsv} disabled={!summary}>
            <Download className="h-4 w-4" />
            {t.common.exportCsv}
          </Button>
          <Button onClick={() => window.print()} disabled={!summary}>
            <FileText className="h-4 w-4" />
            {t.common.exportPdf}
          </Button>
        </>
      }
    />
  );

  const controls = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Segmented
        items={TABS.map((value) => ({ value, label: t.reports.tabs[value] }))}
        value={tab}
        onChange={(value) => setTab(value as Tab)}
      />

      <select
        value={range}
        onChange={(event) => setRange(event.target.value as ReportRange)}
        aria-label={t.reports.tabs.revenue}
        className="h-10 rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        {RANGES.map((value) => (
          <option key={value} value={value}>
            {t.reports.ranges[value]}
          </option>
        ))}
      </select>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        {controls}
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
        {controls}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-5" aria-busy>
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <Card className="space-y-3 p-5" aria-busy>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-[320px] w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      {controls}

      {tab === 'revenue' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              align="start"
              icon={DollarSign}
              tone="slate"
              label={t.reports.totalRevenue}
              value={money(summary.totalRevenue)}
            />
            <StatCard
              align="start"
              icon={TrendingUp}
              tone="blue"
              label={t.reports.totalCommission}
              value={money(summary.totalCommission)}
            />
            <StatCard
              align="start"
              icon={BarChart3}
              tone="accent"
              label={t.reports.totalBookings}
              value={summary.totalBookings.toLocaleString('en-US')}
            />
            <StatCard
              align="start"
              icon={TrendingUp}
              tone="brand"
              label={t.reports.avgMonthlyRevenue}
              value={money(summary.avgMonthlyRevenue)}
            />
          </div>

          {summary.revenueSeries.length === 0 ? (
            <Card>
              <EmptyState title={t.reports.emptyRevenue} />
            </Card>
          ) : (
            <>
              <RevenueChart
                data={summary.revenueSeries}
                title={t.reports.revenueOverTimeTitle}
                description={t.reports.revenueOverTimeSubtitle}
                showRangeSwitch={false}
                showLegend
                height={320}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <HorizontalBarChart
                  data={summary.revenueByCity}
                  title={t.reports.revenueByCityTitle}
                  seriesLabel={t.reports.revenue}
                  formatLabel={city}
                  formatValue={money}
                  formatTick={millions}
                />
                <BookingStatusChart data={summary.bookingStatusSlices} />
              </div>
            </>
          )}
        </>
      )}

      {tab === 'bookings' && (
        summary.bookingVolume.length === 0 ? (
          <Card>
            <EmptyState title={t.reports.emptyBookings} />
          </Card>
        ) : (
          <CategoryBarChart
            data={summary.bookingVolume}
            title={t.reports.bookingVolumeTitle}
            seriesLabel={t.reports.bookings}
            formatLabel={month}
            highlightPeak
            height={400}
          />
        )
      )}

      {tab === 'partners' && (
        summary.topPartners.length === 0 ? (
          <Card>
            <EmptyState title={t.reports.emptyPartners} />
          </Card>
        ) : (
          <>
            <CategoryBarChart
              data={summary.topPartners.map((partner) => ({
                label: partner.name,
                value: partner.revenue,
              }))}
              title={t.reports.topPartnersTitle}
              seriesLabel={t.reports.revenue}
              formatLabel={shortPartnerName}
              formatValue={money}
              formatTick={thousandsTick}
              height={360}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              {summary.topPartners.map((partner, index) => (
                <Card
                  key={partner.partnerId}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <span className="text-lg font-semibold tabular-nums text-slate-300">
                    #{index + 1}
                  </span>
                  <Avatar name={partner.name} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{partner.name}</p>
                    <p className="truncate text-sm text-slate-500">
                      {city(partner.city)} · {t.reports.unitsCount(partner.units)}
                    </p>
                  </div>

                  <div className="text-end">
                    <p className="font-semibold tabular-nums text-slate-900">
                      {money(partner.revenue)}
                    </p>
                    <p className="text-sm tabular-nums text-slate-500">
                      {t.reports.bookingsCount(partner.bookings)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )
      )}

      {tab === 'occupancy' && (
        summary.occupancySeries.length === 0 ? (
          <Card>
            <EmptyState title={t.reports.emptyOccupancy} />
          </Card>
        ) : (
          <OccupancyChart data={summary.occupancySeries} average={summary.occupancyAverage} />
        )
      )}
    </div>
  );
}

/** Bar labels get the distinguishing word, not the whole legal name. */
function shortPartnerName(name: string): string {
  const words = name.trim().split(/\s+/);
  return words[words.length - 1];
}
