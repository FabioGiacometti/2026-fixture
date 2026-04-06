import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CesiumGlobe from "@/components/CesiumGlobe";
import TimelineBar from "@/components/TimelineBar";
import EventsListPanel from "@/components/EventsListPanel";
import SafariSelectionModal from "@/components/SafariSelectionModal";
import { historicalEvents, getEventsInRange, safaris } from "@/data/historical-events";
import { WORLD_CUP_YEARS, worldCupEvents, worldCupSafaris } from "@/data/world-cup-data";
import type { HistoricalEvent } from "@/data/historical-events";
import { useIsMobile } from "@/hooks/use-mobile";

const CESIUM_LOADED_CHECK_INTERVAL = 200;
const DATASET_MODE_KEY = "history-map-dataset-mode";

type DatasetMode = "historical" | "worldcup";

interface HoveredEventState {
  event: HistoricalEvent;
  x: number;
  y: number;
}

export default function Index() {
  const [datasetMode, setDatasetMode] = useState<DatasetMode>(() => {
    try {
      const rawMode = localStorage.getItem(DATASET_MODE_KEY);
      return rawMode === "historical" ? "historical" : "worldcup";
    } catch {
      return "worldcup";
    }
  });
  const [currentYear, setCurrentYear] = useState<number>(
    datasetMode === "worldcup" ? WORLD_CUP_YEARS[0] : 0
  );
  const [windowSize, setWindowSize] = useState<number>(
    datasetMode === "worldcup" ? 6 : 300
  );
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [cesiumReady, setCesiumReady] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [hoveredEventState, setHoveredEventState] = useState<HoveredEventState | null>(null);
  const [timelineHoverActive, setTimelineHoverActive] = useState(false);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mapStyle, setMapStyle] = useState<"political" | "geographic">(
    () => (datasetMode === "worldcup" ? "geographic" : "political")
  );
  const isMobile = useIsMobile();

  // Safari State
  const [activeSafariId, setActiveSafariId] = useState<string | null>(null);
  const [showSafariModal, setShowSafariModal] = useState(true);

  const allDatasetEvents = useMemo(
    () => (datasetMode === "worldcup" ? worldCupEvents : historicalEvents),
    [datasetMode]
  );

  const datasetSafaris = useMemo(
    () => (datasetMode === "worldcup" ? worldCupSafaris : safaris),
    [datasetMode]
  );

  const activeSafari = useMemo(() => 
    datasetSafaris.find(s => s.id === activeSafariId) || null,
    [activeSafariId, datasetSafaris]
  );

  useEffect(() => {
    try {
      localStorage.setItem(DATASET_MODE_KEY, datasetMode);
    } catch {
      // no-op if localStorage is unavailable
    }
  }, [datasetMode]);

  useEffect(() => {
    setSelectedEvent(null);
    setActiveSafariId(null);
    setShowSafariModal(true);

    if (datasetMode === "worldcup") {
      setMapStyle("geographic");
      setCurrentYear((year) =>
        WORLD_CUP_YEARS.includes(year) ? year : WORLD_CUP_YEARS[WORLD_CUP_YEARS.length - 1]
      );
      setWindowSize(6);
      return;
    }

    setMapStyle("political");
    setWindowSize(300);
    setCurrentYear((year) => (year >= -3000 && year <= 2024 ? year : 0));
  }, [datasetMode]);

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

  const visibleEvents = useMemo(() => {
    if (activeSafariId && activeSafari) {
      // In safari mode, we ONLY show events belonging to that safari
      return allDatasetEvents.filter(e => activeSafari.eventIds.includes(e.id));
    }
    // Global mode: filter by year range
    return getEventsInRange(currentYear, windowSize, allDatasetEvents);
  }, [currentYear, windowSize, activeSafariId, activeSafari, allDatasetEvents]);

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handleHoverYear = useCallback((year: number | null) => {
    setTimelineHoverActive(year !== null);
  }, []);

  const handleSelectEvent = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
    setCurrentYear(event.year);
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

  const handleSelectSafari = useCallback((safariId: string) => {
    if (safariId.startsWith("world-cup-")) {
      setMapStyle("geographic");
    }

    setActiveSafariId(safariId);
    setShowSafariModal(false);
    
    // Auto-select the first event of the safari
    const safari = datasetSafaris.find(s => s.id === safariId);
    if (safari && safari.eventIds.length > 0) {
      const firstEvent = allDatasetEvents.find(e => e.id === safari.eventIds[0]);
      if (firstEvent) {
        handleSelectEvent(firstEvent);
      }
    }
  }, [handleSelectEvent, datasetSafaris, allDatasetEvents, setMapStyle]);

  const handleJumpToSafariEvent = useCallback((safariId: string, eventId: string) => {
    if (safariId.startsWith("world-cup-")) {
      setMapStyle("geographic");
    }

    setActiveSafariId(safariId);
    setShowSafariModal(false);

    const targetEvent = allDatasetEvents.find((event) => event.id === eventId);
    if (targetEvent) {
      handleSelectEvent(targetEvent);
      return;
    }

    const safari = datasetSafaris.find((item) => item.id === safariId);
    if (safari && safari.eventIds.length > 0) {
      const firstEvent = allDatasetEvents.find((event) => event.id === safari.eventIds[0]);
      if (firstEvent) {
        handleSelectEvent(firstEvent);
      }
    }
  }, [allDatasetEvents, datasetSafaris, handleSelectEvent, setMapStyle]);

  const handleCloseSafari = useCallback(() => {
    setActiveSafariId(null);
    setShowSafariModal(true); // Allow re-selecting from modal if needed
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
          allEvents={allDatasetEvents}
          selectedEvent={selectedEvent}
          activeSafari={activeSafari}
          onSelectEvent={handleSelectEvent}
          onHoverEvent={handleHoverEvent}
          isMobile={isMobile}
          mapStyle={mapStyle}
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
        className="fixed top-5 left-6 z-40 flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
        style={{
          background: "hsl(var(--card) / 0.85)",
          border: "1px solid hsl(var(--border))",
          backdropFilter: "blur(8px)",
        }}
        onClick={() => setShowSafariModal(true)}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "hsl(var(--primary))" }}
        />
        <span
          className="font-mono-space text-xs"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {datasetMode === "worldcup" ? "Safari Mundialista" : "Safari Histórico"}
        </span>
        <span
          className="font-mono-space text-xs"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {allDatasetEvents.length} eventos
        </span>
      </div>

      {/* ── Dataset Mode Toggle (title area) ── */}
      <div
        className="fixed top-16 left-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: "hsl(var(--card) / 0.85)",
          border: "1px solid hsl(var(--border))",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          className="font-mono-space text-[10px] uppercase tracking-wider"
          style={{ color: datasetMode === "historical" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
        >
          Histórico
        </span>
        <Switch
          id="dataset-mode"
          checked={datasetMode === "worldcup"}
          onCheckedChange={(checked) => setDatasetMode(checked ? "worldcup" : "historical")}
          style={datasetMode === "worldcup" ? { backgroundColor: "hsl(var(--primary))" } : {}}
        />
        <span
          className="font-mono-space text-[10px] uppercase tracking-wider"
          style={{ color: datasetMode === "worldcup" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
        >
          Mundialista
        </span>
      </div>

      {/* ── Map Style Toggle (top-right) ── */}
      <div
        className="fixed top-5 right-6 z-40 flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: "hsl(var(--card) / 0.85)",
          border: "1px solid hsl(var(--border))",
          backdropFilter: "blur(8px)",
        }}
        // Adjust right position if EventsListPanel is collapsed or not to avoid overlap, 
        // though EventsListPanel is fixed to the right. Let's position the toggle next to the panel tab.
      >
        <div className="flex items-center space-x-2">
          <Label 
            htmlFor="map-style" 
            className="font-mono-space text-[10px] uppercase tracking-wider"
            style={{ color: mapStyle === "political" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
          >
            Político
          </Label>
          <Switch
            id="map-style"
            checked={mapStyle === "geographic"}
            onCheckedChange={(checked) => setMapStyle(checked ? "geographic" : "political")}
            style={mapStyle === "geographic" ? { backgroundColor: "hsl(var(--primary))" } : {}}
          />
          <Label 
            htmlFor="map-style"
            className="font-mono-space text-[10px] uppercase tracking-wider"
            style={{ color: mapStyle === "geographic" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
          >
            Geográfico
          </Label>
        </div>
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
        allEvents={allDatasetEvents}
        selectedEvent={selectedEvent}
        currentYear={currentYear}
        windowSize={windowSize}
        activeSafari={activeSafari}
        onSelectEvent={handleSelectEvent}
        onYearChange={handleYearChange}
        onClose={handleClosePanel}
        onCloseSafari={handleCloseSafari}
        forceOpen={timelineHoverActive}
        onMediaModalChange={setIsMediaModalOpen}
      />

      {/* ── Timeline Bar ── */}
      <TimelineBar
        currentYear={currentYear}
        windowSize={windowSize}
        onYearChange={handleYearChange}
        onHoverYear={handleHoverYear}
        onChangeWindowSize={setWindowSize}
        isMediaModalOpen={isMediaModalOpen}
        allEvents={allDatasetEvents}
        mode={datasetMode}
        minYear={datasetMode === "worldcup" ? WORLD_CUP_YEARS[0] : -3000}
        maxYear={datasetMode === "worldcup" ? WORLD_CUP_YEARS[WORLD_CUP_YEARS.length - 1] : 2024}
        yearSnapPoints={datasetMode === "worldcup" ? WORLD_CUP_YEARS : undefined}
      />

      <SafariSelectionModal
        isOpen={showSafariModal}
        safaris={datasetSafaris}
        allEvents={allDatasetEvents}
        onSelectSafari={handleSelectSafari}
        onJumpToEvent={handleJumpToSafariEvent}
        onClose={() => setShowSafariModal(false)}
        title={datasetMode === "worldcup" ? "Safaris Mundialistas" : "Safaris Históricos"}
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
