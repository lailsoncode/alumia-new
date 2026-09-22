export type ThemePreference = "light" | "dark";

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemePreference) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem("theme", theme);
  }
}
