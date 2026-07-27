'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useT } from '@/i18n';
import type { StatusSlice } from '@/types';
import { ChartCard } from './ChartCard';
import { ChartTooltipBox } from './ChartTooltip';
import { STATUS_COLOR } from './theme';

export function BookingStatusChart({ data }: { data: StatusSlice[] }) {
  const t = useT();
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  const share = (count: number) => (total ? Math.round((count / total) * 1000) / 10 : 0);

  return (
    <ChartCard title={t.dashboard.bookingStatusTitle} description={t.dashboard.bookingStatusSubtitle}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={54}
            outerRadius={90}
            paddingAngle={2}
            cornerRadius={4}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((slice) => (
              <Cell key={slice.status} fill={STATUS_COLOR[slice.status]} />
            ))}
          </Pie>

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const slice = payload[0]?.payload as StatusSlice;
              return (
                <ChartTooltipBox
                  title={t.status[slice.status]}
                  rows={[
                    {
                      label: t.dashboard.bookings,
                      value: `${slice.count.toLocaleString('en-US')} · ${share(slice.count)}%`,
                      color: STATUS_COLOR[slice.status],
                    },
                  ]}
                />
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-5 space-y-3">
        {data.map((slice) => (
          <li key={slice.status} className="flex items-center gap-3 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[slice.status] }}
              aria-hidden
            />
            <span className="flex-1 truncate text-slate-600">{t.status[slice.status]}</span>
            <span dir="ltr" className="font-semibold tabular-nums text-slate-900">
              {slice.count.toLocaleString('en-US')}
            </span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
