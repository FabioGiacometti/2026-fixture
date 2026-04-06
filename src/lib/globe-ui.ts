import type { HistoricalEvent } from "@/data/historical-events";

export const ACTIVE_EVENT_COLOR = "#22C55E";
export const INACTIVE_EVENT_COLOR = "#F2A900";
export const DEFAULT_LABEL_COLOR = "#E1E3E8";
export const ACTIVE_EVENT_ZOOM_PERCENT = 80;
export const MATCH_EVENT_ZOOM_PERCENT = 100;

const MIN_CAMERA_HEIGHT = 10_000;
const MAX_CAMERA_HEIGHT = 22_000_000;

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
};

export interface MarkerAppearance {
  pixelSize: number;
  color: string;
  colorAlpha: number;
  outlineColor: string;
  outlineWidth: number;
  labelColor: string;
}

export interface ZoomIndicatorState {
  label: "Local" | "Regional" | "Continental" | "Global";
  percent: number;
  altitudeKm: number;
}

export function getMarkerAppearance(isSelected: boolean): MarkerAppearance {
  if (isSelected) {
    return {
      pixelSize: 16,
      color: ACTIVE_EVENT_COLOR,
      colorAlpha: 1,
      outlineColor: "#DCFCE7",
      outlineWidth: 8,
      labelColor: ACTIVE_EVENT_COLOR,
    };
  }

  return {
    pixelSize: 8,
    color: INACTIVE_EVENT_COLOR,
    colorAlpha: 0.65,
    outlineColor: "#F2A900",
    outlineWidth: 0,
    labelColor: DEFAULT_LABEL_COLOR,
  };
}

export function getCameraHeightForZoomPercent(percent: number): number {
  const safePercent = Number.isFinite(percent) ? percent : 0;
  const clampedPercent = Math.min(100, Math.max(0, safePercent));
  const zoomRange = Math.log10(MAX_CAMERA_HEIGHT) - Math.log10(MIN_CAMERA_HEIGHT);
  const logHeight = Math.log10(MAX_CAMERA_HEIGHT) - (clampedPercent / 100) * zoomRange;

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

export function getWorldCupCountryBounds(tournamentId?: string | null): CountryBounds | null {
  const year = tournamentId?.match(/\d{4}/)?.[0];
  if (!year) return null;

  return WORLD_CUP_COUNTRY_BOUNDS[year] ?? null;
}

export function getZoomIndicatorState(heightMeters: number): ZoomIndicatorState {
  const safeHeight = Number.isFinite(heightMeters) ? heightMeters : MAX_CAMERA_HEIGHT;
  const clampedHeight = Math.min(MAX_CAMERA_HEIGHT, Math.max(MIN_CAMERA_HEIGHT, safeHeight));

  // Cesium camera altitude spans several orders of magnitude, so a logarithmic curve
  // gives users a more intuitive "how close am I?" indicator than a linear scale.
  const zoomRange = Math.log10(MAX_CAMERA_HEIGHT) - Math.log10(MIN_CAMERA_HEIGHT);
  const zoomProgress = Math.log10(MAX_CAMERA_HEIGHT) - Math.log10(clampedHeight);
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
