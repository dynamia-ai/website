import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { legacyBlogDestination } from "@/lib/legacy-blog-redirects";
import { routing } from "./i18n/routing";
import { GEO_COOKIE_MAX_AGE } from "@/config/cookie-consent";
import { getCountry, CONSENT_REQUIRED_COUNTRIES } from "@/utils/geo";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const legacyDestination = legacyBlogDestination(request.nextUrl.pathname);
  if (legacyDestination) {
    const destination = request.nextUrl.clone();
    destination.pathname = legacyDestination;
    return NextResponse.redirect(destination, 308);
  }

  const response = intlMiddleware(request);

  if (!request.cookies.get("consent-required")) {
    const country = getCountry(request.headers);
    // Fail closed: unknown country → show consent banner
    const requiresConsent = !country || CONSENT_REQUIRED_COUNTRIES.has(country);
    response.cookies.set("consent-required", String(requiresConsent), {
      path: "/",
      maxAge: GEO_COOKIE_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    // Blog slugs may contain dots (excluded by the rule above).
    "/blog/:path*",
    "/en/blog/:path*",
    "/zh/blog/:path*",
    "/de/blog/:path*",
  ],
};
