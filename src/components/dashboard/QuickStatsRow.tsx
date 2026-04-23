import { Card } from "@/components/ui/Card";
import { Clock, BookCheck, FileText } from "lucide-react";
import { formatTotalMinutes } from "@/utils/formatTime";

interface QuickStatsRowProps {
  totalMinutes: number;
  booksFinished: number;
  totalPages: number;
}

export function QuickStatsRow({ totalMinutes, booksFinished, totalPages }: QuickStatsRowProps) {
  const stats = [
    {
      icon: Clock,
      label: "Tiempo total",
      value: formatTotalMinutes(totalMinutes),
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: BookCheck,
      label: "Libros leídos",
      value: String(booksFinished),
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      icon: FileText,
      label: "Páginas leídas",
      value: String(totalPages),
      color: "text-plum",
      bg: "bg-plum/10 dark:bg-plum/20",
    },
  ];

  return (
    <>
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <Card key={label} className="p-5">
          <div className="flex items-start gap-3">
            <div className={`p-2 ${bg} rounded-xl flex-shrink-0`}>
              <Icon className={color} size={18} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
