import { describe, expect, it } from "vitest";
import {
  formatMatchLocalDateTime,
  formatMatchLocalKickoff,
  getMatchStartInstant,
  getMatchVenueTimeZone,
} from "@/lib/match-time";

describe("match time helpers", () => {
  it("maps known 2026 venues to stable IANA timezones", () => {
    expect(getMatchVenueTimeZone({ year: 2026, city: "Toronto Stadium" })).toBe("America/Toronto");
    expect(getMatchVenueTimeZone({ year: 2026, city: "Dallas Stadium" })).toBe("America/Chicago");
    expect(getMatchVenueTimeZone({ year: 2026, city: "Estadio Guadalajara" })).toBe("America/Mexico_City");
  });

  it("converts venue-local kickoff into a real instant", () => {
    const instant = getMatchStartInstant({
      year: 2026,
      month: 6,
      day: 12,
      kickoff: "16:00",
      city: "Toronto Stadium",
    });

    expect(instant?.toISOString()).toBe("2026-06-12T20:00:00.000Z");
  });

  it("formats local kickoff for a target user timezone", () => {
    const formattedKickoff = formatMatchLocalKickoff(
      {
        year: 2026,
        month: 6,
        day: 12,
        kickoff: "16:00",
        city: "Toronto Stadium",
      },
      { locale: "es-AR", timeZone: "America/Los_Angeles" }
    );

    expect(formattedKickoff).toBe("13:00");
  });

  it("formats date and time together for the viewer timezone", () => {
    const formattedDateTime = formatMatchLocalDateTime(
      {
        year: 2026,
        month: 6,
        day: 12,
        kickoff: "16:00",
        city: "Toronto Stadium",
      },
      { locale: "es-AR", timeZone: "America/Los_Angeles" }
    );

    expect(formattedDateTime).toContain("viernes");
    expect(formattedDateTime).toContain("12 de junio de 2026");
    expect(formattedDateTime).toContain("13:00");
  });

  it("falls back cleanly when timezone metadata is unavailable", () => {
    expect(
      formatMatchLocalKickoff({ year: 2026, month: 6, day: 12, kickoff: "16:00", city: "Unknown Stadium" })
    ).toBe("16:00");
    expect(
      formatMatchLocalDateTime({ year: 2026, month: 6, day: 12, kickoff: "16:00", city: "Unknown Stadium" })
    ).toBeNull();
  });
});