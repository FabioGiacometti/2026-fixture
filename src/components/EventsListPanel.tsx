import { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, X, MapPin, Calendar, List, Play, Image as ImageIcon, ExternalLink, Globe, Video, Maximize2 } from "lucide-react";
import { Safari, HistoricalEvent, formatYear } from "@/data/historical-events";

type PanelState = "collapsed" | "list" | "detail";

interface EventsListPanelProps {
  visibleEvents: HistoricalEvent[];
  allEvents: HistoricalEvent[];
  selectedEvent: HistoricalEvent | null;
  currentYear: number;
  activeSafari?: Safari | null;
  onSelectEvent: (event: HistoricalEvent) => void;
  onYearChange: (year: number) => void;
  onClose: () => void;
  onCloseSafari?: () => void;
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
  allEvents,
  selectedEvent,
  currentYear,
  activeSafari,
  onSelectEvent,
  onYearChange,
  onClose,
  onCloseSafari,
  forceOpen,
}: EventsListPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("collapsed");
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

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

  const panelWidth =
    panelState === "collapsed" ? "36px" : "300px";

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
                  {activeSafari ? `Narrativa Curada` : `± 300 años de ${formatYear(currentYear)}`}
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

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(var(--foreground) / 0.85)" }}
              >
                {selectedEvent.description}
              </p>

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          style={{ background: "hsl(0 0% 0% / 0.85)", backdropFilter: "blur(8px)" }}
        >
          {/* Close Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setActiveMediaIndex(null)} />
          
          <div className="relative w-full max-w-5xl aspect-video md:aspect-auto md:max-h-[90vh] flex flex-col items-center gap-6 z-10">
            {/* Header / Controls */}
            <div className="absolute -top-12 left-0 right-0 flex items-center justify-between pointer-events-none px-2">
              <h3 className="text-white font-mono-space text-lg font-bold pointer-events-auto drop-shadow-lg">
                {selectedEvent.media[activeMediaIndex].title}
              </h3>
              <button 
                onClick={() => setActiveMediaIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Media Content */}
            <div className="relative w-full h-full flex items-center justify-center bg-black/50 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Previous Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev! > 0 ? prev! - 1 : selectedEvent.media!.length - 1));
                }}
                className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Content Rendering */}
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
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
                  <div className="bg-black/80 p-6 border-t border-white/10">
                    {selectedEvent.media[activeMediaIndex].description && (
                      <p className="text-white text-base leading-relaxed mb-2 text-center">
                        {selectedEvent.media[activeMediaIndex].description}
                      </p>
                    )}
                    {selectedEvent.media[activeMediaIndex].sourceName && (
                      <p className="text-zinc-500 text-xs font-mono-space text-center uppercase tracking-widest">
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
                className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Pagination dots */}
            <div className="flex gap-2">
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
