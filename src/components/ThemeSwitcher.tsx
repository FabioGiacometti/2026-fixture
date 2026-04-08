import { useEffect, useMemo, useState } from "react";
import { Map, Paintbrush2, Settings2, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APP_FONT_SIZE_STORAGE_KEY,
  DEFAULT_FONT_SIZE,
  DEFAULT_THEME,
  FONT_SIZE_OPTIONS,
  THEME_OPTIONS,
  getAppThemeLabel,
  isAppFontSize,
  isAppTheme,
} from "@/lib/theme";

type MapStyle = "political" | "geographic";

interface ThemeSwitcherProps {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  panelOffset?: number;
}

export default function ThemeSwitcher({
  mapStyle,
  onMapStyleChange,
  panelOffset = 36,
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    const storedFontSize = window.localStorage.getItem(APP_FONT_SIZE_STORAGE_KEY);
    if (isAppFontSize(storedFontSize)) {
      setFontSize(storedFontSize);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.dataset.fontSize = fontSize;

    try {
      window.localStorage.setItem(APP_FONT_SIZE_STORAGE_KEY, fontSize);
    } catch {
      // Ignore storage errors and still apply the size for this session.
    }
  }, [fontSize]);

  const activeTheme = mounted && isAppTheme(theme) ? theme : DEFAULT_THEME;
  const activeOption = THEME_OPTIONS.find((option) => option.id === activeTheme) ?? THEME_OPTIONS[0];
  const isGeographic = mapStyle === "geographic";
  const fontSizeIndex = useMemo(
    () => Math.max(0, FONT_SIZE_OPTIONS.findIndex((option) => option.id === fontSize)),
    [fontSize]
  );

  const handleToggleMapStyle = () => {
    onMapStyleChange(isGeographic ? "political" : "geographic");
    setOpen(false);
  };

  const handleFontSizeChange = (nextValue: number) => {
    const option = FONT_SIZE_OPTIONS[Math.max(0, Math.min(FONT_SIZE_OPTIONS.length - 1, nextValue))];
    if (option) {
      setFontSize(option.id);
    }
  };

  const handleToggleSettingsMenu = () => {
    setOpen((currentOpen) => !currentOpen);
  };

  return (
    <div
      className="fixed top-5 z-40 transition-[right] duration-300 ease-out"
      style={{ right: `${panelOffset + 16}px` }}
    >
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Abrir ajustes de mapa e interfaz"
            aria-pressed={open}
            onPointerDown={(event) => {
              if (event.button === 0 && event.ctrlKey === false) {
                event.preventDefault();
              }
            }}
            onClick={handleToggleSettingsMenu}
            className="h-11 w-11 rounded-full border-border/80 bg-card/85 text-foreground shadow-lg backdrop-blur-md hover:bg-accent/80"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[320px] rounded-[24px] border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center gap-2">
            <Settings2 className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
            <div>
              <p
                className="font-mono-space text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "hsl(var(--primary))" }}
              >
                Ajustes
              </p>
              <p
                className="font-mono-space text-[9px]"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Mapa, texto y tema
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-border/70 bg-background/45 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Map className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} />
                <p
                  className="font-mono-space text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Mapa
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                aria-label="Alternar estilo del mapa"
                aria-pressed={isGeographic}
                onClick={handleToggleMapStyle}
                className="h-auto w-full justify-between border-border/80 bg-background/70 px-3 py-2 font-mono-space text-[10px] uppercase tracking-wider"
              >
                <span
                  style={{ color: !isGeographic ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                >
                  Político
                </span>
                <span
                  className="rounded-full px-2 py-1 text-[9px]"
                  style={{
                    backgroundColor: isGeographic ? "hsl(var(--primary) / 0.18)" : "hsl(var(--muted) / 0.5)",
                    color: isGeographic ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {isGeographic ? "Geográfico" : "Político"}
                </span>
              </Button>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/45 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Type className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} />
                <p
                  className="font-mono-space text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Texto
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/60 px-3 py-3">
                <input
                  type="range"
                  min={0}
                  max={FONT_SIZE_OPTIONS.length - 1}
                  step={1}
                  value={fontSizeIndex}
                  onChange={(event) => handleFontSizeChange(event.currentTarget.valueAsNumber)}
                  aria-label="Tamaño de fuente"
                  className="timeline-slider"
                />

                <div
                  className="mt-2 grid grid-cols-3 gap-2 font-mono-space text-[9px] uppercase tracking-wider"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {FONT_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFontSize(option.id)}
                      className="rounded-md px-1 py-1 text-center transition-colors"
                      style={{
                        color: fontSize === option.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                        background: fontSize === option.id ? "hsl(var(--primary) / 0.12)" : "transparent",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/45 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Paintbrush2 className="h-3.5 w-3.5" style={{ color: "hsl(var(--primary))" }} />
                <p
                  className="font-mono-space text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Tema
                </p>
              </div>

              <Select value={activeTheme} onValueChange={setTheme} disabled={!mounted}>
                <SelectTrigger className="h-10 border-border/80 bg-background/70 font-mono-space text-[10px] uppercase tracking-wider">
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className="font-mono-space text-[10px] uppercase tracking-wide"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p
                className="mt-2 text-[10px] leading-relaxed"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {getAppThemeLabel(activeTheme)} · {activeOption.description}
              </p>
            </section>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
