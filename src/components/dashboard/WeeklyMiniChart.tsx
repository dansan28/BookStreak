"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatTotalMinutes } from "@/utils/formatTime";
import type { DailyStats } from "@/types";

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

export function WeeklyMiniChart({ data }: { data: DailyStats[] }) {
  const today = new Date().toISOString().split("T")[0];
  const weekTotal = data.reduce((s, d) => s + d.total_minutes, 0);
  const maxMinutes = Math.max(...data.map((d) => d.total_minutes), 1);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          Esta semana
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {formatTotalMinutes(weekTotal)}
          </span>
          <Link
            href="/profile"
            className="text-[10px] text-plum font-medium hover:underline"
          >
            Ver todo
          </Link>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-14">
        {data.map((day) => {
          const isToday = day.date === today;
          const heightPct = Math.max((day.total_minutes / maxMinutes) * 100, day.total_minutes > 0 ? 8 : 4);
          const dayLabel = DAY_LABELS[new Date(day.date + "T12:00:00").getDay()];

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: "44px" }}>
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isToday
                      ? "var(--color-plum, #9B72CF)"
                      : day.total_minutes > 0
                      ? "rgba(155,114,207,0.35)"
                      : "var(--border)",
                  }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isToday ? "var(--color-plum, #9B72CF)" : "var(--text-muted)",
                }}
              >
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
