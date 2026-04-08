import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "world-cup-brand",
    setTheme,
  }),
}));

describe("ThemeSwitcher", () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    delete document.documentElement.dataset.fontSize;
  });

  it("opens and closes the settings menu with map and theme controls only", () => {
    const onMapStyleChange = vi.fn();

    render(
      <ThemeSwitcher mapStyle="political" onMapStyleChange={onMapStyleChange} />
    );

    const settingsButton = screen.getByRole("button", { name: /abrir ajustes de mapa e interfaz/i });

    fireEvent.click(settingsButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.queryByText(/^idioma$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/^mapa$/i)).toBeInTheDocument();
    expect(screen.getByText(/^tema$/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /traducir esta página/i })).not.toBeInTheDocument();

    fireEvent.click(settingsButton);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles the map style button on click", () => {
    const onMapStyleChange = vi.fn();

    render(
      <ThemeSwitcher mapStyle="political" onMapStyleChange={onMapStyleChange} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /abrir ajustes de mapa e interfaz/i })
    );

    const fontSizeSlider = screen.getByRole("slider", { name: /tamaño de fuente/i });
    expect(fontSizeSlider).toBeInTheDocument();
    expect(screen.getByText(/^small$/i)).toBeInTheDocument();
    expect(screen.getByText(/^medium$/i)).toBeInTheDocument();
    expect(screen.getByText(/^large$/i)).toBeInTheDocument();

    fireEvent.change(fontSizeSlider, { target: { value: "2" } });
    expect(document.documentElement.dataset.fontSize).toBe("large");

    fireEvent.click(screen.getByRole("button", { name: /alternar estilo del mapa/i }));

    expect(onMapStyleChange).toHaveBeenCalledWith("geographic");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("positions the settings button relative to the panel offset", () => {
    const { container } = render(
      <ThemeSwitcher
        mapStyle="political"
        onMapStyleChange={vi.fn()}
        panelOffset={280}
      />
    );

    expect(container.firstChild).toHaveStyle({ right: "296px" });
  });
});
