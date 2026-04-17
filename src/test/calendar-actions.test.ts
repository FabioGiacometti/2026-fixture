import { describe, expect, it } from "vitest";
import type { HistoricalEvent } from "@/data/historical-events";
import {
  buildCalendarEntries,
  buildGoogleCalendarUrl,
  buildIcsCalendar,
  buildMatchCalendarEntry,
  getSupportedCalendarProviderActions,
} from "@/lib/calendar-actions";

const matchEvent: HistoricalEvent = {
  id: "g-j1",
  title: "Grupo J: Argentina vs Argelia",
  description: "Primer partido de Argentina en el grupo.",
  year: 2026,
  month: 6,
  day: 16,
  lat: 39.0489,
  lng: -94.4839,
  city: "Kansas City Stadium",
  region: "América",
  importance: 1,
  dataset: "worldcup",
  eventType: "match",
  stage: "group",
  groupName: "Grupo J",
  kickoff: "22:00",
  homeTeam: "Argentina",
  awayTeam: "Argelia",
};

describe("calendar actions", () => {
  it("builds a normalized calendar entry from a match", () => {
    const entry = buildMatchCalendarEntry(matchEvent);

    expect(entry?.title).toBe("Argentina vs Argelia");
    expect(entry?.location).toBe("Kansas City Stadium");
    expect(entry?.sourceTimeZone).toBe("America/Chicago");
    expect(entry?.start.toISOString()).toBe("2026-06-17T03:00:00.000Z");
    expect(entry?.end.toISOString()).toBe("2026-06-17T05:00:00.000Z");
  });

  it("builds a Google Calendar deeplink from the normalized entry", () => {
    const entry = buildMatchCalendarEntry(matchEvent);
    if (!entry) {
      throw new Error("Expected calendar entry");
    }

    const url = buildGoogleCalendarUrl(entry);

    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=Argentina+vs+Argelia");
    expect(url).toContain("dates=20260617T030000Z%2F20260617T050000Z");
  });

  it("serializes one or more entries into an ICS calendar", () => {
    const entries = buildCalendarEntries([matchEvent]);
    const ics = buildIcsCalendar(entries);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Argentina vs Argelia");
    expect(ics).toContain("LOCATION:Kansas City Stadium");
    expect(ics).toContain("DTSTART:20260617T030000Z");
  });

  it("keeps Google limited to single-entry flows while allowing ICS bundles", () => {
    expect(getSupportedCalendarProviderActions(1).map((action) => action.id)).toEqual(["google", "ics"]);
    expect(getSupportedCalendarProviderActions(2).map((action) => action.id)).toEqual(["ics"]);
  });
});