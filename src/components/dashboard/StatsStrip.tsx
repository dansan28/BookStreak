import { Clock, BookCheck, FileText, Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatTotalMinutes } from "@/utils/formatTime";

interface StatsStripProps {
  totalMinutes: number;
  booksFinished: number;
  totalPages: number;
  longestStreak: number;
}

export function StatsStrip({ totalMinutes, booksFinished, totalPages, longestStreak }: StatsStripProps) {
  const stats = [
    {
      icon: Clock,
      label: "Tiempo total",
      value: formatTotalMinutes(totalMinutes),
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: BookCheck,
      label: "Libros leídos",
      value: String(booksFinished),
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: FileText,
      label: "Páginas leídas",
      value: totalPages > 999 ? `${(totalPages / 1000).toFixed(1)}k` : String(totalPages),
      color: "text-plum",
      bg: "bg-plum/10 dark:bg-plum/20",
    },
    {
      icon: Flame,
      label: "Mejor racha",
      value: `${longestStreak}d`,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 sm:py-0 first:pl-0 last:pr-0">
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
