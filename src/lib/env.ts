function normalizeApiBaseUrlValue(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  return trimmed.replace(/\/+$/, "");
}

export function parseEnvBoolean(value: string | undefined, fallback: boolean) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on", "enabled"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", "disabled"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function normalizeApiBaseUrl(value?: string) {
  return normalizeApiBaseUrlValue(value);
}

export const env = {
  apiBaseUrl: normalizeApiBaseUrlValue(import.meta.env.VITE_API_BASE_URL),
  analyticsEnabled: parseEnvBoolean(import.meta.env.VITE_ANALYTICS_ENABLED, import.meta.env.PROD),
  appEnv:
    import.meta.env.VITE_APP_ENV?.trim() ||
    (import.meta.env.PROD ? "production" : "development"),
};

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return env.apiBaseUrl ? `${env.apiBaseUrl}${normalizedPath}` : normalizedPath;
}
