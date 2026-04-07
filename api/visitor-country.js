export default function handler(req, res) {
  const getHeader = (name) => {
    const value = req.headers?.[name];
    return Array.isArray(value) ? value[0] : value;
  };

  const countryCode = getHeader("x-vercel-ip-country") ?? null;
  const region = getHeader("x-vercel-ip-country-region") ?? null;
  const city = getHeader("x-vercel-ip-city") ?? null;

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).json({
    countryCode,
    region,
    city,
  });
}
