import { createClient } from "@/lib/supabase/server";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { ReadingTimerWidget } from "@/components/dashboard/ReadingTimerWidget";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { CurrentlyReadingCard } from "@/components/dashboard/CurrentlyReadingCard";
import { todayDateString } from "@/utils/formatTime";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayDateString();

  const [
    { data: profile },
    { data: readingBooks },
    { data: todaySessions },
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
  ]);

  const todayMinutes = (todaySessions ?? []).reduce((s, r) => s + r.duration_minutes, 0);
  const totalMinutes = profile?.total_minutes ?? 0;
  const totalPages = profile?.total_pages_read ?? 0;
  const booksFinished = profile?.books_finished ?? 0;

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
      </div>

      {/* Stats strip */}
      <StatsStrip
        totalMinutes={totalMinutes}
        booksFinished={booksFinished}
        totalPages={totalPages}
        longestStreak={profile?.longest_streak ?? 0}
      />

      {/* Leyendo ahora (solo si hay más de un libro) */}
      {(readingBooks ?? []).length > 1 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-1">
            También leyendo
          </p>
          <div className="space-y-2">
            {(readingBooks ?? []).slice(1).map((book) => (
              <CurrentlyReadingCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
