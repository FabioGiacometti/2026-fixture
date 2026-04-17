import type { HistoricalEvent } from "@/data/historical-events";
import { getMatchStartInstant, getMatchVenueTimeZone } from "@/lib/match-time";

const DEFAULT_MATCH_DURATION_MINUTES = 120;

export type CalendarProviderId = "google" | "ics";

export interface CalendarEntry {
  id: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  sourceTimeZone: string | null;
}

export interface CalendarProviderAction {
  id: CalendarProviderId;
  label: string;
  supportsMultipleEntries: boolean;
}

export const CALENDAR_PROVIDER_ACTIONS: CalendarProviderAction[] = [
  { id: "google", label: "Google Calendar", supportsMultipleEntries: false },
  { id: "ics", label: "Descargar .ics", supportsMultipleEntries: true },
];

function formatGoogleDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatIcsDate(date: Date) {
  return formatGoogleDate(date);
}

function buildCalendarDescription(event: HistoricalEvent) {
  const lines = [event.description.trim()];

  if (event.groupName) {
    lines.push(`Grupo: ${event.groupName}`);
  } else if (event.stage) {
    lines.push(`Fase: ${event.stage}`);
  }

  if (event.city) {
    lines.push(`Sede: ${event.city}`);
  }

  return lines.filter(Boolean).join("\n");
}

export function buildMatchCalendarEntry(
  event: HistoricalEvent,
  options?: { durationMinutes?: number }
) {
  const start = getMatchStartInstant(event);
  if (!start) {
    return null;
  }

  const durationMinutes = options?.durationMinutes ?? DEFAULT_MATCH_DURATION_MINUTES;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const title = event.eventType === "match" && event.homeTeam && event.awayTeam
    ? `${event.homeTeam} vs ${event.awayTeam}`
    : event.title;

  return {
    id: event.id,
    title,
    description: buildCalendarDescription(event),
    location: event.city ?? event.region ?? "Sede por confirmar",
    start,
    end,
    sourceTimeZone: getMatchVenueTimeZone(event),
  } satisfies CalendarEntry;
}

export function buildCalendarEntries(events: HistoricalEvent[], options?: { durationMinutes?: number }) {
  return events
    .map((event) => buildMatchCalendarEntry(event, options))
    .filter((entry): entry is CalendarEntry => Boolean(entry));
}

export function buildGoogleCalendarUrl(entry: CalendarEntry) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: entry.title,
    details: entry.description,
    location: entry.location,
    dates: `${formatGoogleDate(entry.start)}/${formatGoogleDate(entry.end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsCalendar(entries: CalendarEntry[]) {
  const body = entries.map((entry) => [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(`fixture-${entry.id}@fixture-2026`)}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(entry.start)}`,
    `DTEND:${formatIcsDate(entry.end)}`,
    `SUMMARY:${escapeIcsText(entry.title)}`,
    `DESCRIPTION:${escapeIcsText(entry.description)}`,
    `LOCATION:${escapeIcsText(entry.location)}`,
    "END:VEVENT",
  ].join("\r\n")).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//2026 Fixture//Calendar//ES",
    "CALSCALE:GREGORIAN",
    body,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function getSupportedCalendarProviderActions(entryCount: number) {
  return CALENDAR_PROVIDER_ACTIONS.filter((action) => entryCount === 1 || action.supportsMultipleEntries);
}