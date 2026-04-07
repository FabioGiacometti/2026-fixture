import { describe, expect, it } from "vitest";
import {
  CURRENT_WORLD_CUP_SAFARI_ID,
  CURRENT_WORLD_CUP_YEAR,
  worldCupSafaris,
} from "@/data/world-cup-data";

describe("worldCupSafaris defaults", () => {
  it("prioritizes the current World Cup safari first", () => {
    expect(CURRENT_WORLD_CUP_YEAR).toBe(2026);
    expect(CURRENT_WORLD_CUP_SAFARI_ID).toBe("world-cup-2026");
    expect(worldCupSafaris[0]?.id).toBe(CURRENT_WORLD_CUP_SAFARI_ID);
  });

  it("uses the mascot asset as the 2026 safari thumbnail", () => {
    const currentSafari = worldCupSafaris.find(
      (safari) => safari.id === CURRENT_WORLD_CUP_SAFARI_ID
    );

    expect(currentSafari?.thumbnail).toBeTruthy();
  });
});
