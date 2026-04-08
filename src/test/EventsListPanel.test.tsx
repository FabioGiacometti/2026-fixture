import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EventsListPanel from "@/components/EventsListPanel";
import type { HistoricalEvent, Safari } from "@/data/historical-events";

describe("EventsListPanel match detail view", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders upcoming World Cup matches without crashing when no score is available", async () => {
    const upcomingMatch = {
      id: "wc2026-g-a1",
      title: "Grupo A: México vs Sudáfrica",
      description: "México vs Sudáfrica · 16:00. Programado.",
      year: 2026,
      month: 6,
      day: 11,
      lat: 19.3029,
      lng: -99.1505,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      homeTeam: "México",
      awayTeam: "Sudáfrica",
      kickoff: "16:00",
      city: "Estadio Ciudad de México",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [upcomingMatch.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[upcomingMatch]}
        allEvents={[upcomingMatch]}
        selectedEvent={upcomingMatch}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Grupo A: México vs Sudáfrica" }));

    await waitFor(() => {
      expect(screen.getByText("Partido programado · 16:00")).toBeInTheDocument();
    });

    expect(screen.getByText("Estadio Ciudad de México")).toBeInTheDocument();
    expect(screen.getByText("México")).toBeInTheDocument();
    expect(screen.getByText("Sudáfrica")).toBeInTheDocument();
    expect(screen.queryByText(/^Penales:/)).not.toBeInTheDocument();
  });

  it("pre-filters the current World Cup by the visitor country when it is a participant", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ countryCode: "AR", country: "Argentina" }),
      })
    );
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["es-ES"]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("es-ES");

    const argentinaMatch = {
      id: "wc2026-arg-prefill",
      title: "Grupo C: Argentina vs Japón",
      description: "Argentina vs Japón · 20:00. Programado.",
      year: 2026,
      month: 6,
      day: 14,
      lat: 34.1613,
      lng: -118.1676,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo C",
      homeTeam: "Argentina",
      awayTeam: "Japón",
      kickoff: "20:00",
      city: "Los Angeles Stadium",
    } as HistoricalEvent;

    const usaMatch = {
      id: "wc2026-usa-prefill",
      title: "Grupo B: USA vs Marruecos",
      description: "USA vs Marruecos · 18:00. Programado.",
      year: 2026,
      month: 6,
      day: 15,
      lat: 40.8135,
      lng: -74.0745,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo B",
      homeTeam: "Estados Unidos",
      awayTeam: "Marruecos",
      kickoff: "18:00",
      city: "New York / New Jersey Stadium",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [argentinaMatch.id, usaMatch.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[argentinaMatch, usaMatch]}
        allEvents={[argentinaMatch, usaMatch]}
        selectedEvent={null}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Quitar filtro Argentina" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Grupo C: Argentina vs Japón" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Grupo B: USA vs Marruecos" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro Argentina" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Grupo B: USA vs Marruecos" })).toBeInTheDocument();
    });
  });

  it("uses locale only as a suggestion when IP country is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("geo unavailable")));
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["es-ES"]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("es-ES");

    const spainMatch = {
      id: "wc2026-esp-suggestion",
      title: "Grupo B: España vs Túnez",
      description: "España vs Túnez · 21:00. Programado.",
      year: 2026,
      month: 6,
      day: 16,
      lat: 40.4168,
      lng: -3.7038,
      region: "Europa",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo B",
      homeTeam: "España",
      awayTeam: "Túnez",
      kickoff: "21:00",
      city: "Boston Stadium",
    } as HistoricalEvent;

    const usaMatch = {
      id: "wc2026-usa-suggestion",
      title: "Grupo B: USA vs Marruecos",
      description: "USA vs Marruecos · 18:00. Programado.",
      year: 2026,
      month: 6,
      day: 15,
      lat: 40.8135,
      lng: -74.0745,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo B",
      homeTeam: "Estados Unidos",
      awayTeam: "Marruecos",
      kickoff: "18:00",
      city: "New York / New Jersey Stadium",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [spainMatch.id, usaMatch.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[spainMatch, usaMatch]}
        allEvents={[spainMatch, usaMatch]}
        selectedEvent={null}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sugerir filtro España" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Grupo B: España vs Túnez" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grupo B: USA vs Marruecos" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Quitar filtro España" })).not.toBeInTheDocument();
  });

  it("shows a removable chip when a group filter is active", async () => {
    const groupMatch = {
      id: "wc2026-group-chip",
      title: "Grupo A: México vs Sudáfrica",
      description: "México vs Sudáfrica · 16:00. Programado.",
      year: 2026,
      month: 6,
      day: 11,
      lat: 19.3029,
      lng: -99.1505,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo A",
      homeTeam: "México",
      awayTeam: "Sudáfrica",
      kickoff: "16:00",
      city: "Estadio Ciudad de México",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [groupMatch.id],
    };

    const onClearGroupFilter = vi.fn();

    render(
      <EventsListPanel
        visibleEvents={[groupMatch]}
        allEvents={[groupMatch]}
        selectedEvent={null}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
        activeGroupFilter="Grupo A"
        onClearGroupFilter={onClearGroupFilter}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Grupo: Grupo A")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro de grupo Grupo A" }));
    expect(onClearGroupFilter).toHaveBeenCalledTimes(1);
  });

  it("shows the current World Cup calendar in the right panel and navigates to match detail on click", async () => {
    const openingMatch = {
      id: "wc2026-g-a1",
      title: "Grupo A: México vs Sudáfrica",
      description: "México vs Sudáfrica · 16:00. Programado.",
      year: 2026,
      month: 6,
      day: 11,
      lat: 19.3029,
      lng: -99.1505,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo A",
      homeTeam: "México",
      awayTeam: "Sudáfrica",
      kickoff: "16:00",
      city: "Estadio Ciudad de México",
    } as HistoricalEvent;

    const secondMatch = {
      id: "wc2026-g-a2",
      title: "Grupo A: Suiza vs Ecuador",
      description: "Suiza vs Ecuador · 19:00. Programado.",
      year: 2026,
      month: 6,
      day: 11,
      lat: 20.6786,
      lng: -103.346,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo A",
      homeTeam: "Suiza",
      awayTeam: "Ecuador",
      kickoff: "19:00",
      city: "Estadio Guadalajara",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [openingMatch.id, secondMatch.id],
    };

    const onSelectEvent = vi.fn();
    const onYearChange = vi.fn();

    render(
      <EventsListPanel
        visibleEvents={[openingMatch, secondMatch]}
        allEvents={[openingMatch, secondMatch]}
        selectedEvent={openingMatch}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={onSelectEvent}
        onYearChange={onYearChange}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Calendario del torneo")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Grupo A: Suiza vs Ecuador" }));

    expect(onSelectEvent).toHaveBeenCalledWith(secondMatch);
    expect(onYearChange).toHaveBeenCalledWith(2026);
  });

  it("keeps the classic event list for older world cup safaris", async () => {
    const classicMatch = {
      id: "classic-1",
      title: "Grupo 1: Uruguay vs Peru",
      description: "Uruguay 1-0 Peru. Resultado del partido.",
      year: 1930,
      month: 7,
      day: 18,
      lat: -34.8941,
      lng: -56.0675,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      homeTeam: "Uruguay",
      awayTeam: "Peru",
      city: "Montevideo",
      score: { home: 1, away: 0 },
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-1930",
      name: "Uruguay 1930",
      description: "Primer Mundial",
      overview: "Recorrido por el torneo.",
      eventIds: [classicMatch.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[classicMatch]}
        allEvents={[classicMatch]}
        selectedEvent={null}
        currentYear={1930}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
        forceOpen
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Narrativa Curada")).toBeInTheDocument();
    });

    expect(screen.queryByText("Calendario del torneo")).not.toBeInTheDocument();
    expect(screen.getByText("Uruguay vs Peru")).toBeInTheDocument();
  });

  it("applies cumulative quick filter chips as union matches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("geo unavailable")));
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["fr-FR"]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("fr-FR");

    const argentinaMatch = {
      id: "wc2026-arg",
      title: "Grupo C: Argentina vs Japón",
      description: "Argentina vs Japón · 20:00.",
      year: 2026,
      month: 6,
      day: 14,
      lat: 34.1613,
      lng: -118.1676,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo C",
      homeTeam: "Argentina",
      awayTeam: "Japón",
      kickoff: "20:00",
      city: "Los Angeles Stadium",
    } as HistoricalEvent;

    const usaMatch = {
      id: "wc2026-usa",
      title: "Grupo B: USA vs Marruecos",
      description: "USA vs Marruecos · 18:00.",
      year: 2026,
      month: 6,
      day: 15,
      lat: 40.8135,
      lng: -74.0745,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo B",
      homeTeam: "Estados Unidos",
      awayTeam: "Marruecos",
      kickoff: "18:00",
      city: "New York / New Jersey Stadium",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [argentinaMatch.id, usaMatch.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[argentinaMatch, usaMatch]}
        allEvents={[argentinaMatch, usaMatch]}
        selectedEvent={null}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Filtrar por país, sede o fecha");

    fireEvent.change(input, { target: { value: "argentina" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("argentina")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grupo C: Argentina vs Japón" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Grupo B: USA vs Marruecos" })).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "USA" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grupo C: Argentina vs Japón" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grupo B: USA vs Marruecos" })).toBeInTheDocument();
  });

  it("reports filtered events so the map can stay in sync with the active chips", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("geo unavailable")));
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["fr-FR"]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("fr-FR");

    const argentinaMatch = {
      id: "wc2026-map-arg",
      title: "Grupo C: Argentina vs Japón",
      description: "Argentina vs Japón · 20:00.",
      year: 2026,
      month: 6,
      day: 14,
      lat: 34.1613,
      lng: -118.1676,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo C",
      homeTeam: "Argentina",
      awayTeam: "Japón",
      kickoff: "20:00",
      city: "Los Angeles Stadium",
    } as HistoricalEvent;

    const usaMatch = {
      id: "wc2026-map-usa",
      title: "Grupo B: USA vs Marruecos",
      description: "USA vs Marruecos · 18:00.",
      year: 2026,
      month: 6,
      day: 15,
      lat: 40.8135,
      lng: -74.0745,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo B",
      homeTeam: "Estados Unidos",
      awayTeam: "Marruecos",
      kickoff: "18:00",
      city: "New York / New Jersey Stadium",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [argentinaMatch.id, usaMatch.id],
    };

    const onVisibleEventsChange = vi.fn();

    render(
      <EventsListPanel
        visibleEvents={[argentinaMatch, usaMatch]}
        allEvents={[argentinaMatch, usaMatch]}
        selectedEvent={null}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
        onVisibleEventsChange={onVisibleEventsChange}
      />
    );

    await waitFor(() => {
      expect(onVisibleEventsChange).toHaveBeenCalledWith([argentinaMatch, usaMatch]);
    });

    const input = screen.getByPlaceholderText("Filtrar por país, sede o fecha");
    fireEvent.change(input, { target: { value: "argentina" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(onVisibleEventsChange).toHaveBeenLastCalledWith([argentinaMatch]);
    });
  });

  it("filters matches by venue and date chips", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("geo unavailable")));
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["fr-FR"]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("fr-FR");

    const firstMatch = {
      id: "wc2026-date-1",
      title: "Grupo A: México vs Sudáfrica",
      description: "México vs Sudáfrica · 16:00.",
      year: 2026,
      month: 6,
      day: 11,
      lat: 19.3029,
      lng: -99.1505,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo A",
      homeTeam: "México",
      awayTeam: "Sudáfrica",
      kickoff: "16:00",
      city: "Estadio Ciudad de México",
    } as HistoricalEvent;

    const secondMatch = {
      id: "wc2026-date-2",
      title: "Grupo A: Suiza vs Ecuador",
      description: "Suiza vs Ecuador · 19:00.",
      year: 2026,
      month: 6,
      day: 12,
      lat: 20.6786,
      lng: -103.346,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      groupName: "Grupo A",
      homeTeam: "Suiza",
      awayTeam: "Ecuador",
      kickoff: "19:00",
      city: "Estadio Guadalajara",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Seguimiento del torneo.",
      eventIds: [firstMatch.id, secondMatch.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[firstMatch, secondMatch]}
        allEvents={[firstMatch, secondMatch]}
        selectedEvent={null}
        currentYear={2026}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Filtrar por país, sede o fecha");

    fireEvent.change(input, { target: { value: "guadalajara" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByRole("button", { name: "Grupo A: Suiza vs Ecuador" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Grupo A: México vs Sudáfrica" })).not.toBeInTheDocument();

    const removeVenueChip = screen.getByRole("button", { name: "Quitar filtro guadalajara" });
    fireEvent.click(removeVenueChip);

    fireEvent.change(input, { target: { value: "11-06-2026" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByRole("button", { name: "Grupo A: México vs Sudáfrica" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Grupo A: Suiza vs Ecuador" })).not.toBeInTheDocument();
  });

  it("shows the safari name, venue, simplified formations, and only knockout milestones", async () => {
    const selectedMatch = {
      id: "g-a1",
      title: "Grupo 1: Uruguay vs Peru",
      description: "Uruguay 1-0 Peru. Resultado del partido.",
      year: 1930,
      month: 7,
      day: 18,
      lat: -34.8941,
      lng: -56.0675,
      region: "América",
      importance: 2,
      dataset: "worldcup",
      eventType: "match",
      stage: "group",
      homeTeam: "Uruguay",
      awayTeam: "Peru",
      score: { home: 1, away: 0 },
      formationHome: "2-3-5",
      formationAway: "2-3-5",
      winnerTeam: "Uruguay",
      scorers: [{ team: "Uruguay", player: "Hector Castro", minute: 60 }],
      matchTimeline: [{ minute: 60, type: "goal", description: "Uruguay: Hector Castro" }],
      city: "Montevideo",
    } as HistoricalEvent;

    const semifinal = {
      ...selectedMatch,
      id: "semi-1",
      title: "Semifinal: Uruguay vs Yugoslavia",
      stage: "semifinal",
      homeTeam: "Uruguay",
      awayTeam: "Yugoslavia",
      winnerTeam: "Uruguay",
    } as HistoricalEvent;

    const final = {
      ...selectedMatch,
      id: "final",
      title: "Final: Uruguay vs Argentina",
      stage: "final",
      awayTeam: "Argentina",
      winnerTeam: "Uruguay",
    } as HistoricalEvent;

    const safari: Safari = {
      id: "uruguay-1930",
      name: "Uruguay 1930",
      description: "Primer Mundial",
      overview: "Recorrido por el torneo.",
      eventIds: [selectedMatch.id, semifinal.id, final.id],
    };

    render(
      <EventsListPanel
        visibleEvents={[selectedMatch, semifinal, final]}
        allEvents={[selectedMatch, semifinal, final]}
        selectedEvent={selectedMatch}
        currentYear={1930}
        windowSize={6}
        activeSafari={safari}
        onSelectEvent={vi.fn()}
        onYearChange={vi.fn()}
        onClose={vi.fn()}
        onCloseSafari={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Volver a Uruguay 1930")).toBeInTheDocument();
    });

    expect(screen.getByText("Montevideo")).toBeInTheDocument();
    expect(screen.queryByText("América")).not.toBeInTheDocument();
    expect(screen.getAllByText(/^Formación:/)).toHaveLength(2);
    expect(screen.queryByText(/Formación Uruguay:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Uruguay 1-0 Peru\. Resultado del partido\./)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Semifinal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Final" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Grupos" })).not.toBeInTheDocument();
  });
});
