import type { HistoricalEvent } from "@/data/historical-events";
import { cn } from "@/lib/utils";

type MatchRowVariant = "compact" | "regular" | "comfortable";

interface MatchTeamsRowProps {
  event: HistoricalEvent;
  variant?: MatchRowVariant;
  className?: string;
  onHomeTeamClick?: () => void;
  onAwayTeamClick?: () => void;
  centerContent?: string;
}

const variantClasses: Record<MatchRowVariant, {
  root: string;
  flag: string;
  teamName: string;
  center: string;
}> = {
  compact: {
    root: "gap-1.5 text-xs",
    flag: "h-3 w-4",
    teamName: "text-xs leading-snug",
    center: "text-xs",
  },
  regular: {
    root: "gap-2 text-sm",
    flag: "h-4 w-6",
    teamName: "text-[15px] leading-tight",
    center: "text-sm",
  },
  comfortable: {
    root: "gap-2.5 text-base",
    flag: "h-5 w-7",
    teamName: "text-base leading-tight",
    center: "text-base",
  },
};

export default function MatchTeamsRow({
  event,
  variant = "compact",
  className,
  onHomeTeamClick,
  onAwayTeamClick,
  centerContent = "vs",
}: MatchTeamsRowProps) {
  const classes = variantClasses[variant];


  const renderTeam = (
    teamName: string | undefined,
    flagCode: string | undefined,
    fallbackLabel: string,
    onClick?: () => void
  ) => {
    const content = (
      <>
        {flagCode && (
          <img
            src={`https://flagcdn.com/w20/${flagCode.toLowerCase()}.png`}
            alt={teamName ?? fallbackLabel}
            className={cn(classes.flag, "rounded-[2px] object-cover flex-shrink-0")}
            style={{ marginRight: 4 }}
          />
        )}
        <span
          className={cn(
            "min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] font-bold",
            classes.teamName
          )}
          style={{ display: "inline-block", verticalAlign: "middle", wordBreak: "break-word" }}
        >
          {teamName ?? fallbackLabel}
        </span>
      </>
    );

    // Container is only as wide as flag+name, no extra space
    const containerClass = "flex min-w-0 items-center";

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={cn(containerClass, "text-left transition-opacity hover:opacity-80")}
          style={{ padding: 0, background: "none", border: "none" }}
        >
          {content}
        </button>
      );
    }
    return (
      <div className={containerClass} style={{ padding: 0 }}>{content}</div>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center font-mono-space font-bold leading-snug",
        classes.root,
        className
      )}
      style={{ color: "hsl(var(--foreground) / 0.92)", gap: 24 }} // 24px gap between teams
    >
      {renderTeam(event.homeTeam, event.homeFlag, "Equipo local", onHomeTeamClick)}
      <span className={cn("shrink-0 px-2", classes.center)} style={{ color: "hsl(var(--muted-foreground))" }}>
        {centerContent}
      </span>
      {renderTeam(event.awayTeam, event.awayFlag, "Equipo visitante", onAwayTeamClick)}
    </div>
  );
}