export type RouteDatasetMode = "historical" | "worldcup";
export type RouteMapStyle = "political" | "geographic";

export interface AppRouteStateInput {
  datasetMode: RouteDatasetMode;
  activeSafariId?: string | null;
  currentYear?: number;
  selectedWorldCupGroup?: string;
  quickFilters?: string[];
  mapStyle?: RouteMapStyle;
  selectedEventId?: string | null;
  showEventDetails?: boolean;
}

export interface ParsedAppRouteState {
  datasetMode: RouteDatasetMode;
  activeSafariId: string | null;
  currentYear?: number;
  selectedWorldCupGroup: string;
  quickFilters: string[];
  mapStyle?: RouteMapStyle;
  selectedEventId?: string | null;
  showEventDetails: boolean;
}

export function buildAppRouteState({
  datasetMode,
  activeSafariId,
  currentYear,
  selectedWorldCupGroup = "Todos",
  quickFilters = [],
  mapStyle,
  selectedEventId,
  showEventDetails,
}: AppRouteStateInput) {
  const pathname = datasetMode === "historical"
    ? activeSafariId
      ? `/historical/safari/${activeSafariId}`
      : "/historical"
    : activeSafariId
      ? `/worldcup/${activeSafariId}`
      : "/worldcup";

  const searchParams = new URLSearchParams();

  if (datasetMode === "historical" && typeof currentYear === "number" && Number.isFinite(currentYear)) {
    searchParams.set("year", String(currentYear));
  }

  if (selectedWorldCupGroup && selectedWorldCupGroup !== "Todos") {
    searchParams.set("group", selectedWorldCupGroup);
  }

  if (quickFilters.length > 0) {
    searchParams.set("filters", quickFilters.join(","));
  }

  if (mapStyle) {
    searchParams.set("map", mapStyle);
  }

  if (selectedEventId) {
    searchParams.set("event", selectedEventId);
    if (typeof showEventDetails === "boolean") {
      searchParams.set("details", String(showEventDetails));
    }
  }

  const search = searchParams.toString();

  return {
    pathname,
    search: search ? `?${search}` : "",
  };
}

export function parseAppRouteState(pathname: string, search: string): ParsedAppRouteState {
  const segments = pathname.split("/").filter(Boolean);
  const datasetMode: RouteDatasetMode = segments[0] === "historical" ? "historical" : "worldcup";
  const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  let activeSafariId: string | null = null;

  if (datasetMode === "historical") {
    activeSafariId = segments[1] === "safari" && segments[2] ? decodeURIComponent(segments[2]) : null;
  } else {
    activeSafariId = segments[1] ? decodeURIComponent(segments[1]) : null;
  }

  const rawYear = searchParams.get("year");
  const parsedYear = rawYear !== null ? Number(rawYear) : undefined;
  const filters = searchParams.get("filters");
  const mapValue = searchParams.get("map");
  const selectedEventId = searchParams.get("event");
  const detailsValue = searchParams.get("details");
  const showEventDetails = detailsValue === null
    ? Boolean(selectedEventId)
    : detailsValue === "true";

  return {
    datasetMode,
    activeSafariId,
    currentYear: Number.isFinite(parsedYear) ? parsedYear : undefined,
    selectedWorldCupGroup: searchParams.get("group") ?? "Todos",
    quickFilters: filters ? filters.split(",").map((value) => value.trim()).filter(Boolean) : [],
    mapStyle: mapValue === "political" || mapValue === "geographic" ? mapValue : undefined,
    selectedEventId,
    showEventDetails,
  };
}
