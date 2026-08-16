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
import { RequirePermission } from '@/components/auth';
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
import { cn } from '@/lib/utils/cn';
import { useCan } from '@/hooks/useCan';
import { reportsApi } from '@/lib/api';
import { downloadCsv, toCsv } from '@/lib/utils/csv';
import { formatSAR } from '@/lib/utils/format';
import type { ReportRange, ReportsSummary } from '@/types';

const TABS = ['revenue', 'bookings', 'partners', 'occupancy'] as const;
type Tab = (typeof TABS)[number];

/**
 * The money view — revenue, commission, the split by city. Everything else on this
 * screen describes how the platform is operating, not what it earned.
 */
const FINANCIAL_TABS: readonly Tab[] = ['revenue'];
const OPERATIONAL_TABS: readonly Tab[] = ['bookings', 'partners', 'occupancy'];

const RANGES: ReportRange[] = ['6m', '1y', 'all'];

export default function ReportsPage() {
  return (
    <RequirePermission permission="reports.financial">
      <ReportsPageContent />
    </RequirePermission>
  );
}

function ReportsPageContent() {
  const t = useT();
  const { can } = useCan();

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
  /**
   * Production still returns the pre-VAT shape, so these fields can be absent. `null`
   * means "not reported"; it must never collapse into a zero, which would read as a
   * factual claim that nothing was collected.
   */
  const optionalMoney = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value) ? money(value) : null;

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

  // Finance holds reports.financial only, so it gets the financial section and never
  // the operational one. A tab that is not visible can never be the active tab.
  const visibleTabs: readonly Tab[] = can('reports.operational')
    ? [...FINANCIAL_TABS, ...OPERATIONAL_TABS]
    : FINANCIAL_TABS;
  const activeTab: Tab = visibleTabs.includes(tab) ? tab : 'revenue';

  const controls = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Segmented
        items={visibleTabs.map((value) => ({ value, label: t.reports.tabs[value] }))}
        value={activeTab}
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

      {activeTab === 'revenue' && (
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

          {/* The financial section proper: what was earned, what was tax, what the
              partners are owed, and how much of it has actually left the building. */}
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="p-5 xl:col-span-2">
              <h3 className="text-base font-semibold text-slate-900">
                {t.reports.financialSection}
              </h3>
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <FinancialRow
                  label={t.reports.netRevenue}
                  value={optionalMoney(summary.netRevenue)}
                />
                <FinancialRow
                  label={t.reports.totalCommission}
                  value={money(summary.totalCommission)}
                />
                <FinancialRow
                  label={t.reports.partnersShare}
                  value={optionalMoney(summary.partnersShare)}
                />
                <FinancialRow
                  label={t.reports.payoutsPaid}
                  value={optionalMoney(summary.payoutsPaid)}
                />
                <FinancialRow
                  label={t.reports.payoutsPending}
                  value={optionalMoney(summary.payoutsPending)}
                />
              </dl>
            </Card>

            {/* Its own tile, never a line in the revenue card and never added into a
                total: this is money held for the authority, not money the platform
                earned. Read straight from the API — deriving it from totalRevenue here
                would double-count now that the backend is VAT-inclusive.

                `vatCollected` is this endpoint's name for it; `vat` belongs to the
                partner dashboard's report and is accepted only as a fallback. */}
            <Card className="flex flex-col justify-center p-5">
              <p className="text-sm text-slate-600">{t.reports.vatCollected}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                {optionalMoney(summary.vatCollected) ?? (
                  <span className="text-xl font-medium text-slate-400">
                    {t.reports.notReported}
                  </span>
                )}
              </p>
              <p className="mt-2 text-xs text-slate-500">{t.reports.vatNotRevenue}</p>

              {/* Legacy-only, and silent when there is nothing to explain. Without it a
                  reader closing the gross-to-net gap with tax alone reads a 19.6% VAT
                  rate off a screen that never says so. */}
              {summary.fees !== undefined && summary.fees > 0 && (
                <p className="mt-3 border-t border-hairline pt-3 text-xs text-slate-500">
                  {t.reports.legacyFees}{' '}
                  <span className="font-semibold tabular-nums text-slate-700">
                    {money(summary.fees)}
                  </span>
                </p>
              )}
            </Card>
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

      {activeTab === 'bookings' && (
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

      {activeTab === 'partners' && (
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

      {activeTab === 'occupancy' && (
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

function FinancialRow({ label, value }: { label: string; value: string | null }) {
  const t = useT();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-0">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd
        className={cn(
          'tabular-nums',
          value ? 'font-semibold text-slate-900' : 'text-sm text-slate-400',
        )}
      >
        {value ?? t.reports.notReported}
      </dd>
    </div>
  );
}
