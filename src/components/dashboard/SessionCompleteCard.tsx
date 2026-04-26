"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

export interface SessionCompleteData {
  durationSeconds: number;
  pagesRead: number;
  bookTitle: string;
  currentStreak: number;
}

interface SessionCompleteCardProps extends SessionCompleteData {
  onClose: () => void;
}

function getMotivation(streak: number): string {
  if (streak >= 30) return "¡Un mes leyendo todos los días! 🌟";
  if (streak >= 14) return "¡Dos semanas de lector constante! 🔥";
  if (streak >= 7)  return "¡Una semana seguida! 💪";
  if (streak >= 4)  return "¡Vas en racha! Sigue así 🚀";
  if (streak >= 2)  return "¡Vuelve mañana y no lo rompas! 🌱";
  return "¡Buen comienzo! Vuelve mañana 📖";
}

const AUTO_DISMISS_MS = 5000;

export function SessionCompleteCard({
  durationSeconds,
  pagesRead,
  bookTitle,
  currentStreak,
  onClose,
}: SessionCompleteCardProps) {
  useEffect(() => {
    const t = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onClose]);

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeLabel =
    minutes > 0
      ? seconds > 0
        ? `${minutes}m ${seconds}s`
        : `${minutes}m`
      : `${seconds}s`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 inset-x-0 flex justify-center px-4 z-50 pointer-events-none">
      <div
        className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
        style={{ animation: "slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
      >
        {/* Auto-dismiss bar */}
        <div className="h-0.5 bg-[var(--border)]">
          <div
            className="h-full bg-plum"
            style={{ animation: `progress-drain ${AUTO_DISMISS_MS}ms linear forwards` }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-emerald-500" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)]">¡Sesión guardada!</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{bookTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 ml-2 flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-2">
            <div className="flex-1 bg-[var(--bg-card-hover)] rounded-xl p-2.5 text-center">
              <p className="text-base font-black text-[var(--text-primary)]">{timeLabel}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">leídos</p>
            </div>
            {pagesRead > 0 && (
              <div className="flex-1 bg-[var(--bg-card-hover)] rounded-xl p-2.5 text-center">
                <p className="text-base font-black text-[var(--text-primary)]">{pagesRead}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">páginas</p>
              </div>
            )}
            <div className="flex-1 bg-plum/8 dark:bg-plum/15 rounded-xl p-2.5 text-center">
              <p className="text-base font-black text-plum">🔥 {currentStreak}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">días</p>
            </div>
          </div>

          {/* Motivation */}
          <p className="text-xs text-center text-[var(--text-muted)] mt-2.5 font-medium">
            {getMotivation(currentStreak)}
          </p>
        </div>
      </div>
    </div>
  );
}
