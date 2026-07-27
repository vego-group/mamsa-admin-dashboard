'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Segmented } from '@/components/common';
import { useT } from '@/i18n';
import { formatSAR } from '@/lib/utils/format';
import { useUiStore } from '@/stores';
import type { DualSeriesPoint } from '@/types';
import { ChartCard } from './ChartCard';
import { ChartTooltipBox } from './ChartTooltip';
import { CHART, axisTicks, thousandsTick } from './theme';

/** Trailing months, newest last. `12M` is the whole seeded window. */
const RANGES = [3, 6, 12] as const;
type Range = (typeof RANGES)[number];

export interface RevenueChartProps {
  data: DualSeriesPoint[];
  title?: string;
  description?: string;
  /** Off when an outer control already scopes the range, as on Reports. */
  showRangeSwitch?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

export function RevenueChart({
  data,
  title,
  description,
  showRangeSwitch = true,
  showLegend = false,
  height = 280,
  className,
}: RevenueChartProps) {
  const t = useT();
  const rtl = useUiStore((state) => state.locale) === 'ar';
  const [range, setRange] = useState<Range>(12);

  const points = useMemo(
    () => (showRangeSwitch ? data.slice(-range) : data),
    [data, range, showRangeSwitch],
  );
  const ticks = useMemo(
    () => axisTicks(Math.max(...points.map((point) => point.revenue), 0)),
    [points],
  );

  return (
    <ChartCard
      className={className}
      title={title ?? t.dashboard.revenueTitle}
      description={description ?? t.dashboard.revenueSubtitle}
      action={
        showRangeSwitch && (
          <Segmented
            ltr
            items={RANGES.map((value) => ({ value: String(value), label: `${value}M` }))}
            value={String(range)}
            onChange={(value) => setRange(Number(value) as Range)}
          />
        )
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.revenue} stopOpacity={0.14} />
              <stop offset="100%" stopColor={CHART.revenue} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />

          <XAxis
            dataKey="label"
            reversed={rtl}
            tickFormatter={(label: string) => t.months[label as keyof typeof t.months] ?? label}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />
          <YAxis
            orientation={rtl ? 'right' : 'left'}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            tickFormatter={thousandsTick}
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />

          <Tooltip
            cursor={{ stroke: CHART.grid, strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox
                  title={t.months[label as keyof typeof t.months] ?? String(label)}
                  rows={[
                    {
                      label: t.dashboard.revenue,
                      value: formatSAR(Number(payload[0]?.payload?.revenue ?? 0), { compact: true }),
                      color: CHART.revenue,
                    },
                    {
                      label: t.dashboard.commission,
                      value: formatSAR(Number(payload[0]?.payload?.commission ?? 0), {
                        compact: true,
                      }),
                      color: CHART.commission,
                    },
                  ]}
                />
              ) : null
            }
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART.revenue}
            strokeWidth={2.5}
            fill="url(#revenue-fill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
          />
          <Area
            type="monotone"
            dataKey="commission"
            stroke={CHART.commission}
            strokeWidth={2}
            fill="none"
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {showLegend && (
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          {[
            { color: CHART.commission, label: t.dashboard.commission },
            { color: CHART.revenue, label: t.dashboard.revenue },
          ].map((entry) => (
            <li key={entry.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.label}
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
