import { describe, expect, it } from "vitest";
import {
  ACTIVE_EVENT_COLOR,
  INACTIVE_EVENT_COLOR,
  MATCH_EVENT_ZOOM_PERCENT,
  getCameraHeightForZoomPercent,
  getMarkerAppearance,
  getSafariPathEvents,
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

  it("reports closer camera heights as more zoomed in", () => {
    const farView = getZoomIndicatorState(22_000_000);
    const nearView = getZoomIndicatorState(800_000);
    const eventFocusView = getZoomIndicatorState(3_500_000);
    const highAltitudeView = getZoomIndicatorState(250_000);
    const streetLevelView = getZoomIndicatorState(10_000);

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

  it("keeps World Cup match focus tight enough to reveal the stadium area", () => {
    const matchFocusIndicator = getZoomIndicatorState(
      getCameraHeightForZoomPercent(MATCH_EVENT_ZOOM_PERCENT)
    );

    expect(MATCH_EVENT_ZOOM_PERCENT).toBeGreaterThan(90);
    expect(matchFocusIndicator.percent).toBeGreaterThanOrEqual(90);
    expect(matchFocusIndicator.label).toBe("Local");
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
