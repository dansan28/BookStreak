"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ReadingStyle {
  label: string;
  description: string;
  emoji: string;
  bg: string;
  color: string;
}

interface FavoriteTime {
  label: string;
  emoji: string;
}

export interface ReadingInsights {
  style: ReadingStyle;
  bestDay: string | null;
  favoriteTime: FavoriteTime | null;
  avgSessionMinutes: number;
  avgDaysPerWeek: number;
}

const STYLE_EXPLANATIONS = [
  { emoji: "🔥", label: "Constante",        hint: "Lees 4+ días por semana en promedio" },
  { emoji: "💪", label: "Intensivo",        hint: "Tus sesiones duran 60+ minutos de media" },
  { emoji: "🏖️", label: "Fin de semana",   hint: "Más del 60% de tu lectura es en sáb/dom" },
  { emoji: "📚", label: "Regular",          hint: "Entre 2 y 4 días por semana de media" },
  { emoji: "🌱", label: "En construcción",  hint: "Menos de 2 días por semana — el hábito crece" },
];

function StyleTooltip({ currentLabel }: { currentLabel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
        aria-label="¿Qué significa mi estilo?"
      >
        <HelpCircle size={15} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-30 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl p-3 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-1">
            Estilos posibles
          </p>
          {STYLE_EXPLANATIONS.map(({ emoji, label, hint }) => (
            <div
              key={label}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-xl ${label === currentLabel ? "bg-[var(--bg-card-hover)]" : ""}`}
            >
              <span className="text-sm leading-none mt-0.5">{emoji}</span>
              <div>
                <p className={`text-xs font-semibold leading-tight ${label === currentLabel ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  {label}
                  {label === currentLabel && (
                    <span className="ml-1.5 text-[10px] text-plum font-medium">← tú</span>
                  )}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">{hint}</p>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-[var(--text-muted)] px-1 pt-1 border-t border-[var(--border)] mt-1">
            Calculado con tus últimos 90 días
          </p>
        </div>
      )}
    </div>
  );
}

function InsightCell({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string | null;
}) {
  return (
    <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 space-y-0.5">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {value ? `${emoji} ${value}` : "—"}
      </p>
    </div>
  );
}

export function ReadingInsightsCard({ insights }: { insights: ReadingInsights }) {
  const { style, bestDay, favoriteTime, avgSessionMinutes, avgDaysPerWeek } = insights;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
        Tu perfil de lectura
      </h3>

      {/* Style badge + help button */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 ${style.bg}`}>
          <span className="text-base leading-none">{style.emoji}</span>
          <span className={`text-sm font-bold ${style.color}`}>{style.label}</span>
        </div>
        <StyleTooltip currentLabel={style.label} />
      </div>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
        {style.description}
      </p>

      {/* 4 metric cells */}
      <div className="grid grid-cols-2 gap-2">
        <InsightCell emoji="📅" label="Mejor día" value={bestDay} />
        <InsightCell
          emoji={favoriteTime?.emoji ?? ""}
          label="Momento favorito"
          value={favoriteTime?.label ?? null}
        />
        <InsightCell
          emoji="⏱"
          label="Sesión típica"
          value={avgSessionMinutes > 0 ? `${Math.round(avgSessionMinutes)} min` : null}
        />
        <InsightCell
          emoji="📆"
          label="Días por semana"
          value={avgDaysPerWeek > 0 ? avgDaysPerWeek.toFixed(1) : null}
        />
      </div>
    </Card>
  );
}
