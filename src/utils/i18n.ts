import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/config/app-config";

const DOMAIN = SITE_URL;

type SeoPage =
  | "home"
  | "products"
  | "pricing"
  | "company"
  | "blog"
  | "caseStudies"
  | "solutions"
  | "resources"
  | "tools"
  | "whatIsHami"
  | "faq";

function normalizePath(path: string): string {
  if (!path || path === "/") return "";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

export function localizedUrl(path: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const normalizedPath = normalizePath(path);
  if (!prefix && !normalizedPath) return `${DOMAIN}/`;
  return `${DOMAIN}${prefix}${normalizedPath}`;
}

export function localizedPath(path: string, locale: string): string {
  const normalizedPath = normalizePath(path);
  if (locale === routing.defaultLocale) return normalizedPath || "/";
  return `/${locale}${normalizedPath}`;
}

export function shortenDescription(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}…`;
}

export function localizedAlternates(
  path: string,
  locales: readonly string[] = routing.locales
): Record<string, string> {
  const xDefaultLocale = locales.includes(routing.defaultLocale)
    ? routing.defaultLocale
    : locales[0];

  return {
    ...Object.fromEntries(locales.map((loc) => [loc, localizedUrl(path, loc)])),
    ...(xDefaultLocale
      ? { "x-default": localizedUrl(path, xDefaultLocale) }
      : {}),
  };
}

export function pageAlternates(
  path: string,
  locale: string,
  locales: readonly string[] = routing.locales
): Metadata["alternates"] {
  return {
    canonical: localizedUrl(path, locale),
    languages: localizedAlternates(path, locales),
  };
}

export async function generatePageMetadata(
  locale: string,
  page: SeoPage,
  path: string
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Seo" });
  const mt = await getTranslations({ locale, namespace: "Metadata" });

  const title = t(`${page}.title`);
  const description = t(`${page}.description`);
  const keywords = t(`${page}.keywords`);
  const url = localizedUrl(path, locale);

  return {
    title: { absolute: title },
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName: mt("siteName"),
      type: "website",
      locale: mt("ogLocale"),
      images: [{ url: `${DOMAIN}/LOGO-small.svg`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${DOMAIN}/LOGO-small.svg`],
    },
    alternates: pageAlternates(path, locale),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
