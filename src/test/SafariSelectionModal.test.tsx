import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SafariSelectionModal from "@/components/SafariSelectionModal";
import type { HistoricalEvent, Safari } from "@/data/historical-events";
import "@/index.css";

describe("SafariSelectionModal", () => {
  it("keeps the World Cup selector content scrollable within the viewport", () => {
    const safari: Safari = {
      id: "world-cup-1930",
      name: "Copa Mundial 1930",
      description: "Uruguay · Montevideo. Primer Mundial.",
      overview: "Recorrido del torneo.",
      eventIds: ["world-cup-1930-milestone", "world-cup-1930-final"],
    };

    const events: HistoricalEvent[] = [
      {
        id: "world-cup-1930-milestone",
        title: "Hito de la Copa Mundial 1930",
        description: "Resumen histórico del torneo.",
        year: 1930,
        month: 6,
        day: 1,
        lat: -34.9,
        lng: -56.2,
        city: "Montevideo",
        region: "América",
        importance: 2,
        dataset: "worldcup",
        eventType: "milestone",
      },
      {
        id: "world-cup-1930-final",
        title: "Final 1930: Uruguay vs Argentina",
        description: "Uruguay 4-2 Argentina",
        year: 1930,
        month: 7,
        day: 30,
        lat: -34.9,
        lng: -56.2,
        city: "Montevideo",
        region: "América",
        importance: 1,
        dataset: "worldcup",
        eventType: "match",
        stage: "final",
        homeTeam: "Uruguay",
        awayTeam: "Argentina",
        score: { home: 4, away: 2 },
      },
    ];

    render(
      <SafariSelectionModal
        isOpen
        safaris={[safari]}
        allEvents={events}
        onSelectSafari={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Selección inmersiva")).toBeInTheDocument();
    const scrollableArea = document.body.querySelector(".overflow-y-auto");
    expect(scrollableArea).toBeTruthy();
    expect(scrollableArea?.className).not.toContain("theme-scrollbar");
  });
});
