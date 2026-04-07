import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventsListPanel from "@/components/EventsListPanel";
import type { HistoricalEvent, Safari } from "@/data/historical-events";

describe("EventsListPanel match detail view", () => {
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

    await waitFor(() => {
      expect(screen.getByText("Partido programado · 16:00")).toBeInTheDocument();
    });

    expect(screen.getByText("Estadio Ciudad de México")).toBeInTheDocument();
    expect(screen.getByText("México")).toBeInTheDocument();
    expect(screen.getByText("Sudáfrica")).toBeInTheDocument();
    expect(screen.queryByText(/^Penales:/)).not.toBeInTheDocument();
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
