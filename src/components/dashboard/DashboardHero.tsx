import { Flame } from "lucide-react";
import { getGreeting, todayDateString } from "@/utils/formatTime";
import { getStreakMessage, isReadToday } from "@/utils/streakUtils";
import type { Profile } from "@/types";

interface DashboardHeroProps {
  profile: Profile | null;
  todayMinutes: number;
}

export function DashboardHero({ profile, todayMinutes }: DashboardHeroProps) {
  const streak = profile?.current_streak ?? 0;
  const goal = profile?.daily_goal_minutes ?? 30;
  const percent = Math.min(100, Math.round((todayMinutes / goal) * 100));
  const reached = todayMinutes >= goal;
  const readToday = isReadToday(profile?.last_read_date ?? null);

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

        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{getGreeting()}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5 capitalize">{today}</p>
        </div>

        <div className="flex items-center gap-5 ml-auto flex-wrap">

          {/* Streak */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Flame className="text-orange-500" size={18} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[var(--text-primary)]">{streak}</span>
                <span className="text-sm text-[var(--text-muted)]">
                  {streak === 1 ? "día" : "días"}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-none">
                {readToday ? (
                  <span className="text-emerald-500 font-medium">Leíste hoy ✓</span>
                ) : (
                  getStreakMessage(streak)
                )}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />

          {/* Daily goal ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--border)" strokeWidth="5" />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke={reached ? "#10b981" : "#9B72CF"}
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
