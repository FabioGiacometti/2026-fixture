import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ArrowLeft, Globe, Map, BookOpen, Clock } from "lucide-react";
import { Safari, HistoricalEvent, formatYear } from "@/data/historical-events";

interface SafariSelectionModalProps {
  isOpen: boolean;
  safaris: Safari[];
  allEvents: HistoricalEvent[];
  onSelectSafari: (safariId: string) => void;
  onClose: () => void;
}

export default function SafariSelectionModal({
  isOpen,
  safaris,
  allEvents,
  onSelectSafari,
  onClose
}: SafariSelectionModalProps) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedSafari, setSelectedSafari] = useState<Safari | null>(null);

  const handleSelectCard = (safari: Safari) => {
    setSelectedSafari(safari);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedSafari(null);
  };

  const getSafariEvents = (safari: Safari) => {
    return safari.eventIds
      .map(id => allEvents.find(e => e.id === id))
      .filter((e): e is HistoricalEvent => !!e);
  };

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
              {view === "list" ? "Safaris Históricos" : selectedSafari?.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-hidden flex flex-col">
          {view === "list" ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safaris.map((safari) => (
                <Card 
                  key={safari.id}
                  className="bg-white/5 border-white/10 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => handleSelectCard(safari)}
                >
                  <div className="aspect-video w-full bg-black/40 relative">
                    {safari.thumbnail ? (
                      <img 
                        src={safari.thumbnail} 
                        alt={safari.name} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Globe className="w-12 h-12" />
                      </div>
                    )}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
                    />
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
              ))}
              
              <Card 
                className="bg-white/5 border-dashed border-white/10 hover:border-white/30 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center"
                onClick={onClose}
              >
                <Map className="w-8 h-8 text-white/20 mb-3" />
                <h3 className="font-mono-space text-xs uppercase tracking-wider text-white/60">
                  Exploración Libre
                </h3>
                <p className="text-[10px] text-white/40 mt-1">
                  Navega por el mapa global sin narrativa guiada
                </p>
              </Card>
            </div>
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
                          <div 
                            key={event.id}
                            className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:bg-white/10 transition-colors"
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
                          </div>
                        ))}
                      </div>
                    </div>
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
              onClick={() => onSelectSafari(selectedSafari.id)}
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
