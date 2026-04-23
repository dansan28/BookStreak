import { Clock, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatMinutes } from "@/utils/formatTime";

interface SessionWithBook {
  id: string;
  duration_minutes: number;
  pages_read: number;
  date: string;
  books: { title: string } | null;
}

export function SessionHistoryList({ sessions }: { sessions: SessionWithBook[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        No hay sesiones registradas todavía
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center gap-3 py-2.5 px-1 border-b border-[var(--border)] last:border-0"
        >
          <div className="p-2 bg-plum/10 dark:bg-plum/20 rounded-lg flex-shrink-0">
            <Clock className="text-plum" size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {session.books?.title ?? "Libro eliminado"}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{new Date(session.date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
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
          </div>
          <span className="text-sm font-semibold text-plum flex-shrink-0">
            {formatMinutes(session.duration_minutes)}
          </span>
        </div>
      ))}
    </div>
  );
}
