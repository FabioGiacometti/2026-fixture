import { X, MapPin, Calendar } from "lucide-react";
import type { HistoricalEvent } from "@/data/historical-events";
import { formatEventDate } from "@/data/historical-events";

interface EventPanelProps {
  event: HistoricalEvent | null;
  onClose: () => void;
}

const regionColors: Record<string, string> = {
  Europa: "hsl(220 80% 60%)",
  Asia: "hsl(30 90% 60%)",
  África: "hsl(120 60% 50%)",
  América: "hsl(280 70% 65%)",
  Espacio: "hsl(200 80% 70%)",
};

export default function EventPanel({ event, onClose }: EventPanelProps) {
  const isOpen = !!event;

  return (
    <div
      className="fixed top-0 right-0 h-full z-40 flex flex-col transition-transform duration-500 ease-out"
      style={{
        width: "min(400px, 90vw)",
        transform: isOpen ? "translateX(0)" : "translateX(105%)",
        background: "hsl(var(--card))",
        borderLeft: "1px solid hsl(var(--border))",
        boxShadow: isOpen ? "-8px 0 40px hsl(0 0% 0% / 0.5)" : "none",
        paddingBottom: "96px", // clear the timeline bar
      }}
      role="complementary"
      aria-label="Detalle de evento histórico"
    >
      {event && (
        <>
          {/* ── Header ── */}
          <div
            className="flex items-start justify-between gap-3 p-6 pb-4"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}
          >
            <div className="flex-1 min-w-0">
              {/* Year badge */}
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--primary))" }} />
                <span
                  className="font-mono-space text-xl font-bold leading-none"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {formatEventDate(event)}
                </span>
              </div>

              {/* Region chip */}
              <div className="flex items-center gap-1.5 mb-3">
                <MapPin className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                <span
                  className="font-mono-space text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: regionColors[event.region] ?? "hsl(var(--muted-foreground))",
                    background: `${regionColors[event.region] ?? "hsl(var(--muted-foreground))"}22`,
                    border: `1px solid ${regionColors[event.region] ?? "hsl(var(--muted-foreground))"}55`,
                  }}
                >
                  {event.region}
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-mono-space text-base font-bold leading-snug"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {event.title}
              </h2>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors mt-0.5"
              style={{
                color: "hsl(var(--muted-foreground))",
                background: "hsl(var(--muted) / 0.5)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--muted))";
                (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--foreground))";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--muted) / 0.5)";
                (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--muted-foreground))";
              }}
              aria-label="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Description ── */}
          <div className="flex-1 overflow-y-auto p-6 pt-5">
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--foreground) / 0.85)" }}
            >
              {event.description}
            </p>

            {/* ── Coordinates footer ── */}
            <div
              className="mt-8 pt-4 flex items-center gap-3"
              style={{ borderTop: "1px solid hsl(var(--border))" }}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
              <span
                className="font-mono-space text-xs"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {event.lat.toFixed(2)}° N, {event.lng.toFixed(2)}° E
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
