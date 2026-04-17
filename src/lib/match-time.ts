interface MatchTimeInput {
  year: number;
  month?: number;
  day?: number;
  kickoff?: string;
  city?: string;
}

const WORLD_CUP_VENUE_TIME_ZONES: Record<string, string> = {
  "Estadio Ciudad de México": "America/Mexico_City",
  "Estadio Azteca Ciudad de México": "America/Mexico_City",
  "Estadio Guadalajara": "America/Mexico_City",
  "Estadio Monterrey": "America/Monterrey",
  "Atlanta Stadium": "America/New_York",
  "Boston Stadium": "America/New_York",
  "BC Place Vancouver": "America/Vancouver",
  "Dallas Stadium": "America/Chicago",
  "Houston Stadium": "America/Chicago",
  "Kansas City Stadium": "America/Chicago",
  "Los Angeles Stadium": "America/Los_Angeles",
  "Miami Stadium": "America/New_York",
  "New York / New Jersey Stadium": "America/New_York",
  "New York New Jersey Stadium": "America/New_York",
  "Philadelphia Stadium": "America/New_York",
  "San Francisco Bay Area Stadium": "America/Los_Angeles",
  "Seattle Stadium": "America/Los_Angeles",
  "Toronto Stadium": "America/Toronto",
};

function parseKickoff(kickoff?: string) {
  if (!kickoff) {
    return null;
  }

  const match = kickoff.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return {
    hours: Math.max(0, Math.min(23, hours)),
    minutes: Math.max(0, Math.min(59, minutes)),
  };
}

function getTimeZoneOffsetMs(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number.parseInt(part.value, 10)])
  ) as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>;

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return asUtc - date.getTime();
}

export function getMatchVenueTimeZone(event: MatchTimeInput) {
  if (!event.city) {
    return null;
  }

  return WORLD_CUP_VENUE_TIME_ZONES[event.city] ?? null;
}

export function getMatchStartInstant(event: MatchTimeInput) {
  if (event.year <= 0) {
    return null;
  }

  const kickoff = parseKickoff(event.kickoff);
  const timeZone = getMatchVenueTimeZone(event);
  if (!kickoff || !timeZone) {
    return null;
  }

  const month = Math.max(1, Math.min(12, event.month ?? 1));
  const day = Math.max(1, Math.min(31, event.day ?? 1));
  const localUtcGuess = Date.UTC(event.year, month - 1, day, kickoff.hours, kickoff.minutes, 0);
  const firstOffset = getTimeZoneOffsetMs(timeZone, new Date(localUtcGuess));
  let instantMs = localUtcGuess - firstOffset;
  const refinedOffset = getTimeZoneOffsetMs(timeZone, new Date(instantMs));

  if (refinedOffset !== firstOffset) {
    instantMs = localUtcGuess - refinedOffset;
  }

  return new Date(instantMs);
}

export function formatMatchLocalKickoff(
  event: MatchTimeInput,
  options?: { locale?: string; timeZone?: string }
) {
  const instant = getMatchStartInstant(event);
  if (!instant) {
    return event.kickoff ?? null;
  }

  return new Intl.DateTimeFormat(options?.locale ?? "es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: options?.timeZone,
  }).format(instant);
}

export function formatMatchLocalDateTime(
  event: MatchTimeInput,
  options?: { locale?: string; timeZone?: string; includeWeekday?: boolean; includeYear?: boolean }
) {
  const instant = getMatchStartInstant(event);
  if (!instant) {
    return null;
  }

  const locale = options?.locale ?? "es-AR";
  const datePart = new Intl.DateTimeFormat(locale, {
    weekday: options?.includeWeekday ?? true ? "long" : undefined,
    day: "2-digit",
    month: "long",
    year: options?.includeYear ?? true ? "numeric" : undefined,
    timeZone: options?.timeZone,
  }).format(instant);
  const timePart = formatMatchLocalKickoff(event, options);

  return timePart ? `${datePart} · ${timePart}` : datePart;
}