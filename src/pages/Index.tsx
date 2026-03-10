import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import CesiumGlobe from "@/components/CesiumGlobe";
import TimelineBar from "@/components/TimelineBar";
import EventPanel from "@/components/EventPanel";
import { historicalEvents, getEventsInRange } from "@/data/historical-events";
import type { HistoricalEvent } from "@/data/historical-events";

const CESIUM_LOADED_CHECK_INTERVAL = 200;

export default function Index() {
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [cesiumReady, setCesiumReady] = useState(false);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for CesiumJS to load (CDN async)
  useEffect(() => {
    checkRef.current = setInterval(() => {
      if (window.Cesium) {
        setCesiumReady(true);
        if (checkRef.current) clearInterval(checkRef.current);
      }
    }, CESIUM_LOADED_CHECK_INTERVAL);
    return () => {
      if (checkRef.current) clearInterval(checkRef.current);
    };
  }, []);

  const visibleEvents = useMemo(
    () => getEventsInRange(currentYear, 300),
    [currentYear]
  );

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handleSelectEvent = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#111319" }}
    >
      {/* ── Globe ── */}
      {cesiumReady ? (
        <CesiumGlobe
          events={visibleEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
        />
      ) : (
        <LoadingScreen />
      )}

      {/* ── Event count overlay (top-left) ── */}
      <div
        className="fixed top-5 left-6 z-40 flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: "hsl(var(--card) / 0.85)",
          border: "1px solid hsl(var(--border))",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "hsl(var(--primary))" }}
        />
        <span
          className="font-mono-space text-xs"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Taller Terreno
        </span>
        <span
          className="font-mono-space text-xs"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {historicalEvents.length} eventos
        </span>
      </div>

      {/* ── Instruction overlay (top-center) — fades after first selection ── */}
      {!selectedEvent && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full pointer-events-none"
          style={{
            background: "hsl(var(--card) / 0.75)",
            border: "1px solid hsl(var(--border))",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            className="font-mono-space text-xs"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Mueve el slider ↓ · Haz clic en un marcador para ver el evento
          </span>
        </div>
      )}

      {/* ── Event Detail Panel ── */}
      <EventPanel event={selectedEvent} onClose={handleClosePanel} />

      {/* ── Timeline Bar ── */}
      <TimelineBar currentYear={currentYear} onYearChange={handleYearChange} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      style={{ background: "#111319" }}
    >
      <div
        className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "hsl(var(--primary) / 0.3)", borderTopColor: "hsl(var(--primary))" }}
      />
      <p
        className="font-mono-space text-sm"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Cargando globo 3D…
      </p>
    </div>
  );
}
