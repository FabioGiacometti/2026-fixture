import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  APP_THEMES,
  APP_THEME_STORAGE_KEY,
  DEFAULT_THEME,
  THEME_CLASS_MAP,
  getAppThemeMode,
} from "@/lib/theme";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

function ThemeModeSync() {
  const { theme } = useTheme();

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", getAppThemeMode(theme) === "dark");
  }, [theme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={DEFAULT_THEME}
      enableSystem={false}
      storageKey={APP_THEME_STORAGE_KEY}
      themes={[...APP_THEMES]}
      value={THEME_CLASS_MAP}
      {...props}
    >
      <ThemeModeSync />
      {children}
    </NextThemesProvider>
  );
}
