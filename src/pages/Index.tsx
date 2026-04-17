import { getEventSortValue } from "../lib/globe-ui";

// Utility: get all group matches and one per phase for a country
function getCountryRelevantMatches(events: HistoricalEvent[], country: string) {
  const normalized = normalizeText(country);
  // Group by stage
  const byStage: Record<string, HistoricalEvent[]> = {};
  for (const event of events) {
    if (event.eventType !== "match") continue;
    if (
      normalizeText(event.homeTeam ?? "") === normalized ||
      normalizeText(event.awayTeam ?? "") === normalized
    ) {
      if (!event.stage) continue;
      if (!byStage[event.stage]) byStage[event.stage] = [];
      byStage[event.stage].push(event);
    }
  }
  // All group matches, and one per other stage
  const result: HistoricalEvent[] = [];
  if (byStage.group) result.push(...byStage.group);
  for (const stage of ["round32","round16","quarterfinal","semifinal","third-place","final"]) {
    if (byStage[stage] && byStage[stage].length > 0) {
      // Pick the earliest by date
      const sorted = [...byStage[stage]].sort((a, b) => getEventSortValue(a) - getEventSortValue(b));
      result.push(sorted[0]);
    }
  }
  return result;
}
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Trophy, Sparkles, Calendar } from "lucide-react";
import {
  buildMatchCalendarEntry,
  buildGoogleCalendarUrl,
  buildIcsCalendar,
  CALENDAR_PROVIDER_ACTIONS,
} from "@/lib/calendar-actions";
import { useState, useCallback, useMemo, useEffect, useRef, type CSSProperties } from "react";
import { track } from "@vercel/analytics";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import CesiumGlobe from "@/components/CesiumGlobe";
import TimelineBar from "@/components/TimelineBar";
import EventsListPanel from "@/components/EventsListPanel";
import MatchTeamsRow from "@/components/MatchTeamsRow";
import SafariSelectionModal from "@/components/SafariSelectionModal";
import FixturePipPanel from "@/components/FixturePipPanel";
import WelcomeModal from "@/components/WelcomeModal";
import WorldCupGroupsDrawer from "@/components/WorldCupGroupsDrawer";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { historicalEvents, formatEventDate, formatExplicitEventDate, formatYear, getEventsInRange, safaris } from "@/data/historical-events";
import {
  CURRENT_WORLD_CUP_SAFARI_ID,
  CURRENT_WORLD_CUP_YEAR,
  WORLD_CUP_YEARS,
  worldCupEvents,
  worldCupSafaris,
} from "@/data/world-cup-data";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import { getChronologicalMatchNavigationEvent, getNextUpcomingWorldCupEvent, getUpcomingWorldCupVenueMapEvents } from "@/lib/globe-ui";
import { buildAppRouteState, parseAppRouteState } from "@/lib/app-route-state";
import { env } from "@/lib/env";
import { useIsMobile } from "@/hooks/use-mobile";
import { detectVisitorCountryMatch, normalizeText } from "@/lib/visitor-country";

const CESIUM_LOADED_CHECK_INTERVAL = 200;
const UI_TRANSITION_DURATION_MS = 500;
const MOBILE_POPUP_SWIPE_DURATION_MS = 400;
const MOBILE_POPUP_LEFT_EDGE_GUARD_PX = 28;
const DATASET_MODE_KEY = "history-map-dataset-mode";
const DEFAULT_SHARE_TITLE = "Fixture Interactivo Copa 2026";
const DEFAULT_SHARE_DESCRIPTION = "Explora el fixture de la Copa Mundial 2026 en un mapa 3D interactivo y comparte partidos con enlaces directos.";
const DEFAULT_SHARE_IMAGE_PATH = "/social-share-2026.png";

type DatasetMode = "historical" | "worldcup";
const LOCKED_DATASET_MODE: DatasetMode = "worldcup";

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

function eventIncludesTeam(event: HistoricalEvent, teamName: string) {
  const normalizedTeamName = normalizeText(teamName);

  return normalizeText(event.homeTeam ?? "") === normalizedTeamName
    || normalizeText(event.awayTeam ?? "") === normalizedTeamName;
}

function getEventTeamFlagCode(event: HistoricalEvent | null, teamName: string | null) {
  if (!event || !teamName) {
    return null;
  }

  const normalizedTeamName = normalizeText(teamName);
  if (normalizeText(event.homeTeam ?? "") === normalizedTeamName) {
    return event.homeFlag ?? null;
  }

  if (normalizeText(event.awayTeam ?? "") === normalizedTeamName) {
    return event.awayFlag ?? null;
  }

  return null;
}

function updateMetaTag(selector: string, content: string) {
  if (typeof document === "undefined") return;
  const node = document.querySelector(selector);
  if (node instanceof HTMLMetaElement) {
    node.content = content;
  }
}

function updateCanonicalUrl(url: string) {
  if (typeof document === "undefined") return;
  const node = document.querySelector('link[rel="canonical"]');
  if (node instanceof HTMLLinkElement) {
    node.href = url;
  }
}

function buildSharePayload(event: HistoricalEvent | null) {
  if (!event) {
    return {
      title: DEFAULT_SHARE_TITLE,
      description: DEFAULT_SHARE_DESCRIPTION,
      imageAlt: DEFAULT_SHARE_TITLE,
    };
  }

  if (event.eventType === "match" && event.homeTeam && event.awayTeam) {
    const title = `${event.homeTeam} vs ${event.awayTeam} | Fixture Interactivo Copa 2026`;
    const description = `${formatEventDate(event, { includeEra: false })} · ${event.city ?? event.region ?? "Sede por confirmar"}. Comparto este partido de la Copa Mundial 2026.`;

    return {
      title,
      description,
      imageAlt: `${event.homeTeam} vs ${event.awayTeam} - Copa Mundial 2026`,
    };
  }

  return {
    title: `${event.title} | Fixture Interactivo Copa 2026`,
    description: `${formatEventDate(event, { includeEra: false })} · ${event.city ?? event.region ?? "Copa Mundial 2026"}.`,
    imageAlt: event.title,
  };
}

export default function Index() {
  const [datasetMode, setDatasetMode] = useState<DatasetMode>(LOCKED_DATASET_MODE);
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
  const [isMobilePopupDismissed, setIsMobilePopupDismissed] = useState(false);
  const [timelineHoverActive, setTimelineHoverActive] = useState(false);
  const [showInstructionHint, setShowInstructionHint] = useState(true);
  const [selectedWorldCupGroup, setSelectedWorldCupGroup] = useState("Todos");
  const [isGroupsDrawerExpanded, setIsGroupsDrawerExpanded] = useState(false);
  const [panelFilteredEventIds, setPanelFilteredEventIds] = useState<string[] | null>(null);
  const [panelQuickFilters, setPanelQuickFilters] = useState<string[]>([]);
  const [rightPanelOffset, setRightPanelOffset] = useState<number>(
    datasetMode === "worldcup" ? 300 : 36
  );
  const [mobilePopupCardHeight, setMobilePopupCardHeight] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [detectedVisitorTeam, setDetectedVisitorTeam] = useState<string | null>(null);
  const [copiedPopupMatchId, setCopiedPopupMatchId] = useState<string | null>(null);
  const [popupSwipeDirection, setPopupSwipeDirection] = useState<"left" | "right" | null>(null);
  const [popupSwipeEventId, setPopupSwipeEventId] = useState<string | null>(null);
  const [popupSwipeIncomingEvent, setPopupSwipeIncomingEvent] = useState<HistoricalEvent | null>(null);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobilePopupCardRef = useRef<HTMLDivElement | null>(null);
  const hoverClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const popupSwipeHandledRef = useRef(false);
  const popupSwipeAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupExitAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTooltipInteractingRef = useRef(false);
  const hasAppliedRouteStateRef = useRef(false);
  const routeHydrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTrackedRouteRef = useRef<string | null>(null);
  const hasDecidedWelcomeModalRef = useRef(false);
  const [routeHydrationVersion, setRouteHydrationVersion] = useState(0);
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
  const showStandaloneGroupsDrawer = showWorldCupGroupsDrawer && !isMobile;

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
    const allowedSafariIds = new Set(worldCupSafaris.map((safari) => safari.id));
    const nextSafariId = routeState.activeSafariId && allowedSafariIds.has(routeState.activeSafariId)
      ? routeState.activeSafariId
      : CURRENT_WORLD_CUP_SAFARI_ID;

    hasAppliedRouteStateRef.current = false;

    setDatasetMode((prev) => (prev === LOCKED_DATASET_MODE ? prev : LOCKED_DATASET_MODE));
    setActiveSafariId((prev) => (prev === nextSafariId ? prev : nextSafariId));
    setSelectedWorldCupGroup(routeState.selectedWorldCupGroup ?? "Todos");
    setPanelQuickFilters((prev) => areStringArraysEqual(prev, routeState.quickFilters) ? prev : routeState.quickFilters);

    if (!hasDecidedWelcomeModalRef.current) {
      setShowWelcomeModal(!routeState.selectedEventId && nextSafariId === CURRENT_WORLD_CUP_SAFARI_ID);
      hasDecidedWelcomeModalRef.current = true;
    }

    if (routeState.mapStyle) {
      setMapStyle((prev) => (prev === routeState.mapStyle ? prev : routeState.mapStyle));
    }

    if (typeof routeState.currentYear === "number") {
      setCurrentYear((prev) => (prev === routeState.currentYear ? prev : routeState.currentYear));
    }

    if (routeState.selectedEventId) {
      const routedEvent = allDatasetEvents.find((event) => event.id === routeState.selectedEventId);
      if (routedEvent) {
        if (routeState.showEventDetails) {
          setSelectedEvent((prev) => (prev?.id === routedEvent.id ? prev : routedEvent));
        } else {
          setSelectedEvent(null);
        }
        setFocusedVenueEvent((prev) => (prev?.id === routedEvent.id ? prev : routedEvent));
        setCurrentYear((prev) => (prev === routedEvent.year ? prev : routedEvent.year));
      } else if (nextSafariId === CURRENT_WORLD_CUP_SAFARI_ID) {
        setSelectedEvent(null);
        setFocusedVenueEvent(null);
      }
    } else if (nextSafariId === CURRENT_WORLD_CUP_SAFARI_ID) {
      setSelectedEvent(null);
      setFocusedVenueEvent(null);
    }

    if (routeHydrationTimeoutRef.current) {
      clearTimeout(routeHydrationTimeoutRef.current);
    }

    routeHydrationTimeoutRef.current = setTimeout(() => {
      hasAppliedRouteStateRef.current = true;
      setRouteHydrationVersion((value) => value + 1);
      routeHydrationTimeoutRef.current = null;
    }, 0);

    return () => {
      if (routeHydrationTimeoutRef.current) {
        clearTimeout(routeHydrationTimeoutRef.current);
        routeHydrationTimeoutRef.current = null;
      }
    };
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

  const nextUpcomingGlobalEvent = useMemo(
    () => getNextUpcomingWorldCupEvent(currentWorldCupSafariEvents),
    [currentWorldCupSafariEvents]
  );

  const nextUpcomingPopupEvent = useMemo(
    () => getNextUpcomingWorldCupEvent(currentWorldCupFilteredEvents),
    [currentWorldCupFilteredEvents]
  );

  const nextUpcomingCountryEvent = useMemo(() => {
    if (!detectedVisitorTeam) {
      return null;
    }

    return getNextUpcomingWorldCupEvent(
      currentWorldCupSafariEvents.filter((event) => eventIncludesTeam(event, detectedVisitorTeam))
    );
  }, [currentWorldCupSafariEvents, detectedVisitorTeam]);

  const detectedVisitorFlagCode = useMemo(
    () => getEventTeamFlagCode(nextUpcomingCountryEvent, detectedVisitorTeam),
    [nextUpcomingCountryEvent, detectedVisitorTeam]
  );

  const mapVisibleEvents = useMemo(() => {
    if (datasetMode === "worldcup" && activeSafari?.id === CURRENT_WORLD_CUP_SAFARI_ID) {
      return getUpcomingWorldCupVenueMapEvents(currentWorldCupFilteredEvents);
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
  }, []);

  const showSafariPath = false;
  const activePopupEvent =
    hoveredEventState?.event ??
    focusedVenueEvent ??
    ((!isMobile || !isMobilePopupDismissed) ? nextUpcomingPopupEvent : null) ??
    null;
  const [renderedPopupEvent, setRenderedPopupEvent] = useState<HistoricalEvent | null>(null);
  const [isPopupClosing, setIsPopupClosing] = useState(false);
  const popupContextChips = [
    selectedWorldCupGroup !== "Todos" ? selectedWorldCupGroup : null,
    ...panelQuickFilters.slice(0, 2),
  ].filter((value): value is string => Boolean(value));
  const shouldPrioritizeMobilePopup = isMobile && Boolean(activePopupEvent) && !selectedEvent;
  const isMobilePanelOpen = isMobile && rightPanelOffset > 36;
  const mobileCalendarioOffset = shouldPrioritizeMobilePopup ? mobilePopupCardHeight + 16 : 12;
  const shouldHideBottomNavigation = isMobile && (Boolean(activePopupEvent) || Boolean(selectedEvent) || isMobilePanelOpen);
  const hasMobileFilterChips = selectedWorldCupGroup !== "Todos" || panelQuickFilters.length > 0;
  const showMobileContextChips = isMobile && !selectedEvent && hasMobileFilterChips;
  const swipeablePopupMatches = useMemo(
    () =>
      (datasetMode === "worldcup" ? currentWorldCupFilteredEvents : visibleEvents)
        .filter((event) => event.eventType === "match"),
    [datasetMode, currentWorldCupFilteredEvents, visibleEvents]
  );
  const popupTournamentMatches = useMemo(
    () =>
      (activeSafari
        ? activeSafari.eventIds
            .map((id) => allDatasetEvents.find((event) => event.id === id))
            .filter((event): event is HistoricalEvent => Boolean(event && event.eventType === "match"))
        : swipeablePopupMatches
      ).sort((left, right) => {
        const leftDate = new Date(left.year, (left.month ?? 1) - 1, left.day ?? 1).getTime();
        const rightDate = new Date(right.year, (right.month ?? 1) - 1, right.day ?? 1).getTime();
        const leftKickoff = left.kickoff ? Number.parseInt(left.kickoff.replace(":", ""), 10) : 9999;
        const rightKickoff = right.kickoff ? Number.parseInt(right.kickoff.replace(":", ""), 10) : 9999;

        return leftDate === rightDate ? leftKickoff - rightKickoff : leftDate - rightDate;
      }),
    [activeSafari, allDatasetEvents, swipeablePopupMatches]
  );
  const globeViewportInsets = useMemo(
    () => ({
      top: 0,
      left: 0,
      right: isMobile ? 0 : rightPanelOffset,
      bottom: isMobile && shouldPrioritizeMobilePopup ? Math.max(0, mobilePopupCardHeight - 8) : 0,
    }),
    [isMobile, rightPanelOffset, shouldPrioritizeMobilePopup, mobilePopupCardHeight]
  );

  useEffect(() => {
    setIsMobilePopupDismissed(false);
  }, [nextUpcomingPopupEvent?.id, activeSafari?.id, datasetMode]);

  useEffect(() => {
    if (activePopupEvent?.id !== popupSwipeEventId && popupSwipeEventId) {
      setPopupSwipeDirection(null);
      setPopupSwipeEventId(null);
      setPopupSwipeIncomingEvent(null);
    }
  }, [activePopupEvent?.id, popupSwipeEventId]);

  useEffect(() => {
    if (!shouldPrioritizeMobilePopup) {
      setMobilePopupCardHeight(0);
      return;
    }

    const updatePopupHeight = () => {
      const nextHeight = mobilePopupCardRef.current?.getBoundingClientRect().height ?? 0;
      setMobilePopupCardHeight(Math.round(nextHeight));
    };

    updatePopupHeight();

    if (typeof ResizeObserver === "undefined" || !mobilePopupCardRef.current) {
      window.addEventListener("resize", updatePopupHeight);
      return () => window.removeEventListener("resize", updatePopupHeight);
    }

    const observer = new ResizeObserver(() => updatePopupHeight());
    observer.observe(mobilePopupCardRef.current);
    window.addEventListener("resize", updatePopupHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePopupHeight);
    };
  }, [shouldPrioritizeMobilePopup, activePopupEvent?.id, renderedPopupEvent?.id]);

  const routeState = useMemo(
    () => {
      const routeEventId = selectedEvent?.id ?? focusedVenueEvent?.id ?? null;
      return buildAppRouteState({
        datasetMode,
        activeSafariId,
        currentYear,
        selectedWorldCupGroup,
        quickFilters: panelQuickFilters,
        mapStyle,
        selectedEventId: routeEventId,
        showEventDetails: Boolean(selectedEvent),
      });
    },
    [datasetMode, activeSafariId, currentYear, selectedWorldCupGroup, panelQuickFilters, mapStyle, selectedEvent, focusedVenueEvent]
  );

  const shareEvent = selectedEvent ?? focusedVenueEvent;

  const handleViewEventOnMap = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(null);
    setFocusedVenueEvent(event);
    setCurrentYear(event.year);
    setIsMobilePopupDismissed(false);
  }, []);

  const handleDismissWelcomeModal = useCallback(() => {
    setShowWelcomeModal(false);
  }, []);

  const handleCopyMatchLink = useCallback(async (event: HistoricalEvent, showEventDetails: boolean) => {
    if (typeof window === "undefined") {
      return;
    }

    const shareRoute = buildAppRouteState({
      datasetMode,
      activeSafariId,
      currentYear: event.year,
      selectedWorldCupGroup,
      quickFilters: panelQuickFilters,
      mapStyle,
      selectedEventId: event.id,
      showEventDetails,
    });

    const matchLabel = event.eventType === "match" && event.homeTeam && event.awayTeam
      ? `${event.homeTeam} vs ${event.awayTeam}`
      : event.title;
    const matchDate = formatExplicitEventDate(event, { includeEra: false, includeTime: true });
    const previewShareUrl = `${window.location.origin}/s/${encodeURIComponent(event.id)}?${new URLSearchParams({
      d: showEventDetails ? "1" : "0",
      m: matchLabel,
      dt: matchDate,
    }).toString()}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(previewShareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = previewShareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedPopupMatchId(event.id);

      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }

      copyFeedbackTimeoutRef.current = setTimeout(() => {
        setCopiedPopupMatchId(null);
      }, 1600);
    } catch {
      // Silent fail for browsers that block clipboard outside secure/user contexts.
    }
  }, [datasetMode, activeSafariId, selectedWorldCupGroup, panelQuickFilters, mapStyle]);

  useEffect(() => {
    if (!hasAppliedRouteStateRef.current) return;

    const nextRoute = `${routeState.pathname}${routeState.search}`;
    const currentRoute = `${location.pathname}${location.search}`;

    if (nextRoute !== currentRoute) {
      navigate(nextRoute, { replace: true });
    }
  }, [routeState, location.pathname, location.search, navigate, routeHydrationVersion]);

  useEffect(() => {
    if (!hasAppliedRouteStateRef.current || !env.analyticsEnabled) return;

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
      appEnv: env.appEnv,
    });
  }, [routeState, datasetMode, activeSafariId, selectedWorldCupGroup, panelQuickFilters, mapStyle, selectedEvent]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}${location.pathname}${location.search}`;
    const shareImageUrl = `${window.location.origin}${DEFAULT_SHARE_IMAGE_PATH}`;
    const payload = buildSharePayload(shareEvent);

    document.title = payload.title;
    updateCanonicalUrl(shareUrl);
    updateMetaTag('meta[property="og:title"]', payload.title);
    updateMetaTag('meta[property="og:description"]', payload.description);
    updateMetaTag('meta[property="og:url"]', shareUrl);
    updateMetaTag('meta[property="og:image"]', shareImageUrl);
    updateMetaTag('meta[property="og:image:alt"]', payload.imageAlt);
    updateMetaTag('meta[name="twitter:title"]', payload.title);
    updateMetaTag('meta[name="twitter:description"]', payload.description);
    updateMetaTag('meta[name="twitter:image"]', shareImageUrl);
  }, [shareEvent, location.pathname, location.search]);

  useEffect(() => {
    if (!showWelcomeModal || currentWorldCupSafariEvents.length === 0) {
      return;
    }

    let isCancelled = false;

    void detectVisitorCountryMatch(currentWorldCupSafariEvents).then(({ matchedTeam }) => {
      if (!isCancelled) {
        setDetectedVisitorTeam(matchedTeam);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [showWelcomeModal, currentWorldCupSafariEvents]);

  useEffect(() => {
    if (popupExitAnimationTimeoutRef.current) {
      clearTimeout(popupExitAnimationTimeoutRef.current);
      popupExitAnimationTimeoutRef.current = null;
    }

    let isUnmounted = false;

    if (activePopupEvent) {
      setRenderedPopupEvent(activePopupEvent);
      setIsPopupClosing(false);
      return;
    }

    if (!renderedPopupEvent) {
      setIsPopupClosing(false);
      return;
    }

    setIsPopupClosing(true);
    popupExitAnimationTimeoutRef.current = setTimeout(() => {
      if (!isUnmounted) {
        setRenderedPopupEvent(null);
        setIsPopupClosing(false);
        popupExitAnimationTimeoutRef.current = null;
      }
    }, UI_TRANSITION_DURATION_MS);

    return () => {
      isUnmounted = true;
      if (popupExitAnimationTimeoutRef.current) {
        clearTimeout(popupExitAnimationTimeoutRef.current);
        popupExitAnimationTimeoutRef.current = null;
      }
    };
  }, [activePopupEvent, renderedPopupEvent]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
      if (popupSwipeAnimationTimeoutRef.current) {
        clearTimeout(popupSwipeAnimationTimeoutRef.current);
      }
      if (popupExitAnimationTimeoutRef.current) {
        clearTimeout(popupExitAnimationTimeoutRef.current);
      }
    };
  }, []);

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
    setFocusedVenueEvent(
      selectedEvent?.dataset === "worldcup" && selectedEvent.eventType === "match"
        ? selectedEvent
        : null
    );
    setIsMobilePopupDismissed(false);
  }, [selectedEvent]);

  const clearHoverTooltip = useCallback(() => {
    if (hoverClearTimeoutRef.current) {
      clearTimeout(hoverClearTimeoutRef.current);
      hoverClearTimeoutRef.current = null;
    }
  }, []);

  const handleWelcomeSelectEvent = useCallback((event: HistoricalEvent | null) => {
    setShowWelcomeModal(false);

    if (!event) {
      return;
    }

    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setHoveredEventState(null);
    setSelectedWorldCupGroup("Todos");
    setPanelQuickFilters([]);
    setIsMobilePopupDismissed(false);
    setSelectedEvent(null);
    setFocusedVenueEvent(event);
    setCurrentYear(event.year);
  }, [clearHoverTooltip]);

  const handleWelcomeViewNextMatch = useCallback(() => {
    handleWelcomeSelectEvent(nextUpcomingGlobalEvent);
  }, [handleWelcomeSelectEvent, nextUpcomingGlobalEvent]);

  // Onboarding CTA: filter for country, close modal, show all country matches, select next match
  const handleWelcomeViewCountryMatch = useCallback(() => {
    if (!detectedVisitorTeam) return;
    setShowWelcomeModal(false);
    setPanelQuickFilters([detectedVisitorTeam]);
    setSelectedWorldCupGroup("Todos");
    setIsMobilePopupDismissed(false);
    setCurrentYear(CURRENT_WORLD_CUP_YEAR);

    // Find all matches for the country
    const normalized = normalizeText(detectedVisitorTeam);
    const countryMatches = currentWorldCupSafariEvents.filter(e =>
      e.eventType === "match" &&
      (normalizeText(e.homeTeam ?? "") === normalized || normalizeText(e.awayTeam ?? "") === normalized)
    );
    // Find next upcoming match
    const now = new Date();
    const nextMatch = countryMatches.find(e => {
      const eventDate = new Date(e.year, (e.month ?? 1) - 1, e.day ?? 1);
      return !e.score && eventDate >= now;
    }) || countryMatches.find(e => !e.score) || countryMatches[0] || null;
    setSelectedEvent(null);
    setFocusedVenueEvent(nextMatch ?? null);
  }, [detectedVisitorTeam, currentWorldCupSafariEvents]);

  const handleHoverEvent = useCallback(
    (event: HistoricalEvent | null, x: number, y: number) => {
      clearHoverTooltip();

      if (event) {
        setIsMobilePopupDismissed(false);
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
    setIsMobilePopupDismissed(true);
    setHoveredEventState(null);
    handleSelectEvent(activePopupEvent);
  }, [activePopupEvent, clearHoverTooltip, handleSelectEvent]);

  const handleDismissPopup = useCallback(() => {
    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setHoveredEventState(null);
    setFocusedVenueEvent(null);
    setIsMobilePopupDismissed(true);
  }, [clearHoverTooltip]);

  const resetMobileFiltersView = useCallback(() => {
    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setHoveredEventState(null);
    setFocusedVenueEvent(null);
    setIsMobilePopupDismissed(false);
  }, [clearHoverTooltip]);

  const handleShowPopupMatch = useCallback((nextMatch: HistoricalEvent) => {
    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setIsMobilePopupDismissed(false);
    setSelectedEvent(null);
    setFocusedVenueEvent(nextMatch);
    setCurrentYear(nextMatch.year);
    setHoveredEventState((prev) => ({ event: nextMatch, x: prev?.x ?? 0, y: prev?.y ?? 0 }));
  }, [clearHoverTooltip]);

  const triggerPopupNavigation = useCallback((direction: number) => {
    if (!activePopupEvent) {
      return false;
    }

    const nextMatch = getChronologicalMatchNavigationEvent(
      swipeablePopupMatches,
      activePopupEvent.id,
      direction
    );

    if (!nextMatch || nextMatch.id === activePopupEvent.id) {
      return false;
    }

    setPopupSwipeDirection(direction < 0 ? "right" : "left");
    setPopupSwipeEventId(activePopupEvent.id);
    setPopupSwipeIncomingEvent(nextMatch);

    if (popupSwipeAnimationTimeoutRef.current) {
      clearTimeout(popupSwipeAnimationTimeoutRef.current);
    }

    popupSwipeAnimationTimeoutRef.current = setTimeout(() => {
      handleShowPopupMatch(nextMatch);
    }, MOBILE_POPUP_SWIPE_DURATION_MS);

    return true;
  }, [activePopupEvent, handleShowPopupMatch, swipeablePopupMatches]);

  const handlePopupNavigation = useCallback((direction: number) => {
    void triggerPopupNavigation(direction);
  }, [triggerPopupNavigation]);

  const beginPopupSwipe = useCallback((clientX: number, clientY: number) => {
    if (isMobile && clientX <= MOBILE_POPUP_LEFT_EDGE_GUARD_PX) {
      popupSwipeStartRef.current = null;
      popupSwipeHandledRef.current = false;
      return;
    }

    popupSwipeStartRef.current = { x: clientX, y: clientY };
    popupSwipeHandledRef.current = false;
  }, [isMobile]);

  const endPopupSwipe = useCallback((clientX: number, clientY: number) => {
    const swipeStart = popupSwipeStartRef.current;
    popupSwipeStartRef.current = null;

    if (!swipeStart) return;

    const deltaX = clientX - swipeStart.x;
    const deltaY = clientY - swipeStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) < 36) {
      popupSwipeHandledRef.current = false;
      return;
    }

    popupSwipeHandledRef.current = true;

    if (absDeltaX > absDeltaY) {
      const direction = deltaX > 0 ? -1 : 1;
      const didNavigate = triggerPopupNavigation(direction);

      if (!didNavigate) {
        popupSwipeHandledRef.current = false;
        return;
      }

      return;
    }

    if (deltaY < -42) {
      handleOpenHoveredMatchInfo();
      return;
    }

    if (deltaY > 42) {
      handleDismissPopup();
    }
  }, [handleDismissPopup, handleOpenHoveredMatchInfo, triggerPopupNavigation]);

  const handleMobilePopupCardClick = useCallback(() => {
    if (popupSwipeHandledRef.current) {
      popupSwipeHandledRef.current = false;
      return;
    }

    handleOpenHoveredMatchInfo();
  }, [handleOpenHoveredMatchInfo]);

  const applyVenueFilter = useCallback((event: HistoricalEvent) => {
    const venueLabel = event.city ?? event.region;
    if (!venueLabel) return;

    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setIsMobilePopupDismissed(true);
    setHoveredEventState(null);
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
    setIsMobilePopupDismissed(true);
    setHoveredEventState(null);
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
    setIsMobilePopupDismissed(false);
    setHoveredEventState(null);
    setSelectedEvent(null);
    setFocusedVenueEvent(event);
    setCurrentYear(event.year);
    setSelectedWorldCupGroup("Todos");
    setPanelQuickFilters([teamName]);
  }, [clearHoverTooltip]);

  const handleSelectVenueFromMap = useCallback((event: HistoricalEvent, x = 0, y = 0) => {
    clearHoverTooltip();
    hoverTooltipInteractingRef.current = false;
    setIsMobilePopupDismissed(false);

    setSelectedEvent(null);
    setFocusedVenueEvent(event);
    setCurrentYear(event.year);
    setHoveredEventState({ event, x, y });
  }, [clearHoverTooltip]);

  const isAnimatedPopupSwipe = Boolean(
    isMobile
      && popupSwipeDirection
      && popupSwipeIncomingEvent
      && renderedPopupEvent
      && renderedPopupEvent.id === popupSwipeEventId
  );

  const renderPopupCardContent = (popupEvent: HistoricalEvent) => {
    const popupIsNextUpcoming = Boolean(
      nextUpcomingPopupEvent && popupEvent.id === nextUpcomingPopupEvent.id
    );
    const currentPopupIndex = popupTournamentMatches.findIndex((event) => event.id === popupEvent.id);
    const hasPreviousPopupMatch = currentPopupIndex > 0;
    const hasNextPopupMatch = currentPopupIndex !== -1 && currentPopupIndex < popupTournamentMatches.length - 1;

    return popupEvent.dataset === "worldcup" && popupEvent.eventType === "match" ? (
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 pr-10">
          <div className="flex items-center gap-2">
            <p
              className="text-[14px] font-semibold leading-tight"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Próximo partido del torneo
            </p>
            <span className="text-[14px] font-semibold leading-tight" style={{ color: "hsl(var(--foreground))" }}>
              ({currentPopupIndex + 1}/{popupTournamentMatches.length})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {popupEvent.groupName ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleApplyGroupFilter(popupEvent);
              }}
              className="rounded-full px-2.5 py-1 font-mono-space text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
              style={{
                color: "hsl(var(--primary))",
                background: "hsl(var(--primary) / 0.12)",
              }}
            >
              {popupEvent.groupName}
            </button>
          ) : (
            <span
              className="rounded-full px-2.5 py-1 font-mono-space text-[10px] uppercase tracking-[0.18em]"
              style={{
                color: "hsl(var(--primary))",
                background: "hsl(var(--primary) / 0.12)",
              }}
            >
              {popupEvent.stage ?? "Partido"}
            </span>
          )}
          {/* Calendar & Share inline with group */}
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-opacity hover:opacity-85 ml-1"
                  style={{
                    borderColor: "hsl(var(--border) / 0.7)",
                    background: "hsl(var(--muted) / 0.2)",
                    color: "hsl(var(--muted-foreground))",
                  }}
                  aria-label="Agendar partido"
                  title="Agendar partido"
                  onClick={e => { e.stopPropagation(); }}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-2 w-56">
                <div className="font-semibold mb-2 text-[13px]">Agendar partido</div>
                {CALENDAR_PROVIDER_ACTIONS.map((action) => {
                  const entry = buildMatchCalendarEntry(popupEvent);
                  if (!entry) return null;
                  if (action.id === "google") {
                    return (
                      <a
                        key="google"
                        href={buildGoogleCalendarUrl(entry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer text-[14px]"
                      >
                        <Calendar className="w-4 h-4 mr-1" /> Google Calendar
                      </a>
                    );
                  }
                  if (action.id === "ics") {
                    return (
                      <button
                        key="ics"
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer text-[14px] w-full text-left"
                        onClick={() => {
                          const ics = buildIcsCalendar([entry]);
                          const blob = new Blob([ics], { type: "text/calendar" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${entry.title}.ics`;
                          document.body.appendChild(a);
                          a.click();
                          setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }, 100);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-1" /> Descargar .ics
                      </button>
                    );
                  }
                  return null;
                })}
              </PopoverContent>
            </Popover>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handleCopyMatchLink(popupEvent, false);
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-opacity hover:opacity-85 ml-1"
              style={{
                borderColor: "hsl(var(--border) / 0.7)",
                background: "hsl(var(--muted) / 0.2)",
                color: copiedPopupMatchId === popupEvent.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
              aria-label={copiedPopupMatchId === popupEvent.id ? "Link copiado" : "Copiar link del partido"}
              title={copiedPopupMatchId === popupEvent.id ? "Link copiado" : "Copiar link del partido"}
            >
              {copiedPopupMatchId === popupEvent.id ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div
          className="flex flex-col gap-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          <p
            className="text-[12px] uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {formatExplicitEventDate(popupEvent, { includeEra: false, includeTime: true })}
          </p>
          <MatchTeamsRow
            event={popupEvent}
            variant="regular"
            centerContent={popupEvent.score ? `${popupEvent.score.home}-${popupEvent.score.away}` : "vs"}
            onHomeTeamClick={() => handleApplyTeamFilter(popupEvent.homeTeam, popupEvent)}
            onAwayTeamClick={() => handleApplyTeamFilter(popupEvent.awayTeam, popupEvent)}
          />
        </div>

        <div className="space-y-1">
          
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              applyVenueFilter(popupEvent);
            }}
            className="text-left text-[15px] font-semibold leading-tight transition-opacity hover:opacity-80"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {popupEvent.city ?? popupEvent.region}
          </button>
        </div>

        {/* Navigation and info button */}
        <div className="flex items-center justify-between gap-3 mt-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenHoveredMatchInfo();
            }}
            className="rounded-md px-0 py-0.5 text-[12px] font-semibold transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--primary))" }}
          >
            Ver información del partido
          </button>
          <div className="flex items-center gap-2">
            {hasPreviousPopupMatch && (
              <button
                type="button"
                aria-label="Partido anterior"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-opacity hover:opacity-85"
                style={{
                  borderColor: "hsl(var(--border) / 0.7)",
                  background: "hsl(var(--muted) / 0.2)",
                  color: "hsl(var(--primary))",
                }}
                onClick={e => {
                  e.stopPropagation();
                  handlePopupNavigation(-1);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {/* <span className="text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              {`Partido ${currentPopupIndex + 1}/${popupTournamentMatches.length}`}
            </span> */}
            {hasNextPopupMatch && (
              <button
                type="button"
                aria-label="Partido siguiente"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-opacity hover:opacity-85"
                style={{
                  borderColor: "hsl(var(--border) / 0.7)",
                  background: "hsl(var(--muted) / 0.2)",
                  color: "hsl(var(--primary))",
                }}
                onClick={e => {
                  e.stopPropagation();
                  handlePopupNavigation(1);
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-1">
        <span
          className="font-mono-space text-xs font-bold leading-snug"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {popupEvent.title}
        </span>
        <p
          className="text-[10px] leading-relaxed line-clamp-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {popupEvent.description}
        </p>
        <span
          className="font-mono-space text-[9px] mt-0.5"
          style={{ color: "hsl(var(--primary))" }}
        >
          {formatYear(popupEvent.year)}
        </span>
      </div>
    );
  };

  const renderPopupCard = (
    popupEvent: HistoricalEvent,
    variant: "single" | "outgoing" | "incoming"
  ) => {
    const baseStyle: CSSProperties = {
      background: isMobile ? "hsl(var(--card))" : "hsl(var(--card) / 0.97)",
      border: "1px solid hsl(var(--border))",
      borderTopLeftRadius: isMobile ? "24px" : undefined,
      borderTopRightRadius: isMobile ? "24px" : undefined,
      boxShadow: isMobile ? "0 -16px 40px hsl(0 0% 0% / 0.42)" : "0 10px 28px hsl(0 0% 0% / 0.42)",
      backdropFilter: "blur(10px)",
      touchAction: isMobile ? "none" : "auto",
    };

    if (variant === "single" && isMobile) {
      baseStyle.transition = "transform 500ms ease-in-out, opacity 500ms ease-in-out";
      if (isPopupClosing && !activePopupEvent) {
        baseStyle.transform = "translateY(110%)";
        baseStyle.opacity = 0;
      }
    }

    if (variant !== "single" && isMobile) {
      baseStyle.position = "absolute";
      baseStyle.inset = 0;
      baseStyle.pointerEvents = "none";
      baseStyle.willChange = "transform, opacity";
      baseStyle.animation = popupSwipeDirection === "left"
        ? variant === "outgoing"
          ? `mobile-popup-card-exit-left ${MOBILE_POPUP_SWIPE_DURATION_MS}ms ease-in-out forwards`
          : `mobile-popup-card-enter-right ${MOBILE_POPUP_SWIPE_DURATION_MS}ms ease-in-out forwards`
        : variant === "outgoing"
          ? `mobile-popup-card-exit-right ${MOBILE_POPUP_SWIPE_DURATION_MS}ms ease-in-out forwards`
          : `mobile-popup-card-enter-left ${MOBILE_POPUP_SWIPE_DURATION_MS}ms ease-in-out forwards`;
      baseStyle.zIndex = variant === "incoming" ? 2 : 1;
    }

    return (
      <div
        key={`${variant}-${popupEvent.id}`}
        className={`border px-3.5 py-3 shadow-xl ${variant === "single" ? "pointer-events-auto" : "pointer-events-none"} ${
          isMobile ? "w-full rounded-none border-b-0 border-l-0 border-r-0 px-4 pb-4 pt-3" : "relative rounded-xl"
        }`}
        style={baseStyle}
        onClick={variant === "single" && isMobile ? handleMobilePopupCardClick : undefined}
        onTouchStart={variant === "single" && isMobile ? (event) => beginPopupSwipe(event.touches[0].clientX, event.touches[0].clientY) : undefined}
        onTouchEnd={variant === "single" && isMobile ? (event) => endPopupSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY) : undefined}
        onPointerDown={variant === "single" && isMobile ? (event) => beginPopupSwipe(event.clientX, event.clientY) : undefined}
        onPointerUp={variant === "single" && isMobile ? (event) => endPopupSwipe(event.clientX, event.clientY) : undefined}
        onMouseEnter={() => {
          hoverTooltipInteractingRef.current = true;
          clearHoverTooltip();
        }}
        onMouseLeave={() => {
          hoverTooltipInteractingRef.current = false;
          setHoveredEventState(null);
        }}
      >
        {isMobile && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDismissPopup();
            }}
            aria-label="Cerrar tooltip del mapa"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold transition-opacity hover:opacity-80"
            style={{
              background: "hsl(var(--muted) / 0.55)",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            ×
          </button>
        )}
        {renderPopupCardContent(popupEvent)}
      </div>
    );
  };

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
        ["--timeline-height" as string]: shouldHideBottomNavigation
          ? "0px"
          : showStandaloneGroupsDrawer
            ? (isGroupsDrawerExpanded ? "156px" : "58px")
            : showWorldCupGroupsDrawer
              ? "0px"
              : "96px",
      } as CSSProperties}
    >
      {/* ── Globe ── */}
      {cesiumReady ? (
        <CesiumGlobe
          events={mapVisibleEvents}
          allEvents={allDatasetEvents}
          selectedEvent={selectedEvent}
          focusedEvent={activePopupEvent}
          viewportInsets={globeViewportInsets}
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
      {renderedPopupEvent && (
        <div
          className={
            isMobile
              ? "fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end pointer-events-none"
              : "fixed z-50 pointer-events-none"
          }
          style={
            !isMobile && hoveredEventState
              ? {
                  left: hoveredEventState.x + 14,
                  top: hoveredEventState.y - 8,
                  maxWidth: renderedPopupEvent.dataset === "worldcup" ? "280px" : "220px",
                  transform:
                    hoveredEventState.x > window.innerWidth - 260
                      ? "translateX(-110%)"
                      : undefined,
                }
              : isMobile
                ? undefined
                : {
                    left: "18px",
                    bottom: "calc(var(--timeline-height) + 18px)",
                    maxWidth: renderedPopupEvent.dataset === "worldcup" ? "320px" : "240px",
                  }
          }
        >
          <div
            ref={isMobile ? mobilePopupCardRef : undefined}
            className={isAnimatedPopupSwipe ? "pointer-events-auto relative overflow-hidden" : undefined}
            style={isAnimatedPopupSwipe ? { minHeight: mobilePopupCardHeight || undefined } : undefined}
          >
            {isAnimatedPopupSwipe && renderedPopupEvent && popupSwipeIncomingEvent
              ? [
                  renderPopupCard(renderedPopupEvent, "outgoing"),
                  renderPopupCard(popupSwipeIncomingEvent, "incoming"),
                ]
              : renderPopupCard(renderedPopupEvent, "single")}
          </div>
        </div>
      )}



      {/* ── App badge (top-left) as dropdown menu ── */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`fixed z-40 rounded-full cursor-pointer transition-colors hover:bg-white/5 flex items-center gap-2 ${
              isMobile ? "top-3 left-3 px-3 py-1.5" : "top-5 left-6 px-4 py-2"
            }`}
            style={{
              background: "hsl(var(--card) / 0.85)",
              border: "1px solid hsl(var(--border))",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Abrir menú principal"
          >
            <img
              src="/favicon-soccer.svg"
              alt="Logo"
              className={isMobile ? "w-5 h-5" : "w-6 h-6"}
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <span
              className={`font-mono-space font-semibold uppercase tracking-[0.18em] ${isMobile ? "text-[10px]" : "text-xs"}`}
              style={{ color: "hsl(var(--foreground))" }}
            >
              Mundial 2026
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={isMobile ? "w-4 h-4 ml-1" : "w-5 h-5 ml-1"}
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} className="p-0 w-80 border-none bg-[hsl(var(--popover))] shadow-xl">
          <div className="flex flex-col">
            <button
              type="button"
              className="flex items-center gap-3 px-6 py-4 text-base font-normal rounded-none hover:bg-[hsl(var(--muted)/0.13)] transition-colors text-left"
              style={{ color: "hsl(var(--foreground))" }}
              onClick={() => setShowSafariModal(true)}
            >
              <Trophy className="w-6 h-6 opacity-90" />
              Ver mundiales anteriores
            </button>
            <button
              type="button"
              className="flex items-center gap-3 px-6 py-4 text-base font-normal rounded-none hover:bg-[hsl(var(--muted)/0.13)] transition-colors text-left"
              style={{ color: "hsl(var(--foreground))" }}
              onClick={() => setShowWelcomeModal(true)}
            >
              <Sparkles className="w-6 h-6 opacity-90" />
              Ver inicio rapido
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {showMobileContextChips && (
        <div className="fixed left-4 top-[4.7rem] z-40 flex max-w-[calc(100vw-2rem)] flex-col gap-2">
          {selectedWorldCupGroup !== "Todos" && (
            <button
              type="button"
              onClick={() => {
                setSelectedWorldCupGroup("Todos");
                resetMobileFiltersView();
              }}
              className="inline-flex w-fit max-w-full items-center gap-2 rounded-full px-4 py-3 font-mono-space text-[10px] uppercase tracking-[0.18em] shadow-lg"
              style={{
                color: "hsl(var(--primary))",
                background: "hsl(var(--card) / 0.94)",
                border: "1px solid hsl(var(--primary) / 0.28)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="truncate">Grupo {selectedWorldCupGroup}</span>
              <span aria-hidden="true">×</span>
            </button>
          )}
          {panelQuickFilters.slice(0, 2).map((chip) => (
            <button
              key={`context-${chip}`}
              type="button"
              onClick={() => {
                setPanelQuickFilters((prev) => prev.filter((value) => value !== chip));
                resetMobileFiltersView();
              }}
              className="inline-flex w-fit max-w-full items-center gap-2 rounded-full px-4 py-3 text-left font-mono-space text-[10px] uppercase tracking-[0.18em] shadow-lg"
              style={{
                color: "hsl(var(--foreground))",
                background: "hsl(var(--card) / 0.94)",
                border: "1px solid hsl(var(--border))",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="truncate">{`Partidos de ${chip}`}</span>
              <span aria-hidden="true" style={{ color: "hsl(var(--primary))" }}>×</span>
            </button>
          ))}
        </div>
      )}

      {!shouldPrioritizeMobilePopup && (
        <ThemeSwitcher
          mapStyle={mapStyle}
          onMapStyleChange={(style) => setMapStyle(style)}
          panelOffset={rightPanelOffset}
          isMobile={isMobile}
        />
      )}

      {/* ── Instruction overlay (top-center) ── */}
      {!selectedEvent && showInstructionHint && !shouldPrioritizeMobilePopup && (
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
        onViewOnMap={handleViewEventOnMap}
        onCloseSafari={handleCloseSafari}
        forceOpen={timelineHoverActive}
        onMediaModalChange={setIsMediaModalOpen}
        onVisibleEventsChange={handlePanelVisibleEventsChange}
        onQuickFiltersChange={handlePanelQuickFiltersChange}
        onPanelOffsetChange={setRightPanelOffset}
        activeGroupFilter={showWorldCupGroupsDrawer ? selectedWorldCupGroup : undefined}
        onClearGroupFilter={() => {
          setSelectedWorldCupGroup("Todos");
          setFocusedVenueEvent(null);
          setHoveredEventState(null);
          setIsMobilePopupDismissed(true);
        }}
        quickFiltersFromRoute={panelQuickFilters}
        isMobile={isMobile}
        hideCollapsedTrigger={Boolean(selectedEvent) || isMobilePanelOpen || showWelcomeModal}
        collapsedBottomOffset={mobileCalendarioOffset}
        worldCupGroups={worldCupGroupOptions}
        onSelectGroupFilter={setSelectedWorldCupGroup}
      />

      {/* ── Bottom navigation ── */}
      {!shouldHideBottomNavigation && (showStandaloneGroupsDrawer ? (
        <WorldCupGroupsDrawer
          groups={worldCupGroupOptions}
          selectedGroup={selectedWorldCupGroup}
          onSelectGroup={setSelectedWorldCupGroup}
          isExpanded={isGroupsDrawerExpanded}
          onToggleExpanded={() => setIsGroupsDrawerExpanded((value) => !value)}
          isMediaModalOpen={isMediaModalOpen}
          title="Grupos · Copa Mundial 2026"
        />
      ) : !showWorldCupGroupsDrawer ? (
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
      ) : null)}

      <SafariSelectionModal
        isOpen={showSafariModal}
        safaris={datasetSafaris}
        allEvents={allDatasetEvents}
        onSelectSafari={handleSelectSafari}
        onJumpToEvent={handleJumpToSafariEvent}
        onClose={() => setShowSafariModal(false)}
        title={datasetMode === "worldcup" ? "Safaris Mundialistas" : "Safaris Históricos"}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        countryLabel={detectedVisitorTeam}
        countryFlagCode={detectedVisitorFlagCode}
        isCountryActionDisabled={!nextUpcomingCountryEvent}
        onViewNextMatch={handleWelcomeViewNextMatch}
        onViewCountryMatch={handleWelcomeViewCountryMatch}
        onExploreFreely={handleDismissWelcomeModal}
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
