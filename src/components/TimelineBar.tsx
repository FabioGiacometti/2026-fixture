import { useCallback, useMemo } from "react";
import { historicalEvents, formatYear } from "@/data/historical-events";

interface TimelineBarProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

const MIN_YEAR = -3000;
const MAX_YEAR = 2024;

export default function TimelineBar({ currentYear, onYearChange }: TimelineBarProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onYearChange(Number(e.target.value));
    },
    [onYearChange]
  );

  // Count events visible near current year for display
  const nearbyEventCount = useMemo(() => {
    return historicalEvents.filter(
      (e) => e.year >= currentYear - 300 && e.year <= currentYear + 300
    ).length;
  }, [currentYear]);

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
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col gap-2 px-8 py-4"
      style={{
        background:
          "linear-gradient(to top, hsl(var(--card)) 0%, hsl(var(--card) / 0.97) 80%, transparent 100%)",
        borderTop: "1px solid hsl(var(--border))",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* ── Year info row ── */}
      <div className="flex items-center justify-between">
        {/* Left: era label */}
        <span
          className="font-mono-space text-xs tracking-widest uppercase"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {era}
        </span>

        {/* Center: large year display */}
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

        {/* Right: bookmarks */}
        <span
          className="font-mono-space text-xs tracking-widest uppercase"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          3000 a.C. → 2024 d.C.
        </span>
      </div>

      {/* ── Slider row ── */}
      <div className="relative flex items-center gap-3">
        {/* BC label */}
        <span
          className="font-mono-space text-xs shrink-0"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          3000 a.C.
        </span>

        {/* Custom slider track container */}
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
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={currentYear}
            onChange={handleChange}
            className="timeline-slider relative z-10"
            aria-label="Año histórico"
          />
        </div>

        {/* AD label */}
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
