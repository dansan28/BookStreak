import { Flame, Check } from "lucide-react";
import { Greeting } from "@/components/dashboard/Greeting";
import { getStreakMessage, getActiveStreak } from "@/utils/streakUtils";
import type { Profile } from "@/types";

interface DashboardHeroProps {
  profile: Profile | null;
  todayMinutes: number;
}

export function DashboardHero({ profile, todayMinutes }: DashboardHeroProps) {
  const streak = getActiveStreak(profile?.current_streak ?? 0, profile?.last_read_date ?? null);
  const goal = profile?.daily_goal_minutes ?? 30;
  const percent = Math.min(100, Math.round((todayMinutes / goal) * 100));
  const reached = todayMinutes >= goal;
  const litToday = todayMinutes > 0;

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between gap-4 flex-wrap">

        {/* Greeting + fuego inline + badge de objetivo */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-[var(--text-primary)]"><Greeting /></h2>

            <Flame
              size={20}
              className={
                litToday
                  ? "text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.45)]"
                  : "text-[var(--text-muted)] opacity-30"
              }
            />

            {reached && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25">
                <Check size={11} strokeWidth={2.5} />
                Objetivo cumplido
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5 capitalize">{today}</p>
        </div>

        <div className="flex items-center gap-5 ml-auto">

          {/* Racha */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors duration-300 ${
              litToday
                ? "bg-orange-100 dark:bg-orange-900/30"
                : "bg-[var(--bg-card-hover)]"
            }`}>
              <Flame
                size={18}
                className={litToday ? "text-orange-500" : "text-[var(--text-muted)]"}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[var(--text-primary)]">{streak}</span>
                <span className="text-sm text-[var(--text-muted)]">
                  {streak === 1 ? "día" : "días"}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-none">
                {litToday ? (
                  <span className="text-emerald-500 font-medium">Leíste hoy ✓</span>
                ) : (
                  getStreakMessage(streak)
                )}
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />

          {/* Anillo de progreso diario */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle
                  cx="28" cy="28" r={radius}
                  fill="none" stroke="var(--border)" strokeWidth="5"
                />
                <circle
                  cx="28" cy="28" r={radius}
                  fill="none"
                  stroke={reached ? "#10b981" : "var(--accent)"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[var(--text-primary)]">{percent}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-[var(--text-primary)]">{todayMinutes}</span>
                <span className="text-sm text-[var(--text-muted)]">/{goal}m</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-none mt-0.5">
                {reached ? (
                  <span className="text-emerald-500 font-medium">Meta alcanzada</span>
                ) : (
                  "Meta de hoy"
                )}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
