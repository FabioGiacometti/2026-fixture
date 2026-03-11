import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, X, MapPin, Calendar, List } from "lucide-react";
import type { HistoricalEvent } from "@/data/historical-events";
import { formatYear } from "@/data/historical-events";

type PanelState = "collapsed" | "list" | "detail";

interface EventsListPanelProps {
  visibleEvents: HistoricalEvent[];
  selectedEvent: HistoricalEvent | null;
  currentYear: number;
  onSelectEvent: (event: HistoricalEvent) => void;
  onClose: () => void;
  forceOpen?: boolean; // triggered by timeline hover
}

const regionColors: Record<string, string> = {
  Europa: "hsl(220 80% 60%)",
  Asia: "hsl(30 90% 60%)",
  África: "hsl(120 60% 50%)",
  América: "hsl(280 70% 65%)",
  Espacio: "hsl(200 80% 70%)",
};

export default function EventsListPanel({
  visibleEvents,
  selectedEvent,
  currentYear,
  onSelectEvent,
  onClose,
  forceOpen,
}: EventsListPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("collapsed");

  // When a marker is clicked (selectedEvent changes), open detail
  useEffect(() => {
    if (selectedEvent) {
      setPanelState("detail");
    }
  }, [selectedEvent]);

  // When forceOpen (timeline hover), open list if collapsed
  useEffect(() => {
    if (forceOpen && panelState === "collapsed") {
      setPanelState("list");
    }
  }, [forceOpen]);

  const handleTabClick = () => {
    if (panelState === "collapsed") {
      setPanelState("list");
    } else {
      setPanelState("collapsed");
    }
  };

  const handleSelectEvent = (event: HistoricalEvent) => {
    onSelectEvent(event);
    setPanelState("detail");
  };

  const handleBack = () => {
    setPanelState("list");
    onClose();
  };

  const handleCollapse = () => {
    setPanelState("collapsed");
    onClose();
  };

  const panelWidth =
    panelState === "collapsed" ? "36px" : "300px";

  const sortedEvents = [...visibleEvents].sort((a, b) => a.year - b.year);

  return (
    <div
      className="fixed top-0 right-0 h-full z-40 flex"
      style={{ paddingBottom: "var(--timeline-height, 96px)" }}
    >
      {/* ── Vertical tab strip (always visible) ── */}
      <button
        onClick={handleTabClick}
        className="flex flex-col items-center justify-center gap-1.5 shrink-0 transition-colors"
        style={{
          width: "36px",
          background:
            panelState === "collapsed"
              ? "hsl(var(--card) / 0.85)"
              : "hsl(var(--card))",
          borderLeft: "1px solid hsl(var(--border))",
          borderRight:
            panelState !== "collapsed"
              ? "none"
              : "1px solid hsl(var(--border) / 0.3)",
          backdropFilter: "blur(8px)",
        }}
        aria-label={panelState === "collapsed" ? "Abrir lista de eventos" : "Colapsar panel"}
      >
        {/* Arrow icon */}
        <div
          className="transition-transform duration-300"
          style={{ color: "hsl(var(--primary))" }}
        >
          {panelState === "collapsed" ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        {/* Rotated label */}
        <span
          className="font-mono-space text-[9px] tracking-widest uppercase select-none"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "hsl(var(--muted-foreground))",
            letterSpacing: "0.12em",
          }}
        >
          Eventos
        </span>
        <List className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
      </button>

      {/* ── Sliding panel content ── */}
      <div
        className="flex flex-col overflow-hidden transition-all duration-300 ease-out"
        style={{
          width: panelState !== "collapsed" ? "300px" : "0px",
          background: "hsl(var(--card))",
          borderLeft: "1px solid hsl(var(--border))",
          boxShadow:
            panelState !== "collapsed"
              ? "-6px 0 32px hsl(0 0% 0% / 0.4)"
              : "none",
          opacity: panelState !== "collapsed" ? 1 : 0,
          pointerEvents: panelState !== "collapsed" ? "auto" : "none",
        }}
      >
        {/* ── LIST VIEW ── */}
        {panelState === "list" && (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <div>
                <p
                  className="font-mono-space text-xs font-bold uppercase tracking-widest"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Eventos
                </p>
                <p
                  className="font-mono-space text-[10px] mt-0.5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  ± 300 años de {formatYear(currentYear)}
                </p>
              </div>
              <button
                onClick={handleCollapse}
                className="w-7 h-7 flex items-center justify-center rounded-full"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  color: "hsl(var(--muted-foreground))",
                }}
                aria-label="Cerrar panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Events list */}
            <div className="flex-1 overflow-y-auto">
              {sortedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <Calendar
                    className="w-5 h-5"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <p
                    className="font-mono-space text-xs text-center px-4"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Sin eventos en este período
                  </p>
                </div>
              ) : (
                <ul className="divide-y" style={{ borderColor: "hsl(var(--border) / 0.5)" }}>
                  {sortedEvents.map((event) => {
                    const regionColor =
                      regionColors[event.region] ?? "hsl(var(--muted-foreground))";
                    return (
                      <li key={event.id}>
                        <button
                          onClick={() => handleSelectEvent(event)}
                          className="w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors hover:bg-muted/30 group"
                        >
                          {/* Year + region */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="font-mono-space text-xs font-bold"
                              style={{ color: "hsl(var(--primary))" }}
                            >
                              {formatYear(event.year)}
                            </span>
                            <span
                              className="font-mono-space text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                              style={{
                                color: regionColor,
                                background: `${regionColor}22`,
                                border: `1px solid ${regionColor}55`,
                              }}
                            >
                              {event.region}
                            </span>
                          </div>
                          {/* Title */}
                          <span
                            className="font-mono-space text-xs leading-snug line-clamp-2 group-hover:text-foreground transition-colors"
                            style={{ color: "hsl(var(--foreground) / 0.85)" }}
                          >
                            {event.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ── DETAIL VIEW ── */}
        {panelState === "detail" && selectedEvent && (
          <>
            {/* Header with back button */}
            <div
              className="flex items-center gap-2 px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "hsl(var(--muted-foreground))" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "hsl(var(--foreground))")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "hsl(var(--muted-foreground))")
                }
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="font-mono-space">Volver</span>
              </button>
              <div className="flex-1" />
              <button
                onClick={handleCollapse}
                className="w-7 h-7 flex items-center justify-center rounded-full"
                style={{
                  background: "hsl(var(--muted) / 0.5)",
                  color: "hsl(var(--muted-foreground))",
                }}
                aria-label="Cerrar panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Event detail content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Year */}
              <div className="flex items-center gap-2 mb-2">
                <Calendar
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "hsl(var(--primary))" }}
                />
                <span
                  className="font-mono-space text-xl font-bold leading-none"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {formatYear(selectedEvent.year)}
                </span>
              </div>

              {/* Region chip */}
              <div className="flex items-center gap-1.5 mb-3">
                <MapPin
                  className="w-3 h-3 shrink-0"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
                <span
                  className="font-mono-space text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color:
                      regionColors[selectedEvent.region] ??
                      "hsl(var(--muted-foreground))",
                    background: `${
                      regionColors[selectedEvent.region] ??
                      "hsl(var(--muted-foreground))"
                    }22`,
                    border: `1px solid ${
                      regionColors[selectedEvent.region] ??
                      "hsl(var(--muted-foreground))"
                    }55`,
                  }}
                >
                  {selectedEvent.region}
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-mono-space text-sm font-bold leading-snug mb-4"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {selectedEvent.title}
              </h2>

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(var(--foreground) / 0.85)" }}
              >
                {selectedEvent.description}
              </p>

              {/* Coordinates */}
              <div
                className="mt-6 pt-3 flex items-center gap-2"
                style={{ borderTop: "1px solid hsl(var(--border))" }}
              >
                <MapPin
                  className="w-3 h-3 shrink-0"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
                <span
                  className="font-mono-space text-[10px]"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {selectedEvent.lat.toFixed(2)}° N,{" "}
                  {selectedEvent.lng.toFixed(2)}° E
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
