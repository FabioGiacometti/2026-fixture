import type { HistoricalEvent } from "@/data/historical-events";
import { buildApiUrl } from "@/lib/env";

const COUNTRY_CODE_ALIASES: Record<string, string[]> = {
  AR: ["argentina"],
  BO: ["bolivia"],
  BR: ["brasil", "brazil"],
  CA: ["canada", "canadá"],
  CH: ["suiza", "switzerland"],
  CL: ["chile"],
  CO: ["colombia"],
  CR: ["costa rica"],
  CV: ["cabo verde", "cape verde"],
  DE: ["alemania", "germany", "west germany", "east germany"],
  EC: ["ecuador"],
  EG: ["egipto", "egypt"],
  ES: ["espana", "españa", "spain"],
  FR: ["francia", "france"],
  GB: ["inglaterra", "england", "escocia", "scotland", "gales", "wales", "united kingdom", "great britain", "uk"],
  GH: ["ghana"],
  HR: ["croacia", "croatia"],
  IT: ["italia", "italy"],
  JP: ["japon", "japón", "japan"],
  KR: ["corea del sur", "south korea", "korea republic", "republic of korea"],
  MA: ["marruecos", "morocco"],
  MX: ["mexico", "méxico"],
  NG: ["nigeria"],
  NL: ["paises bajos", "países bajos", "netherlands", "holland"],
  NO: ["noruega", "norway"],
  PA: ["panama", "panamá"],
  PE: ["peru", "perú"],
  PL: ["polonia", "poland"],
  PT: ["portugal"],
  QA: ["qatar"],
  SA: ["arabia saudita", "saudi arabia"],
  SN: ["senegal"],
  TN: ["tunez", "túnez", "tunisia"],
  TR: ["turquia", "turquía", "turkey"],
  US: ["usa", "us", "united states", "estados unidos", "eeuu", "eua"],
  UY: ["uruguay"],
};

export interface VisitorCountryMatchResult {
  matchedTeam: string | null;
  detectedCountryName: string | null;
  source: "ip" | "locale" | "none";
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getLocaleRegionCode() {
  if (typeof navigator === "undefined") return null;

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const locale of locales) {
    if (!locale) continue;
    const match = locale.match(/[-_](?<region>[A-Za-z]{2})$/);
    const region = match?.groups?.region?.toUpperCase();
    if (region) return region;
  }

  return null;
}

function getRegionDisplayName(regionCode?: string | null) {
  const normalizedCode = regionCode?.toUpperCase();
  if (!normalizedCode) return null;

  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(normalizedCode) ?? null;
  } catch {
    return null;
  }
}

function getCountryCandidates(countryCode?: string | null, countryName?: string | null) {
  const candidates = new Set<string>();

  if (countryName) {
    candidates.add(normalizeText(countryName));
  }

  const normalizedCode = countryCode?.toUpperCase();
  if (normalizedCode) {
    COUNTRY_CODE_ALIASES[normalizedCode]?.forEach((alias) => candidates.add(normalizeText(alias)));

    try {
      const spanishName = new Intl.DisplayNames(["es"], { type: "region" }).of(normalizedCode);
      const englishName = new Intl.DisplayNames(["en"], { type: "region" }).of(normalizedCode);
      if (spanishName) candidates.add(normalizeText(spanishName));
      if (englishName) candidates.add(normalizeText(englishName));
    } catch {
      // Ignore DisplayNames support issues and rely on alias mapping.
    }
  }

  return [...candidates].filter(Boolean);
}

export function findParticipantCountryMatch(
  events: HistoricalEvent[],
  countryCode?: string | null,
  countryName?: string | null
) {
  const candidates = getCountryCandidates(countryCode, countryName);
  if (candidates.length === 0) return null;

  const participantTeams = Array.from(
    new Set(
      events.flatMap((event) => [event.homeTeam, event.awayTeam]).filter((team): team is string => Boolean(team))
    )
  );

  const normalizedTeams = participantTeams.map((team) => ({
    original: team,
    normalized: normalizeText(team),
  }));

  for (const candidate of candidates) {
    const match = normalizedTeams.find(
      (team) =>
        team.normalized === candidate ||
        team.normalized.includes(candidate) ||
        candidate.includes(team.normalized)
    );

    if (match) {
      return match.original;
    }
  }

  return null;
}

export async function detectVisitorCountryMatch(events: HistoricalEvent[]): Promise<VisitorCountryMatchResult> {
  if (typeof window === "undefined") {
    return { matchedTeam: null, detectedCountryName: null, source: "none" };
  }

  try {
    const response = await fetch(buildApiUrl("/api/visitor-country"), {
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      const geoMatch = findParticipantCountryMatch(events, data?.countryCode, data?.country);
      if (geoMatch) {
        return {
          matchedTeam: geoMatch,
          detectedCountryName: data?.country ?? geoMatch,
          source: "ip",
        };
      }
    }
  } catch {
    // Ignore network/IP lookup issues and rely on locale as a soft suggestion only.
  }

  const localeRegionCode = getLocaleRegionCode();
  const localeMatch = findParticipantCountryMatch(events, localeRegionCode, null);
  if (localeMatch) {
    return {
      matchedTeam: localeMatch,
      detectedCountryName: getRegionDisplayName(localeRegionCode) ?? localeMatch,
      source: "locale",
    };
  }

  return { matchedTeam: null, detectedCountryName: null, source: "none" };
}