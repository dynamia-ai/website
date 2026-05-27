import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const DOMAIN = "https://dynamia.ai";

type SeoPage = "home" | "products" | "pricing" | "company" | "solutions" | "resources" | "whatIsHami";

export function localizedUrl(path: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${DOMAIN}${prefix}${path}`;
}

export function localizedAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((loc) => [loc, localizedUrl(path, loc)])
  );
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
    title,
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
      description: mt("twitterDescription"),
      images: [`${DOMAIN}/LOGO-small.svg`],
    },
    alternates: {
      canonical: url,
      languages: localizedAlternates(path),
    },
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
