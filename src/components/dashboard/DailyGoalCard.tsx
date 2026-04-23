import { Card } from "@/components/ui/Card";
import { Target } from "lucide-react";
import type { Profile } from "@/types";

interface DailyGoalCardProps {
  profile: Profile | null;
  todayMinutes: number;
}

export function DailyGoalCard({ profile, todayMinutes }: DailyGoalCardProps) {
  const goal = profile?.daily_goal_minutes ?? 30;
  const percent = Math.min(100, Math.round((todayMinutes / goal) * 100));
  const reached = todayMinutes >= goal;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-plum/10 dark:bg-plum/20 rounded-xl">
          <Target className="text-plum" size={18} />
        </div>
        <span className="text-sm font-medium text-[var(--text-muted)]">Meta diaria</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={reached ? "#10b981" : "#9B72CF"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--text-primary)]">{percent}%</span>
          </div>
        </div>

        <div>
          <div className="text-xl font-bold text-[var(--text-primary)]">
            {todayMinutes}<span className="text-sm font-normal text-[var(--text-muted)]">m</span>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            de {goal}min hoy
          </div>
          {reached && (
            <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Meta alcanzada
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
