import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const svgPath = path.join(publicDir, 'favicon-soccer.svg');
const faviconPngPath = path.join(publicDir, 'favicon.png');
const sharePngPath = path.join(publicDir, 'social-share-2026.png');

const svgMarkup = await fs.readFile(svgPath, 'utf8');
const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

const browser = await chromium.launch();

async function renderFavicon() {
  const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 2 });
  await page.setContent(`
    <html>
      <body style="margin:0;display:grid;place-items:center;background:transparent;">
        <img src="${svgDataUrl}" style="width:220px;height:220px;display:block;" />
      </body>
    </html>
  `);
  await page.screenshot({ path: faviconPngPath, omitBackground: true });
  await page.close();
}

async function renderShareCard() {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`
    <html>
      <body style="margin:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4efe6;">
        <div style="width:1200px;height:630px;position:relative;overflow:hidden;background:
          radial-gradient(circle at 15% 18%, rgba(255,255,255,0.95), rgba(255,255,255,0.55) 22%, transparent 38%),
          linear-gradient(135deg, #f7f1e8 0%, #efe1cc 48%, #e9d7be 100%);">
          <div style="position:absolute;inset:0;background:
            radial-gradient(circle at 84% 16%, rgba(28,131,68,0.14), transparent 28%),
            radial-gradient(circle at 72% 84%, rgba(29,94,201,0.14), transparent 24%),
            radial-gradient(circle at 30% 74%, rgba(197,22,38,0.12), transparent 28%);"></div>

          <div style="position:absolute;left:72px;top:72px;width:250px;height:250px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,0.55);box-shadow:0 30px 60px rgba(92,73,45,0.14);backdrop-filter:blur(8px);">
            <img src="${svgDataUrl}" style="width:210px;height:210px;display:block;" />
          </div>

          <div style="position:absolute;left:380px;right:82px;top:98px;color:#1e1b16;">
            <div style="display:inline-flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:#ffffffc9;color:#7a5a2c;border:1px solid rgba(122,90,44,0.16);font-size:20px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
              Fixture Interactivo Copa 2026
            </div>
            <div style="margin-top:30px;font-size:68px;line-height:1.05;font-weight:800;max-width:680px;letter-spacing:-0.03em;">
              Comparte cada partido con una vista limpia y directa.
            </div>
            <div style="margin-top:24px;font-size:30px;line-height:1.35;color:#514536;max-width:670px;">
              Mapa 3D, links cortos y tarjetas sociales listas para WhatsApp, X y Facebook.
            </div>
          </div>

          <div style="position:absolute;left:76px;right:76px;bottom:58px;display:flex;align-items:center;justify-content:space-between;padding:26px 32px;border-radius:28px;background:#1f2430;color:#f3ede3;box-shadow:0 24px 50px rgba(17,23,35,0.22);">
            <div>
              <div style="font-size:23px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#f2b94b;">Nuevo favicon y card</div>
              <div style="margin-top:10px;font-size:36px;font-weight:700;">Balón oficial inspirado en tu referencia visual</div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:20px;background:rgba(255,255,255,0.06);">
              <img src="${svgDataUrl}" style="width:74px;height:74px;display:block;" />
              <div style="font-size:22px;line-height:1.25;color:#d9cdbd;max-width:240px;">La imagen social ahora usa el mismo icono que el favicon.</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: sharePngPath });
  await page.close();
}

await renderFavicon();
await renderShareCard();
await browser.close();
