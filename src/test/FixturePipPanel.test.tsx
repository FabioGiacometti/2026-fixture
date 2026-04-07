import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import FixturePipPanel, { getNextFixtureSize } from "@/components/FixturePipPanel";

describe("FixturePipPanel", () => {
  it("allows the fixture popup to grow past the previous max size", () => {
    const nextSize = getNextFixtureSize({
      originWidth: 420,
      originHeight: 330,
      startX: 100,
      startY: 100,
      clientX: 900,
      clientY: 800,
    });

    expect(nextSize.width).toBeGreaterThan(720);
    expect(nextSize.height).toBeGreaterThan(520);
  });

  it("shows a calendar-style fixture board for the 2026 World Cup safari", () => {
    const safari: Safari = {
      id: "world-cup-2026",
      name: "Copa Mundial 2026",
      description: "Canadá / México / Estados Unidos · Norteamérica.",
      overview: "Calendario del torneo.",
      eventIds: ["mx-za", "br-ma", "final-2026"],
    };

    const events: HistoricalEvent[] = [
      {
        id: "mx-za",
        title: "Grupo A: México vs Sudáfrica",
        description: "Partido inaugural programado.",
        year: 2026,
        month: 6,
        day: 11,
        lat: 19.3029,
        lng: -99.1505,
        city: "Estadio Ciudad de México",
        region: "América",
        importance: 2,
        dataset: "worldcup",
        eventType: "match",
        stage: "group",
        groupName: "Grupo A",
        tournamentId: "world-cup-2026",
        homeTeam: "México",
        awayTeam: "Sudáfrica",
        kickoff: "16:00",
      },
      {
        id: "br-ma",
        title: "Grupo C: Brasil vs Marruecos",
        description: "Partido programado.",
        year: 2026,
        month: 6,
        day: 13,
        lat: 42.3467,
        lng: -71.0972,
        city: "Boston Stadium",
        region: "América",
        importance: 2,
        dataset: "worldcup",
        eventType: "match",
        stage: "group",
        groupName: "Grupo C",
        tournamentId: "world-cup-2026",
        homeTeam: "Brasil",
        awayTeam: "Marruecos",
        kickoff: "19:00",
      },
      {
        id: "final-2026",
        title: "Final 2026",
        description: "Final programada.",
        year: 2026,
        month: 7,
        day: 19,
        lat: 40.8135,
        lng: -74.0745,
        city: "New York New Jersey Stadium",
        region: "América",
        importance: 1,
        dataset: "worldcup",
        eventType: "match",
        stage: "final",
        tournamentId: "world-cup-2026",
        homeTeam: "Ganador 101",
        awayTeam: "Ganador 102",
        kickoff: "16:00",
      },
    ];

    render(
      <FixturePipPanel
        activeSafari={safari}
        allEvents={events}
        selectedEvent={events[0]}
        onSelectEvent={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /expandir fixture/i }));

    expect(screen.getByRole("button", { name: /calendario/i })).toBeInTheDocument();
    expect(screen.getByTestId("fixture-calendar")).toBeInTheDocument();
    expect(screen.getAllByText(/méxico vs sudáfrica/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Estadio Ciudad de México")).toBeInTheDocument();
    expect(screen.getAllByText("16:00").length).toBeGreaterThan(0);
  });

  it("starts minimized for World Cup safaris and can expand to show the animated fixture", () => {
    const safari: Safari = {
      id: "world-cup-2022",
      name: "Qatar 2022",
      description: "Qatar · Doha.",
      overview: "Recorrido del torneo.",
      eventIds: ["qf-1", "sf-1", "final", "third-place"],
    };

    const events: HistoricalEvent[] = [
      {
        id: "qf-1",
        title: "Cuartos: Argentina vs Países Bajos",
        description: "Argentina 2-2 Países Bajos",
        year: 2022,
        month: 12,
        day: 9,
        lat: 25.28,
        lng: 51.52,
        city: "Lusail",
        region: "Asia",
        importance: 2,
        dataset: "worldcup",
        eventType: "match",
        stage: "quarterfinal",
        tournamentId: "world-cup-2022",
        homeTeam: "Argentina",
        awayTeam: "Netherlands",
        score: { home: 2, away: 2, penalties: { home: 4, away: 3 } },
        winnerTeam: "Argentina",
      },
      {
        id: "sf-1",
        title: "Semifinal: Argentina vs Croacia",
        description: "Argentina 3-0 Croacia",
        year: 2022,
        month: 12,
        day: 13,
        lat: 25.28,
        lng: 51.52,
        city: "Lusail",
        region: "Asia",
        importance: 2,
        dataset: "worldcup",
        eventType: "match",
        stage: "semifinal",
        tournamentId: "world-cup-2022",
        homeTeam: "Argentina",
        awayTeam: "Croatia",
        score: { home: 3, away: 0 },
        winnerTeam: "Argentina",
      },
      {
        id: "final",
        title: "Final: Argentina vs France",
        description: "Argentina 3-3 France",
        year: 2022,
        month: 12,
        day: 18,
        lat: 25.28,
        lng: 51.52,
        city: "Lusail",
        region: "Asia",
        importance: 1,
        dataset: "worldcup",
        eventType: "match",
        stage: "final",
        tournamentId: "world-cup-2022",
        homeTeam: "Argentina",
        awayTeam: "France",
        score: { home: 3, away: 3, penalties: { home: 4, away: 2 } },
        winnerTeam: "Argentina",
      },
      {
        id: "third-place",
        title: "3er puesto: Croacia vs Marruecos",
        description: "Croacia 2-1 Marruecos",
        year: 2022,
        month: 12,
        day: 17,
        lat: 25.28,
        lng: 51.52,
        city: "Doha",
        region: "Asia",
        importance: 2,
        dataset: "worldcup",
        eventType: "match",
        stage: "third-place",
        tournamentId: "world-cup-2022",
        homeTeam: "Croatia",
        awayTeam: "Morocco",
        score: { home: 2, away: 1 },
        winnerTeam: "Croatia",
      },
    ];

    const onSelectEvent = vi.fn();

    render(
      <FixturePipPanel
        activeSafari={safari}
        allEvents={events}
        selectedEvent={events[1]}
        onSelectEvent={onSelectEvent}
      />
    );

    expect(screen.getByText("Fixture")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /expandir fixture/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /expandir fixture/i }));

    expect(screen.getAllByText("Semifinal").length).toBeGreaterThan(0);
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getByTestId("fixture-bracket")).toBeInTheDocument();
    expect(screen.getAllByTestId("fixture-connector").length).toBeGreaterThan(0);
    expect(screen.getByText(/fase final/i)).toBeInTheDocument();
    expect(screen.getByText(/campeón proyectado/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /final: argentina vs france/i }));
    expect(onSelectEvent).toHaveBeenCalledWith(events[2]);
  });
});
