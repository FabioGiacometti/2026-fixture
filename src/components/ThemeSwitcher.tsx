import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


type MapStyle = "political" | "geographic";

interface ThemeSwitcherProps {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  panelOffset?: number;
  isMobile?: boolean;
}

export default function ThemeSwitcher({
  mapStyle,
  onMapStyleChange,
  panelOffset = 36,
  isMobile = false,
}: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);

  const handleToggleSettingsMenu = () => {
    setOpen((currentOpen) => !currentOpen);
  };

  const handleMapStyleChange = (style: MapStyle) => {
    onMapStyleChange(style);
    setOpen(false);
  };

  return (
    <div
      className="fixed z-40 transition-[right,top] duration-300 ease-out"
      style={{
        top: isMobile ? "12px" : "20px",
        right: isMobile ? "12px" : `${panelOffset + 16}px`,
      }}
    >
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Abrir ajustes de mapa e interfaz"
            aria-pressed={open}
            onPointerDown={(event) => {
              if (event.button === 0 && event.ctrlKey === false) {
                event.preventDefault();
              }
            }}
            onClick={handleToggleSettingsMenu}
            className={`${isMobile ? "h-10 w-10" : "h-11 w-11"} rounded-full border-border/80 bg-card/85 text-foreground shadow-lg backdrop-blur-md hover:bg-accent/80`}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[320px] rounded-[24px] border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl"
        >

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
