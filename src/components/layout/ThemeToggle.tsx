"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/utils/cn";

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  const options = [
    { value: "light" as const, icon: Sun, label: "Claro" },
    { value: "dark" as const, icon: Moon, label: "Oscuro" },
    { value: "system" as const, icon: Monitor, label: "Sistema" },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-[var(--bg-card-hover)] rounded-xl p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setPreference(value)}
          title={label}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            preference === value
              ? "bg-[var(--bg-card)] text-plum shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
