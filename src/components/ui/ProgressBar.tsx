import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: "purple" | "green" | "orange";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel,
  color = "purple",
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  const colors = {
    purple: "bg-plum",
    green: "bg-emerald-500",
    orange: "bg-amber-500",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-card-hover)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[var(--text-muted)] tabular-nums w-8 text-right">
          {percent}%
        </span>
      )}
    </div>
  );
}
