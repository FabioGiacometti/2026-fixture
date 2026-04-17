import { Compass, Flag, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WelcomeModalProps {
  isOpen: boolean;
  countryLabel?: string | null;
  countryFlagCode?: string | null;
  isCountryActionDisabled?: boolean;
  onViewNextMatch: () => void;
  onViewCountryMatch: () => void;
  onExploreFreely: () => void;
}

export default function WelcomeModal({
  isOpen,
  countryLabel,
  countryFlagCode,
  isCountryActionDisabled = false,
  onViewNextMatch,
  onViewCountryMatch,
  onExploreFreely,
}: WelcomeModalProps) {
  const resolvedCountryLabel = countryLabel ?? "tu país";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onExploreFreely()}>
      <DialogContent
        className="max-w-xl border-0 p-0 sm:rounded-[28px]"
        style={{
          background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.96) 55%, hsl(var(--muted) / 0.55) 100%)",
          boxShadow: "0 28px 70px hsl(0 0% 0% / 0.45)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="relative overflow-hidden rounded-[28px] border" style={{ borderColor: "hsl(var(--border) / 0.65)" }}>
          <div
            className="absolute inset-x-0 top-0 h-40"
            style={{
              background: "radial-gradient(circle at top left, hsl(var(--primary) / 0.28), transparent 58%), radial-gradient(circle at top right, hsl(var(--accent) / 0.22), transparent 46%)",
            }}
          />

          <div className="relative p-6 sm:p-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono-space text-[10px] uppercase tracking-[0.2em]"
              style={{
                borderColor: "hsl(var(--primary) / 0.32)",
                background: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Inicio rapido
            </div>

            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="font-mono-space text-xl uppercase tracking-[0.12em] leading-tight text-foreground sm:text-2xl">
                Bienvenido al Fixture Interactivo Copa 2026. Como queres proceder?
              </DialogTitle>
              <DialogDescription className="max-w-md font-mono-space text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Elegi un acceso rapido para saltar al proximo partido o cerrar el modal y recorrer el mapa libremente.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={onViewNextMatch}
                className="flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-transform hover:-translate-y-[1px]"
                style={{
                  borderColor: "hsl(var(--primary) / 0.28)",
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.14), hsl(var(--card) / 0.92))",
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "hsl(var(--primary) / 0.16)", color: "hsl(var(--primary))" }}>
                    <Flag className="h-5 w-5" />
                  </span>
                  <span className="font-mono-space text-[11px] uppercase tracking-[0.14em] text-foreground">
                    Ver proximo partido a jugarse
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={onViewCountryMatch}
                disabled={isCountryActionDisabled}
                className="flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-transform enabled:hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  borderColor: "hsl(var(--border) / 0.72)",
                  background: "linear-gradient(135deg, hsl(var(--accent) / 0.12), hsl(var(--card) / 0.96))",
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "hsl(var(--accent) / 0.2)", color: "hsl(var(--foreground))" }}>
                    {countryFlagCode ? (
                      <img
                        src={`https://flagcdn.com/w40/${countryFlagCode.toLowerCase()}.png`}
                        alt={`Bandera de ${resolvedCountryLabel}`}
                        className="h-5 w-7 rounded-sm object-cover"
                      />
                    ) : (
                      <Flag className="h-5 w-5" />
                    )}
                  </span>
                  <span className="font-mono-space text-[11px] uppercase tracking-[0.14em] text-foreground">
                    {`Ver próximos partidos de ${resolvedCountryLabel}`}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={onExploreFreely}
                className="flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-transform hover:-translate-y-[1px]"
                style={{
                  borderColor: "hsl(var(--border) / 0.72)",
                  background: "hsl(var(--background) / 0.38)",
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "hsl(var(--muted) / 0.6)", color: "hsl(var(--foreground))" }}>
                    <Compass className="h-5 w-5" />
                  </span>
                  <span className="font-mono-space text-[11px] uppercase tracking-[0.14em] text-foreground">
                    Explorar libremente
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}