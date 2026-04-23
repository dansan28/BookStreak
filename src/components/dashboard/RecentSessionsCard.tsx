import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { formatMinutes } from "@/utils/formatTime";

interface Session {
  id: string;
  duration_minutes: number;
  pages_read: number;
  date: string;
  books: { title: string; cover_url: string | null } | null;
}

export function RecentSessionsCard({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Actividad reciente</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
          <Clock size={24} className="opacity-30 mb-2" />
          <p className="text-sm">Aún no hay sesiones</p>
          <p className="text-xs mt-0.5">Inicia tu primera sesión de lectura</p>
        </div>
      </Card>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const formatDate = (date: string) => {
    if (date === today) return "Hoy";
    if (date === yesterday) return "Ayer";
    return new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Actividad reciente</h3>
        <Link
          href="/stats"
          className="text-xs text-plum hover:text-plum-dark font-medium flex items-center gap-0.5 transition-colors"
        >
          Ver todo <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0"
          >
            <div className="w-8 h-11 bg-plum/10 dark:bg-plum/20 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
              {session.books?.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.books.cover_url}
                  alt={session.books.title ?? ""}
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
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>{formatDate(session.date)}</span>
                {session.pages_read > 0 && (
                  <>
                    <span>·</span>
                    <span>{session.pages_read} págs</span>
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
    </Card>
  );
}
