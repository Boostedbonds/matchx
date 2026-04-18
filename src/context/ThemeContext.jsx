import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const DARK = {
  "--mx-bg":           "#030508",
  "--mx-bg-2":         "#0a0c12",
  "--mx-bg-card":      "rgba(10,12,18,0.85)",
  "--mx-surface":      "rgba(212,175,55,0.04)",
  "--mx-surface-2":    "rgba(212,175,55,0.08)",
  "--mx-border":       "rgba(212,175,55,0.12)",
  "--mx-border-hover": "rgba(212,175,55,0.35)",
  "--mx-text":         "#e8e0d0",
  "--mx-text-2":       "rgba(232,224,208,0.6)",
  "--mx-text-3":       "rgba(232,224,208,0.35)",
  "--mx-score":        "#ffd700",
  "--mx-score-2":      "#d4af37",
  "--mx-accent":       "#00e6a0",
  "--mx-accent-2":     "rgba(0,230,160,0.4)",
  "--mx-sidebar-bg":   "#0d0f15",
  "--mx-sidebar-border":"rgba(0,255,200,0.07)",
  "--mx-topbar-bg":    "#0d0f15",
  "--mx-card-hover":   "rgba(0,0,0,0.5)",
  "--mx-stat-before":  "#d4af37",
  "--mx-badge-live-bg":"rgba(0,230,160,0.12)",
  "--mx-badge-live-border":"rgba(0,230,160,0.4)",
  "--mx-badge-live-text":"#00e6a0",
  "--mx-shot-bg":      "rgba(212,175,55,0.04)",
  "--mx-commentary-bg":"rgba(0,0,0,0.3)",
  "--mx-input-bg":     "rgba(255,255,255,0.03)",
  "--mx-input-border": "rgba(255,255,255,0.1)",
  "--mx-overlay":      "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(212,175,55,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(212,175,55,0.03) 40px)",
};

const LIGHT = {
  "--mx-bg":           "#FDF6EC",
  "--mx-bg-2":         "#FFF8F0",
  "--mx-bg-card":      "#FFFFFF",
  "--mx-surface":      "#FFF0D6",
  "--mx-surface-2":    "#FFE8C0",
  "--mx-border":       "#E8D8C0",
  "--mx-border-hover": "#C4A870",
  "--mx-text":         "#2C1F0E",
  "--mx-text-2":       "#7A6248",
  "--mx-text-3":       "#A89070",
  "--mx-score":        "#C96A00",
  "--mx-score-2":      "#A05000",
  "--mx-accent":       "#0F8A6E",
  "--mx-accent-2":     "rgba(15,138,110,0.4)",
  "--mx-sidebar-bg":   "#1C2B3A",
  "--mx-sidebar-border":"rgba(253,246,236,0.08)",
  "--mx-topbar-bg":    "#1C2B3A",
  "--mx-card-hover":   "rgba(232,216,192,0.4)",
  "--mx-stat-before":  "#C96A00",
  "--mx-badge-live-bg":"rgba(15,138,110,0.1)",
  "--mx-badge-live-border":"rgba(15,138,110,0.35)",
  "--mx-badge-live-text":"#0A6B54",
  "--mx-shot-bg":      "#FFF8F0",
  "--mx-commentary-bg":"#FFFFFF",
  "--mx-input-bg":     "#FFFFFF",
  "--mx-input-border": "#E8D8C0",
  "--mx-overlay":      "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(201,106,0,0.025) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(201,106,0,0.025) 40px)",
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("mx_theme") || "dark"
  );

  useEffect(() => {
    const vars = theme === "light" ? LIGHT : DARK;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute("data-mx-theme", theme);
    localStorage.setItem("mx_theme", theme);
  }, [theme]);

  function toggle() {
    setTheme(t => t === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}