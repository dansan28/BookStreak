"use client";

import { useState, useCallback } from "react";
import { BookOpen, Clock, X } from "lucide-react";
import { ReadingCalendar } from "@/components/stats/ReadingCalendar";
import { createClient } from "@/lib/supabase/client";
import { formatMinutes } from "@/utils/formatTime";

interface DayData {
  date: string;
  minutes: number;
}

interface DaySession {
  id: string;
  duration_minutes: number;
  pages_read: number;
  note: string | null;
  books: { title: string; cover_url: string | null } | null;
}

// Sessions passed from the server query (include date + created_at for lookup and display)
export interface PreloadedSession extends DaySession {
  date: string;
  created_at?: string;
}

function formatDayFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

function formatTotalTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function CalendarWithDetail({
  data,
  currentStreak,
  preloadedSessions = [],
}: {
  data: DayData[];
  currentStreak: number;
  preloadedSessions?: PreloadedSession[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDayClick = useCallback(async (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setSessions([]);
      return;
    }
    setSelectedDate(date);

    // Use server-preloaded sessions when available — avoids client query issues
    const fromServer = preloadedSessions.filter(s => s.date === date);
    if (fromServer.length > 0) {
      setSessions(fromServer);
      return;
    }

    // Fallback: client-side fetch for dates older than the preloaded window
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: withNote, error } = await supabase
      .from("reading_sessions")
      .select("id, duration_minutes, pages_read, note, books(title, cover_url)")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at");

    // If note column doesn't exist yet, retry without it
    const rows = error
      ? (await supabase
          .from("reading_sessions")
          .select("id, duration_minutes, pages_read, books(title, cover_url)")
          .eq("user_id", user.id)
          .eq("date", date)
          .order("created_at")).data
      : withNote;

    setSessions(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rows ?? []).map((r: any) => ({
        id: r.id as string,
        duration_minutes: r.duration_minutes as number,
        pages_read: r.pages_read as number,
        note: (r.note as string | null) ?? null,
        books: Array.isArray(r.books)
          ? (r.books[0] as DaySession["books"]) ?? null
          : (r.books as DaySession["books"]),
      }))
    );
    setLoading(false);
  }, [selectedDate, preloadedSessions]);

  const totalMinutes = sessions.reduce((s, r) => s + r.duration_minutes, 0);
  const totalPages   = sessions.reduce((s, r) => s + r.pages_read, 0);

  return (
    <>
      <ReadingCalendar
        data={data}
        currentStreak={currentStreak}
        selectedDate={selectedDate}
        onDayClick={handleDayClick}
      />

      {selectedDate && (
        <div
          className="mt-4 border-t border-[var(--border)] pt-4"
          style={{ animation: "slide-up 0.2s ease-out" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[var(--text-muted)] capitalize tracking-wider">
              {formatDayFull(selectedDate)}
            </p>
            <button
              onClick={() => { setSelectedDate(null); setSessions([]); }}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-[var(--bg-card-hover)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-3">
              Sin sesiones registradas
            </p>
          ) : (
            <>
              {sessions.length > 1 && (
                <div className="flex gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-card-hover)] rounded-lg px-2.5 py-1.5">
                    <Clock size={11} className="text-plum" />
                    <span className="font-semibold text-[var(--text-primary)]">{formatTotalTime(totalMinutes)}</span>
                    <span>total</span>
                  </div>
                  {totalPages > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-card-hover)] rounded-lg px-2.5 py-1.5">
                      <BookOpen size={11} className="text-plum" />
                      <span className="font-semibold text-[var(--text-primary)]">{totalPages}</span>
                      <span>páginas</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 bg-[var(--bg-card-hover)] rounded-xl p-3"
                  >
                    <div className="w-8 h-11 bg-plum/10 dark:bg-plum/20 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {session.books?.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.books.cover_url}
                          alt={session.books.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen size={12} className="text-plum" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {session.books?.title ?? "Libro eliminado"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatMinutes(session.duration_minutes)}
                        </span>
                        {session.pages_read > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <BookOpen size={10} />
                              {session.pages_read} págs
                            </span>
                          </>
                        )}
                      </div>
                      {session.note && (
                        <p className="text-xs text-[var(--text-muted)] italic mt-1 line-clamp-2 leading-relaxed">
                          &ldquo;{session.note}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-plum flex-shrink-0">
                      {formatMinutes(session.duration_minutes)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
