export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTotalMinutes(minutes: number): string {
  if (minutes === 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function sevenDaysAgoString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().split("T")[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Buenos días";
  
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  
  return "Buenas noches";
}
