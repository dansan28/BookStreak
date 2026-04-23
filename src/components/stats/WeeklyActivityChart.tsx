"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyStats } from "@/types";

interface WeeklyActivityChartProps {
  data: DailyStats[];
}

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_LABELS[d.getDay()];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={formatLabel}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}m`}
        />
        <Tooltip
          formatter={(value: number) => [`${value} min`, "Lectura"]}
          labelFormatter={formatLabel}
          cursor={false}
          contentStyle={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "var(--text-primary)",
          }}
          labelStyle={{ color: "var(--text-primary)" }}
          itemStyle={{ color: "var(--text-primary)" }}
        />
        <Bar
          dataKey="total_minutes"
          radius={[6, 6, 0, 0]}
          activeBar={{ fill: "#C4A0F0", stroke: "#9B72CF", strokeWidth: 1.5 }}
        >
          {data.map((entry) => (
            <Cell
              key={entry.date}
              fill={entry.date === today ? "#9B72CF" : "#9B72CF44"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
