export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "usar-calendar-theme";

export const themeScript = `(function(){try{
var k=${JSON.stringify(STORAGE_KEY)};
var p=localStorage.getItem(k)||"system";
var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark",d);
document.documentElement.style.colorScheme=d?"dark":"light";
}catch(e){}})();`;

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

export function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") {
    return preference;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;

  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Private browsing modes can reject writes; the in-memory theme still applies.
  }
}