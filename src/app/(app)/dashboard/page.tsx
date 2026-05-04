import { createClient } from "@/lib/supabase/server";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { ReadingTimerWidget } from "@/components/dashboard/ReadingTimerWidget";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { WeeklyMiniChart } from "@/components/dashboard/WeeklyMiniChart";
import { OtherReadingBooks } from "@/components/dashboard/OtherReadingBooks";
import { todayDateString, sevenDaysAgoString } from "@/utils/formatTime";
import { getActiveStreak } from "@/utils/streakUtils";
import type { DailyStats } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayDateString();
  const sevenDaysAgo = sevenDaysAgoString();

  const [
    { data: profile },
    { data: readingBooks },
    { data: todaySessions },
    { data: weekSessions },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase
      .from("books")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["reading", "pending"])
      .order("status")
      .limit(10),
    supabase
      .from("reading_sessions")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .eq("date", today),
    supabase
      .from("reading_sessions")
      .select("date, duration_minutes, pages_read")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo)
      .lte("date", today)
      .order("date"),
  ]);

  const todayMinutes = (todaySessions ?? []).reduce((s, r) => s + r.duration_minutes, 0);

  const weekMinutes = (weekSessions ?? []).reduce((s, r) => s + r.duration_minutes, 0);
  const weekPages = (weekSessions ?? []).reduce((s, r) => s + r.pages_read, 0);
  const weekSessionCount = (weekSessions ?? []).length;

  const weekMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekMap[d.toISOString().split("T")[0]] = 0;
  }
  (weekSessions ?? []).forEach((s) => {
    if (weekMap[s.date] !== undefined) weekMap[s.date] += s.duration_minutes;
  });
  const weekData: DailyStats[] = Object.entries(weekMap).map(([date, total_minutes]) => ({ date, total_minutes }));

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Hero: saludo + streak + meta */}
      <DashboardHero profile={profile} todayMinutes={todayMinutes} />

      {/* Acción principal: timer + libro actual */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-1">
          Sesión de lectura
        </p>
        <ReadingTimerWidget books={readingBooks ?? []} />
        <OtherReadingBooks books={readingBooks ?? []} />
      </div>

      {/* Stats strip semanal */}
      <StatsStrip
        weekMinutes={weekMinutes}
        weekPages={weekPages}
        weekSessions={weekSessionCount}
        currentStreak={getActiveStreak(profile?.current_streak ?? 0, profile?.last_read_date ?? null)}
      />

      {/* Actividad semanal */}
      <WeeklyMiniChart data={weekData} />


    </div>
  );
}
