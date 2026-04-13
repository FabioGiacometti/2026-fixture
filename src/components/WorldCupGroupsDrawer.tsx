import { ChevronDown, ChevronUp, Layers3 } from "lucide-react";

interface WorldCupGroupStandingRow {
  team: string;
  flag?: string;
  played: number;
  goalDiff: number;
  points: number;
}

interface WorldCupGroupOption {
  name: string;
  count: number;
  resolvedCount: number;
  standings: WorldCupGroupStandingRow[];
}

interface WorldCupGroupsDrawerProps {
  groups: WorldCupGroupOption[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isMediaModalOpen?: boolean;
  title?: string;
}

export default function WorldCupGroupsDrawer({
  groups,
  selectedGroup,
  onSelectGroup,
  isExpanded,
  onToggleExpanded,
  isMediaModalOpen,
  title = "Grupos 2026",
}: WorldCupGroupsDrawerProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
        isMediaModalOpen ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
    >
      <div
        className={`pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-[28px] border border-b-0 transition-[height] duration-500 ${
          isExpanded ? "h-[calc(100vh-4.5rem)]" : "h-[68px]"
        }`}
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          backdropFilter: "blur(10px)",
          boxShadow: "0 -10px 28px hsl(0 0% 0% / 0.28)",
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="flex justify-center px-4 pt-1.5">
          <span
            className="h-1.5 w-14 rounded-full"
            style={{ background: "hsl(var(--border) / 0.9)" }}
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-2 px-4 pb-2 pt-1.5">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex flex-1 items-center justify-between gap-3 text-left"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Colapsar grupos" : "Expandir grupos"}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  background: "hsl(var(--primary) / 0.12)",
                  color: "hsl(var(--primary))",
                }}
              >
                <Layers3 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p
                  className="font-mono-space text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {title}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              ) : (
                <ChevronUp className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              )}
            </div>
          </button>

        </div>

        {isExpanded && (
          <div
            className="flex-1 overflow-y-auto border-t px-4 pb-5 pt-3"
            style={{ borderColor: "hsl(var(--border) / 0.7)" }}
          >
            <div className="flex items-center justify-end gap-3">
              {selectedGroup !== "Todos" && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectGroup("Todos");
                    onToggleExpanded();
                  }}
                  className="font-mono-space text-[10px] uppercase tracking-wider transition-colors"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Ver todos
                </button>
              )}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => {
                const isActive = selectedGroup === group.name;

                return (
                  <button
                    key={`${group.name}-table`}
                    type="button"
                    onClick={() => {
                      onSelectGroup(isActive ? "Todos" : group.name);
                      onToggleExpanded();
                    }}
                    className="rounded-xl border p-3 text-left transition-colors"
                    style={{
                      borderColor: isActive
                        ? "hsl(var(--primary) / 0.45)"
                        : "hsl(var(--border) / 0.75)",
                      background: isActive
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--card)))"
                        : "hsl(var(--muted) / 0.16)",
                      boxShadow: isActive ? "0 0 0 1px hsl(var(--primary) / 0.2)" : "none",
                    }}
                    aria-label={`Filtrar ${group.name}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="font-mono-space text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: "hsl(var(--primary))" }}
                        >
                          {group.name}
                        </p>
                        <p
                          className="font-mono-space text-[9px]"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          {group.resolvedCount}/{group.count} jugados
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono-space text-[9px] uppercase tracking-wider"
                        style={{
                          color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          background: "hsl(var(--background) / 0.42)",
                        }}
                      >
                        {group.count} partidos
                      </span>
                    </div>

                    <div
                      className="overflow-hidden rounded-lg"
                      style={{ background: "hsl(var(--background) / 0.22)" }}
                    >
                      <div
                        className="grid grid-cols-[18px,1fr,28px,34px,34px] items-center gap-2 border-b px-2 py-1 font-mono-space text-[9px] uppercase tracking-wider"
                        style={{
                          borderColor: "hsl(var(--border) / 0.55)",
                          background: "hsl(var(--background) / 0.45)",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        <span>#</span>
                        <span>Equipo</span>
                        <span className="text-right">PJ</span>
                        <span className="text-right">DG</span>
                        <span className="text-right">PTS</span>
                      </div>

                      {group.standings.map((team, index) => (
                        <div
                          key={`${group.name}-${team.team}`}
                          className="grid grid-cols-[18px,1fr,28px,34px,34px] items-center gap-2 border-b px-2 py-1.5 text-[10px] last:border-b-0"
                          style={{
                            borderColor: "hsl(var(--border) / 0.45)",
                            color: "hsl(var(--foreground) / 0.9)",
                          }}
                        >
                          <span className="font-mono-space text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {index + 1}
                          </span>
                          <div className="flex min-w-0 items-center gap-1.5">
                            {team.flag && (
                              <img
                                src={`https://flagcdn.com/w20/${team.flag.toLowerCase()}.png`}
                                alt={team.team}
                                className="h-3 w-4 rounded-[2px] object-cover"
                              />
                            )}
                            <span className="truncate font-mono-space text-[10px]">{team.team}</span>
                          </div>
                          <span className="text-right font-mono-space text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {team.played}
                          </span>
                          <span className="text-right font-mono-space text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                          </span>
                          <span className="text-right font-mono-space text-[10px] font-bold" style={{ color: "hsl(var(--primary))" }}>
                            {team.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
