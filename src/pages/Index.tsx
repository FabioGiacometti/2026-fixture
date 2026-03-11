import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import CesiumGlobe from "@/components/CesiumGlobe";
import TimelineBar from "@/components/TimelineBar";
import EventsListPanel from "@/components/EventsListPanel";
import { historicalEvents, getEventsInRange } from "@/data/historical-events";
import type { HistoricalEvent } from "@/data/historical-events";
import { useIsMobile } from "@/hooks/use-mobile";

const CESIUM_LOADED_CHECK_INTERVAL = 200;

interface HoveredEventState {
  event: HistoricalEvent;
  x: number;
  y: number;
}

export default function Index() {
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [cesiumReady, setCesiumReady] = useState(false);
  const [hoveredEventState, setHoveredEventState] = useState<HoveredEventState | null>(null);
  const [timelineHoverActive, setTimelineHoverActive] = useState(false);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMobile = useIsMobile();

  // Poll for CesiumJS
  useEffect(() => {
    checkRef.current = setInterval(() => {
      if (window.Cesium) {
        setCesiumReady(true);
        if (checkRef.current) clearInterval(checkRef.current);
      }
    }, CESIUM_LOADED_CHECK_INTERVAL);
    return () => { if (checkRef.current) clearInterval(checkRef.current); };
  }, []);

  const visibleEvents = useMemo(
    () => getEventsInRange(currentYear, 300),
    [currentYear]
  );

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handleHoverYear = useCallback((year: number | null) => {
    setTimelineHoverActive(year !== null);
  }, []);

  const handleSelectEvent = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleHoverEvent = useCallback(
    (event: HistoricalEvent | null, x: number, y: number) => {
      if (event) {
        setHoveredEventState({ event, x, y });
      } else {
        setHoveredEventState(null);
      }
    },
    []
  );

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
          onHoverEvent={handleHoverEvent}
          isMobile={isMobile}
        />
      ) : (
        <LoadingScreen />
      )}

      {/* ── Hover Tooltip Overlay (desktop only) ── */}
      {!isMobile && hoveredEventState && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredEventState.x + 14,
            top: hoveredEventState.y - 8,
            maxWidth: "220px",
            transform:
              hoveredEventState.x > window.innerWidth - 260
                ? "translateX(-110%)"
                : undefined,
          }}
        >
          <div
            className="px-3 py-2.5 rounded-lg flex flex-col gap-1"
            style={{
              background: "hsl(var(--card) / 0.97)",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 4px 20px hsl(0 0% 0% / 0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              className="font-mono-space text-xs font-bold leading-snug"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {hoveredEventState.event.title}
            </span>
            <p
              className="text-[10px] leading-relaxed line-clamp-2"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {hoveredEventState.event.description}
            </p>
            <span
              className="font-mono-space text-[9px] mt-0.5"
              style={{ color: "hsl(var(--primary))" }}
            >
              {hoveredEventState.event.year < 0
                ? `${Math.abs(hoveredEventState.event.year)} a.C.`
                : `${hoveredEventState.event.year} d.C.`}
            </span>
          </div>
        </div>
      )}

      {/* ── App badge (top-left) ── */}
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

      {/* ── Instruction overlay (top-center) ── */}
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
            {isMobile
              ? "Toca un marcador para ver el evento"
              : "Mueve el slider ↓ · Haz clic en un marcador o usa el panel ▸"}
          </span>
        </div>
      )}

      {/* ── Events List Panel (right side, replaces old EventPanel) ── */}
      <EventsListPanel
        visibleEvents={visibleEvents}
        selectedEvent={selectedEvent}
        currentYear={currentYear}
        onSelectEvent={handleSelectEvent}
        onClose={handleClosePanel}
        forceOpen={timelineHoverActive}
      />

      {/* ── Timeline Bar ── */}
      <TimelineBar
        currentYear={currentYear}
        onYearChange={handleYearChange}
        onHoverYear={handleHoverYear}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      style={{ background: "#111319" }}
    >
      <div
        className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
        style={{
          borderColor: "hsl(var(--primary) / 0.3)",
          borderTopColor: "hsl(var(--primary))",
        }}
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
