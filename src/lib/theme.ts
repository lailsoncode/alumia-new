export type ThemePreference = "light" | "dark";

const THEME_CHANGE_EVENT = "alumia-theme-change";

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
    window.dispatchEvent(new CustomEvent<ThemePreference>(THEME_CHANGE_EVENT, { detail: theme }));
  }
}

export function subscribeToThemeChanges(listener: (theme: ThemePreference) => void) {
  if (typeof window === "undefined") return () => undefined;
  const handleChange = (event: Event) => listener((event as CustomEvent<ThemePreference>).detail);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
}
