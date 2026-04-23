"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Layers, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTotalMinutes } from "@/utils/formatTime";
import type { Book } from "@/types";

interface Stats {
  totalMinutes: number;
  sessionCount: number;
  daysReading: number;
}

const CONFETTI_COLORS = ["#9B72CF","#C4A0F0","#FFD700","#FF8C69","#87CEEB","#98FB98","#FFB347","#DDA0DD"];

function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    size: 7 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {pieces.map(({ id, color, left, delay, duration, size, rotate }) => (
        <div
          key={id}
          style={{
            position: "absolute",
            left: `${left}%`,
            top: -12,
            width: size,
            height: size * 0.55,
            backgroundColor: color,
            borderRadius: 2,
            transform: `rotate(${rotate}deg)`,
            animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

interface BookFinishedModalProps {
  book: Book;
  onClose: () => void;
}

export function BookFinishedModal({ book, onClose }: BookFinishedModalProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reading_sessions")
        .select("duration_minutes, date")
        .eq("book_id", book.id)
        .order("date");

      if (!data || data.length === 0) return;

      const totalMinutes = data.reduce((s, r) => s + r.duration_minutes, 0);
      const sessionCount = data.length;
      const firstDate = new Date(data[0].date + "T12:00:00");
      const lastDate  = new Date(data[data.length - 1].date + "T12:00:00");
      const daysReading = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1);

      setStats({ totalMinutes, sessionCount, daysReading });
    };

    fetchStats();
  }, [book.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
        style={{ animation: "celebration-pop 0.4s ease-out forwards" }}
      >
        <Confetti />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-[var(--bg-card-hover)] rounded-full p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center relative z-10">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">¡Libro terminado!</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Completaste tu lectura</p>
        </div>

        {/* Portada + título */}
        <div className="flex items-center gap-4 px-6 py-4 bg-plum/5 dark:bg-plum/10 relative z-10">
          <div className="w-14 h-20 bg-plum/10 dark:bg-plum/20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="text-plum" size={22} />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[var(--text-primary)] leading-tight line-clamp-2">{book.title}</p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5 truncate">{book.author}</p>
            {book.total_pages > 0 && (
              <p className="text-xs text-plum font-medium mt-1">{book.total_pages} páginas</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-5 relative z-10">
          {stats ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 text-center">
                <Clock size={16} className="text-plum mx-auto mb-1" />
                <p className="text-sm font-bold text-[var(--text-primary)]">{formatTotalMinutes(stats.totalMinutes)}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Tiempo total</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 text-center">
                <Layers size={16} className="text-plum mx-auto mb-1" />
                <p className="text-sm font-bold text-[var(--text-primary)]">{stats.sessionCount}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Sesiones</p>
              </div>
              <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 text-center">
                <span className="text-base block mb-0.5">📅</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">{stats.daysReading}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Días</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[var(--bg-card-hover)] rounded-xl p-3 h-16 animate-pulse" />
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-plum text-white rounded-xl font-semibold text-sm hover:bg-plum-dark active:scale-95 transition-all"
          >
            ¡Genial! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
