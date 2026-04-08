export const APP_THEMES = [
  "geological-dark",
  "clean-light",
  "world-cup-brand",
  "high-contrast",
] as const;

export type AppTheme = (typeof APP_THEMES)[number];
export type AppThemeMode = "light" | "dark";

export const APP_FONT_SIZES = ["small", "medium", "large"] as const;

export type AppFontSize = (typeof APP_FONT_SIZES)[number];

export const DEFAULT_THEME: AppTheme = "geological-dark";
export const APP_THEME_STORAGE_KEY = "history-map-theme";
export const DEFAULT_FONT_SIZE: AppFontSize = "medium";
export const APP_FONT_SIZE_STORAGE_KEY = "history-map-font-size";

export const THEME_OPTIONS: Array<{
  id: AppTheme;
  label: string;
  description: string;
  mode: AppThemeMode;
}> = [
  {
    id: "geological-dark",
    label: "Geológico oscuro",
    description: "La paleta actual, refinada para exploración.",
    mode: "dark",
  },
  {
    id: "clean-light",
    label: "Luz editorial",
    description: "Un modo claro y limpio para lectura diurna.",
    mode: "light",
  },
  {
    id: "world-cup-brand",
    label: "Mundial vibrante",
    description: "Una variante más deportiva y energética.",
    mode: "dark",
  },
  {
    id: "high-contrast",
    label: "Alto contraste",
    description: "Máxima legibilidad y accesibilidad.",
    mode: "dark",
  },
];

export const THEME_CLASS_MAP: Record<AppTheme, string> = {
  "geological-dark": "theme-geological-dark",
  "clean-light": "theme-clean-light",
  "world-cup-brand": "theme-world-cup-brand",
  "high-contrast": "theme-high-contrast",
};

export const FONT_SIZE_OPTIONS: Array<{
  id: AppFontSize;
  label: string;
}> = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export function isAppTheme(value: string | null | undefined): value is AppTheme {
  return typeof value === "string" && APP_THEMES.includes(value as AppTheme);
}

export function isAppFontSize(value: string | null | undefined): value is AppFontSize {
  return typeof value === "string" && APP_FONT_SIZES.includes(value as AppFontSize);
}

export function getAppThemeMode(theme: string | null | undefined): AppThemeMode {
  return THEME_OPTIONS.find((option) => option.id === theme)?.mode ?? "dark";
}

export function getAppThemeLabel(theme: string | null | undefined): string {
  return THEME_OPTIONS.find((option) => option.id === theme)?.label ?? "Tema";
}
