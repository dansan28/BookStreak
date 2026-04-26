"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayData {
  date: string;
  minutes: number;
}

interface ReadingCalendarProps {
  data: DayData[];
  currentStreak: number;
  selectedDate?: string | null;
  onDayClick?: (date: string) => void;
}

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS   = ["L","M","X","J","V","S","D"];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

export function ReadingCalendar({ data, currentStreak, selectedDate, onDayClick }: ReadingCalendarProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(12,0,0,0); return d; }, []);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Mapa date -> minutos
  const map = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(({ date, minutes }) => { m[date] = minutes; });
    return m;
  }, [data]);

  // Calcular días de la racha (hacia atrás desde hoy o ayer)
  const streakDates = useMemo(() => {
    const s = new Set<string>();
    if (currentStreak === 0) return s;
    const cursor = new Date(today);
    // Si hoy no tiene lectura, la racha puede terminar ayer
    if (!map[toDateStr(today)]) cursor.setDate(cursor.getDate() - 1);
    for (let i = 0; i < currentStreak; i++) {
      s.add(toDateStr(cursor));
      cursor.setDate(cursor.getDate() - 1);
    }
    return s;
  }, [map, currentStreak, today]);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const goForward = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Construir celdas del mes
  const firstDow   = new Date(viewYear, viewMonth, 1).getDay();
  const offset     = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toDateStr(today);
  const pad = (n: number) => String(n).padStart(2, "0");
  const ds  = (day: number) => `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;

  const readDaysThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => (map[ds(d)] ?? 0) > 0).length;

  return (
    <div>
      {/* Navegación */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={goBack} className="p-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--text-primary)] capitalize">
            {MONTHS[viewMonth]} {viewYear}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {readDaysThisMonth} {readDaysThisMonth === 1 ? "día leído" : "días leídos"}
          </p>
        </div>
        <button
          onClick={goForward}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] transition-colors disabled:opacity-25 disabled:cursor-default"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-[var(--text-muted)]">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const dateStr  = ds(day);
          const minutes  = map[dateStr] ?? 0;
          const hasRead  = minutes > 0;
          const isToday  = dateStr === todayStr;
          const isFuture = new Date(dateStr + "T12:00:00") > today;
          const isStreak = streakDates.has(dateStr);

          // Columna dentro de la fila (0=lun … 6=dom) — decide si hay barra izq/der
          const col = i % 7;

          // Día anterior y siguiente en la racha (y en la misma fila)
          const prevDate = col > 0 ? ds(day - 1) : null;
          const nextDate = col < 6 ? ds(day + 1) : null;
          const hasLeft  = isStreak && !!prevDate && streakDates.has(prevDate);
          const hasRight = isStreak && !!nextDate && streakDates.has(nextDate) && day < daysInMonth;

          return (
            <div key={i} className="relative flex items-center justify-center h-10">
              {/* Barra conectora izquierda */}
              {hasLeft && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-7 bg-plum/20 dark:bg-plum/30" />
              )}
              {/* Barra conectora derecha */}
              {hasRight && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-7 bg-plum/20 dark:bg-plum/30" />
              )}

              {/* Círculo del día */}
              <div
                title={hasRead ? `${minutes} min` : undefined}
                onClick={() => hasRead && !isFuture && onDayClick?.(dateStr)}
                className={`
                  relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all select-none
                  ${hasRead && !isFuture ? "cursor-pointer hover:scale-110 active:scale-95" : ""}
                  ${selectedDate === dateStr ? "ring-2 ring-offset-1 ring-offset-[var(--bg-card)] ring-plum" : ""}
                  ${isFuture
                    ? "text-[var(--text-muted)] opacity-30"
                    : isStreak
                    ? "bg-plum text-white shadow-sm shadow-plum/40"
                    : hasRead
                    ? "bg-plum/30 text-plum dark:text-plum-light font-semibold"
                    : isToday
                    ? "ring-2 ring-plum text-plum font-bold"
                    : "text-[var(--text-muted)]"
                  }
                `}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda racha */}
      <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{currentStreak} días de racha</p>
            <p className="text-xs text-[var(--text-muted)]">
              {currentStreak > 0 ? "¡Sigue leyendo cada día!" : "Lee hoy para iniciar tu racha"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-plum" />
            <span>Racha</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-plum/30" />
            <span>Leído</span>
          </div>
        </div>
      </div>
    </div>
  );
}
