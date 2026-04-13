import { test, expect } from "../playwright-fixture";

const EVENT_ID = "world-cup-2026-g-j1";
const MAP_VIEW_PATH = `/worldcup/world-cup-2026?filters=Argentina&map=geographic&event=${EVENT_ID}&details=false`;
const DETAIL_VIEW_PATH = `/worldcup/world-cup-2026?filters=Argentina&map=geographic&event=${EVENT_ID}&details=true`;

test.describe("Deep link event state", () => {
  test("reproduces map-focused event view after reload", async ({ page }) => {
    await page.goto(MAP_VIEW_PATH, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(new RegExp(`event=${EVENT_ID}`));
    await expect(page).toHaveURL(/details=false/);
    await expect(page.getByRole("button", { name: /ver información del partido/i })).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });

    await expect(page).toHaveURL(new RegExp(`event=${EVENT_ID}`));
    await expect(page).toHaveURL(/details=false/);
    await expect(page.getByRole("button", { name: /ver información del partido/i })).toBeVisible();
  });

  test("reproduces detail event view after reload", async ({ page }) => {
    await page.goto(DETAIL_VIEW_PATH, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(new RegExp(`event=${EVENT_ID}`));
    await expect(page).toHaveURL(/details=true/);
    await expect(page.getByRole("button", { name: /ver en mapa/i }).first()).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });

    await expect(page).toHaveURL(new RegExp(`event=${EVENT_ID}`));
    await expect(page).toHaveURL(/details=true/);
    await expect(page.getByRole("button", { name: /ver en mapa/i }).first()).toBeVisible();
  });
});
