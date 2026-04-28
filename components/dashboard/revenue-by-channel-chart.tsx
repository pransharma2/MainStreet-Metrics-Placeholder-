"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChannelSlice } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/utils";

export function RevenueByChannelChart({ data }: { data: ChannelSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="flex items-center gap-6">
      <div className="h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="channel"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.channel} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 24px -12px rgba(16,24,40,0.15)",
                fontSize: 12,
              }}
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2.5 text-sm">
        {data.map((d) => {
          const pct = (d.revenue / total) * 100;
          return (
            <li
              key={d.channel}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="font-medium">{d.channel}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {formatCurrency(d.revenue)}
                </span>
                <span className="inline-flex w-12 justify-end rounded-full bg-muted px-1.5 py-0.5 font-medium text-foreground/80 tabular-nums">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
