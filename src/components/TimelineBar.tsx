import { useCallback, useMemo, useRef } from "react";
import { historicalEvents, formatYear } from "@/data/historical-events";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimelineBarProps {
  currentYear: number;
  windowSize: number;
  onYearChange: (year: number) => void;
  onHoverYear?: (year: number | null) => void;
  onChangeWindowSize: (size: number) => void;
  isMediaModalOpen?: boolean;
}

const MIN_YEAR = -3000;
const MAX_YEAR = 2024;

export default function TimelineBar({ currentYear, windowSize, onYearChange, onHoverYear, onChangeWindowSize, isMediaModalOpen }: TimelineBarProps) {
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onYearChange(Number(e.target.value));
    },
    [onYearChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (!onHoverYear || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const hoverYear = Math.round(MIN_YEAR + pct * (MAX_YEAR - MIN_YEAR));
      onHoverYear(Math.max(MIN_YEAR, Math.min(MAX_YEAR, hoverYear)));
    },
    [onHoverYear]
  );

  const handleMouseLeave = useCallback(() => {
    onHoverYear?.(null);
  }, [onHoverYear]);

  // Count events visible near current year
  const nearbyEventCount = useMemo(() => {
    return historicalEvents.filter(
      (e) => e.year >= currentYear - windowSize && e.year <= currentYear + windowSize
    ).length;
  }, [currentYear, windowSize]);

  // Progress percentage for fill bar
  const progressPct = useMemo(
    () => ((currentYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100,
    [currentYear]
  );

  const formattedYear = formatYear(currentYear);

  // Era label
  const era = useMemo(() => {
    if (currentYear < -500) return "Antigüedad";
    if (currentYear < 500) return "Época Clásica";
    if (currentYear < 1400) return "Edad Media";
    if (currentYear < 1700) return "Era Moderna Temprana";
    if (currentYear < 1900) return "Era Moderna";
    if (currentYear < 1950) return "Siglo XX Temprano";
    return "Era Contemporánea";
  }, [currentYear]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col gap-2 px-8 py-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isMediaModalOpen ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(to top, hsl(var(--card)) 0%, hsl(var(--card) / 0.97) 80%, transparent 100%)",
        borderTop: "1px solid hsl(var(--border))",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* ── Year info row ── */}
      <div className="flex items-center justify-between">
        <span
          className="font-mono-space text-xs tracking-widest uppercase"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {era}
        </span>

        <div className="flex flex-col items-center">
          <span
            className="font-mono-space text-2xl font-bold tracking-tight leading-none"
            style={{ color: "hsl(var(--primary))" }}
          >
            {formattedYear}
          </span>
          <span
            className="font-mono-space text-xs mt-0.5"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {nearbyEventCount} evento{nearbyEventCount !== 1 ? "s" : ""} en esta ventana
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="font-mono-space text-xs tracking-widest uppercase cursor-pointer transition-colors hover:text-white"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Rango: ±{windowSize} años
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-4 mb-2 shadow-xl" 
            side="top" 
            align="end"
            style={{
              background: "hsl(var(--card) / 0.97)",
              border: "1px solid hsl(var(--border))",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="font-mono-space text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Rango temporal</label>
                <span className="font-mono-space text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>±{windowSize} años</span>
              </div>
              <input
                type="range"
                min={10}
                max={1500}
                step={10}
                value={windowSize}
                onChange={(e) => onChangeWindowSize(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "hsl(var(--primary))" }}
              />
              <p className="text-[10px] leading-tight" style={{ color: "hsl(var(--muted-foreground))" }}>
                Define la cantidad de años antes y después del año seleccionado que se muestran en el globo.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Slider row ── */}
      <div className="relative flex items-center gap-3">
        <span
          className="font-mono-space text-xs shrink-0"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          3000 a.C.
        </span>

        <div className="relative flex-1 flex items-center">
          {/* Background fill bar */}
          <div
            className="absolute left-0 h-1 rounded-full pointer-events-none transition-all duration-75"
            style={{
              width: `${progressPct}%`,
              background:
                "linear-gradient(to right, hsl(var(--primary) / 0.4), hsl(var(--primary)))",
            }}
          />
          <input
            ref={sliderRef}
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={currentYear}
            onChange={handleChange}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="timeline-slider relative z-10"
            aria-label="Año histórico"
          />
        </div>

        <span
          className="font-mono-space text-xs shrink-0"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          2024 d.C.
        </span>
      </div>

      {/* ── Era tick marks ── */}
      <div className="relative flex items-center mx-[calc(2.5rem+1px)] h-3 pointer-events-none">
        {[
          { year: -3000, label: "" },
          { year: -2000, label: "" },
          { year: -1000, label: "" },
          { year: 0, label: "Año 0" },
          { year: 500, label: "" },
          { year: 1000, label: "" },
          { year: 1500, label: "" },
          { year: 2000, label: "" },
        ].map(({ year, label }) => {
          const pct = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
          const isPast = year <= currentYear;
          return (
            <div
              key={year}
              className="absolute flex flex-col items-center"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            >
              <div
                className="w-px h-2 rounded-full"
                style={{
                  background: isPast
                    ? "hsl(var(--primary) / 0.5)"
                    : "hsl(var(--muted-foreground) / 0.3)",
                }}
              />
              {label && (
                <span
                  className="font-mono-space text-[9px] mt-0.5"
                  style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
                >
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
