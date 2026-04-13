import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WelcomeModal from "@/components/WelcomeModal";

describe("WelcomeModal", () => {
  it("renders the welcome copy and the three requested actions", () => {
    render(
      <WelcomeModal
        isOpen
        countryLabel="Argentina"
        onViewNextMatch={vi.fn()}
        onViewCountryMatch={vi.fn()}
        onExploreFreely={vi.fn()}
      />
    );

    expect(
      screen.getByText("Bienvenido al Fixture Interactivo Copa 2026. Como queres proceder?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver proximo partido a jugarse/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver proximo partido de Argentina/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Explorar libremente/i })).toBeInTheDocument();
  });

  it("routes actions through the provided callbacks", () => {
    const onViewNextMatch = vi.fn();
    const onViewCountryMatch = vi.fn();
    const onExploreFreely = vi.fn();

    render(
      <WelcomeModal
        isOpen
        countryLabel="Argentina"
        onViewNextMatch={onViewNextMatch}
        onViewCountryMatch={onViewCountryMatch}
        onExploreFreely={onExploreFreely}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Ver proximo partido a jugarse/i }));
    fireEvent.click(screen.getByRole("button", { name: /Ver proximo partido de Argentina/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explorar libremente/i }));

    expect(onViewNextMatch).toHaveBeenCalledTimes(1);
    expect(onViewCountryMatch).toHaveBeenCalledTimes(1);
    expect(onExploreFreely).toHaveBeenCalledTimes(1);
  });
});