import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side geo access gate for public pages. Laravel (App\Services\Geo\
 * GeoAccessDecisionService) is the single source of truth for whitelist,
 * blacklist, country policy and VPN/Tor/datacenter detection — this
 * middleware never duplicates that policy, it just asks Laravel's
 * secret-gated /api/geo/check endpoint and caches the verdict in a cookie
 * so repeat visits from the same browser don't pay the round-trip.
 *
 * Fails open on any network error/timeout so a Laravel outage never takes
 * the public site down for legitimate visitors.
 */

const COOKIE_NAME = "geo_access_v1";
const COOKIE_TTL_SECONDS = 15 * 60;
const CHECK_TIMEOUT_MS = 2500;

const fallbackApiBase =
  process.env.NODE_ENV === "production"
    ? "https://api.domesticrealestate.us/api"
    : "http://127.0.0.1:8001/api";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || fallbackApiBase;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function clientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

interface GeoCookiePayload {
  allowed: boolean;
  reason: string;
  message: string;
  exp: number;
}

function readCookie(request: NextRequest): GeoCookiePayload | null {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GeoCookiePayload;
    if (typeof parsed.exp === "number" && parsed.exp > Date.now()) {
      return parsed;
    }
  } catch {
    // fall through to re-check
  }
  return null;
}

async function checkWithLaravel(ip: string): Promise<GeoCookiePayload> {
  const secret = process.env.GEO_INTERNAL_SECRET;
  const fallback: GeoCookiePayload = {
    allowed: true,
    reason: "check_unavailable",
    message: "",
    exp: Date.now() + COOKIE_TTL_SECONDS * 1000,
  };

  if (!secret) {
    console.error("[geo-middleware] GEO_INTERNAL_SECRET is not set — allowing all traffic through.");
    return fallback;
  }

  try {
    const response = await fetch(`${apiBase()}/geo/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Geo-Internal-Secret": secret,
      },
      body: JSON.stringify({ ip }),
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[geo-middleware] geo check failed with status ${response.status} — failing open.`);
      return fallback;
    }

    const body = await response.json();
    const data = body?.data ?? body;

    return {
      allowed: Boolean(data?.allowed ?? true),
      reason: String(data?.reason ?? "unknown"),
      message: String(data?.blocked_message ?? ""),
      exp: Date.now() + COOKIE_TTL_SECONDS * 1000,
    };
  } catch (error) {
    console.error("[geo-middleware] geo check request failed — failing open.", error);
    return fallback;
  }
}

function blockedResponse(message: string): NextResponse {
  const safeMessage =
    message ||
    "Domestic Real Estate is currently available only to users located in the United States and Canada. If you believe this is an error, please contact support.";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>Access Restricted</title>
<style>
  body { margin:0; background:#0A2647; color:#fff; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  main { min-height:70vh; display:flex; align-items:center; justify-content:center; padding:64px 16px; text-align:center; }
  .wrap { max-width:640px; }
  .eyebrow { color:#C9A227; font-size:14px; letter-spacing:.2em; text-transform:uppercase; margin-bottom:16px; font-weight:600; }
  h1 { font-size:clamp(32px,6vw,56px); font-weight:700; margin:0 0 24px; }
  p { color:rgba(255,255,255,.7); font-size:18px; line-height:1.6; margin:0 0 24px; }
  a { display:inline-block; background:#C9A227; color:#0A2647; font-weight:600; padding:14px 32px; border-radius:8px; text-decoration:none; }
</style>
</head>
<body>
<main>
  <div class="wrap">
    <p class="eyebrow">403 &middot; Access Restricted</p>
    <h1>Access Restricted</h1>
    <p>${safeMessage}</p>
    <a href="mailto:support@domesticrealestate.us">Contact Support</a>
  </div>
</main>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 403,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  return response;
}

function setCookie(response: NextResponse, payload: GeoCookiePayload): void {
  response.cookies.set(COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_TTL_SECONDS,
    path: "/",
  });
}

export async function proxy(request: NextRequest) {
  const cached = readCookie(request);
  if (cached) {
    return cached.allowed ? NextResponse.next() : blockedResponse(cached.message);
  }

  const ip = clientIp(request);
  if (!ip) {
    // No resolvable client IP (e.g. local dev without a proxy) — allow.
    return NextResponse.next();
  }

  const decision = await checkWithLaravel(ip);

  const response = decision.allowed ? NextResponse.next() : blockedResponse(decision.message);
  setCookie(response, decision);
  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except: /admin (auth-gated separately, no cookie
     * visible to this middleware), Next internals, and static assets.
     */
    "/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml|json|woff|woff2)$).*)",
  ],
};
