import { Flame, BookCheck, Clock, ScrollText, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  unlocked: boolean;
}

interface Props {
  longestStreak: number;
  booksFinished: number;
  totalMinutes: number;
  totalPagesRead: number;
}

function buildAchievements({
  longestStreak,
  booksFinished,
  totalMinutes,
  totalPagesRead,
}: Props): Achievement[] {
  return [
    // Rachas
    {
      id: "streak-1",
      title: "Primera chispa",
      description: "Lee 1 día seguido",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      unlocked: longestStreak >= 1,
    },
    {
      id: "streak-7",
      title: "Semana ardiente",
      description: "Racha de 7 días",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      unlocked: longestStreak >= 7,
    },
    {
      id: "streak-30",
      title: "Mes imparable",
      description: "Racha de 30 días",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      unlocked: longestStreak >= 30,
    },
    // Libros terminados
    {
      id: "books-1",
      title: "Primer final",
      description: "Termina 1 libro",
      icon: BookCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      unlocked: booksFinished >= 1,
    },
    {
      id: "books-5",
      title: "Coleccionista",
      description: "Termina 5 libros",
      icon: BookCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      unlocked: booksFinished >= 5,
    },
    {
      id: "books-10",
      title: "Bibliófilo",
      description: "Termina 10 libros",
      icon: BookCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      unlocked: booksFinished >= 10,
    },
    // Tiempo leído
    {
      id: "time-60",
      title: "Primera hora",
      description: "Lee 1 hora en total",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      unlocked: totalMinutes >= 60,
    },
    {
      id: "time-600",
      title: "Maratón",
      description: "Lee 10 horas en total",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      unlocked: totalMinutes >= 600,
    },
    {
      id: "time-6000",
      title: "Centenario",
      description: "Lee 100 horas en total",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      unlocked: totalMinutes >= 6000,
    },
    // Páginas
    {
      id: "pages-100",
      title: "Primeras páginas",
      description: "Lee 100 páginas",
      icon: ScrollText,
      color: "text-plum",
      bg: "bg-plum/10 dark:bg-plum/20",
      unlocked: totalPagesRead >= 100,
    },
    {
      id: "pages-1000",
      title: "Lector voraz",
      description: "Lee 1.000 páginas",
      icon: ScrollText,
      color: "text-plum",
      bg: "bg-plum/10 dark:bg-plum/20",
      unlocked: totalPagesRead >= 1000,
    },
    {
      id: "pages-5000",
      title: "Devorador",
      description: "Lee 5.000 páginas",
      icon: ScrollText,
      color: "text-plum",
      bg: "bg-plum/10 dark:bg-plum/20",
      unlocked: totalPagesRead >= 5000,
    },
  ];
}

export function AchievementsSection(props: Props) {
  const achievements = buildAchievements(props);
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          Logros
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          {unlocked} / {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {achievements.map(({ id, title, description, icon: Icon, color, bg, unlocked }) => (
          <div
            key={id}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-opacity",
              !unlocked && "opacity-35"
            )}
          >
            <div className={cn("relative p-2.5 rounded-xl", unlocked ? bg : "bg-[var(--bg-card-hover)]")}>
              <Icon
                size={20}
                className={unlocked ? color : "text-[var(--text-muted)]"}
              />
              {!unlocked && (
                <div className="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5">
                  <Lock size={9} className="text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--text-primary)] leading-tight">
                {title}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
