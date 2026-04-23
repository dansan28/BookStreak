"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ThemePreference } from "@/types";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  preference: "system",
  setPreference: () => {},
});

export function ThemeProvider({
  children,
  initialPreference = "system",
}: {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
}) {
  const [mounted, setMounted] = useState(false);
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme-preference") as ThemePreference;
    if (stored) {
      setPreferenceState(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const resolve = (pref: ThemePreference): Theme => {
      if (pref === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return pref;
    };

    const resolved = resolve(preference);
    setTheme(resolved);

    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preference, mounted]);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    localStorage.setItem("theme-preference", p);
  };

  if (!mounted) {
    // Render with initial values to match server
    const initialTheme = initialPreference === "system" ? "light" : initialPreference;
    return (
      <ThemeContext.Provider value={{ theme: initialTheme, preference: initialPreference, setPreference }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
