import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronLeft, X, MapPin, Calendar, List, Play, Image as ImageIcon, ExternalLink, Globe, Video, Maximize2 } from "lucide-react";
import { Safari, HistoricalEvent, formatYear } from "@/data/historical-events";

type PanelState = "collapsed" | "list" | "detail";

interface EventsListPanelProps {
  visibleEvents: HistoricalEvent[];
  allEvents: HistoricalEvent[];
  selectedEvent: HistoricalEvent | null;
  currentYear: number;
  windowSize: number;
  activeSafari?: Safari | null;
  onSelectEvent: (event: HistoricalEvent) => void;
  onYearChange: (year: number) => void;
  onClose: () => void;
  onCloseSafari?: () => void;
  forceOpen?: boolean; // triggered by timeline hover
  onMediaModalChange?: (isOpen: boolean) => void;
}

const regionColors: Record<string, string> = {
  Europa: "hsl(220 80% 60%)",
  Asia: "hsl(30 90% 60%)",
  África: "hsl(120 60% 50%)",
  América: "hsl(280 70% 65%)",
  Espacio: "hsl(200 80% 70%)",
};

const stageOrder: Record<string, number> = {
  group: 1,
  round16: 2,
  quarterfinal: 3,
  semifinal: 4,
  "third-place": 5,
  final: 6,
};

const stageLabel: Record<string, string> = {
  group: "Grupos",
  round16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinal",
  "third-place": "3er puesto",
  final: "Final",
};

export default function EventsListPanel({
  visibleEvents,
  allEvents,
  selectedEvent,
  currentYear,
  windowSize,
  activeSafari,
  onSelectEvent,
  onYearChange,
  onClose,
  onCloseSafari,
  forceOpen,
  onMediaModalChange,
}: EventsListPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("collapsed");
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(300);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [panelWidth]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    // Dragging left increases width (panel is on the right)
    const delta = dragStartX.current - e.clientX;
    const next = Math.min(600, Math.max(220, dragStartWidth.current + delta));
    setPanelWidth(next);
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // When a marker is clicked (selectedEvent changes), open detail
  useEffect(() => {
    if (selectedEvent) {
      setPanelState("detail");
    }
  }, [selectedEvent]);

  // Report media modal state
  useEffect(() => {
    if (onMediaModalChange) {
      onMediaModalChange(activeMediaIndex !== null);
    }
  }, [activeMediaIndex, onMediaModalChange]);

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
    onYearChange(event.year);
  };

  const handleBack = () => {
    setPanelState("list");
    onClose();
  };

  const handleCollapse = () => {
    setPanelState("collapsed");
    onClose();
  };

  const sortedEventsList = [...visibleEvents].sort((a, b) => a.year - b.year);
  
  // For navigation (Back/Next), use all events sorted by year, OR safari events if active
  const navigationEvents = activeSafari 
    ? activeSafari.eventIds
        .map(id => allEvents.find(e => e.id === id))
        .filter((e): e is HistoricalEvent => !!e)
    : [...allEvents].sort((a, b) => a.year - b.year);

  const selectedIndex = selectedEvent 
    ? navigationEvents.findIndex(e => e.id === selectedEvent.id) 
    : -1;

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex !== -1 && selectedIndex < navigationEvents.length - 1;
  const isFinalSafariEvent = activeSafari && selectedIndex === navigationEvents.length - 1;

  const safariMatchEvents = activeSafari
    ? activeSafari.eventIds
        .map((id) => allEvents.find((e) => e.id === id))
        .filter((e): e is HistoricalEvent => !!e && e.eventType === "match")
        .sort((a, b) => {
          const stageA = stageOrder[a.stage ?? "group"] ?? 99;
          const stageB = stageOrder[b.stage ?? "group"] ?? 99;
          if (stageA !== stageB) return stageA - stageB;
          return a.title.localeCompare(b.title);
        })
    : [];

  const finalMatch = safariMatchEvents.find((match) => match.stage === "final");
  const champion = finalMatch?.winnerTeam;
  const semifinalWinners = safariMatchEvents
    .filter((match) => match.stage === "semifinal")
    .map((match) => match.winnerTeam)
    .filter((team): team is string => !!team);

  const handlePrev = () => {
    if (hasPrev) {
      const prevEvent = navigationEvents[selectedIndex - 1];
      onSelectEvent(prevEvent);
      onYearChange(prevEvent.year);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextEvent = navigationEvents[selectedIndex + 1];
      onSelectEvent(nextEvent);
      onYearChange(nextEvent.year);
    } else if (isFinalSafariEvent && onCloseSafari) {
      onCloseSafari();
    }
  };

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
        className="flex flex-col overflow-hidden transition-[opacity,box-shadow] duration-300 ease-out"
        style={{
          width: panelState !== "collapsed" ? `${panelWidth}px` : "0px",
          minWidth: panelState !== "collapsed" ? "220px" : undefined,
          maxWidth: panelState !== "collapsed" ? "600px" : undefined,
          transition: isDragging.current ? "none" : "width 300ms ease-out, opacity 300ms ease-out",
          background: "hsl(var(--card))",
          borderLeft: "1px solid hsl(var(--border))",
          boxShadow:
            panelState !== "collapsed"
              ? "-6px 0 32px hsl(0 0% 0% / 0.4)"
              : "none",
          opacity: panelState !== "collapsed" ? 1 : 0,
          pointerEvents: panelState !== "collapsed" ? "auto" : "none",
          position: "relative",
        }}
      >
        {/* ── Drag handle ── */}
        {panelState !== "collapsed" && (
          <div
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className="absolute left-0 top-0 h-full z-50 flex items-center justify-center"
            style={{
              width: "6px",
              cursor: "ew-resize",
              background: "transparent",
            }}
            title="Arrastra para redimensionar"
          >
            <div
              className="h-12 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              style={{ width: "3px", background: "hsl(var(--primary) / 0.6)" }}
            />
          </div>
        )}
        {/* ── LIST VIEW ── */}
        {panelState === "list" && (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <div>
                {activeSafari ? (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 mb-1 w-fit">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono-space text-[9px] uppercase font-bold text-primary tracking-widest whitespace-nowrap">
                      {activeSafari.name}
                    </span>
                    <button 
                      onClick={onCloseSafari}
                      className="hover:text-white text-primary/60 transition-colors ml-1"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <p
                    className="font-mono-space text-xs font-bold uppercase tracking-widest"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    Eventos
                  </p>
                )}
                <p
                  className="font-mono-space text-[10px] mt-0.5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {activeSafari ? `Narrativa Curada` : `± ${windowSize} años de ${formatYear(currentYear)}`}
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
              {sortedEventsList.length === 0 ? (
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
                  {sortedEventsList.map((event) => {
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
                          {event.eventType === "match" && event.homeTeam && event.awayTeam && event.score && (
                            <span
                              className="font-mono-space text-[10px]"
                              style={{ color: "hsl(var(--muted-foreground))" }}
                            >
                              {event.homeFlag && <img src={`https://flagcdn.com/w20/${event.homeFlag.toLowerCase()}.png`} alt={event.homeTeam} className="inline h-3 mr-0.5 align-middle" />}{event.homeTeam} {event.score.home}-{event.score.away} {event.awayTeam}{event.awayFlag && <img src={`https://flagcdn.com/w20/${event.awayFlag.toLowerCase()}.png`} alt={event.awayTeam} className="inline h-3 ml-0.5 align-middle" />}
                            </span>
                          )}
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

              {/* Region & Coordinates */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin
                    className="w-3 h-3 shrink-0"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <span
                    className="font-mono-space text-xs font-bold uppercase tracking-wider"
                    style={{
                      color:
                        regionColors[selectedEvent.region] ??
                        "hsl(var(--muted-foreground))",
                    }}
                  >
                    {selectedEvent.region}
                  </span>
                </div>
                <span
                  className="font-mono-space text-[10px] opacity-60"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {selectedEvent.lat.toFixed(2)}° N, {selectedEvent.lng.toFixed(2)}° E
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-mono-space text-sm font-bold leading-snug mb-4"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {selectedEvent.title}
              </h2>

              {selectedEvent.eventType === "match" && selectedEvent.homeTeam && selectedEvent.awayTeam && selectedEvent.score && (
                <div
                  className="mb-4 p-3 rounded-lg border"
                  style={{
                    background: "hsl(var(--muted) / 0.25)",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {selectedEvent.homeFlag
                        ? <img src={`https://flagcdn.com/w40/${selectedEvent.homeFlag.toLowerCase()}.png`} alt={selectedEvent.homeTeam} className="h-5 rounded-sm" />
                        : <span className="text-lg">🏳️</span>}
                      <span className="font-mono-space text-xs font-bold" style={{ color: "hsl(var(--foreground))" }}>
                        {selectedEvent.homeTeam}
                      </span>
                    </div>
                    <span className="font-mono-space text-xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                      {selectedEvent.score.home}-{selectedEvent.score.away}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-space text-xs font-bold" style={{ color: "hsl(var(--foreground))" }}>
                        {selectedEvent.awayTeam}
                      </span>
                      {selectedEvent.awayFlag
                        ? <img src={`https://flagcdn.com/w40/${selectedEvent.awayFlag.toLowerCase()}.png`} alt={selectedEvent.awayTeam} className="h-5 rounded-sm" />
                        : <span className="text-lg">🏳️</span>}
                    </div>
                  </div>
                  {(selectedEvent.formationHome || selectedEvent.formationAway) && (
                    <div className="mt-2 pt-2 border-t border-border/60 grid grid-cols-2 gap-2">
                      <span className="font-mono-space text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Formación {selectedEvent.homeTeam}: {selectedEvent.formationHome ?? "N/D"}
                      </span>
                      <span className="font-mono-space text-[10px] text-right" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Formación {selectedEvent.awayTeam}: {selectedEvent.formationAway ?? "N/D"}
                      </span>
                    </div>
                  )}
                  {selectedEvent.score.note && (
                    <p className="mt-2 font-mono-space text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {selectedEvent.score.note}
                    </p>
                  )}
                  {selectedEvent.score.penalties && (
                    <p className="font-mono-space text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Penales: {selectedEvent.score.penalties.home}-{selectedEvent.score.penalties.away}
                    </p>
                  )}
                  {selectedEvent.winnerTeam && (
                    <p className="mt-2 font-mono-space text-[10px] font-bold" style={{ color: "hsl(var(--primary))" }}>
                      Ganador: {selectedEvent.winnerTeam}
                    </p>
                  )}

                  {selectedEvent.stage && (
                    <div className="mt-2">
                      <span
                        className="font-mono-space text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          color: "hsl(var(--primary))",
                          background: "hsl(var(--primary) / 0.1)",
                          border: "1px solid hsl(var(--primary) / 0.4)",
                        }}
                      >
                        {stageLabel[selectedEvent.stage] ?? selectedEvent.stage}
                      </span>
                    </div>
                  )}

                  {safariMatchEvents.length > 1 && (
                    <div className="mt-3 pt-2 border-t border-border/60">
                      <p className="font-mono-space text-[10px] uppercase tracking-widest mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Camino eliminatorio
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {safariMatchEvents.map((match) => {
                          const isCurrent = match.id === selectedEvent.id;
                          const winner = match.winnerTeam ? ` · ${match.winnerTeam}` : "";
                          return (
                            <button
                              key={match.id}
                              onClick={() => handleSelectEvent(match)}
                              className="font-mono-space text-[9px] px-2 py-1 rounded-md border transition-colors"
                              style={{
                                color: isCurrent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                                background: isCurrent ? "hsl(var(--primary) / 0.12)" : "hsl(var(--muted) / 0.2)",
                                borderColor: isCurrent ? "hsl(var(--primary) / 0.45)" : "hsl(var(--border) / 0.6)",
                              }}
                              title={`${match.homeTeam} ${match.score?.home}-${match.score?.away} ${match.awayTeam}${winner}`}
                            >
                              {stageLabel[match.stage ?? "group"] ?? "Partido"}
                            </button>
                          );
                        })}
                      </div>


                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(var(--foreground) / 0.85)" }}
              >
                {selectedEvent.description}
              </p>

              {selectedEvent.eventType === "match" && selectedEvent.scorers && selectedEvent.scorers.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="font-mono-space text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                    GOLEADORES
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {selectedEvent.scorers.map((scorer, idx) => (
                      <div key={`${scorer.team}-${scorer.minute}-${idx}`} className="flex items-center justify-between">
                        <span className="font-mono-space text-[11px]" style={{ color: "hsl(var(--foreground) / 0.9)" }}>
                          {scorer.team} · {scorer.player}
                        </span>
                        <span className="font-mono-space text-[10px]" style={{ color: "hsl(var(--primary))" }}>
                          {scorer.minute}'
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.eventType === "match" && selectedEvent.matchTimeline && selectedEvent.matchTimeline.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="font-mono-space text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                    TIMELINE DEL PARTIDO
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {selectedEvent.matchTimeline.map((item, idx) => (
                      <div key={`${item.type}-${item.minute}-${idx}`} className="flex items-center justify-between gap-3">
                        <span className="font-mono-space text-[11px] leading-snug" style={{ color: "hsl(var(--foreground) / 0.9)" }}>
                          {item.description}
                        </span>
                        <span className="font-mono-space text-[10px] shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {item.minute}'
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multimedia Section */}
              {selectedEvent.media && selectedEvent.media.length > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <p className="font-mono-space text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                    MULTIMEDIA
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEvent.media.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveMediaIndex(index)}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted/20 transition-all hover:border-primary/50 hover:bg-muted/40"
                      >
                        {item.type === "image" && item.url ? (
                          <img 
                            src={(() => {
                              const getOptimizedWikiUrl = (url: string, size: number) => {
                                if (url.includes("upload.wikimedia.org") && url.includes("/thumb/")) {
                                  return url.replace(/\/\d+px-/, `/${size}px-`);
                                }
                                return url;
                              };
                              return getOptimizedWikiUrl(item.url, 330);
                            })()} 
                            alt={item.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 p-3">
                            {item.type === "video" && <Play className="w-6 h-6 text-primary/70" />}
                            {item.type === "link" && <ExternalLink className="w-6 h-6 text-primary/70" />}
                            <span className="text-[10px] font-medium text-center line-clamp-2 leading-tight">
                              {item.title}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation & Related Events Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono-space text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {activeSafari 
                      ? activeSafari.name 
                      : (selectedEvent.relatedEvents && selectedEvent.relatedEvents.length > 0 
                        ? "EVENTOS RELACIONADOS" 
                        : "NAVEGACIÓN HISTÓRICA")}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={!hasPrev}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                      style={{
                        background: hasPrev ? "hsl(var(--primary) / 0.1)" : "transparent",
                        color: hasPrev ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)",
                        border: `1px solid ${hasPrev ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border) / 0.5)"}`,
                        cursor: hasPrev ? "pointer" : "default",
                      }}
                      onMouseEnter={(e) => {
                        if (hasPrev) {
                          e.currentTarget.style.background = "hsl(var(--primary) / 0.2)";
                          e.currentTarget.style.borderColor = "hsl(var(--primary))";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasPrev) {
                          e.currentTarget.style.background = "hsl(var(--primary) / 0.1)";
                          e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)";
                        }
                      }}
                      aria-label="Evento anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!hasNext && !isFinalSafariEvent}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                      style={{
                        background: (hasNext || isFinalSafariEvent) ? "hsl(var(--primary) / 0.1)" : "transparent",
                        color: (hasNext || isFinalSafariEvent) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)",
                        border: `1px solid ${(hasNext || isFinalSafariEvent) ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border) / 0.5)"}`,
                        cursor: (hasNext || isFinalSafariEvent) ? "pointer" : "default",
                      }}
                      onMouseEnter={(e) => {
                        if (hasNext || isFinalSafariEvent) {
                          e.currentTarget.style.background = "hsl(var(--primary) / 0.2)";
                          e.currentTarget.style.borderColor = "hsl(var(--primary))";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasNext || isFinalSafariEvent) {
                          e.currentTarget.style.background = "hsl(var(--primary) / 0.1)";
                          e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)";
                        }
                      }}
                      aria-label={isFinalSafariEvent ? "Finalizar safari" : "Próximo evento"}
                    >
                      {isFinalSafariEvent ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {selectedEvent.relatedEvents && selectedEvent.relatedEvents.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {selectedEvent.relatedEvents.map(relatedId => {
                      const relatedEvent = allEvents.find(e => e.id === relatedId);
                      if (!relatedEvent) return null;
                      return (
                        <button
                          key={relatedId}
                          onClick={() => handleSelectEvent(relatedEvent)}
                          className="text-left p-2 rounded border transition-all hover:bg-muted/50 group"
                          style={{ borderColor: "hsl(var(--border) / 0.5)" }}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-mono-space text-[10px] font-bold" style={{ color: "hsl(var(--primary))" }}>
                              {formatYear(relatedEvent.year)}
                            </span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "hsl(var(--muted-foreground))" }} />
                          </div>
                          <p className="text-[11px] leading-tight font-medium line-clamp-1 group-hover:text-foreground">
                            {relatedEvent.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>


            </div>
          </>
        )}
      </div>

      {/* ── MULTIMEDIA MODAL ── */}
      {activeMediaIndex !== null && selectedEvent && selectedEvent.media && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8"
          style={{ background: "hsl(0 0% 0% / 0.85)", backdropFilter: "blur(8px)" }}
        >
          {/* Close Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setActiveMediaIndex(null)} />
          
          <div className="relative w-full h-full md:h-auto max-w-5xl md:aspect-auto md:max-h-[90vh] flex flex-col items-center z-10 pt-2 md:pt-0 pb-4 md:pb-0">
            {/* Header / Controls */}
            <div className="w-full flex items-center justify-between p-4 md:absolute md:-top-12 md:left-0 md:right-0 md:p-0 md:px-2 pointer-events-none shrink-0 z-30 gap-3">
              <h3 className="text-white font-mono-space text-base md:text-lg font-bold pointer-events-auto drop-shadow-lg pr-4 line-clamp-2 md:line-clamp-1">
                {selectedEvent.media[activeMediaIndex].title}
              </h3>
              <button 
                onClick={() => setActiveMediaIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto shrink-0 z-40"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Media Content */}
            <div className="relative w-full flex-1 md:flex-none md:aspect-video flex items-center justify-center bg-black/80 md:bg-black/50 md:rounded-xl overflow-hidden md:border border-white/10 md:shadow-2xl">
              {/* Previous Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev! > 0 ? prev! - 1 : selectedEvent.media!.length - 1));
                }}
                className="absolute left-2 md:left-4 z-20 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Content Rendering */}
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center overflow-hidden p-2 md:p-4">
                  {selectedEvent.media[activeMediaIndex].type === "image" && (
                    <img 
                      src={selectedEvent.media[activeMediaIndex].url}
                      alt={selectedEvent.media[activeMediaIndex].title}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                  {selectedEvent.media[activeMediaIndex].type === "video" && (
                    <div className="w-full h-full flex items-center justify-center">
                      {selectedEvent.media[activeMediaIndex].url.includes("youtube.com") || selectedEvent.media[activeMediaIndex].url.includes("youtu.be") ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${selectedEvent.media[activeMediaIndex].url.split("v=")[1] || selectedEvent.media[activeMediaIndex].url.split("/").pop()}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full aspect-video"
                        />
                      ) : (
                        <div className="text-white flex flex-col items-center gap-4">
                          <Play className="w-16 h-16 opacity-50" />
                          <p>Video de plataforma externa</p>
                          <a 
                            href={selectedEvent.media[activeMediaIndex].url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold"
                          >
                            Ver en la plataforma
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedEvent.media[activeMediaIndex].type === "link" && (
                    <div className="text-white flex flex-col items-center justify-center gap-6 p-12 text-center max-w-xl mx-auto">
                      <Globe className="w-24 h-24 text-primary opacity-50" />
                      <div>
                        <h4 className="text-2xl font-bold mb-2">{selectedEvent.media[activeMediaIndex].title}</h4>
                        <p className="text-zinc-400 mb-8">{selectedEvent.media[activeMediaIndex].description}</p>
                        <a 
                          href={selectedEvent.media[activeMediaIndex].url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Visitar sitio web
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Description Footer */}
                {(selectedEvent.media[activeMediaIndex].description || selectedEvent.media[activeMediaIndex].sourceName) && (
                  <div className="bg-black/90 md:bg-black/80 p-4 md:p-6 border-t border-white/10 shrink-0">
                    {selectedEvent.media[activeMediaIndex].description && (
                      <p className="text-white text-sm md:text-base leading-relaxed mb-2 text-center">
                        {selectedEvent.media[activeMediaIndex].description}
                      </p>
                    )}
                    {selectedEvent.media[activeMediaIndex].sourceName && (
                      <p className="text-zinc-500 text-[10px] md:text-xs font-mono-space text-center uppercase tracking-widest">
                        Fuente: {selectedEvent.media[activeMediaIndex].sourceName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Next Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev! < selectedEvent.media!.length - 1 ? prev! + 1 : 0));
                }}
                className="absolute right-2 md:right-4 z-20 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Pagination dots */}
            <div className="flex gap-2 p-4 md:p-0 md:mt-6 pb-6 md:pb-0 justify-center w-full shrink-0 z-20">
              {selectedEvent.media.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeMediaIndex ? "bg-primary w-6" : "bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
