import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { buildCalendarEntries, buildIcsCalendar } from "@/lib/calendar-actions";
import { historicalEvents } from "@/data/historical-events";

export default function CalendarBundlePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // TODO: derive bundle options from location state or query
  // For now, just show all group matches for Argentina as a placeholder
  const bundleMatches = useMemo(() => {
    return historicalEvents.filter(
      (e) =>
        e.eventType === "match" &&
        e.stage === "group" &&
        (e.homeTeam === "Argentina" || e.awayTeam === "Argentina")
    );
  }, []);

  const handleDownloadIcs = () => {
    const entries = buildCalendarEntries(bundleMatches);
    const ics = buildIcsCalendar(entries);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Argentina-fase-grupos.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Agendar varios partidos</h1>
      <div className="mb-6 text-center text-muted-foreground">
        Selecciona una opción para descargar todos los partidos relevantes en un solo archivo .ics.
      </div>
      <div className="w-full max-w-md space-y-4">
        <div className="border rounded-lg p-4 flex flex-col items-start">
          <div className="font-semibold mb-1">Todos los partidos de la fase de grupos para Argentina</div>
          <div className="text-xs mb-2 text-muted-foreground">Incluye {bundleMatches.length} partidos</div>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            onClick={handleDownloadIcs}
          >
            Descargar .ics
          </button>
        </div>
      </div>
      <button
        className="mt-8 text-sm text-muted-foreground underline"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>
    </div>
  );
}
