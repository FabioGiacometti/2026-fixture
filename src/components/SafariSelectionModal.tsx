import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ArrowLeft, Globe, Map as MapIcon, BookOpen, Clock, Check } from "lucide-react";
import { Safari, HistoricalEvent, formatYear } from "@/data/historical-events";

const STORAGE_KEY = "safari-historico-read";

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
  semifinal: "Semifinales",
  "third-place": "Tercer puesto",
  final: "Final",
};

function getReadSafaris(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markSafariAsRead(safariId: string) {
  const read = getReadSafaris();
  read.add(safariId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...read]));
}

interface SafariSelectionModalProps {
  isOpen: boolean;
  safaris: Safari[];
  allEvents: HistoricalEvent[];
  onSelectSafari: (safariId: string) => void;
  onJumpToEvent?: (safariId: string, eventId: string) => void;
  onClose: () => void;
  title?: string;
}

export default function SafariSelectionModal({
  isOpen,
  safaris,
  allEvents,
  onSelectSafari,
  onJumpToEvent,
  onClose,
  title = "Safaris Históricos",
}: SafariSelectionModalProps) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedSafari, setSelectedSafari] = useState<Safari | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadSafaris());

  const sortedSafaris = useMemo(() => {
    return [...safaris].sort((a, b) => {
      const aRead = readIds.has(a.id) ? 1 : 0;
      const bRead = readIds.has(b.id) ? 1 : 0;
      if (aRead !== bRead) return aRead - bRead;
      // Preserve caller-supplied order (worldCupSafaris is already newest-first)
      return 0;
    });
  }, [safaris, readIds]);

  const handleSelectCard = (safari: Safari) => {
    setSelectedSafari(safari);
    setView("detail");
  };

  const handleStartSafari = (safariId: string) => {
    markSafariAsRead(safariId);
    setReadIds(getReadSafaris());
    onSelectSafari(safariId);
  };

  const handleBack = () => {
    setView("list");
    setSelectedSafari(null);
  };

  const handleJumpToEvent = (safariId: string, eventId: string) => {
    markSafariAsRead(safariId);
    setReadIds(getReadSafaris());
    if (onJumpToEvent) {
      onJumpToEvent(safariId, eventId);
      return;
    }
    onSelectSafari(safariId);
  };

  const getSafariEvents = (safari: Safari) => {
    return safari.eventIds
      .map(id => allEvents.find(e => e.id === id))
      .filter((e): e is HistoricalEvent => !!e);
  };

  const getFixtureOverview = (safari: Safari) => {
    const matchEvents = getSafariEvents(safari)
      .filter((event) => event.eventType === "match")
      .sort((a, b) => {
        const stageA = stageOrder[a.stage ?? "group"] ?? 99;
        const stageB = stageOrder[b.stage ?? "group"] ?? 99;
        if (stageA !== stageB) return stageA - stageB;
        return a.title.localeCompare(b.title);
      });

    const grouped = new Map<string, HistoricalEvent[]>();
    matchEvents.forEach((event) => {
      const key = event.stage ?? "group";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(event);
    });

    return Array.from(grouped.entries()).map(([stage, events]) => ({
      stage,
      label: stageLabel[stage] ?? stage,
      events,
    }));
  };

  const getOptimizedWikiUrl = (url: string, size: number) => {
    if (url.includes("upload.wikimedia.org") && url.includes("/thumb/")) {
      return url.replace(/\/\d+px-/, `/${size}px-`);
    }
    return url;
  };

  const fixtureOverview = useMemo(() => {
    if (!selectedSafari) return [] as Array<{ stage: string; label: string; events: HistoricalEvent[] }>;
    return getFixtureOverview(selectedSafari);
  }, [selectedSafari, allEvents]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-[#111319] border-white/10 text-white p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            {view === "detail" && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="font-mono-space text-lg uppercase tracking-[0.2em] text-primary">
              {view === "list" ? title : selectedSafari?.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-hidden flex flex-col">
          {view === "list" ? (
            <ScrollArea className="flex-1">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedSafaris.map((safari) => {
                  const isRead = readIds.has(safari.id);
                  return (
                    <Card 
                      key={safari.id}
                      className={`bg-white/5 border-white/10 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden ${isRead ? 'opacity-60' : ''}`}
                      onClick={() => handleSelectCard(safari)}
                    >
                      <div className="aspect-video w-full bg-black/40 relative">
                        {safari.thumbnail ? (
                          <img 
                            src={getOptimizedWikiUrl(safari.thumbnail, 330)} 
                            alt={safari.name} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center opacity-80 px-4 text-center">
                            <Globe className="w-10 h-10 mb-2 text-white/30" />
                            <span className="font-mono-space text-[10px] uppercase tracking-widest text-white/60">
                              {safari.thumbnailLabel ?? "No thumbnail"}
                            </span>
                          </div>
                        )}
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
                        />
                        {isRead && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500/80 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-3 left-4">
                          <div 
                            className="w-8 h-1 rounded-full mb-2" 
                            style={{ backgroundColor: safari.color || "hsl(var(--primary))" }}
                          />
                          <h3 className="font-mono-space font-bold text-sm uppercase tracking-wider text-white">
                            {safari.name}
                          </h3>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                          {safari.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
                
                <Card 
                  className="bg-white/5 border-dashed border-white/10 hover:border-white/30 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center"
                  onClick={onClose}
                >
                  <MapIcon className="w-8 h-8 text-white/20 mb-3" />
                  <h3 className="font-mono-space text-xs uppercase tracking-wider text-white/60">
                    Exploración Libre
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1">
                    Navega por el mapa global sin narrativa guiada
                  </p>
                </Card>
              </div>
            </ScrollArea>
          ) : (
            selectedSafari && (
              <ScrollArea className="flex-1">
                <div className="p-8">
                  <div className="flex flex-col gap-6">
                    {/* Safari Overview */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-primary">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-mono-space text-[10px] uppercase tracking-[0.1em]">Contexto Histórico</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed font-light italic border-l-2 border-primary/30 pl-6 py-2">
                        {selectedSafari.overview}
                      </p>
                    </div>

                    {/* Event List Preview */}
                    <div className="flex flex-col gap-4 mt-4">
                      <div className="flex items-center gap-2 text-white/40">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono-space text-[10px] uppercase tracking-[0.1em]">Hitos Cronológicos</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getSafariEvents(selectedSafari).map((event, idx) => (
                          <button
                            key={event.id}
                            onClick={() => handleJumpToEvent(selectedSafari.id, event.id)}
                            className="w-full text-left bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:bg-white/10 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] text-primary/70 font-mono-space">
                                {formatYear(event.year)}
                              </span>
                              <span className="text-xs font-bold text-white/90">
                                {event.title}
                              </span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 group-hover:bg-primary group-hover:text-black transition-colors">
                              {idx + 1}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fixture overview by stage for World Cup safaris */}
                    {fixtureOverview.length > 0 && (
                      <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono-space text-[10px] uppercase tracking-[0.1em]">Fixture del torneo</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {fixtureOverview.map((group) => (
                            <div key={group.stage} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                              <p className="font-mono-space text-[10px] uppercase tracking-widest text-primary mb-2">
                                {group.label}
                              </p>
                              <div className="flex flex-col gap-2">
                                {group.events.map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() => handleJumpToEvent(selectedSafari.id, event.id)}
                                    className="w-full text-left flex items-center justify-between gap-3 text-xs text-white/80 hover:text-white transition-colors"
                                  >
                                    <span className="font-semibold line-clamp-1">{event.homeTeam} vs {event.awayTeam}</span>
                                    <span className="font-mono-space text-primary shrink-0">
                                      {event.score?.home ?? "-"}-{event.score?.away ?? "-"}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="font-mono-space text-[10px] uppercase tracking-wider text-white/40 hover:text-white"
          >
            Explorar libremente
          </Button>
          {view === "detail" && selectedSafari && (
            <Button 
              onClick={() => handleStartSafari(selectedSafari.id)}
              className="bg-primary text-black hover:bg-primary/90 font-mono-space text-[10px] uppercase tracking-wider px-8"
            >
              Empezar Safari
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
