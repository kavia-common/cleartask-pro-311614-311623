import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { safeJsonParse } from "../utils/storage";

const THEME_STORAGE_KEY = "ct.theme";

/**
 * PUBLIC_INTERFACE
 * ThemeContext provides the current theme and a toggle function.
 */
const ThemeContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * ThemeProvider persists theme preference and applies it via [data-theme] on documentElement.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = safeJsonParse(localStorage.getItem(THEME_STORAGE_KEY));
    if (stored === "light" || stored === "dark") return stored;

    // Respect OS preference on first run.
    try {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useTheme hook to access theme state.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
