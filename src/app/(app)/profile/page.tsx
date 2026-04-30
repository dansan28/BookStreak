import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { WeeklyActivityChart } from "@/components/stats/WeeklyActivityChart";
import { SessionHistoryList } from "@/components/stats/SessionHistoryList";
import { CalendarWithDetail, type PreloadedSession } from "@/components/stats/CalendarWithDetail";
import { Flame, Clock, BookCheck, TrendingUp, CalendarDays } from "lucide-react";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { ReadingInsightsCard } from "@/components/profile/ReadingInsightsCard";
import type { ReadingInsights } from "@/components/profile/ReadingInsightsCard";
import { formatTotalMinutes, sevenDaysAgoString, todayDateString } from "@/utils/formatTime";
import type { DailyStats } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const sevenDaysAgo = sevenDaysAgoString();
  const today = todayDateString();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const [
    { data: profile },
    { data: recentSessions },
    { data: sessionHistory },
    { data: yearSessions },
    { data: insightSessions },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, longest_streak, total_minutes, books_finished, total_pages_read, created_at, username, avatar_url")
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
    supabase
      .from("reading_sessions")
      .select("date, duration_minutes, created_at")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoStr)
      .order("date")
      .limit(300),
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

  // --- Reading insights ---
  const sessions90 = insightSessions ?? [];
  let readingInsights: ReadingInsights | null = null;

  if (sessions90.length >= 3) {
    // Best day of week (from year data for more signal)
    const dayMinutes = [0, 0, 0, 0, 0, 0, 0];
    (yearSessions ?? []).forEach((s) => {
      const day = new Date(s.date + "T12:00:00").getDay();
      dayMinutes[day] += s.duration_minutes;
    });
    const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const bestDayIndex = dayMinutes.indexOf(Math.max(...dayMinutes));
    const bestDay = Math.max(...dayMinutes) > 0 ? DAY_NAMES[bestDayIndex] : null;

    // Favorite time of day (from created_at — proxy for end of session)
    const timeMinutes = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sessions90.forEach((s) => {
      const hour = new Date(s.created_at).getHours();
      if (hour >= 6 && hour < 12) timeMinutes.morning += s.duration_minutes;
      else if (hour >= 12 && hour < 18) timeMinutes.afternoon += s.duration_minutes;
      else if (hour >= 18 && hour < 22) timeMinutes.evening += s.duration_minutes;
      else timeMinutes.night += s.duration_minutes;
    });
    const favTimeKey = (Object.entries(timeMinutes).sort((a, b) => b[1] - a[1])[0][0]) as keyof typeof timeMinutes;
    const timeLabels = {
      morning:   { label: "Mañana",      emoji: "🌅" },
      afternoon: { label: "Tarde",        emoji: "☀️" },
      evening:   { label: "Tarde noche", emoji: "🌆" },
      night:     { label: "Noche",       emoji: "🌙" },
    };
    const favoriteTime = Object.values(timeMinutes).some((v) => v > 0) ? timeLabels[favTimeKey] : null;

    // Avg session length
    const avgSessionMinutes = sessions90.reduce((s, r) => s + r.duration_minutes, 0) / sessions90.length;

    // Avg days per week
    const uniqueDays = new Set(sessions90.map((s) => s.date)).size;
    const avgDaysPerWeek = uniqueDays / (90 / 7);

    // Weekend ratio
    const weekendMinutes = sessions90.reduce((s, r) => {
      const day = new Date(r.date + "T12:00:00").getDay();
      return day === 0 || day === 6 ? s + r.duration_minutes : s;
    }, 0);
    const totalMin90 = sessions90.reduce((s, r) => s + r.duration_minutes, 0);
    const weekendRatio = totalMin90 > 0 ? weekendMinutes / totalMin90 : 0;

    // Reading style
    let style: ReadingInsights["style"];
    if (avgDaysPerWeek >= 4) {
      style = { label: "Constante", description: "Lees con disciplina casi todos los días. Tu racha habla por sí sola.", emoji: "🔥", bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400" };
    } else if (avgSessionMinutes >= 60) {
      style = { label: "Intensivo", description: "Cuando agarras un libro no lo sueltas. Tus sesiones son largas y concentradas.", emoji: "💪", bg: "bg-plum/10 dark:bg-plum/20", color: "text-plum" };
    } else if (weekendRatio > 0.6) {
      style = { label: "Fin de semana", description: "Los fines de semana son tu tiempo sagrado. Aprovechas bien cada momento libre.", emoji: "🏖️", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" };
    } else if (avgDaysPerWeek >= 2) {
      style = { label: "Regular", description: "Tienes un buen equilibrio entre lectura y vida cotidiana. ¡Sigue así!", emoji: "📚", bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" };
    } else {
      style = { label: "En construcción", description: "Cada sesión cuenta. El hábito de lectura se construye poco a poco.", emoji: "🌱", bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" };
    }

    readingInsights = { style, bestDay, favoriteTime, avgSessionMinutes, avgDaysPerWeek };
  }
  // -------------------------

  const overallStats = [
    { icon: Flame, label: "Racha actual", value: `${profile?.current_streak ?? 0} días`, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { icon: TrendingUp, label: "Mejor racha", value: `${profile?.longest_streak ?? 0} días`, color: "text-plum", bg: "bg-plum/10 dark:bg-plum/20" },
    { icon: Clock, label: "Tiempo total", value: formatTotalMinutes(totalMinutes), color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { icon: BookCheck, label: "Libros leídos", value: String(profile?.books_finished ?? 0), color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ];

  const displayName = profile?.username || user.email?.split("@")[0] || "Usuario";
  const initial = displayName[0].toUpperCase();
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Profile header */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-plum/15 dark:bg-plum/25 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-plum">{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[var(--text-primary)] truncate">{displayName}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
            {memberSince && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
                <CalendarDays size={12} />
                <span>Miembro desde {memberSince}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats grid */}
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

      {readingInsights && <ReadingInsightsCard insights={readingInsights} />}

      <AchievementsSection
        longestStreak={profile?.longest_streak ?? 0}
        booksFinished={profile?.books_finished ?? 0}
        totalMinutes={profile?.total_minutes ?? 0}
        totalPagesRead={profile?.total_pages_read ?? 0}
      />

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
