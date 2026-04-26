"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export function ToasterProvider() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    />
  );
}
