import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { WeeklyActivityChart } from "@/components/stats/WeeklyActivityChart";
import { SessionHistoryList } from "@/components/stats/SessionHistoryList";
import { CalendarWithDetail, type PreloadedSession } from "@/components/stats/CalendarWithDetail";
import { Flame, Clock, BookCheck, TrendingUp } from "lucide-react";
import { formatTotalMinutes, sevenDaysAgoString, todayDateString } from "@/utils/formatTime";
import type { DailyStats } from "@/types";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const sevenDaysAgo = sevenDaysAgoString();
  const today = todayDateString();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];

  const [
    { data: profile },
    { data: recentSessions },
    { data: sessionHistory },
    { data: yearSessions },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, longest_streak, total_minutes, books_finished")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("reading_sessions")
      .select("date, duration_minutes")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo)
      .lte("date", today)
      .order("date"),
    supabase
      .from("reading_sessions")
      .select("id, duration_minutes, pages_read, date, created_at, note, books(title, cover_url)")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo)
      .order("created_at", { ascending: false }),
    supabase
      .from("reading_sessions")
      .select("date, duration_minutes")
      .eq("user_id", user.id)
      .gte("date", oneYearAgoStr)
      .order("date"),
  ]);

  const totalMinutes = profile?.total_minutes ?? 0;

  const preloadedSessions: PreloadedSession[] = (sessionHistory ?? []).map((s) => ({
    id: s.id,
    duration_minutes: s.duration_minutes,
    pages_read: s.pages_read,
    date: s.date,
    created_at: s.created_at,
    note: (s as Record<string, unknown>).note as string | null ?? null,
    books: Array.isArray(s.books)
      ? (s.books[0] as PreloadedSession["books"]) ?? null
      : s.books as PreloadedSession["books"],
  }));

  // Agrega minutos por día para el calendario
  const calendarMap: Record<string, number> = {};
  (yearSessions ?? []).forEach(({ date, duration_minutes }) => {
    calendarMap[date] = (calendarMap[date] ?? 0) + duration_minutes;
  });
  const calendarData = Object.entries(calendarMap).map(([date, minutes]) => ({ date, minutes }));

  const weekMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekMap[d.toISOString().split("T")[0]] = 0;
  }
  (recentSessions ?? []).forEach((s) => {
    if (weekMap[s.date] !== undefined) weekMap[s.date] += s.duration_minutes;
  });
  const weekData: DailyStats[] = Object.entries(weekMap).map(([date, total_minutes]) => ({ date, total_minutes }));

  const overallStats = [
    { icon: Flame, label: "Racha actual", value: `${profile?.current_streak ?? 0} días`, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { icon: TrendingUp, label: "Mejor racha", value: `${profile?.longest_streak ?? 0} días`, color: "text-plum", bg: "bg-plum/10 dark:bg-plum/20" },
    { icon: Clock, label: "Tiempo total", value: formatTotalMinutes(totalMinutes), color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { icon: BookCheck, label: "Libros leídos", value: String(profile?.books_finished ?? 0), color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Estadísticas</h2>

      <div className="grid grid-cols-2 gap-3">
        {overallStats.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${bg} rounded-xl flex-shrink-0`}>
                <Icon className={color} size={18} />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{value}</div>
                <div className="text-xs text-[var(--text-muted)]">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
          Actividad últimos 7 días
        </h3>
        <WeeklyActivityChart data={weekData} />
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
          Actividad del año
        </h3>
        <CalendarWithDetail
          data={calendarData}
          currentStreak={profile?.current_streak ?? 0}
          preloadedSessions={preloadedSessions}
        />
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
          Sesiones de esta semana
        </h3>
        <SessionHistoryList sessions={preloadedSessions} />
      </Card>
    </div>
  );
}
