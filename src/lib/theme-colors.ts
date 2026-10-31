// Map pins are drawn on a canvas, so they read the admin-set theme colours from CSS.
export function themeColor(name: "--brand" | "--accent", fallback: string) {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
