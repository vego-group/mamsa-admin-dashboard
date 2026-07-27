'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useT } from '@/i18n';
import { formatPercent } from '@/lib/utils/format';
import { useUiStore } from '@/stores';
import type { SeriesPoint } from '@/types';
import { ChartCard } from './ChartCard';
import { ChartTooltipBox } from './ChartTooltip';
import { CHART } from './theme';

/** Occupancy is a share of nights: the axis is anchored to a readable band, not to 0. */
const TICKS = [40, 55, 70, 85, 100];

export function OccupancyChart({
  data,
  average,
  className,
}: {
  data: SeriesPoint[];
  average: number;
  className?: string;
}) {
  const t = useT();
  const rtl = useUiStore((state) => state.locale) === 'ar';
  const month = (label: string) => t.months[label as keyof typeof t.months] ?? label;

  return (
    <ChartCard
      className={className}
      title={t.reports.occupancyTitle}
      description={t.reports.occupancySubtitle}
      action={
        <div className="text-end">
          <p className="text-3xl font-semibold tabular-nums text-slate-900">{average}%</p>
          <p className="text-sm text-slate-500">{t.reports.annualAverage}</p>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" />

          <XAxis
            dataKey="label"
            reversed={rtl}
            tickFormatter={month}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />
          <YAxis
            orientation={rtl ? 'right' : 'left'}
            ticks={TICKS}
            domain={[TICKS[0], TICKS[TICKS.length - 1]]}
            tickFormatter={(value: number) => `${value}%`}
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
                  title={month(String(label))}
                  rows={[
                    {
                      label: t.reports.occupancy,
                      value: formatPercent(Number(payload[0]?.value ?? 0), 0),
                      color: CHART.revenue,
                    },
                  ]}
                />
              ) : null
            }
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART.revenue}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: CHART.revenue, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
