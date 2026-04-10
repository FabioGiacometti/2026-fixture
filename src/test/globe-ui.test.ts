import { describe, expect, it } from "vitest";
import {
  ACTIVE_EVENT_COLOR,
  DEFAULT_MAX_CAMERA_HEIGHT,
  INACTIVE_EVENT_COLOR,
  MATCH_EVENT_ZOOM_PERCENT,
  MIN_CAMERA_HEIGHT,
  getCameraHeightForZoomPercent,
  getMaxZoomOutCameraHeight,
  getMapThemeColors,
  getWheelZoomCameraHeight,
  getMarkerAppearance,
  getNextUpcomingWorldCupEvent,
  getSafariPathEvents,
  getUpcomingMatchTooltipLabel,
  getUpcomingWorldCupMapEvents,
  getWorldCupCountryBounds,
  getZoomIndicatorState,
} from "../lib/globe-ui";

describe("globe UI helpers", () => {
  it("makes the selected event marker green and emphasized", () => {
    const marker = getMarkerAppearance(true);

    expect(marker.color).toBe(ACTIVE_EVENT_COLOR);
    expect(marker.pixelSize).toBeGreaterThan(getMarkerAppearance(false).pixelSize);
    expect(marker.outlineWidth).toBeGreaterThan(0);
  });

  it("keeps non-selected markers in the default amber palette", () => {
    const marker = getMarkerAppearance(false);

    expect(marker.color).toBe(INACTIVE_EVENT_COLOR);
    expect(marker.colorAlpha).toBeLessThan(1);
  });

  it("emphasizes upcoming venue markers so all upcoming matches stay visible on the map", () => {
    const defaultMarker = getMarkerAppearance(false);
    const upcomingMarker = getMarkerAppearance(false, true);

    expect(upcomingMarker.pixelSize).toBeGreaterThan(defaultMarker.pixelSize);
    expect(upcomingMarker.outlineWidth).toBeGreaterThanOrEqual(defaultMarker.outlineWidth);
    expect(upcomingMarker.colorAlpha).toBeGreaterThan(defaultMarker.colorAlpha);
  });

  it("formats upcoming match tooltip labels with date and flags", () => {
    const label = getUpcomingMatchTooltipLabel({
      city: "San Francisco Bay Area Stadium",
      region: "América",
      year: 2026,
      month: 6,
      day: 25,
      kickoff: "18:00",
      homeTeam: "Qatar",
      awayTeam: "Suiza",
      homeFlag: "qa",
      awayFlag: "ch",
    });

    expect(label).toContain("San Francisco Bay Area Stadium");
    expect(label).toContain("25-06-2026 · 18:00");
    expect(label).toContain("🇶🇦 Qatar vs 🇨🇭 Suiza");
  });

  it("reports closer camera heights as more zoomed in", () => {
    const farView = getZoomIndicatorState(22_000_000);
    const nearView = getZoomIndicatorState(800_000);
    const eventFocusView = getZoomIndicatorState(3_500_000);
    const highAltitudeView = getZoomIndicatorState(250_000);
    const streetLevelView = getZoomIndicatorState(MIN_CAMERA_HEIGHT);

    expect(farView.label).toBe("Global");
    expect(nearView.label).toBe("Local");
    expect(nearView.percent).toBeGreaterThan(farView.percent);
    expect(eventFocusView.percent).toBeLessThan(60);
    expect(highAltitudeView.percent).toBeLessThan(100);
    expect(streetLevelView.percent).toBe(100);
  });

  it("provides a camera height that maps to the requested zoom percentage", () => {
    const activeEventHeight = getCameraHeightForZoomPercent(80);
    const indicator = getZoomIndicatorState(activeEventHeight);

    expect(indicator.percent).toBeGreaterThanOrEqual(79);
    expect(indicator.percent).toBeLessThanOrEqual(81);
    expect(indicator.label).toBe("Local");
  });

  it("zooms relative to the current centered camera height and respects clamps", () => {
    const currentHeight = 8_000_000;
    const zoomInHeight = getWheelZoomCameraHeight(currentHeight, -240, DEFAULT_MAX_CAMERA_HEIGHT);
    const zoomOutHeight = getWheelZoomCameraHeight(currentHeight, 240, DEFAULT_MAX_CAMERA_HEIGHT);

    expect(zoomInHeight).toBeLessThan(currentHeight);
    expect(zoomOutHeight).toBeGreaterThan(currentHeight);
    expect(MIN_CAMERA_HEIGHT).toBe(500);
    expect(getWheelZoomCameraHeight(9_000, -5000, DEFAULT_MAX_CAMERA_HEIGHT)).toBe(MIN_CAMERA_HEIGHT);
    expect(getWheelZoomCameraHeight(DEFAULT_MAX_CAMERA_HEIGHT, 500, DEFAULT_MAX_CAMERA_HEIGHT)).toBe(
      DEFAULT_MAX_CAMERA_HEIGHT
    );
  });

  it("limits global zoom-out to the viewport-constrained globe size", () => {
    const desktopMaxHeight = getMaxZoomOutCameraHeight(1440, 900);
    const mobileMaxHeight = getMaxZoomOutCameraHeight(390, 844);

    expect(desktopMaxHeight).toBeGreaterThan(9_500_000);
    expect(desktopMaxHeight).toBeLessThan(13_000_000);
    expect(mobileMaxHeight).toBeGreaterThan(19_000_000);
    expect(mobileMaxHeight).toBeLessThanOrEqual(22_000_000);
    expect(mobileMaxHeight).toBeGreaterThan(desktopMaxHeight);
  });

  it("keeps World Cup match focus tight enough to reveal the stadium area", () => {
    const matchFocusIndicator = getZoomIndicatorState(
      getCameraHeightForZoomPercent(MATCH_EVENT_ZOOM_PERCENT)
    );

    expect(MATCH_EVENT_ZOOM_PERCENT).toBeGreaterThan(90);
    expect(matchFocusIndicator.percent).toBeGreaterThanOrEqual(90);
    expect(matchFocusIndicator.label).toBe("Local");
  });

  it("provides theme-aware map colors with stable fallbacks", () => {
    const mapColors = getMapThemeColors();

    expect(mapColors).toEqual(
      expect.objectContaining({
        sceneBackground: expect.any(String),
        labelOutlineColor: expect.any(String),
        countryOutlineColor: expect.any(String),
        safariPathColor: expect.any(String),
      })
    );
    expect(mapColors.sceneBackground.length).toBeGreaterThan(0);
    expect(mapColors.safariPathColor.length).toBeGreaterThan(0);
  });

  it("filters map events down to upcoming World Cup matches only", () => {
    const events = [
      { id: "played-match", dataset: "worldcup", eventType: "match", score: { home: 2, away: 1 } },
      { id: "upcoming-match", dataset: "worldcup", eventType: "match" },
      { id: "historic-event", dataset: "historical", eventType: "milestone" },
    ];

    expect(
      getUpcomingWorldCupMapEvents(events as Parameters<typeof getUpcomingWorldCupMapEvents>[0]).map((event) => event.id)
    ).toEqual(["upcoming-match"]);
  });

  it("returns the earliest unresolved World Cup match as the next popup target", () => {
    const nextMatch = getNextUpcomingWorldCupEvent([
      {
        id: "later-match",
        dataset: "worldcup",
        eventType: "match",
        year: 2026,
        month: 6,
        day: 18,
        kickoff: "21:00",
      },
      {
        id: "earlier-match",
        dataset: "worldcup",
        eventType: "match",
        year: 2026,
        month: 6,
        day: 16,
        kickoff: "18:00",
      },
      {
        id: "resolved-match",
        dataset: "worldcup",
        eventType: "match",
        year: 2026,
        month: 6,
        day: 15,
        kickoff: "16:00",
        score: { home: 2, away: 1 },
      },
    ] as Parameters<typeof getNextUpcomingWorldCupEvent>[0]);

    expect(nextMatch?.id).toBe("earlier-match");
  });

  it("builds the safari path from only the matches currently visible in the filtered list", () => {
    const safari = {
      id: "world-cup-2026",
      eventIds: ["match-1", "match-2", "match-3"],
    };

    const allEvents = [
      { id: "match-1", title: "A", lat: 0, lng: 0 },
      { id: "match-2", title: "B", lat: 1, lng: 1 },
      { id: "match-3", title: "C", lat: 2, lng: 2 },
    ];

    const visibleEvents = [allEvents[2], allEvents[0]];

    expect(
      getSafariPathEvents(
        safari as Parameters<typeof getSafariPathEvents>[0],
        allEvents as Parameters<typeof getSafariPathEvents>[1],
        visibleEvents as Parameters<typeof getSafariPathEvents>[2]
      ).map((event) => event.id)
    ).toEqual(["match-1", "match-3"]);
  });

  it("provides country bounds for World Cup safari overviews", () => {
    const uruguayBounds = getWorldCupCountryBounds("world-cup-1930");

    expect(uruguayBounds).toEqual(
      expect.objectContaining({
        west: expect.any(Number),
        south: expect.any(Number),
        east: expect.any(Number),
        north: expect.any(Number),
      })
    );
    expect(uruguayBounds?.west).toBeLessThan(uruguayBounds!.east);
    expect(uruguayBounds?.south).toBeLessThan(uruguayBounds!.north);
  });
});
