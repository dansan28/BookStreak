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

export function getActiveStreak(currentStreak: number, lastReadDate: string | null): number {
  if (!lastReadDate || currentStreak === 0) return 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  if (lastReadDate === todayStr || lastReadDate === yesterdayStr) return currentStreak;
  return 0;
}
