import { describe, expect, it } from "vitest";
import {
  APP_THEMES,
  DEFAULT_THEME,
  THEME_CLASS_MAP,
  getAppThemeMode,
  isAppTheme,
} from "@/lib/theme";

describe("theme registry", () => {
  it("defines the expected preset themes with a stable default", () => {
    expect(DEFAULT_THEME).toBe("geological-dark");
    expect(APP_THEMES).toEqual(
      expect.arrayContaining([
        "geological-dark",
        "clean-light",
        "world-cup-brand",
        "high-contrast",
      ])
    );
    expect(THEME_CLASS_MAP[DEFAULT_THEME]).toContain("theme-geological-dark");
  });

  it("maps presets to light or dark mode correctly", () => {
    expect(getAppThemeMode("clean-light")).toBe("light");
    expect(getAppThemeMode("world-cup-brand")).toBe("dark");
    expect(isAppTheme("high-contrast")).toBe(true);
    expect(isAppTheme("unknown-theme")).toBe(false);
  });
});
