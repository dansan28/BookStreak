import { Clock, FileText, Flame, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatTotalMinutes } from "@/utils/formatTime";

interface StatsStripProps {
  weekMinutes: number;
  weekPages: number;
  weekSessions: number;
  currentStreak: number;
}

export function StatsStrip({ weekMinutes, weekPages, weekSessions, currentStreak }: StatsStripProps) {
  const stats = [
    {
      icon: Clock,
      label: "Tiempo (sem.)",
      value: formatTotalMinutes(weekMinutes),
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: FileText,
      label: "Páginas (sem.)",
      value: weekPages > 999 ? `${(weekPages / 1000).toFixed(1)}k` : String(weekPages),
      color: "text-plum",
      bg: "bg-plum/10 dark:bg-plum/20",
    },
    {
      icon: CalendarDays,
      label: "Sesiones (sem.)",
      value: String(weekSessions),
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: Flame,
      label: "Racha actual",
      value: `${currentStreak}d`,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color, bg }, i) => (
          <div
            key={label}
            className={[
              "flex items-center gap-3 px-4 py-3 sm:py-0",
              // Mobile: separar columna izquierda de derecha
              i % 2 === 0 ? "border-r border-[var(--border)] sm:border-r-0" : "",
              // Mobile: separar fila superior de inferior
              i < 2 ? "border-b border-[var(--border)] sm:border-b-0" : "",
              // Desktop: separar items con borde izquierdo
              i > 0 ? "sm:border-l sm:border-[var(--border)]" : "",
              i === 0 ? "pl-0" : "",
              i === stats.length - 1 ? "pr-0" : "",
            ].join(" ")}
          >
            <div className={`p-2 ${bg} rounded-xl flex-shrink-0`}>
              <Icon className={color} size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--text-primary)] leading-none">{value}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
