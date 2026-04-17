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
            className={cn(classes.flag, "rounded-[2px] object-cover")}
          />
        )}
        <span className={cn("min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] font-bold", classes.teamName)}>
          {teamName ?? fallbackLabel}
        </span>
      </>
    );

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 items-center gap-inherit text-left transition-opacity hover:opacity-80"
        >
          {content}
        </button>
      );
    }

    return <div className="flex min-w-0 items-center gap-inherit">{content}</div>;
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center font-mono-space font-bold leading-snug",
        classes.root,
        className
      )}
      style={{ color: "hsl(var(--foreground) / 0.92)" }}
    >
      {renderTeam(event.homeTeam, event.homeFlag, "Equipo local", onHomeTeamClick)}
      <span className={cn("shrink-0 px-1", classes.center)} style={{ color: "hsl(var(--muted-foreground))" }}>
        {centerContent}
      </span>
      {renderTeam(event.awayTeam, event.awayFlag, "Equipo visitante", onAwayTeamClick)}
    </div>
  );
}