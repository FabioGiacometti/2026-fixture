import { useState, useCallback, useMemo, useEffect, useRef, type CSSProperties } from "react";
import { track } from "@vercel/analytics";
import { useLocation, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import CesiumGlobe from "@/components/CesiumGlobe";
import TimelineBar from "@/components/TimelineBar";
import EventsListPanel from "@/components/EventsListPanel";
import SafariSelectionModal from "@/components/SafariSelectionModal";
import FixturePipPanel from "@/components/FixturePipPanel";
import WorldCupGroupsDrawer from "@/components/WorldCupGroupsDrawer";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { historicalEvents, formatEventDate, formatYear, getEventsInRange, safaris } from "@/data/historical-events";
import {
  CURRENT_WORLD_CUP_SAFARI_ID,
  CURRENT_WORLD_CUP_YEAR,
  WORLD_CUP_YEARS,
  worldCupEvents,
  worldCupSafaris,
} from "@/data/world-cup-data";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import { getNextUpcomingWorldCupEvent, getUpcomingWorldCupMapEvents } from "@/lib/globe-ui";
import { buildAppRouteState, parseAppRouteState } from "@/lib/app-route-state";
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

function areStringArraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
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
    if (defaultSafari?.id === CURRENT_WORLD_CUP_SAFARI_ID) {
      return null;
    }
    return getPreferredSafariEvent(defaultSafari, worldCupEvents, true);
  });
  const [cesiumReady, setCesiumReady] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [hoveredEventState, setHoveredEventState] = useState<HoveredEventState | null>(null);
  const [focusedVenueEvent, setFocusedVenueEvent] = useState<HistoricalEvent | null>(null);
  const [timelineHoverActive, setTimelineHoverActive] = useState(false);
  const [showInstructionHint, setShowInstructionHint] = useState(true);
  const [selectedWorldCupGroup, setSelectedWorldCupGroup] = useState("Todos");
  const [isGroupsDrawerExpanded, setIsGroupsDrawerExpanded] = useState(false);
  const [panelFilteredEventIds, setPanelFilteredEventIds] = useState<string[] | null>(null);
  const [panelQuickFilters, setPanelQuickFilters] = useState<string[]>([]);
  const [rightPanelOffset, setRightPanelOffset] = useState<number>(
    datasetMode === "worldcup" ? 300 : 36
  );
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTooltipInteractingRef = useRef(false);
  const hasAppliedRouteStateRef = useRef(false);
  const lastTrackedRouteRef = useRef<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"political" | "geographic">(
    () => (datasetMode === "worldcup" ? "geographic" : "political")
  );
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

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
      const defaultEvent = defaultSafari?.id === CURRENT_WORLD_CUP_SAFARI_ID
        ? null
        : getPreferredSafariEvent(defaultSafari, worldCupEvents, true);

      setMapStyle("geographic");
      setWindowSize(6);
      setCurrentYear(defaultEvent?.year ?? CURRENT_WORLD_CUP_YEAR);
      setActiveSafariId(defaultSafari?.id ?? CURRENT_WORLD_CUP_SAFARI_ID);
      setSelectedEvent(defaultEvent);
      setFocusedVenueEvent(null);
      setShowSafariModal(false);
      return;
    }

    setSelectedEvent(null);
    setFocusedVenueEvent(null);
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

  useEffect(() => {
    const routeState = parseAppRouteState(location.pathname, location.search);
    const nextDatasetMode = routeState.datasetMode;
    const nextSafariId = nextDatasetMode === "worldcup"
      ? routeState.activeSafariId ?? CURRENT_WORLD_CUP_SAFARI_ID
      : routeState.activeSafariId ?? null;

    setDatasetMode((prev) => (prev === nextDatasetMode ? prev : nextDatasetMode));
    setActiveSafariId((prev) => (prev === nextSafariId ? prev : nextSafariId));
    setSelectedWorldCupGroup(routeState.selectedWorldCupGroup ?? "Todos");
    setPanelQuickFilters((prev) => areStringArraysEqual(prev, routeState.quickFilters) ? prev : routeState.quickFilters);

    if (routeState.mapStyle) {
      setMapStyle((prev) => (prev === routeState.mapStyle ? prev : routeState.mapStyle));
    }

    if (typeof routeState.currentYear === "number") {
      setCurrentYear((prev) => (prev === routeState.currentYear ? prev : routeState.currentYear));
    }

    if (routeState.selectedEventId) {
      const routedEvent = allDatasetEvents.find((event) => event.id === routeState.selectedEventId);
      if (routedEvent) {
        setSelectedEvent((prev) => (prev?.id === routedEvent.id ? prev : routedEvent));
      }
    } else if (nextDatasetMode === "worldcup" && nextSafariId === CURRENT_WORLD_CUP_SAFARI_ID) {
      setSelectedEvent(null);
    }

    hasAppliedRouteStateRef.current = true;
  }, [location.pathname, location.search, allDatasetEvents]);

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

  const currentWorldCupSafariEvents = useMemo(() => {
    if (datasetMode !== "worldcup" || activeSafari?.id !== CURRENT_WORLD_CUP_SAFARI_ID) {
      return [] as HistoricalEvent[];
    }

    return activeSafari.eventIds
      .map((id) => allDatasetEvents.find((event) => event.id === id))
      .filter((event): event is HistoricalEvent => Boolean(event));
  }, [datasetMode, activeSafari, allDatasetEvents]);

  const currentWorldCupFilteredEvents = useMemo(() => {
    if (!panelFilteredEventIds) {
      return currentWorldCupSafariEvents;
    }

    const allowedIds = new Set(panelFilteredEventIds);
    return currentWorldCupSafariEvents.filter((event) => allowedIds.has(event.id));
  }, [currentWorldCupSafariEvents, panelFilteredEventIds]);

  const nextUpcomingPopupEvent = useMemo(
    () => getNextUpcomingWorldCupEvent(currentWorldCupFilteredEvents),
    [currentWorldCupFilteredEvents]
  );

  const mapVisibleEvents = useMemo(() => {
    if (datasetMode === "worldcup" && activeSafari?.id === CURRENT_WORLD_CUP_SAFARI_ID) {
      return getUpcomingWorldCupMapEvents(currentWorldCupFilteredEvents);
    }

    if (!panelFilteredEventIds) {
      return visibleEvents;
    }

    const allowedIds = new Set(panelFilteredEventIds);
    return visibleEvents.filter((event) => allowedIds.has(event.id));
  }, [datasetMode, activeSafari, currentWorldCupFilteredEvents, visibleEvents, panelFilteredEventIds]);

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

  const handlePanelQuickFiltersChange = useCallback((filters: string[]) => {
    setPanelQuickFilters((prev) => (areStringArraysEqual(prev, filters) ? prev : filters));
    setFocusedVenueEvent((prev) => {
      if (!prev) return null;
      const venueLabel = prev.city ?? prev.region ?? "";
      return filters.includes(venueLabel) ? prev : null;
    });
  }, []);

  const showSafariPath = false;
  const activePopupEvent = hoveredEventState?.event ?? nextUpcomingPopupEvent ?? null;
  const isNextPopupEvent = Boolean(
    activePopupEvent &&
      nextUpcomingPopupEvent &&
      activePopupEvent.id === nextUpcomingPopupEvent.id
  );

  const routeState = useMemo(
    () => buildAppRouteState({
      datasetMode,
      activeSafariId,
      currentYear,
      selectedWorldCupGroup,
      quickFilters: panelQuickFilters,
      mapStyle,
      selectedEventId: selectedEvent?.id ?? null,
    }),
    [datasetMode, activeSafariId, currentYear, selectedWorldCupGroup, panelQuickFilters, mapStyle, selectedEvent]
  );

  useEffect(() => {
    if (!hasAppliedRouteStateRef.current) return;

    const nextRoute = `${routeState.pathname}${routeState.search}`;
    const currentRoute = `${location.pathname}${location.search}`;

    if (nextRoute !== currentRoute) {
      navigate(nextRoute, { replace: true });
    }
  }, [routeState, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!hasAppliedRouteStateRef.current) return;

    const trackingKey = `${routeState.pathname}${routeState.search}`;
    if (lastTrackedRouteRef.current === trackingKey) return;

    lastTrackedRouteRef.current = trackingKey;
    track("route_state_viewed", {
      datasetMode,
      safariId: activeSafariId ?? "none",
      selectedGroup: selectedWorldCupGroup,
      quickFilters: panelQuickFilters.length > 0 ? panelQuickFilters.join("|") : "none",
      mapStyle,
      selectedEventId: selectedEvent?.id ?? "none",
    });
  }, [routeState, datasetMode, activeSafariId, selectedWorldCupGroup, panelQuickFilters, mapStyle, selectedEvent]);

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handleHoverYear = useCallback((year: number | null) => {
    setTimelineHoverActive(year !== null);
  }, []);

  const handleSelectEvent = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
    setFocusedVenueEvent(event.dataset === "worldcup" && event.eventType === "match" ? event : null);
    setCurrentYear(event.year);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const clearHoverTooltip = useCallback(() => {
    if (hoverClearTimeoutRef.current) {
      clearTimeout(hoverClearTimeoutRef.current);
      hoverClearTimeoutRef.current = null;
    }
  }, []);

  const handleHoverEvent = useCallback(
    (event: HistoricalEvent | null, x: number, y: number) => {
      clearHoverTooltip();

      if (event) {
        setHoveredEventState({ event, x, y });
        return;
      }

      hoverClearTimeoutRef.current = setTimeout(() => {
        if (!hoverTooltipInteractingRef.current) {
          setHoveredEventState(null);
        }
      }, 120);
    },
    [clearHoverTooltip]
  );

  const handleOpenHoveredMatchInfo = useCallback(() => {
    if (!activePopupEvent) return;

    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setHoveredEventState(null);
    handleSelectEvent(activePopupEvent);
  }, [activePopupEvent, clearHoverTooltip, handleSelectEvent]);

  const applyVenueFilter = useCallback((event: HistoricalEvent) => {
    const venueLabel = event.city ?? event.region;
    if (!venueLabel) return;

    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setSelectedEvent(null);
    setFocusedVenueEvent(event);
    setCurrentYear(event.year);
    setSelectedWorldCupGroup("Todos");
    setPanelQuickFilters([venueLabel]);
  }, [clearHoverTooltip]);

  const handleApplyGroupFilter = useCallback((event: HistoricalEvent) => {
    if (!event.groupName) return;

    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setSelectedEvent(null);
    setFocusedVenueEvent(null);
    setCurrentYear(event.year);
    setSelectedWorldCupGroup(event.groupName);
    setPanelQuickFilters([]);
  }, [clearHoverTooltip]);

  const handleApplyTeamFilter = useCallback((teamName: string | undefined, event: HistoricalEvent) => {
    if (!teamName) return;

    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setSelectedEvent(null);
    setFocusedVenueEvent(null);
    setCurrentYear(event.year);
    setSelectedWorldCupGroup("Todos");
    setPanelQuickFilters([teamName]);
  }, [clearHoverTooltip]);

  const handleSelectVenueFromMap = useCallback((event: HistoricalEvent, x = 0, y = 0) => {
    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;

    if (hoveredEventState?.event.id === event.id) {
      applyVenueFilter(event);
      return;
    }

    setSelectedEvent(null);
    setFocusedVenueEvent(event);
    setCurrentYear(event.year);
    setHoveredEventState({ event, x, y });
  }, [applyVenueFilter, clearHoverTooltip, hoveredEventState]);

  const handleSelectSafari = useCallback((safariId: string) => {
    if (safariId.startsWith("world-cup-")) {
      setMapStyle("geographic");
    }

    setActiveSafariId(safariId);
    setShowSafariModal(false);

    if (safariId === CURRENT_WORLD_CUP_SAFARI_ID) {
      setSelectedEvent(null);
      setCurrentYear(CURRENT_WORLD_CUP_YEAR);
      return;
    }

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
        background: "hsl(var(--background))",
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
          focusedEvent={focusedVenueEvent}
          activeSafari={activeSafari}
          onSelectEvent={handleSelectEvent}
          onSelectVenue={handleSelectVenueFromMap}
          onHoverEvent={handleHoverEvent}
          isMobile={isMobile}
          mapStyle={mapStyle}
          showSafariPath={showSafariPath}
        />
      ) : (
        <LoadingScreen />
      )}

      {/* ── Map popup overlay ── */}
      {activePopupEvent && (
        <div
          className="fixed z-50 pointer-events-none"
          style={
            !isMobile && hoveredEventState
              ? {
                  left: hoveredEventState.x + 14,
                  top: hoveredEventState.y - 8,
                  maxWidth: activePopupEvent.dataset === "worldcup" ? "280px" : "220px",
                  transform:
                    hoveredEventState.x > window.innerWidth - 260
                      ? "translateX(-110%)"
                      : undefined,
                }
              : {
                  left: isMobile ? "12px" : "18px",
                  right: isMobile ? "12px" : undefined,
                  bottom: "calc(var(--timeline-height) + 18px)",
                  maxWidth: isMobile ? undefined : activePopupEvent.dataset === "worldcup" ? "320px" : "240px",
                }
          }
        >
          <div
            className="pointer-events-auto rounded-xl border px-3.5 py-3 shadow-xl"
            style={{
              background: "hsl(var(--card) / 0.97)",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 10px 28px hsl(0 0% 0% / 0.42)",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={() => {
              hoverTooltipInteractingRef.current = true;
              clearHoverTooltip();
            }}
            onMouseLeave={() => {
              hoverTooltipInteractingRef.current = false;
              setHoveredEventState(null);
            }}
          >
            {activePopupEvent.dataset === "worldcup" && activePopupEvent.eventType === "match" ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  {activePopupEvent.groupName ? (
                    <button
                      type="button"
                      onClick={() => handleApplyGroupFilter(activePopupEvent)}
                      className="rounded-full px-2 py-0.5 font-mono-space text-[9px] uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
                      style={{
                        color: "hsl(var(--primary))",
                        background: "hsl(var(--primary) / 0.12)",
                      }}
                    >
                      {activePopupEvent.groupName}
                    </button>
                  ) : (
                    <span
                      className="rounded-full px-2 py-0.5 font-mono-space text-[9px] uppercase tracking-[0.18em]"
                      style={{
                        color: "hsl(var(--primary))",
                        background: "hsl(var(--primary) / 0.12)",
                      }}
                    >
                      {activePopupEvent.stage ?? "Partido"}
                    </span>
                  )}
                  <span
                    className="text-[11px]"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    {`${formatEventDate(activePopupEvent, { includeEra: false })}${activePopupEvent.kickoff ? ` · ${activePopupEvent.kickoff}` : ""}`}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => applyVenueFilter(activePopupEvent)}
                    className="text-left text-sm font-semibold leading-tight transition-opacity hover:opacity-80"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {activePopupEvent.city ?? activePopupEvent.region}
                  </button>
                  {isNextPopupEvent && (
                    <p
                      className="mt-0.5 text-[11px] leading-relaxed"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      Próximo partido del calendario mundialista
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[13px] font-semibold leading-snug" style={{ color: "hsl(var(--foreground))" }}>
                  <button
                    type="button"
                    onClick={() => handleApplyTeamFilter(activePopupEvent.homeTeam, activePopupEvent)}
                    className="flex min-w-0 items-center gap-1.5 text-left transition-opacity hover:opacity-80"
                  >
                    {activePopupEvent.homeFlag && (
                      <img
                        src={`https://flagcdn.com/w20/${activePopupEvent.homeFlag.toLowerCase()}.png`}
                        alt={activePopupEvent.homeTeam ?? "Local"}
                        className="h-3.5 w-5 rounded-[2px] object-cover shadow-sm"
                      />
                    )}
                    <span className="truncate">{activePopupEvent.homeTeam ?? "Local"}</span>
                  </button>
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>vs</span>
                  <button
                    type="button"
                    onClick={() => handleApplyTeamFilter(activePopupEvent.awayTeam, activePopupEvent)}
                    className="flex min-w-0 items-center gap-1.5 text-left transition-opacity hover:opacity-80"
                  >
                    {activePopupEvent.awayFlag && (
                      <img
                        src={`https://flagcdn.com/w20/${activePopupEvent.awayFlag.toLowerCase()}.png`}
                        alt={activePopupEvent.awayTeam ?? "Visitante"}
                        className="h-3.5 w-5 rounded-[2px] object-cover shadow-sm"
                      />
                    )}
                    <span className="truncate">{activePopupEvent.awayTeam ?? "Visitante"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenHoveredMatchInfo}
                  className="self-start rounded-md px-0 py-0.5 text-[11px] font-semibold transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Ver más información
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span
                  className="font-mono-space text-xs font-bold leading-snug"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  {activePopupEvent.title}
                </span>
                <p
                  className="text-[10px] leading-relaxed line-clamp-2"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {activePopupEvent.description}
                </p>
                <span
                  className="font-mono-space text-[9px] mt-0.5"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {formatYear(activePopupEvent.year)}
                </span>
              </div>
            )}
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

      <ThemeSwitcher
        mapStyle={mapStyle}
        onMapStyleChange={(style) => setMapStyle(style)}
        panelOffset={rightPanelOffset}
      />

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
        onQuickFiltersChange={handlePanelQuickFiltersChange}
        onPanelOffsetChange={setRightPanelOffset}
        activeGroupFilter={showWorldCupGroupsDrawer ? selectedWorldCupGroup : undefined}
        onClearGroupFilter={() => setSelectedWorldCupGroup("Todos")}
        quickFiltersFromRoute={panelQuickFilters}
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
      style={{ background: "hsl(var(--background))" }}
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
