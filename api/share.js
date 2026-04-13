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

function resolveTargetUrl(rawTarget, baseUrl) {
  try {
    if (!rawTarget) return baseUrl;
    const url = new URL(rawTarget, baseUrl);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export default function handler(req, res) {
  const protocol = asSingle(req.headers["x-forwarded-proto"]) || "https";
  const host = asSingle(req.headers.host) || "2026-fixture.vercel.app";
  const baseUrl = `${protocol}://${host}`;

  const teams = asSingle(req.query.teams) || "Partido de la Copa Mundial 2026";
  const date = asSingle(req.query.date) || "";
  const rawTarget = asSingle(req.query.target);
  const targetUrl = resolveTargetUrl(rawTarget, baseUrl);

  const siteName = "Fixture Interactivo Copa 2026";
  const title = `${siteName} | ${teams}`;
  const description = date ? `${teams} · ${date}` : teams;
  const imageUrl = `${baseUrl}/social-share-2026.png`;

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(targetUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(targetUrl)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(targetUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(teams)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  </head>
  <body>
    <script>
      window.location.replace(${JSON.stringify(targetUrl)});
    </script>
    <p>Redirigiendo al partido compartido...</p>
    <p><a href="${escapeHtml(targetUrl)}">Continuar</a></p>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.status(200).send(html);
}