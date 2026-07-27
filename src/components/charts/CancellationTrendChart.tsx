'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useT } from '@/i18n';
import { useUiStore } from '@/stores';
import type { CancellationTrendPoint } from '@/types';
import { ChartCard } from './ChartCard';
import { ChartTooltipBox } from './ChartTooltip';
import { CHART, STATUS_COLOR, axisTicks } from './theme';

/** Who walked away: the guest (recoverable) or the host (a partner problem). */
const GUEST_COLOR = CHART.barMuted;
const HOST_COLOR = STATUS_COLOR.cancelled;

export function CancellationTrendChart({
  data,
  className,
}: {
  data: CancellationTrendPoint[];
  className?: string;
}) {
  const t = useT();
  const rtl = useUiStore((state) => state.locale) === 'ar';

  const ticks = useMemo(
    () => axisTicks(Math.max(...data.flatMap((point) => [point.guest, point.host]), 0)),
    [data],
  );
  const month = (label: string) => t.months[label as keyof typeof t.months] ?? label;

  return (
    <ChartCard
      className={className}
      title={t.cancellations.trendTitle}
      description={t.cancellations.trendSubtitle}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barCategoryGap="28%">
          <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />

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
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: CHART.axis, fontSize: 12 }}
          />

          <Tooltip
            cursor={{ fill: CHART.grid, fillOpacity: 0.5 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox
                  title={month(String(label))}
                  rows={[
                    {
                      label: t.cancellations.guestCancellations,
                      value: String(payload[0]?.payload?.guest ?? 0),
                      color: GUEST_COLOR,
                    },
                    {
                      label: t.cancellations.hostCancellations,
                      value: String(payload[0]?.payload?.host ?? 0),
                      color: HOST_COLOR,
                    },
                  ]}
                />
              ) : null
            }
          />

          <Bar dataKey="guest" fill={GUEST_COLOR} radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="host" fill={HOST_COLOR} radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>

      <ul className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-600">
        {[
          { color: GUEST_COLOR, label: t.cancellations.guestCancellations },
          { color: HOST_COLOR, label: t.cancellations.hostCancellations },
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
    </ChartCard>
  );
}
