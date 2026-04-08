import { useState, useCallback, useMemo, useEffect, useRef, type CSSProperties } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CesiumGlobe from "@/components/CesiumGlobe";
import TimelineBar from "@/components/TimelineBar";
import EventsListPanel from "@/components/EventsListPanel";
import SafariSelectionModal from "@/components/SafariSelectionModal";
import FixturePipPanel from "@/components/FixturePipPanel";
import WorldCupGroupsDrawer from "@/components/WorldCupGroupsDrawer";
import { historicalEvents, getEventsInRange, safaris } from "@/data/historical-events";
import {
  CURRENT_WORLD_CUP_SAFARI_ID,
  CURRENT_WORLD_CUP_YEAR,
  WORLD_CUP_YEARS,
  worldCupEvents,
  worldCupSafaris,
} from "@/data/world-cup-data";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import { useIsMobile } from "@/hooks/use-mobile";

const CESIUM_LOADED_CHECK_INTERVAL = 200;
const DATASET_MODE_KEY = "history-map-dataset-mode";

type DatasetMode = "historical" | "worldcup";

interface HoveredEventState {
  event: HistoricalEvent;
  x: number;
  y: number;
}

function getPreferredSafariEvent(
  safari: Safari | null | undefined,
  events: HistoricalEvent[],
  preferMatch = false
) {
  if (!safari) return null;

  const safariEvents = safari.eventIds
    .map((id) => events.find((event) => event.id === id))
    .filter((event): event is HistoricalEvent => Boolean(event));

  if (preferMatch) {
    return safariEvents.find((event) => event.eventType === "match") ?? safariEvents[0] ?? null;
  }

  return safariEvents[0] ?? null;
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
    datasetMode === "worldcup" ? CURRENT_WORLD_CUP_YEAR : 0
  );
  const [windowSize, setWindowSize] = useState<number>(
    datasetMode === "worldcup" ? 6 : 300
  );
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(() => {
    if (datasetMode !== "worldcup") return null;
    const defaultSafari = worldCupSafaris.find((safari) => safari.id === CURRENT_WORLD_CUP_SAFARI_ID) ?? worldCupSafaris[0];
    return getPreferredSafariEvent(defaultSafari, worldCupEvents, true);
  });
  const [cesiumReady, setCesiumReady] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [hoveredEventState, setHoveredEventState] = useState<HoveredEventState | null>(null);
  const [timelineHoverActive, setTimelineHoverActive] = useState(false);
  const [showInstructionHint, setShowInstructionHint] = useState(true);
  const [selectedWorldCupGroup, setSelectedWorldCupGroup] = useState("Todos");
  const [isGroupsDrawerExpanded, setIsGroupsDrawerExpanded] = useState(false);
  const [panelFilteredEventIds, setPanelFilteredEventIds] = useState<string[] | null>(null);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mapStyle, setMapStyle] = useState<"political" | "geographic">(
    () => (datasetMode === "worldcup" ? "geographic" : "political")
  );
  const isMobile = useIsMobile();

  // Safari State
  const [activeSafariId, setActiveSafariId] = useState<string | null>(
    datasetMode === "worldcup" ? CURRENT_WORLD_CUP_SAFARI_ID : null
  );
  const [showSafariModal, setShowSafariModal] = useState(datasetMode !== "worldcup");

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

  const showWorldCupGroupsDrawer =
    datasetMode === "worldcup" && activeSafari?.id === CURRENT_WORLD_CUP_SAFARI_ID;

  const worldCupGroupOptions = useMemo(() => {
    if (!showWorldCupGroupsDrawer || !activeSafari) {
      return [] as Array<{
        name: string;
        count: number;
        resolvedCount: number;
        standings: Array<{
          team: string;
          flag?: string;
          played: number;
          goalDiff: number;
          points: number;
        }>;
      }>;
    }

    const groupMap = new Map<
      string,
      {
        count: number;
        resolvedCount: number;
        standings: Map<
          string,
          {
            team: string;
            flag?: string;
            played: number;
            points: number;
            goalDiff: number;
            goalFor: number;
          }
        >;
      }
    >();

    activeSafari.eventIds.forEach((eventId) => {
      const event = allDatasetEvents.find((item) => item.id === eventId);
      if (!event || event.eventType !== "match" || !event.groupName) return;

      if (!groupMap.has(event.groupName)) {
        groupMap.set(event.groupName, {
          count: 0,
          resolvedCount: 0,
          standings: new Map(),
        });
      }

      const groupEntry = groupMap.get(event.groupName)!;
      groupEntry.count += 1;

      const ensureTeam = (team?: string, flag?: string) => {
        if (!team) return;

        const current = groupEntry.standings.get(team) ?? {
          team,
          flag,
          played: 0,
          points: 0,
          goalDiff: 0,
          goalFor: 0,
        };

        if (!current.flag && flag) {
          current.flag = flag;
        }

        groupEntry.standings.set(team, current);
      };

      ensureTeam(event.homeTeam, event.homeFlag);
      ensureTeam(event.awayTeam, event.awayFlag);

      if (!event.score || !event.homeTeam || !event.awayTeam) return;

      groupEntry.resolvedCount += 1;

      const home = groupEntry.standings.get(event.homeTeam);
      const away = groupEntry.standings.get(event.awayTeam);
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;
      home.goalFor += event.score.home;
      away.goalFor += event.score.away;
      home.goalDiff += event.score.home - event.score.away;
      away.goalDiff += event.score.away - event.score.home;

      if (event.score.home > event.score.away) {
        home.points += 3;
      } else if (event.score.home < event.score.away) {
        away.points += 3;
      } else {
        home.points += 1;
        away.points += 1;
      }
    });

    return [...groupMap.entries()]
      .sort(([groupA], [groupB]) => groupA.localeCompare(groupB, undefined, { numeric: true }))
      .map(([name, group]) => ({
        name,
        count: group.count,
        resolvedCount: group.resolvedCount,
        standings: [...group.standings.values()].sort((teamA, teamB) => {
          if (teamB.points !== teamA.points) return teamB.points - teamA.points;
          if (teamB.goalDiff !== teamA.goalDiff) return teamB.goalDiff - teamA.goalDiff;
          if (teamB.goalFor !== teamA.goalFor) return teamB.goalFor - teamA.goalFor;
          return teamA.team.localeCompare(teamB.team);
        }),
      }));
  }, [showWorldCupGroupsDrawer, activeSafari, allDatasetEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(DATASET_MODE_KEY, datasetMode);
    } catch {
      // no-op if localStorage is unavailable
    }
  }, [datasetMode]);

  useEffect(() => {
    if (datasetMode === "worldcup") {
      const defaultSafari = worldCupSafaris.find((safari) => safari.id === CURRENT_WORLD_CUP_SAFARI_ID) ?? worldCupSafaris[0] ?? null;
      const defaultEvent = getPreferredSafariEvent(defaultSafari, worldCupEvents, true);

      setMapStyle("geographic");
      setWindowSize(6);
      setCurrentYear(defaultEvent?.year ?? CURRENT_WORLD_CUP_YEAR);
      setActiveSafariId(defaultSafari?.id ?? CURRENT_WORLD_CUP_SAFARI_ID);
      setSelectedEvent(defaultEvent);
      setShowSafariModal(false);
      return;
    }

    setSelectedEvent(null);
    setActiveSafariId(null);
    setShowSafariModal(true);
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

  useEffect(() => {
    setShowInstructionHint(true);

    const timeoutId = window.setTimeout(() => {
      setShowInstructionHint(false);
    }, 10_000);

    return () => window.clearTimeout(timeoutId);
  }, [datasetMode]);

  useEffect(() => {
    if (showWorldCupGroupsDrawer) {
      setSelectedWorldCupGroup("Todos");
      setIsGroupsDrawerExpanded(false);
      return;
    }

    setSelectedWorldCupGroup("Todos");
    setIsGroupsDrawerExpanded(false);
  }, [showWorldCupGroupsDrawer, activeSafari?.id]);

  const visibleEvents = useMemo(() => {
    if (activeSafariId && activeSafari) {
      const safariEvents = allDatasetEvents.filter((event) => {
        if (!activeSafari.eventIds.includes(event.id)) return false;
        if (datasetMode === "worldcup") {
          return event.eventType === "match";
        }
        return true;
      });

      if (
        showWorldCupGroupsDrawer &&
        selectedWorldCupGroup !== "Todos"
      ) {
        return safariEvents.filter((event) => event.groupName === selectedWorldCupGroup);
      }

      return safariEvents;
    }

    return getEventsInRange(currentYear, windowSize, allDatasetEvents);
  }, [
    currentYear,
    windowSize,
    activeSafariId,
    activeSafari,
    allDatasetEvents,
    datasetMode,
    showWorldCupGroupsDrawer,
    selectedWorldCupGroup,
  ]);

  const mapVisibleEvents = useMemo(() => {
    if (!panelFilteredEventIds) {
      return visibleEvents;
    }

    const allowedIds = new Set(panelFilteredEventIds);
    return visibleEvents.filter((event) => allowedIds.has(event.id));
  }, [visibleEvents, panelFilteredEventIds]);

  const handlePanelVisibleEventsChange = useCallback((events: HistoricalEvent[]) => {
    const nextIds = events.map((event) => event.id);

    setPanelFilteredEventIds((prev) => {
      if (
        prev &&
        prev.length === nextIds.length &&
        prev.every((id, index) => id === nextIds[index])
      ) {
        return prev;
      }

      return nextIds;
    });
  }, []);

  const showSafariPath = useMemo(
    () => Boolean(activeSafari && mapVisibleEvents.length > 1),
    [activeSafari, mapVisibleEvents.length]
  );

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

    const safari = datasetSafaris.find((item) => item.id === safariId);
    const firstEvent = getPreferredSafariEvent(safari, allDatasetEvents, safariId.startsWith("world-cup-"));
    if (firstEvent) {
      handleSelectEvent(firstEvent);
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
    const fallbackEvent = getPreferredSafariEvent(safari, allDatasetEvents, safariId.startsWith("world-cup-"));
    if (fallbackEvent) {
      handleSelectEvent(fallbackEvent);
    }
  }, [allDatasetEvents, datasetSafaris, handleSelectEvent, setMapStyle]);

  const handleCloseSafari = useCallback(() => {
    setActiveSafariId(null);
    setSelectedWorldCupGroup("Todos");
    setShowSafariModal(true); // Allow re-selecting from modal if needed
  }, []);

  // Group selection in the current World Cup drawer is filter-only.
  // We intentionally avoid auto-navigating into a match here.

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: "#111319",
        ["--timeline-height" as string]: showWorldCupGroupsDrawer
          ? (isGroupsDrawerExpanded ? "156px" : "58px")
          : "96px",
      } as CSSProperties}
    >
      {/* ── Globe ── */}
      {cesiumReady ? (
        <CesiumGlobe
          events={mapVisibleEvents}
          allEvents={allDatasetEvents}
          selectedEvent={selectedEvent}
          activeSafari={activeSafari}
          onSelectEvent={handleSelectEvent}
          onHoverEvent={handleHoverEvent}
          isMobile={isMobile}
          mapStyle={mapStyle}
          showSafariPath={showSafariPath}
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
        {datasetMode === "worldcup" && activeSafari?.thumbnail ? (
          <img
            src={activeSafari.thumbnail}
            alt={`${activeSafari.name} mascot`}
            className="h-7 w-7 rounded-full border border-white/10 bg-white/5 object-contain p-1"
          />
        ) : (
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "hsl(var(--primary))" }}
          />
        )}
        <span
          className="font-mono-space text-xs"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {datasetMode === "worldcup" ? "Safaris mundialistas" : "Safaris históricos"}
        </span>
        <span
          className="font-mono-space text-xs"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {datasetMode === "worldcup"
            ? `${activeSafari?.name ?? "Copa Mundial actual"} · ${mapVisibleEvents.length} partidos`
            : `${allDatasetEvents.length} eventos`}
        </span>
      </div>

      {/* ── Dataset Mode Toggle (title area) ── */}
      <div
        className="fixed top-20 left-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full"
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
      {!selectedEvent && showInstructionHint && (
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
              : showWorldCupGroupsDrawer
                ? "Despliega grupos ↓ · Haz clic en un marcador o usa el panel ▸"
                : "Mueve el slider ↓ · Haz clic en un marcador o usa el panel ▸"}
          </span>
        </div>
      )}

      {/* ── World Cup Fixture PIP ── */}
      {!isMobile && datasetMode === "worldcup" && activeSafari && activeSafari.id !== CURRENT_WORLD_CUP_SAFARI_ID && (
        <FixturePipPanel
          activeSafari={activeSafari}
          allEvents={allDatasetEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
        />
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
        onVisibleEventsChange={handlePanelVisibleEventsChange}
        activeGroupFilter={showWorldCupGroupsDrawer ? selectedWorldCupGroup : undefined}
        onClearGroupFilter={() => setSelectedWorldCupGroup("Todos")}
      />

      {/* ── Bottom navigation ── */}
      {showWorldCupGroupsDrawer ? (
        <WorldCupGroupsDrawer
          groups={worldCupGroupOptions}
          selectedGroup={selectedWorldCupGroup}
          onSelectGroup={setSelectedWorldCupGroup}
          isExpanded={isGroupsDrawerExpanded}
          onToggleExpanded={() => setIsGroupsDrawerExpanded((value) => !value)}
          isMediaModalOpen={isMediaModalOpen}
          title="Grupos · Copa Mundial 2026"
        />
      ) : (
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
      )}

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
