import { cn } from "@/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm",
          "focus:outline-none focus:ring-2 focus:ring-plum/40 focus:border-plum/60",
          "transition-colors duration-150",
          error && "border-red-400 focus:ring-red-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
