import { describe, expect, it } from "vitest";
import { buildApiUrl, normalizeApiBaseUrl, parseEnvBoolean } from "@/lib/env";

describe("env helpers", () => {
  it("parses boolean-like environment flags consistently", () => {
    expect(parseEnvBoolean("true", false)).toBe(true);
    expect(parseEnvBoolean("enabled", false)).toBe(true);
    expect(parseEnvBoolean("false", true)).toBe(false);
    expect(parseEnvBoolean(undefined, true)).toBe(true);
  });

  it("normalizes API base URLs without trailing slashes", () => {
    expect(normalizeApiBaseUrl("https://api.example.com/")).toBe("https://api.example.com");
    expect(normalizeApiBaseUrl("/")).toBe("");
    expect(normalizeApiBaseUrl(undefined)).toBe("");
  });

  it("builds same-origin API paths by default", () => {
    expect(buildApiUrl("/api/visitor-country")).toBe("/api/visitor-country");
  });
});
