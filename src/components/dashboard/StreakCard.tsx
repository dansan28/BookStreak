import { Card } from "@/components/ui/Card";
import { Flame } from "lucide-react";
import { getStreakMessage, isReadToday, getActiveStreak } from "@/utils/streakUtils";
import type { Profile } from "@/types";

export function StreakCard({ profile }: { profile: Profile | null }) {
  const streak = getActiveStreak(profile?.current_streak ?? 0, profile?.last_read_date ?? null);
  const longest = profile?.longest_streak ?? 0;
  const readToday = isReadToday(profile?.last_read_date ?? null);

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Flame className="text-orange-500" size={18} />
          </div>
          <span className="text-sm font-medium text-[var(--text-muted)]">Racha actual</span>
        </div>
        {readToday && (
          <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
            Hoy
          </span>
        )}
      </div>

      <div className="text-6xl font-black text-[var(--text-primary)] leading-none mb-1">
        {streak}
      </div>
      <div className="text-sm text-[var(--text-muted)] mb-3">
        {streak === 1 ? "día" : "días"}
      </div>

      <p className="text-sm text-[var(--text-muted)]">{getStreakMessage(streak)}</p>

      {longest > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">
            Mejor racha: <span className="font-semibold text-plum">{longest}</span> días
          </span>
        </div>
      )}
    </Card>
  );
}
