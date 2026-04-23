export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Comienza tu racha hoy";
  if (streak === 1) return "¡Primer día! Sigue así";
  if (streak < 7) return "¡Buen comienzo!";
  if (streak < 30) return "¡Imparable!";
  if (streak < 100) return "¡Leyenda!";
  return "¡Increíble!";
}

export function isReadToday(lastReadDate: string | null): boolean {
  if (!lastReadDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return lastReadDate === today;
}
