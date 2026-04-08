import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Globe,
  Map as MapIcon,
  BookOpen,
  Clock,
  Check,
  Trophy,
  MapPin,
  CalendarDays,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Safari, HistoricalEvent, formatEventDate } from "@/data/historical-events";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "safari-historico-read";

const stageOrder: Record<string, number> = {
  group: 1,
  round32: 2,
  round16: 3,
  quarterfinal: 4,
  semifinal: 5,
  "third-place": 6,
  final: 7,
};

const stageLabel: Record<string, string> = {
  group: "Grupos",
  round32: "16avos",
  round16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinales",
  "third-place": "Tercer puesto",
  final: "Final",
};

const regionColors: Record<string, string> = {
  Europa: "hsl(220 80% 60%)",
  Asia: "hsl(30 90% 60%)",
  África: "hsl(120 60% 50%)",
  América: "hsl(280 70% 65%)",
  Espacio: "hsl(200 80% 70%)",
};

const worldCupLogoModules = import.meta.glob("../assets/world cup/logos/*.{png,jpg,jpeg,webp}", {
  eager: true,
}) as Record<string, { default: string }>;

const worldCupLogosByYear: Record<number, string> = Object.entries(worldCupLogoModules).reduce(
  (acc, [path, module]) => {
    const match = path.match(/(\d{4})\.(png|jpg|jpeg|webp)$/i);
    if (!match) return acc;
    acc[Number(match[1])] = module.default;
    return acc;
  },
  {} as Record<number, string>
);

const countryFlagCodes: Record<string, string[]> = {
  Uruguay: ["uy"],
  Argentina: ["ar"],
  Italy: ["it"],
  France: ["fr"],
  Brazil: ["br"],
  Switzerland: ["ch"],
  Sweden: ["se"],
  Chile: ["cl"],
  England: ["gb"],
  Mexico: ["mx"],
  "West Germany": ["de"],
  Spain: ["es"],
  "United States": ["us"],
  "South Korea/Japan": ["kr", "jp"],
  Germany: ["de"],
  "South Africa": ["za"],
  Russia: ["ru"],
  Qatar: ["qa"],
  "Canadá / México / Estados Unidos": ["ca", "mx", "us"],
  Netherlands: ["nl"],
  Croatia: ["hr"],
  Czechoslovakia: ["cz"],
  Hungary: ["hu"],
};

function getWinningTeam(event?: HistoricalEvent): string | undefined {
  if (!event?.homeTeam || !event.awayTeam) return undefined;

  const homeScore = event.score?.home ?? 0;
  const awayScore = event.score?.away ?? 0;

  if (homeScore > awayScore) return event.homeTeam;
  if (awayScore > homeScore) return event.awayTeam;

  if (event.score?.penalties) {
    return event.score.penalties.home > event.score.penalties.away
      ? event.homeTeam
      : event.awayTeam;
  }

  return undefined;
}

function getCountryFlagCodes(name?: string) {
  if (!name) return [] as string[];
  return countryFlagCodes[name] ?? [];
}

function getSafariYear(safari: Safari) {
  const match = safari.id.match(/\d{4}/) ?? safari.name.match(/\d{4}/);
  return match ? Number(match[0]) : undefined;
}

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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

  const sortedSafaris = useMemo(() => {
    return [...safaris].sort((a, b) => {
      const aRead = readIds.has(a.id) ? 1 : 0;
      const bRead = readIds.has(b.id) ? 1 : 0;
      if (aRead !== bRead) return aRead - bRead;
      // Preserve caller-supplied order (worldCupSafaris is already newest-first)
      return 0;
    });
  }, [safaris, readIds]);

  const isWorldCupMode = useMemo(
    () => safaris.every((safari) => safari.id.startsWith("world-cup-")),
    [safaris]
  );

  useEffect(() => {
    if (!isOpen) return;
    setView("list");
    setSelectedSafari(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isWorldCupMode || sortedSafaris.length === 0) return;

    const firstUnreadIndex = sortedSafaris.findIndex((safari) => !readIds.has(safari.id));
    setCarouselIndex(firstUnreadIndex >= 0 ? firstUnreadIndex : 0);
  }, [isOpen, isWorldCupMode, sortedSafaris, readIds]);

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
    const events = safari.eventIds
      .map(id => allEvents.find(e => e.id === id))
      .filter((e): e is HistoricalEvent => !!e);

    if (!isWorldCupMode) return events;

    return [...events].sort((a, b) => {
      const aMatch = a.eventType === "match" ? 1 : 0;
      const bMatch = b.eventType === "match" ? 1 : 0;

      if (aMatch !== bMatch) return bMatch - aMatch;

      const stageA = stageOrder[a.stage ?? "group"] ?? -1;
      const stageB = stageOrder[b.stage ?? "group"] ?? -1;
      if (stageA !== stageB) return stageB - stageA;

      const dateA = new Date(a.year, (a.month ?? 1) - 1, a.day ?? 1).getTime();
      const dateB = new Date(b.year, (b.month ?? 1) - 1, b.day ?? 1).getTime();
      return dateB - dateA;
    });
  };

  const worldCupCards = useMemo(() => {
    if (!isWorldCupMode) return [] as Array<{
      safari: Safari;
      year: number;
      logo?: string;
      continent: string;
      host: string;
      city: string;
      hostFlagCodes: string[];
      winner: string;
      winnerFlagCodes: string[];
      contendersText: string;
      scoreText?: string;
      milestoneText: string;
    }>;

    return sortedSafaris.map((safari) => {
      const events = getSafariEvents(safari);
      const milestone = events.find((event) => event.eventType === "milestone") ?? events[0];
      const finalEvent = [...events].reverse().find((event) => event.stage === "final")
        ?? [...events].reverse().find((event) => event.eventType === "match");
      const [hostPart = "", cityPart = ""] = safari.description.split("·");
      const year = milestone?.year ?? getSafariYear(safari) ?? 0;

      const scoreText = finalEvent?.score && finalEvent.homeTeam && finalEvent.awayTeam
        ? `${finalEvent.homeTeam} ${finalEvent.score.home}-${finalEvent.score.away} ${finalEvent.awayTeam}${
            finalEvent.score.penalties
              ? ` · pen. ${finalEvent.score.penalties.home}-${finalEvent.score.penalties.away}`
              : ""
          }`
        : undefined;

      const host = hostPart.trim() || "País sede";
      const winner = getWinningTeam(finalEvent) ?? (year >= new Date().getFullYear() ? "Por definir" : "Campeón destacado");

      return {
        safari,
        year,
        logo: worldCupLogosByYear[year],
        continent: milestone?.region ?? "Global",
        host,
        city: cityPart.split(".")[0]?.trim() ?? "",
        hostFlagCodes: getCountryFlagCodes(host),
        winner,
        winnerFlagCodes: getCountryFlagCodes(winner),
        contendersText: finalEvent?.homeTeam && finalEvent.awayTeam
          ? `${finalEvent.homeTeam} - ${finalEvent.awayTeam}`
          : "Final histórica destacada",
        scoreText,
        milestoneText: milestone?.description ?? safari.overview,
      };
    });
  }, [isWorldCupMode, sortedSafaris, allEvents]);

  const activeWorldCup = worldCupCards[carouselIndex] ?? worldCupCards[0];

  const moveCarousel = (direction: number) => {
    if (worldCupCards.length === 0) return;
    setCarouselIndex((current) => (current + direction + worldCupCards.length) % worldCupCards.length);
  };

  const beginSwipe = (clientX: number) => {
    swipeStartX.current = clientX;
    didSwipeRef.current = false;
  };

  const endSwipe = (clientX: number) => {
    if (swipeStartX.current === null) return;

    const deltaX = clientX - swipeStartX.current;
    swipeStartX.current = null;

    if (Math.abs(deltaX) < 40) return;

    didSwipeRef.current = true;
    moveCarousel(deltaX > 0 ? -1 : 1);
  };

  const getFixtureOverview = (safari: Safari) => {
    const matchEvents = getSafariEvents(safari)
      .filter((event) => event.eventType === "match")
      .sort((a, b) => {
        const stageA = stageOrder[a.stage ?? "group"] ?? -1;
        const stageB = stageOrder[b.stage ?? "group"] ?? -1;
        if (stageA !== stageB) return stageB - stageA;
        return b.title.localeCompare(a.title);
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

  const selectedSafariEvents = useMemo(() => {
    if (!selectedSafari) return [] as HistoricalEvent[];
    return getSafariEvents(selectedSafari);
  }, [selectedSafari, allEvents, isWorldCupMode]);

  const selectedSafariMilestone = useMemo(
    () => selectedSafariEvents.find((event) => event.eventType === "milestone") ?? null,
    [selectedSafariEvents]
  );

  const milestoneLinks = useMemo(
    () => selectedSafariMilestone?.media?.filter((item) => item.type === "link") ?? [],
    [selectedSafariMilestone]
  );

  const fixtureOverview = useMemo(() => {
    if (!selectedSafari) return [] as Array<{ stage: string; label: string; events: HistoricalEvent[] }>;
    return getFixtureOverview(selectedSafari);
  }, [selectedSafari, allEvents]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "bg-background border-border text-foreground p-0 overflow-hidden gap-0 max-h-[92vh]",
          isWorldCupMode && view === "list" ? "sm:max-w-[960px]" : "sm:max-w-[700px]"
        )}
      >
        <DialogHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            {view === "detail" && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="font-mono-space text-lg uppercase tracking-[0.2em] text-primary">
              {view === "list" ? title : selectedSafari?.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div
          className={cn(
            "flex min-h-0 flex-col overflow-hidden",
            isWorldCupMode && view === "list" ? "max-h-[calc(92vh-88px)]" : "max-h-[60vh]"
          )}
        >
          {view === "list" ? (
            isWorldCupMode ? (
              <div className="flex-1 overflow-y-auto bg-background">
                <div className="relative overflow-hidden px-4 pb-4 pt-6 sm:px-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.18),_transparent_0,_transparent_60%)]" />

                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono-space text-[10px] uppercase tracking-[0.28em] text-primary/80">
                        Selección inmersiva
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Desliza entre ediciones históricas y abre el safari de cada Mundial.
                      </p>
                    </div>
                    <div className="hidden rounded-full border border-border bg-card/70 px-3 py-1 font-mono-space text-[10px] uppercase tracking-[0.24em] text-muted-foreground sm:block">
                      {worldCupCards.length} copas
                    </div>
                  </div>

                  <div
                    className="relative h-[320px] select-none touch-pan-y sm:h-[390px] [perspective:1400px]"
                    onTouchStart={(event) => beginSwipe(event.touches[0].clientX)}
                    onTouchEnd={(event) => endSwipe(event.changedTouches[0].clientX)}
                    onPointerDown={(event) => beginSwipe(event.clientX)}
                    onPointerUp={(event) => endSwipe(event.clientX)}
                  >
                    {worldCupCards.map((item, index) => {
                      const total = worldCupCards.length;
                      let offset = index - carouselIndex;

                      if (offset > total / 2) offset -= total;
                      if (offset < -total / 2) offset += total;
                      if (Math.abs(offset) > 2) return null;

                      const isActive = offset === 0;

                      return (
                        <button
                          key={item.safari.id}
                          type="button"
                          onClick={() => {
                            if (didSwipeRef.current) {
                              didSwipeRef.current = false;
                              return;
                            }

                            if (isActive) {
                              handleSelectCard(item.safari);
                              return;
                            }
                            setCarouselIndex(index);
                          }}
                          className="absolute left-1/2 top-1/2 h-[250px] w-[180px] -translate-y-1/2 sm:h-[320px] sm:w-[240px] will-change-transform transition-[transform,opacity,filter] duration-700 ease-out"
                          style={{
                            transform: `translate3d(calc(-50% + ${offset * 170}px), -50%, ${isActive ? "80px" : "-70px"}) rotateY(${offset * -32}deg) scale(${isActive ? 1 : Math.abs(offset) === 1 ? 0.82 : 0.68})`,
                            zIndex: 30 - Math.abs(offset),
                            opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.72 : 0.42,
                            filter: isActive ? "blur(0px) saturate(1)" : Math.abs(offset) === 1 ? "blur(0.4px) saturate(0.8)" : "blur(1px) saturate(0.65)",
                          }}
                        >
                          <div
                            className={cn(
                              "group relative h-full overflow-hidden rounded-[26px] border text-left transition-all duration-500 ease-out",
                              isActive
                                ? "border-border bg-card shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
                                : "border-border/70 bg-muted/80 scale-[0.98]"
                            )}
                          >
                            {item.logo ? (
                              <>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.14),_transparent_58%)]" />
                                <img
                                  src={item.logo}
                                  alt={`${item.safari.name} logo`}
                                  className="absolute inset-0 h-full w-full object-contain px-4 pb-16 pt-5 opacity-[0.72] mix-blend-multiply transition-transform duration-500 group-hover:scale-105 sm:px-5 sm:pb-20 sm:pt-6"
                                />
                              </>
                            ) : item.safari.thumbnail ? (
                              <img
                                src={getOptimizedWikiUrl(item.safari.thumbnail, 420)}
                                alt={item.safari.name}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.22),_transparent_58%)]">
                                <Globe className="h-16 w-16 text-white/20" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/72 via-35% to-white/0" />

                            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4">
                              <span className="rounded-full bg-black/75 px-3 py-1 font-mono-space text-[9px] uppercase tracking-[0.24em] text-white shadow-sm">
                                {item.continent}
                              </span>
                              {readIds.has(item.safari.id) && (
                                <span className="rounded-full border border-emerald-500/55 bg-white/80 px-2 py-1 font-mono-space text-[8px] uppercase tracking-[0.2em] text-emerald-700 shadow-sm backdrop-blur-sm">
                                  Visto
                                </span>
                              )}
                            </div>

                            <div className="absolute inset-x-0 bottom-0 rounded-b-[26px] bg-gradient-to-t from-black/95 via-black/82 to-transparent p-4 sm:p-5">
                              <p className="font-mono-space text-[11px] uppercase tracking-[0.28em] text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                                {item.year}
                              </p>
                              <div className="mt-2 flex items-end justify-between gap-3">
                                <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] sm:text-[1.9rem]">
                                  {item.host}
                                </h3>
                                {item.hostFlagCodes.length > 0 && (
                                  <span className="mb-1 flex shrink-0 items-center gap-1">
                                    {item.hostFlagCodes.map((code) => (
                                      <img
                                        key={`${item.safari.id}-host-${code}`}
                                        src={`https://flagcdn.com/w40/${code}.png`}
                                        alt={`${item.host} flag`}
                                        className="h-[11px] w-4 rounded-[2px] object-cover shadow-sm sm:h-[14px] sm:w-5"
                                      />
                                    ))}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-white/85 sm:text-[15px]">
                                <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">Campeón · {item.winner}</span>
                                {item.winnerFlagCodes.length > 0 && (
                                  <span className="flex shrink-0 items-center gap-1">
                                    {item.winnerFlagCodes.map((code) => (
                                      <img
                                        key={`${item.safari.id}-winner-${code}`}
                                        src={`https://flagcdn.com/w40/${code}.png`}
                                        alt={`${item.winner} flag`}
                                        className="h-[11px] w-4 rounded-[2px] object-cover shadow-sm sm:h-[14px] sm:w-5"
                                      />
                                    ))}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 font-mono-space text-[10px] text-white/88 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-[11px]">
                                Final: {item.contendersText}
                              </p>
                              {isActive && (
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 font-mono-space text-[10px] uppercase tracking-[0.18em] text-black">
                                  Ver safari
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative mt-3 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => moveCarousel(-1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-all duration-300 hover:scale-110 hover:bg-secondary/80 active:scale-95"
                      aria-label="Mundial anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="rounded-full border border-border bg-background/70 px-3 py-1 font-mono-space text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {worldCupCards.length > 0 ? `${carouselIndex + 1} / ${worldCupCards.length}` : "0 / 0"}
                    </div>
                    <button
                      type="button"
                      onClick={() => moveCarousel(1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-black transition-all duration-300 hover:scale-110 hover:bg-primary/90 active:scale-95"
                      aria-label="Siguiente Mundial"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {activeWorldCup && (
                  <div
                    key={activeWorldCup.safari.id}
                    className="border-t border-border bg-card/20 px-4 pb-6 pt-5 sm:px-6 animate-in fade-in slide-in-from-bottom-3 duration-500"
                  >
                    <div className="mb-4 flex items-center gap-2 text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-mono-space text-[10px] uppercase tracking-[0.2em]">
                        Safari mundialista destacado
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-background/40 p-3">
                        <p className="font-mono-space text-[9px] uppercase tracking-[0.2em] text-muted-foreground">País sede</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="flex items-center gap-2">
                            <span>{activeWorldCup.host}</span>
                            {activeWorldCup.hostFlagCodes.map((code) => (
                              <img
                                key={`host-panel-${code}`}
                                src={`https://flagcdn.com/w40/${code}.png`}
                                alt={`${activeWorldCup.host} flag`}
                                className="h-[10px] w-4 rounded-[2px] object-cover"
                              />
                            ))}
                          </span>
                        </div>
                        {activeWorldCup.city && <p className="mt-1 text-xs text-muted-foreground">{activeWorldCup.city}</p>}
                      </div>

                      <div className="rounded-2xl border border-border bg-background/40 p-3">
                        <p className="font-mono-space text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Edición</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span>{activeWorldCup.year}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Recorrido con hitos y cruces clave</p>
                      </div>

                      <div className="rounded-2xl border border-border bg-background/40 p-3">
                        <p className="font-mono-space text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Campeón</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="flex items-center gap-2">
                            <span>{activeWorldCup.winner}</span>
                            {activeWorldCup.winnerFlagCodes.map((code) => (
                              <img
                                key={`winner-panel-${code}`}
                                src={`https://flagcdn.com/w40/${code}.png`}
                                alt={`${activeWorldCup.winner} flag`}
                                className="h-[10px] w-4 rounded-[2px] object-cover"
                              />
                            ))}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Final: {activeWorldCup.contendersText}</p>
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {activeWorldCup.milestoneText}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleSelectCard(activeWorldCup.safari)}
                        className="bg-primary text-black hover:bg-primary/90 font-mono-space text-[10px] uppercase tracking-wider px-6"
                      >
                        Ver recorrido
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={onClose}
                        className="font-mono-space text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        Exploración libre
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedSafaris.map((safari) => {
                    const isRead = readIds.has(safari.id);
                    return (
                      <Card 
                        key={safari.id}
                        className={`bg-card/40 border-border hover:border-primary/50 transition-all cursor-pointer group overflow-hidden ${isRead ? 'opacity-60' : ''}`}
                        onClick={() => handleSelectCard(safari)}
                      >
                        <div className="aspect-video w-full bg-background/60 relative">
                          {safari.thumbnail ? (
                            <img 
                              src={getOptimizedWikiUrl(safari.thumbnail, 330)} 
                              alt={safari.name} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-80 px-4 text-center">
                              <Globe className="w-10 h-10 mb-2 text-muted-foreground/50" />
                              <span className="font-mono-space text-[10px] uppercase tracking-widest text-muted-foreground">
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
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {safari.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  <Card 
                    className="bg-card/40 border-dashed border-border hover:border-foreground/30 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center"
                    onClick={onClose}
                  >
                    <MapIcon className="w-8 h-8 text-muted-foreground/50 mb-3" />
                    <h3 className="font-mono-space text-xs uppercase tracking-wider text-muted-foreground">
                      Exploración Libre
                    </h3>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">
                      Navega por el mapa global sin narrativa guiada
                    </p>
                  </Card>
                </div>
              </ScrollArea>
            )
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

                      <div className={cn("gap-4", isWorldCupMode ? "grid sm:grid-cols-[180px_minmax(0,1fr)] items-start" : "block")}>
                        {isWorldCupMode && (
                          <div className="rounded-2xl border border-border bg-card/30 p-4 flex flex-col items-center justify-center text-center min-h-[180px]">
                            {selectedSafari.thumbnail ? (
                              <img
                                src={getOptimizedWikiUrl(selectedSafari.thumbnail, 320)}
                                alt={`Mascota de ${selectedSafari.name}`}
                                className="h-28 w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                              />
                            ) : (
                              <Globe className="h-12 w-12 text-muted-foreground/50" />
                            )}
                            <span className="mt-3 font-mono-space text-[9px] uppercase tracking-[0.22em] text-primary/80">
                              {selectedSafari.thumbnail ? "Mascota oficial" : (selectedSafari.thumbnailLabel ?? "Sin mascota oficial")}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col gap-4">
                          <p className="whitespace-pre-line text-sm text-foreground/80 leading-relaxed font-light italic border-l-2 border-primary/30 pl-6 py-2">
                            {selectedSafari.overview}
                          </p>

                          {milestoneLinks.length > 0 && (
                            <div className="pl-6">
                              {milestoneLinks.map((item) => (
                                <a
                                  key={item.id}
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono-space text-[10px] uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/15 hover:text-primary/90"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  {item.sourceName ? `Leer en ${item.sourceName}` : item.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Event List Preview */}
                    <div className="flex flex-col gap-4 mt-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono-space text-[10px] uppercase tracking-[0.1em]">Hitos Cronológicos</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getSafariEvents(selectedSafari).map((event, idx) => (
                          <button
                            key={event.id}
                            onClick={() => handleJumpToEvent(selectedSafari.id, event.id)}
                            className="w-full text-left bg-card/40 border border-border/60 rounded-lg p-3 flex items-start justify-between gap-3 group hover:bg-card/70 transition-colors"
                          >
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-primary/80 font-mono-space font-bold">
                                  {event.eventType === "match" && event.stage
                                    ? `${stageLabel[event.stage] ?? "Partido"}: ${formatEventDate(event)}`
                                    : formatEventDate(event)}
                                </span>
                                <span
                                  className="font-mono-space text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                                  style={{
                                    color: regionColors[event.region] ?? "hsl(var(--muted-foreground))",
                                    background: `${regionColors[event.region] ?? "hsl(var(--muted-foreground))"}22`,
                                    border: `1px solid ${regionColors[event.region] ?? "hsl(var(--muted-foreground))"}55`,
                                  }}
                                >
                                  {event.region}
                                </span>
                              </div>

                              <span className="text-xs font-bold text-foreground/90">
                                {event.eventType === "match" && event.homeTeam && event.awayTeam
                                  ? `${event.homeTeam} vs ${event.awayTeam}`
                                  : event.title}
                              </span>

                              {event.eventType === "match" && event.homeTeam && event.awayTeam && (
                                <span className="font-mono-space text-[11px] text-muted-foreground">
                                  {event.homeFlag && (
                                    <img
                                      src={`https://flagcdn.com/w20/${event.homeFlag.toLowerCase()}.png`}
                                      alt={event.homeTeam}
                                      className="inline h-3 mr-1 align-middle"
                                    />
                                  )}
                                  {event.score
                                    ? `${event.homeTeam} (${event.score.home}) vs (${event.score.away}) ${event.awayTeam}`
                                    : `${event.homeTeam} vs ${event.awayTeam}${event.kickoff ? ` · ${event.kickoff}` : ""}`}
                                  {event.awayFlag && (
                                    <img
                                      src={`https://flagcdn.com/w20/${event.awayFlag.toLowerCase()}.png`}
                                      alt={event.awayTeam}
                                      className="inline h-3 ml-1 align-middle"
                                    />
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="w-6 h-6 rounded-full bg-background/70 flex items-center justify-center text-[10px] text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5 shrink-0">
                              {idx + 1}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fixture overview by stage for World Cup safaris */}
                    {fixtureOverview.length > 0 && (
                      <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono-space text-[10px] uppercase tracking-[0.1em]">Fixture del torneo</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {fixtureOverview.map((group) => (
                            <div key={group.stage} className="bg-card/30 border border-border/60 rounded-lg p-3">
                              <p className="font-mono-space text-[10px] uppercase tracking-widest text-primary mb-2">
                                {group.label}
                              </p>
                              <div className="flex flex-col gap-2">
                                {group.events.map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() => handleJumpToEvent(selectedSafari.id, event.id)}
                                    className="w-full text-left flex items-center justify-between gap-3 text-xs text-foreground/80 hover:text-foreground transition-colors"
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

        {!(isWorldCupMode && view === "list") && (
          <div className="p-6 border-t border-border bg-card/20 flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="font-mono-space text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
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
        )}
      </DialogContent>
    </Dialog>
  );
}
