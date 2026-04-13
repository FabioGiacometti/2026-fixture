import { describe, expect, it } from "vitest";
import { buildAppRouteState, parseAppRouteState } from "@/lib/app-route-state";

describe("app route state helpers", () => {
  it("parses shared world cup deep links from URL state", () => {
    const state = parseAppRouteState(
      "/worldcup/world-cup-2026",
      "?filters=Argentina&map=geographic"
    );

    expect(state.datasetMode).toBe("worldcup");
    expect(state.activeSafariId).toBe("world-cup-2026");
    expect(state.quickFilters).toEqual(["Argentina"]);
    expect(state.mapStyle).toBe("geographic");
    expect(state.showEventDetails).toBe(false);
  });

  it("parses event links with explicit details=false for map-focused view", () => {
    const state = parseAppRouteState(
      "/worldcup/world-cup-2026",
      "?map=geographic&event=world-cup-2026-g-j1&details=false"
    );

    expect(state.selectedEventId).toBe("world-cup-2026-g-j1");
    expect(state.showEventDetails).toBe(false);
  });

  it("builds shareable world cup routes for filter exploration", () => {
    const route = buildAppRouteState({
      datasetMode: "worldcup",
      activeSafariId: "world-cup-2026",
      currentYear: 2026,
      selectedWorldCupGroup: "Grupo A",
      quickFilters: ["México", "11-06-2026"],
      mapStyle: "geographic",
      selectedEventId: "wc2026-g-a1",
      showEventDetails: true,
    });

    expect(route.pathname).toBe("/worldcup/world-cup-2026");
    expect(route.search).toContain("group=Grupo+A");
    expect(route.search).toContain("filters=M%C3%A9xico%2C11-06-2026");
    expect(route.search).toContain("map=geographic");
    expect(route.search).toContain("event=wc2026-g-a1");
    expect(route.search).toContain("details=true");
  });

  it("parses filter routes back into app state", () => {
    const state = parseAppRouteState(
      "/historical/safari/space-race",
      "?year=1969&filters=moon,apollo&map=political&event=apollo-11"
    );

    expect(state.datasetMode).toBe("historical");
    expect(state.activeSafariId).toBe("space-race");
    expect(state.currentYear).toBe(1969);
    expect(state.quickFilters).toEqual(["moon", "apollo"]);
    expect(state.mapStyle).toBe("political");
    expect(state.selectedEventId).toBe("apollo-11");
    expect(state.showEventDetails).toBe(true);
  });
});
