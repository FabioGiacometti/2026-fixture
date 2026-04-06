import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Grip,
  Minus,
  Move,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatEventDate,
  type HistoricalEvent,
  type Safari,
} from "@/data/historical-events";

interface FixturePipPanelProps {
  activeSafari: Safari | null;
  allEvents: HistoricalEvent[];
  selectedEvent: HistoricalEvent | null;
  onSelectEvent: (event: HistoricalEvent) => void;
}

type BracketStage = "round16" | "quarterfinal" | "semifinal" | "final" | "third-place";

interface BracketColumn {
  key: string;
  label: string;
  stage: Exclude<BracketStage, "final" | "third-place">;
  side: "left" | "right";
  matches: HistoricalEvent[];
}

interface BracketLayout {
  leftColumns: BracketColumn[];
  rightColumns: BracketColumn[];
  finalMatches: HistoricalEvent[];
  thirdPlaceMatches: HistoricalEvent[];
}

const DEFAULT_POSITION = { x: 24, y: 118 };
const DEFAULT_SIZE = { width: 420, height: 330 };
const MIN_SIZE = { width: 320, height: 240 };
const MAX_SIZE = { width: 720, height: 520 };
const SIDE_STAGES: Array<Exclude<BracketStage, "final" | "third-place">> = [
  "round16",
  "quarterfinal",
  "semifinal",
];

const STAGE_ORDER: Record<BracketStage, number> = {
  round16: 1,
  quarterfinal: 2,
  semifinal: 3,
  final: 4,
  "third-place": 5,
};

const STAGE_LABEL: Record<BracketStage, string> = {
  round16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinal",
  final: "Final",
  "third-place": "3er puesto",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sortMatches(matches: HistoricalEvent[]) {
  return [...matches].sort((a, b) => {
    const stageA = STAGE_ORDER[(a.stage as BracketStage | undefined) ?? "final"] ?? 99;
    const stageB = STAGE_ORDER[(b.stage as BracketStage | undefined) ?? "final"] ?? 99;
    if (stageA !== stageB) return stageA - stageB;

    const dateA = new Date(a.year, (a.month ?? 1) - 1, a.day ?? 1).getTime();
    const dateB = new Date(b.year, (b.month ?? 1) - 1, b.day ?? 1).getTime();
    return dateA - dateB;
  });
}

function splitStageMatches(matches: HistoricalEvent[]) {
  if (matches.length <= 1) {
    return { left: matches, right: [] as HistoricalEvent[] };
  }

  const half = Math.ceil(matches.length / 2);
  return {
    left: matches.slice(0, half),
    right: matches.slice(half).reverse(),
  };
}

function buildBracketLayout(matches: HistoricalEvent[]): BracketLayout {
  const stageGroups: Record<BracketStage, HistoricalEvent[]> = {
    round16: [],
    quarterfinal: [],
    semifinal: [],
    final: [],
    "third-place": [],
  };

  matches.forEach((match) => {
    const stage = match.stage as BracketStage | undefined;
    if (stage && stage in stageGroups) {
      stageGroups[stage].push(match);
    }
  });

  const leftColumns: BracketColumn[] = [];
  const rightColumns: BracketColumn[] = [];

  SIDE_STAGES.forEach((stage) => {
    const split = splitStageMatches(sortMatches(stageGroups[stage]));

    leftColumns.push({
      key: `${stage}-left`,
      label: STAGE_LABEL[stage],
      stage,
      side: "left",
      matches: split.left,
    });

    rightColumns.unshift({
      key: `${stage}-right`,
      label: STAGE_LABEL[stage],
      stage,
      side: "right",
      matches: split.right,
    });
  });

  return {
    leftColumns,
    rightColumns,
    finalMatches: sortMatches(stageGroups.final),
    thirdPlaceMatches: sortMatches(stageGroups["third-place"]),
  };
}

function getStageStackClass(stage: Exclude<BracketStage, "final" | "third-place">) {
  switch (stage) {
    case "round16":
      return "justify-between gap-2";
    case "quarterfinal":
      return "justify-around gap-4";
    case "semifinal":
      return "justify-around gap-8";
    default:
      return "justify-center";
  }
}

function getScoreText(match: HistoricalEvent) {
  if (!match.score) return "vs";

  return `${match.score.home}-${match.score.away}${
    match.score.penalties
      ? ` (${match.score.penalties.home}-${match.score.penalties.away})`
      : ""
  }`;
}

export default function FixturePipPanel({
  activeSafari,
  allEvents,
  selectedEvent,
  onSelectEvent,
}: FixturePipPanelProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const dragRef = useRef<
    | { type: "move"; startX: number; startY: number; originX: number; originY: number }
    | { type: "resize"; startX: number; startY: number; originWidth: number; originHeight: number }
    | null
  >(null);

  const isWorldCupSafari = !!activeSafari?.id.startsWith("world-cup-");

  const matchEvents = useMemo(() => {
    if (!activeSafari) return [] as HistoricalEvent[];

    return activeSafari.eventIds
      .map((id) => allEvents.find((event) => event.id === id))
      .filter((event): event is HistoricalEvent => !!event && event.eventType === "match");
  }, [activeSafari, allEvents]);

  const progressIndex = useMemo(() => {
    if (!selectedEvent || selectedEvent.eventType !== "match") return -1;
    return matchEvents.findIndex((event) => event.id === selectedEvent.id);
  }, [matchEvents, selectedEvent]);

  const revealedIds = useMemo(() => {
    return new Set(
      progressIndex >= 0
        ? matchEvents.slice(0, progressIndex + 1).map((event) => event.id)
        : []
    );
  }, [matchEvents, progressIndex]);

  const bracketLayout = useMemo(() => buildBracketLayout(matchEvents), [matchEvents]);

  useEffect(() => {
    if (!isWorldCupSafari) return;
    setIsHidden(false);
    setIsMinimized(true);
    setPosition(DEFAULT_POSITION);
    setSize(DEFAULT_SIZE);
  }, [activeSafari?.id, isWorldCupSafari]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const currentAction = dragRef.current;
      if (!currentAction) return;

      if (currentAction.type === "move") {
        const nextX = currentAction.originX + (event.clientX - currentAction.startX);
        const nextY = currentAction.originY + (event.clientY - currentAction.startY);

        setPosition({
          x: clamp(nextX, 8, window.innerWidth - (isMinimized ? 220 : size.width) - 8),
          y: clamp(nextY, 8, window.innerHeight - (isMinimized ? 56 : size.height) - 8),
        });
      }

      if (currentAction.type === "resize") {
        const nextWidth = currentAction.originWidth + (event.clientX - currentAction.startX);
        const nextHeight = currentAction.originHeight + (event.clientY - currentAction.startY);

        setSize({
          width: clamp(nextWidth, MIN_SIZE.width, Math.min(MAX_SIZE.width, window.innerWidth - position.x - 16)),
          height: clamp(nextHeight, MIN_SIZE.height, Math.min(MAX_SIZE.height, window.innerHeight - position.y - 16)),
        });
      }
    };

    const handlePointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isMinimized, position.x, position.y, size.height, size.width]);

  if (!isWorldCupSafari || isHidden || matchEvents.length === 0) {
    return null;
  }

  const currentProgress = progressIndex >= 0 ? `${progressIndex + 1}/${matchEvents.length}` : `0/${matchEvents.length}`;

  const projectedChampion = selectedEvent?.winnerTeam
    ?? bracketLayout.finalMatches.find((match) => revealedIds.has(match.id))?.winnerTeam
    ?? bracketLayout.finalMatches[0]?.winnerTeam
    ?? "Por definir";

  const renderMatchCard = (
    match: HistoricalEvent,
    side: "left" | "right" | "center"
  ) => {
    const isRevealed = revealedIds.has(match.id);
    const isCurrent = selectedEvent?.id === match.id;

    return (
      <button
        key={match.id}
        type="button"
        aria-label={match.title}
        onClick={() => onSelectEvent(match)}
        className={cn(
          "group relative overflow-visible rounded-xl border px-2.5 py-2 text-left transition-all duration-700 ease-out",
          isCurrent && "scale-[1.02]"
        )}
        style={{
          borderColor: isCurrent
            ? "hsl(var(--primary))"
            : isRevealed
              ? "hsl(var(--primary) / 0.45)"
              : "hsl(var(--border) / 0.8)",
          background: isCurrent
            ? "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--card) / 0.98))"
            : isRevealed
              ? "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--card) / 0.96))"
              : "hsl(var(--background) / 0.42)",
          opacity: isRevealed || isCurrent ? 1 : 0.5,
          boxShadow: isCurrent ? "0 0 0 1px hsl(var(--primary) / 0.25)" : "none",
        }}
      >
        {side !== "center" && (
          <span
            data-testid="fixture-connector"
            className={cn(
              "pointer-events-none absolute top-1/2 h-px w-4 -translate-y-1/2 transition-all duration-700",
              side === "left" ? "-right-4" : "-left-4"
            )}
            style={{
              background: isRevealed || isCurrent
                ? "linear-gradient(90deg, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.2))"
                : "hsl(var(--border) / 0.7)",
              opacity: isRevealed || isCurrent ? 1 : 0.45,
            }}
          />
        )}

        <div
          className="absolute inset-y-2 left-0 w-1 rounded-r-full transition-all duration-700"
          style={{
            background: isCurrent
              ? "hsl(var(--primary))"
              : isRevealed
                ? "hsl(var(--primary) / 0.72)"
                : "transparent",
          }}
        />

        <span className="block truncate pl-1 text-[11px] font-semibold text-white/90">
          {match.homeTeam} vs {match.awayTeam}
        </span>
        <span className="mt-1 block pl-1 font-mono-space text-[10px] text-primary/90">
          {getScoreText(match)}
        </span>
        <div className="mt-1 flex items-center justify-between gap-2 pl-1 font-mono-space text-[9px] text-white/45">
          <span className="truncate">{formatEventDate(match)}</span>
          {match.city && <span className="truncate text-right">{match.city}</span>}
        </div>
      </button>
    );
  };

  const renderStageColumn = (column: BracketColumn) => {
    const connectorActive = column.matches.some((match) => revealedIds.has(match.id));

    return (
      <div key={column.key} className="relative flex min-h-[210px] flex-col gap-2">
        <div className="px-1 text-center">
          <p className="font-mono-space text-[10px] uppercase tracking-[0.22em] text-white/70">
            {column.label}
          </p>
          <div
            data-testid="fixture-connector"
            className="mx-auto mt-1 h-px w-full origin-left transition-all duration-700"
            style={{
              background: connectorActive
                ? "linear-gradient(90deg, hsl(var(--primary) / 0.8), transparent)"
                : "hsl(var(--border) / 0.65)",
              opacity: connectorActive ? 1 : 0.45,
            }}
          />
        </div>

        <div className={cn("relative flex flex-1 flex-col", getStageStackClass(column.stage))}>
          {column.matches.length > 1 && (
            <span
              data-testid="fixture-connector"
              className={cn(
                "pointer-events-none absolute bottom-[18%] top-[18%] w-px transition-all duration-700",
                column.side === "left" ? "-right-4" : "-left-4"
              )}
              style={{
                background: connectorActive
                  ? "hsl(var(--primary) / 0.55)"
                  : "hsl(var(--border) / 0.55)",
                opacity: connectorActive ? 1 : 0.45,
              }}
            />
          )}

          {column.matches.length > 0 ? (
            column.matches.map((match) => renderMatchCard(match, column.side))
          ) : (
            <div className="mx-2 flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-[0.18em] text-white/25">
              —
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed z-[45] pointer-events-auto"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition-[width,height,opacity,transform] duration-300",
          isMinimized ? "w-[220px]" : ""
        )}
        style={{
          width: isMinimized ? 220 : size.width,
          height: isMinimized ? 56 : size.height,
          background: "hsl(var(--card) / 0.92)",
          borderColor: "hsl(var(--border))",
          boxShadow: "0 18px 50px hsl(0 0% 0% / 0.42)",
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-3 py-2"
          style={{ borderColor: isMinimized ? "transparent" : "hsl(var(--border) / 0.8)", cursor: "move" }}
          onPointerDown={(event) => {
            dragRef.current = {
              type: "move",
              startX: event.clientX,
              startY: event.clientY,
              originX: position.x,
              originY: position.y,
            };
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "hsl(var(--primary) / 0.16)", color: "hsl(var(--primary))" }}
            >
              <Trophy className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-mono-space text-[10px] uppercase tracking-[0.22em] text-primary">
                Fixture
              </p>
              <p className="truncate text-[11px] text-white/60">{activeSafari.name} · {currentProgress}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={isMinimized ? "Expandir fixture" : "Minimizar fixture"}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setIsMinimized((value) => !value)}
              className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Cerrar fixture"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setIsHidden(true)}
              className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="relative flex h-[calc(100%-44px)] flex-col">
            <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(242,169,0,0.09),transparent)] px-3 py-2">
              <div className="flex items-center justify-between text-[10px] text-white/55">
                <span className="font-mono-space uppercase tracking-[0.3em]">FASE FINAL</span>
                <span className="inline-flex items-center gap-1 font-mono-space uppercase tracking-[0.18em] text-primary/85">
                  <Move className="h-3.5 w-3.5" />
                  mover
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-black/20 px-3 py-2">
                <div>
                  <p className="font-mono-space text-[9px] uppercase tracking-[0.22em] text-primary/85">
                    Campeón proyectado
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/90">{projectedChampion}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.18)]">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-3 pb-3 pt-3">
              <div
                data-testid="fixture-bracket"
                className="min-w-[780px] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(17,19,25,0.12))] p-4"
              >
                <div className="grid grid-cols-[1.1fr_1fr_0.95fr_1.15fr_0.95fr_1fr_1.1fr] gap-3">
                  {bracketLayout.leftColumns.map((column) => renderStageColumn(column))}

                  <div className="relative flex min-h-[210px] flex-col gap-3">
                    <div className="px-1 text-center">
                      <p className="font-mono-space text-[10px] uppercase tracking-[0.22em] text-white/70">
                        {STAGE_LABEL.final}
                      </p>
                      <div
                        data-testid="fixture-connector"
                        className="mx-auto mt-1 h-px w-full transition-all duration-700"
                        style={{
                          background: bracketLayout.finalMatches.some((match) => revealedIds.has(match.id))
                            ? "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent)"
                            : "hsl(var(--border) / 0.65)",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-center py-1">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.12)]">
                        <Trophy className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3">
                      {bracketLayout.finalMatches.length > 0 ? (
                        bracketLayout.finalMatches.map((match) => renderMatchCard(match, "center"))
                      ) : (
                        <div className="mx-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-5 text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Final pendiente
                        </div>
                      )}
                    </div>

                    {bracketLayout.thirdPlaceMatches.length > 0 && (
                      <div className="mt-auto pt-3">
                        <div className="px-1 text-center">
                          <p className="font-mono-space text-[10px] uppercase tracking-[0.22em] text-white/70">
                            {STAGE_LABEL["third-place"]}
                          </p>
                          <div
                            data-testid="fixture-connector"
                            className="mx-auto mt-1 h-px w-full transition-all duration-700"
                            style={{
                              background: bracketLayout.thirdPlaceMatches.some((match) => revealedIds.has(match.id))
                                ? "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.65), transparent)"
                                : "hsl(var(--border) / 0.65)",
                            }}
                          />
                        </div>
                        <div className="mt-2 flex flex-col gap-2">
                          {bracketLayout.thirdPlaceMatches.map((match) => renderMatchCard(match, "center"))}
                        </div>
                      </div>
                    )}
                  </div>

                  {bracketLayout.rightColumns.map((column) => renderStageColumn(column))}
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Redimensionar fixture"
              onPointerDown={(event) => {
                event.stopPropagation();
                dragRef.current = {
                  type: "resize",
                  startX: event.clientX,
                  startY: event.clientY,
                  originWidth: size.width,
                  originHeight: size.height,
                };
              }}
              className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/5 hover:text-white/75"
            >
              <Grip className="h-3.5 w-3.5 rotate-45" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
