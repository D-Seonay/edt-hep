import type { VercelRequest, VercelResponse } from "@vercel/node";

// Validation identique à ton client
const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+\d*$/;
  return regex.test(input);
};

const isIsoDate = (input: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(input);

// Rate limiting basique en mémoire (par instance). Pour prod: Upstash Redis / Vercel KV.
const RATE_LIMIT_MAX = 60; // 60 requêtes par 5 min par IP
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tel = typeof req.query.tel === "string" ? req.query.tel : "";
  const date = typeof req.query.date === "string" ? req.query.date : "";
  const time = typeof req.query.time === "string" ? req.query.time : "8:00";

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket as any)?.remoteAddress ||
    "unknown";

  if (!rateLimit(ip)) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  if (!isStringDotString(tel)) {
    res.status(400).json({ error: "Invalid 'tel' format" });
    return;
  }
  if (!isIsoDate(date)) {
    res
      .status(400)
      .json({ error: "Invalid 'date' format (expected YYYY-MM-DD)" });
    return;
  }

  const targetUrl = `https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${encodeURIComponent(
    tel
  )}&date=${encodeURIComponent(date)}%20${encodeURIComponent(time)}`;

  try {
    const resp = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VercelServerlessProxy/1.0; +https://vercel.com)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!resp.ok) {
      res.status(502).json({ error: "Upstream error", status: resp.status });
      return;
    }

    const html = await resp.text();

    // Caching via Vercel CDN
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    // CORS (si tu sers le front sur le même domaine, pas nécessaire, mais utile si tu as plusieurs origines)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.status(200).send(html);
  } catch (e) {
    res.status(500).json({ error: "Proxy fetch failed" });
  }
}
