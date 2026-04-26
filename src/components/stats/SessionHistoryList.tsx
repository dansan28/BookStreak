"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { formatMinutes } from "@/utils/formatTime";
import { cn } from "@/utils/cn";

interface SessionWithBook {
  id: string;
  duration_minutes: number;
  pages_read: number;
  date: string;
  created_at?: string;
  note?: string | null;
  books: { title: string; cover_url?: string | null } | null;
}

function formatTimeRange(createdAt: string, durationMinutes: number): string {
  const end = new Date(createdAt);
  const start = new Date(end.getTime() - durationMinutes * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatDayLabel(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Hoy";
  if (dateStr === yesterday) return "Ayer";
  const d = new Date(dateStr + "T12:00:00");
  const isThisYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    ...(isThisYear ? {} : { year: "numeric" }),
  });
}

const INITIAL_LIMIT = 5;

export function SessionHistoryList({ sessions }: { sessions: SessionWithBook[] }) {
  const [expanded, setExpanded] = useState(false);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        No hay sesiones registradas todavía
      </div>
    );
  }

  const visible = expanded ? sessions : sessions.slice(0, INITIAL_LIMIT);
  const hiddenCount = sessions.length - INITIAL_LIMIT;

  // Group consecutive sessions by date
  const groups: { date: string; sessions: SessionWithBook[] }[] = [];
  for (const session of visible) {
    const last = groups[groups.length - 1];
    if (last && last.date === session.date) {
      last.sessions.push(session);
    } else {
      groups.push({ date: session.date, sessions: [session] });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.date}>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
            {formatDayLabel(group.date)}
          </p>
          <div className="space-y-0">
            {group.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 py-2.5 px-1 border-b border-[var(--border)] last:border-0"
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
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    {session.created_at && (
                      <span>{formatTimeRange(session.created_at, session.duration_minutes)}</span>
                    )}
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
                    <p className="mt-1 text-xs text-[var(--text-muted)] italic line-clamp-2 leading-relaxed">
                      &ldquo;{session.note}&rdquo;
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-plum flex-shrink-0">
                  {formatMinutes(session.duration_minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sessions.length > INITIAL_LIMIT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-colors"
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
          />
          {expanded ? "Ver menos" : `Ver ${hiddenCount} más`}
        </button>
      )}
    </div>
  );
}
