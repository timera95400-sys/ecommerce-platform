// =============================================================================
// LIVRABLE 4 — Middleware de sécurité Next.js
// Headers HTTP + Rate limiting + Protection des routes admin
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Rate limiters par route (Upstash Redis)
// ---------------------------------------------------------------------------

function buildRatelimiter(requests: number, window: string) {
  if (!process.env["UPSTASH_REDIS_REST_URL"] || !process.env["UPSTASH_REDIS_REST_TOKEN"]) {
    return null;
  }
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"],
    token: process.env["UPSTASH_REDIS_REST_TOKEN"],
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"ms" | "s" | "m" | "h" | "d"}`),
    analytics: false,
  });
}

const rateLimiters: Record<string, ReturnType<typeof buildRatelimiter>> = {
  checkout: buildRatelimiter(3, "1 m"),
  auth: buildRatelimiter(5, "15 m"),
  contact: buildRatelimiter(5, "1 h"),
  default: buildRatelimiter(60, "1 m"),
};

function getRatelimiterForPath(pathname: string) {
  if (pathname.startsWith("/api/checkout")) return rateLimiters["checkout"];
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/compte"))
    return rateLimiters["auth"];
  if (pathname.startsWith("/api/contact") || pathname.startsWith("/api/newsletter"))
    return rateLimiters["contact"];
  if (pathname.startsWith("/api/")) return rateLimiters["default"];
  return null;
}

// ---------------------------------------------------------------------------
// CSP nonce helper
// ---------------------------------------------------------------------------

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

function buildCsp(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `frame-src https://js.stripe.com https://www.paypal.com`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://www.paypalobjects.com`,
    `connect-src 'self' https://api.stripe.com https://www.paypal.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];
  return directives.join("; ");
}

// ---------------------------------------------------------------------------
// Middleware principal
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Webhook routes: skip CSP injection (raw body needed)
  const isWebhook = pathname.startsWith("/api/webhooks/");

  // ------------------------------------------------------------------
  // Rate limiting
  // ------------------------------------------------------------------
  const limiter = getRatelimiterForPath(pathname);
  if (limiter) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: "Trop de requetes. Reessayez plus tard." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      );
    }
  }

  // ------------------------------------------------------------------
  // Build response with security headers
  // ------------------------------------------------------------------
  const nonce = isWebhook ? "" : generateNonce();
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        ...(nonce ? { "x-nonce": nonce } : {}),
      }),
    },
  });

  if (!isWebhook) {
    const csp = buildCsp(nonce);
    response.headers.set("Content-Security-Policy", csp);
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self https://js.stripe.com https://www.paypal.com)",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups",
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
