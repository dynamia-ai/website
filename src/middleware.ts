import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getCountry, CONSENT_REQUIRED_COUNTRIES } from "@/utils/geo";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  if (!request.cookies.get("consent-required")) {
    const country = getCountry(request.headers);
    response.cookies.set(
      "consent-required",
      CONSENT_REQUIRED_COUNTRIES.has(country) ? "true" : "false",
      { path: "/", maxAge: 86400 },
    );
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
