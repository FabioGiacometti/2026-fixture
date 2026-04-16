import { formatEventDate, formatExplicitEventDate, type HistoricalEvent, type Safari } from "@/data/historical-events";

export const ACTIVE_EVENT_COLOR = "#22C55E";
export const INACTIVE_EVENT_COLOR = "#F2A900";
export const DEFAULT_LABEL_COLOR = "#E1E3E8";

export interface MapThemeColors {
  sceneBackground: string;
  labelOutlineColor: string;
  safariPathColor: string;
  countryOutlineColor: string;
  tooltipBackgroundColor: string;
}

function getThemeCssColor(tokenName: string, fallback: string) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }

  const tokenValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();

  if (!tokenValue) {
    return fallback;
  }

  const probe = document.createElement("span");
  probe.style.color = fallback;
  probe.style.color = `hsl(${tokenValue})`;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);

  const resolvedColor = window.getComputedStyle(probe).color;
  probe.remove();

  return resolvedColor || fallback;
}

export function getMapThemeColors(): MapThemeColors {
  return {
    sceneBackground: getThemeCssColor("--map-scene-background", "#0A1020"),
    labelOutlineColor: getThemeCssColor("--map-label-outline", "#0A1020"),
    safariPathColor: getThemeCssColor("--map-safari-path", INACTIVE_EVENT_COLOR),
    countryOutlineColor: getThemeCssColor("--map-country-outline", ACTIVE_EVENT_COLOR),
    tooltipBackgroundColor: getThemeCssColor("--card", "#2D3039"),
  };
}

export const ACTIVE_EVENT_ZOOM_PERCENT = 80;
export const MATCH_EVENT_ZOOM_PERCENT = 100;

const BASE_MIN_CAMERA_HEIGHT = 500;
const ZOOM_OUT_EXTENSION_FACTOR = 1.3;

export const MIN_CAMERA_HEIGHT = BASE_MIN_CAMERA_HEIGHT;
export const DEFAULT_MAX_CAMERA_HEIGHT = 22_000_000;
const EARTH_RADIUS_METERS = 6_378_137;
const DEFAULT_CAMERA_FOV_RADIANS = Math.PI / 3;
const WHEEL_ZOOM_STEP = 0.0025;

function getClampedMaxCameraHeight(maxHeight = DEFAULT_MAX_CAMERA_HEIGHT) {
  const safeMaxHeight = Number.isFinite(maxHeight) ? maxHeight : DEFAULT_MAX_CAMERA_HEIGHT;
  return Math.max(MIN_CAMERA_HEIGHT, safeMaxHeight);
}

export function getMaxZoomOutCameraHeight(viewportWidth: number, viewportHeight: number): number {
  const safeWidth = Math.max(1, Number.isFinite(viewportWidth) ? viewportWidth : 1);
  const safeHeight = Math.max(1, Number.isFinite(viewportHeight) ? viewportHeight : 1);
  const aspectRatio = safeWidth / safeHeight;
  const limitingFov = aspectRatio >= 1
    ? DEFAULT_CAMERA_FOV_RADIANS
    : 2 * Math.atan(Math.tan(DEFAULT_CAMERA_FOV_RADIANS / 2) * aspectRatio);

  // On desktop, leave a little extra breathing room so the full globe sits comfortably
  // inside the viewport instead of touching the top and bottom edges.
  const viewportFillRatio = safeWidth >= 1024 ? 0.9 : 1;
  const halfFov = Math.max((limitingFov * viewportFillRatio) / 2, 0.01);
  const centerDistance = EARTH_RADIUS_METERS / Math.sin(halfFov);
  const expandedHeight = (centerDistance - EARTH_RADIUS_METERS) * ZOOM_OUT_EXTENSION_FACTOR;

  return Math.round(
    Math.min(DEFAULT_MAX_CAMERA_HEIGHT, Math.max(MIN_CAMERA_HEIGHT, expandedHeight))
  );
}

function clampCameraHeight(height: number, maxHeight = DEFAULT_MAX_CAMERA_HEIGHT): number {
  const clampedMaxHeight = getClampedMaxCameraHeight(maxHeight);
  const safeHeight = Number.isFinite(height) ? height : clampedMaxHeight;

  return Math.round(Math.min(clampedMaxHeight, Math.max(MIN_CAMERA_HEIGHT, safeHeight)));
}

export function getWheelZoomCameraHeight(
  currentHeight: number,
  deltaY: number,
  maxHeight = DEFAULT_MAX_CAMERA_HEIGHT
): number {
  const clampedCurrentHeight = clampCameraHeight(currentHeight, maxHeight);
  const safeDeltaY = Number.isFinite(deltaY) ? deltaY : 0;

  if (safeDeltaY === 0) {
    return clampedCurrentHeight;
  }

  const zoomScale = Math.exp(Math.abs(safeDeltaY) * WHEEL_ZOOM_STEP);
  const nextHeight = safeDeltaY > 0
    ? clampedCurrentHeight * zoomScale
    : clampedCurrentHeight / zoomScale;

  return clampCameraHeight(nextHeight, maxHeight);
}

export interface CountryBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

const WORLD_CUP_COUNTRY_BOUNDS: Record<string, CountryBounds> = {
  "1930": { west: -58.5, south: -35.1, east: -53.0, north: -30.0 },
  "1934": { west: 6.6, south: 36.4, east: 18.7, north: 47.2 },
  "1938": { west: -5.3, south: 41.0, east: 9.7, north: 51.2 },
  "1950": { west: -74.5, south: -33.8, east: -34.8, north: 5.4 },
  "1954": { west: 5.9, south: 45.7, east: 10.6, north: 47.9 },
  "1958": { west: 11.0, south: 55.1, east: 24.3, north: 69.3 },
  "1962": { west: -75.8, south: -56.0, east: -66.3, north: -17.4 },
  "1966": { west: -6.0, south: 49.8, east: 2.1, north: 56.0 },
  "1970": { west: -118.5, south: 14.5, east: -86.5, north: 32.9 },
  "1974": { west: 5.9, south: 47.2, east: 15.1, north: 55.1 },
  "1978": { west: -73.6, south: -55.3, east: -53.6, north: -21.8 },
  "1982": { west: -9.5, south: 35.8, east: 4.4, north: 43.8 },
  "1986": { west: -118.5, south: 14.5, east: -86.5, north: 32.9 },
  "1990": { west: 6.6, south: 36.4, east: 18.7, north: 47.2 },
  "1994": { west: -125.0, south: 24.0, east: -66.5, north: 49.5 },
  "1998": { west: -5.3, south: 41.0, east: 9.7, north: 51.2 },
  "2002": { west: 124.0, south: 24.0, east: 146.2, north: 45.8 },
  "2006": { west: 5.9, south: 47.2, east: 15.1, north: 55.1 },
  "2010": { west: 16.0, south: -35.0, east: 33.2, north: -21.0 },
  "2014": { west: -74.5, south: -33.8, east: -34.8, north: 5.4 },
  "2018": { west: 19.6, south: 41.2, east: 180.0, north: 81.9 },
  "2022": { west: 50.6, south: 24.3, east: 51.7, north: 26.2 },
  "2026": { west: -123.5, south: 14.0, east: -73.0, north: 56.5 },
};

export interface MarkerAppearance {
  pixelSize: number;
  color: string;
  colorAlpha: number;
  outlineColor: string;
  outlineWidth: number;
}

export interface ZoomIndicatorState {
  label: "Local" | "Regional" | "Continental" | "Global";
  percent: number;
  altitudeKm: number;
}

export function getMarkerAppearance(
  isSelected: boolean,
  emphasizeVenue = false,
  useSoftFocus = false
): MarkerAppearance {
  const activeMarkerColor = getThemeCssColor("--primary", ACTIVE_EVENT_COLOR);
  const inactiveMarkerColor = getThemeCssColor("--secondary", INACTIVE_EVENT_COLOR);
  const inactiveMarkerSize = 10;
  const activeMarkerSize = 14;

  if (useSoftFocus) {
    return {
      pixelSize: activeMarkerSize,
      color: activeMarkerColor,
      colorAlpha: 0.78,
      outlineColor: activeMarkerColor,
      outlineWidth: 0,
    };
  }

  if (isSelected) {
    return {
      pixelSize: activeMarkerSize,
      color: activeMarkerColor,
      colorAlpha: 1,
      outlineColor: activeMarkerColor,
      outlineWidth: 0,
    };
  }

  if (emphasizeVenue) {
    return {
      pixelSize: inactiveMarkerSize,
      color: inactiveMarkerColor,
      colorAlpha: 0.8,
      outlineColor: inactiveMarkerColor,
      outlineWidth: 0,
    };
  }

  return {
    pixelSize: inactiveMarkerSize,
    color: inactiveMarkerColor,
    colorAlpha: 0.68,
    outlineColor: inactiveMarkerColor,
    outlineWidth: 0,
  };
}

function getEventSortValue(event: Pick<HistoricalEvent, "year" | "month" | "day" | "kickoff">): number {
  const dateValue = new Date(event.year, (event.month ?? 1) - 1, event.day ?? 1).getTime();
  const kickoffValue = event.kickoff
    ? Number.parseInt(event.kickoff.replace(":", ""), 10)
    : 9999;

  return dateValue * 10_000 + kickoffValue;
}

export function isUpcomingWorldCupMatch(
  event: Pick<HistoricalEvent, "dataset" | "eventType" | "score"> | null | undefined
): boolean {
  return Boolean(event && event.dataset === "worldcup" && event.eventType === "match" && !event.score);
}

function getFlagEmoji(countryCode?: string | null) {
  if (!countryCode) return "";

  const normalizedCode = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalizedCode)) return "";

  return String.fromCodePoint(
    ...normalizedCode.split("").map((char) => 127397 + char.charCodeAt(0))
  );
}

export function getUpcomingMatchTooltipLabel(
  event: Pick<HistoricalEvent, "city" | "region" | "homeTeam" | "awayTeam" | "homeFlag" | "awayFlag" | "year" | "month" | "day" | "kickoff">
): string {
  const venueLine = event.city ?? event.region ?? "Sede";
  const dateLine = formatExplicitEventDate(event, { includeEra: false, includeTime: true });
  const homeLabel = `${getFlagEmoji(event.homeFlag)} ${event.homeTeam ?? "Local"}`.trim();
  const awayLabel = `${getFlagEmoji(event.awayFlag)} ${event.awayTeam ?? "Visitante"}`.trim();

  return `${venueLine}\n${dateLine}\n${homeLabel} vs ${awayLabel}`;
}

function getSortedUpcomingWorldCupMatches(events: HistoricalEvent[]): HistoricalEvent[] {
  return events
    .filter((event) => isUpcomingWorldCupMatch(event))
    .sort((a, b) => getEventSortValue(a) - getEventSortValue(b));
}

export function getWorldCupVenueKey(
  event: Pick<HistoricalEvent, "city" | "region" | "lat" | "lng" | "dataset" | "eventType"> | null | undefined
): string | null {
  if (!event || event.dataset !== "worldcup" || event.eventType !== "match") {
    return null;
  }

  const latKey = Number.isFinite(event.lat) ? event.lat.toFixed(4) : "na";
  const lngKey = Number.isFinite(event.lng) ? event.lng.toFixed(4) : "na";
  return `${event.city ?? event.region ?? "unknown-venue"}|${latKey}|${lngKey}`;
}

export function getUpcomingWorldCupVenueMapEvents(events: HistoricalEvent[]): HistoricalEvent[] {
  const uniqueVenueEvents = new Map<string, HistoricalEvent>();

  getSortedUpcomingWorldCupMatches(events).forEach((event) => {
    const venueKey = getWorldCupVenueKey(event);
    if (!venueKey || uniqueVenueEvents.has(venueKey)) {
      return;
    }

    uniqueVenueEvents.set(venueKey, event);
  });

  return [...uniqueVenueEvents.values()];
}

export function getChronologicalMatchNavigationEvent(
  events: HistoricalEvent[],
  currentEventId: string | null | undefined,
  direction: number
): HistoricalEvent | null {
  const sortedMatches = events
    .filter((event) => (event.eventType ?? "match") === "match")
    .sort((a, b) => getEventSortValue(a) - getEventSortValue(b));

  if (sortedMatches.length === 0) return null;
  if (!currentEventId) return sortedMatches[0] ?? null;

  const currentIndex = sortedMatches.findIndex((event) => event.id === currentEventId);
  if (currentIndex === -1) {
    return sortedMatches[0] ?? null;
  }

  const normalizedDirection = direction < 0 ? -1 : 1;
  const nextIndex = (currentIndex + normalizedDirection + sortedMatches.length) % sortedMatches.length;
  return sortedMatches[nextIndex] ?? sortedMatches[0] ?? null;
}

export function getNextUpcomingWorldCupEvent(events: HistoricalEvent[]): HistoricalEvent | null {
  return getSortedUpcomingWorldCupMatches(events)[0] ?? null;
}

export function getUpcomingWorldCupMapEvents(events: HistoricalEvent[]): HistoricalEvent[] {
  return getUpcomingWorldCupVenueMapEvents(events);
}

export function getCameraHeightForZoomPercent(percent: number, maxHeight = DEFAULT_MAX_CAMERA_HEIGHT): number {
  const safePercent = Number.isFinite(percent) ? percent : 0;
  const clampedPercent = Math.min(100, Math.max(0, safePercent));
  const clampedMaxHeight = getClampedMaxCameraHeight(maxHeight);
  const zoomRange = Math.log10(clampedMaxHeight) - Math.log10(MIN_CAMERA_HEIGHT);
  const logHeight = Math.log10(clampedMaxHeight) - (clampedPercent / 100) * zoomRange;

  return Math.round(10 ** logHeight);
}

export function getEventZoomPercent(
  event: Pick<HistoricalEvent, "dataset" | "eventType"> | null | undefined
): number {
  if (event?.dataset === "worldcup" && event.eventType === "match") {
    return MATCH_EVENT_ZOOM_PERCENT;
  }

  return ACTIVE_EVENT_ZOOM_PERCENT;
}

export function getSafariPathEvents(
  safari: Pick<Safari, "eventIds"> | null | undefined,
  allEvents: HistoricalEvent[],
  visibleEvents: HistoricalEvent[]
): HistoricalEvent[] {
  if (!safari?.eventIds?.length || visibleEvents.length < 2) {
    return [];
  }

  const visibleIds = new Set(visibleEvents.map((event) => event.id));

  return safari.eventIds
    .map((id) => allEvents.find((event) => event.id === id))
    .filter((event): event is HistoricalEvent => Boolean(event) && visibleIds.has(event.id));
}

export function getWorldCupCountryBounds(tournamentId?: string | null): CountryBounds | null {
  const year = tournamentId?.match(/\d{4}/)?.[0];
  if (!year) return null;

  return WORLD_CUP_COUNTRY_BOUNDS[year] ?? null;
}

export function getZoomIndicatorState(heightMeters: number, maxHeight = DEFAULT_MAX_CAMERA_HEIGHT): ZoomIndicatorState {
  const clampedMaxHeight = getClampedMaxCameraHeight(maxHeight);
  const safeHeight = Number.isFinite(heightMeters) ? heightMeters : clampedMaxHeight;
  const clampedHeight = Math.min(clampedMaxHeight, Math.max(MIN_CAMERA_HEIGHT, safeHeight));

  // Cesium camera altitude spans several orders of magnitude, so a logarithmic curve
  // gives users a more intuitive "how close am I?" indicator than a linear scale.
  const zoomRange = Math.log10(clampedMaxHeight) - Math.log10(MIN_CAMERA_HEIGHT);
  const zoomProgress = Math.log10(clampedMaxHeight) - Math.log10(clampedHeight);
  const percent = Math.round((zoomProgress / zoomRange) * 100);

  let label: ZoomIndicatorState["label"] = "Global";

  if (clampedHeight <= 1_000_000) {
    label = "Local";
  } else if (clampedHeight <= 3_500_000) {
    label = "Regional";
  } else if (clampedHeight <= 8_000_000) {
    label = "Continental";
  }

  return {
    label,
    percent,
    altitudeKm: Math.round(clampedHeight / 1_000),
  };
}
