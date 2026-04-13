function asSingle(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSocialCrawler(userAgent) {
  if (!userAgent) return false;

  return /(WhatsApp|facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|TelegramBot|iMessagePreview)/i.test(userAgent);
}

function buildTargetUrl(baseUrl, eventId, detailsFlag) {
  if (!eventId) return baseUrl;
  const details = detailsFlag === "1" ? "true" : "false";
  return `${baseUrl}/worldcup/world-cup-2026?map=geographic&event=${encodeURIComponent(eventId)}&details=${details}`;
}

export default function handler(req, res) {
  const protocol = asSingle(req.headers["x-forwarded-proto"]) || "https";
  const host = asSingle(req.headers.host) || "2026-fixture.vercel.app";
  const baseUrl = `${protocol}://${host}`;
  const userAgent = asSingle(req.headers["user-agent"]) || "";

  const eventId = asSingle(req.query.event);
  const detailsFlag = asSingle(req.query.d) ?? "0";
  const teams = asSingle(req.query.m) || "Partido de la Copa Mundial 2026";
  const date = asSingle(req.query.dt) || "";

  const targetUrl = buildTargetUrl(baseUrl, eventId, detailsFlag);
  const sharedUrl = `${baseUrl}/s/${encodeURIComponent(eventId ?? "partido")}?d=${encodeURIComponent(detailsFlag)}&m=${encodeURIComponent(teams)}&dt=${encodeURIComponent(date)}`;

  const siteName = "Fixture Interactivo Copa 2026";
  const title = `${siteName} | ${teams}`;
  const description = date ? `${teams} · ${date}` : teams;
  const imageUrl = `${baseUrl}/social-share-2026.png`;

  if (!isSocialCrawler(userAgent)) {
    res.setHeader("Cache-Control", "no-store");
    res.redirect(307, targetUrl);
    return;
  }

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(sharedUrl)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(sharedUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(teams)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  </head>
  <body>
    <p>Redirigiendo al partido compartido...</p>
    <p><a href="${escapeHtml(targetUrl)}">Continuar</a></p>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.status(200).send(html);
}