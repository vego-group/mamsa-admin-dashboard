'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useUiStore } from '@/stores';
import type { SeriesPoint } from '@/types';
import { ChartCard } from './ChartCard';
import { ChartTooltipBox } from './ChartTooltip';
import { CHART, axisTicks } from './theme';

export interface CategoryBarChartProps {
  data: SeriesPoint[];
  title: string;
  description?: string;
  /** Turns a raw series label into display text — month name, weekday, city. */
  formatLabel?: (label: string) => string;
  formatValue?: (value: number) => string;
  /** Y-axis tick text. Omit for plain counts. */
  formatTick?: (value: number) => string;
  /** Paints the tallest bar in full brand green and mutes the rest. */
  highlightPeak?: boolean;
  seriesLabel: string;
  height?: number;
  className?: string;
}

export function CategoryBarChart({
  data,
  title,
  description,
  formatLabel = (label) => label,
  formatValue = (value) => value.toLocaleString('en-US'),
  formatTick,
  highlightPeak = false,
  seriesLabel,
  height = 260,
  className,
}: CategoryBarChartProps) {
  const rtl = useUiStore((state) => state.locale) === 'ar';

  const peak = useMemo(() => Math.max(...data.map((point) => point.value), 0), [data]);
  const ticks = useMemo(() => axisTicks(peak), [peak]);

  return (
    <ChartCard className={className} title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barCategoryGap="30%">
          <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />

          <XAxis
            dataKey="label"
            reversed={rtl}
            tickFormatter={formatLabel}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />
          <YAxis
            orientation={rtl ? 'right' : 'left'}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            tickFormatter={formatTick}
            tickLine={false}
            axisLine={false}
            width={formatTick ? 56 : 40}
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

          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((point) => (
              <Cell
                key={point.label}
                fill={!highlightPeak || point.value === peak ? CHART.bar : CHART.barMuted}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
