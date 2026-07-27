'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useUiStore } from '@/stores';
import type { SeriesPoint } from '@/types';
import { ChartCard } from './ChartCard';
import { ChartTooltipBox } from './ChartTooltip';
import { CHART, axisTicks } from './theme';

export interface HorizontalBarChartProps {
  data: SeriesPoint[];
  title: string;
  description?: string;
  formatLabel?: (label: string) => string;
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
  seriesLabel: string;
  className?: string;
}

/**
 * Bars run along the value axis so long category names get a full line of their own —
 * the vertical form truncates them into initials.
 */
export function HorizontalBarChart({
  data,
  title,
  description,
  formatLabel = (label) => label,
  formatValue = (value) => value.toLocaleString('en-US'),
  formatTick,
  seriesLabel,
  className,
}: HorizontalBarChartProps) {
  const rtl = useUiStore((state) => state.locale) === 'ar';

  const ticks = useMemo(() => axisTicks(Math.max(...data.map((p) => p.value), 0)), [data]);

  return (
    <ChartCard className={className} title={title} description={description}>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 52)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
          barCategoryGap="32%"
        >
          <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" horizontal={false} />

          <XAxis
            type="number"
            reversed={rtl}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            tickFormatter={formatTick}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            orientation={rtl ? 'right' : 'left'}
            tickFormatter={formatLabel}
            tickLine={false}
            axisLine={false}
            width={86}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />

          <Tooltip
            cursor={{ fill: CHART.grid, fillOpacity: 0.5 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox
                  title={formatLabel(String(label))}
                  rows={[
                    {
                      label: seriesLabel,
                      value: formatValue(Number(payload[0]?.value ?? 0)),
                      color: CHART.bar,
                    },
                  ]}
                />
              ) : null
            }
          />

          <Bar dataKey="value" fill={CHART.bar} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
