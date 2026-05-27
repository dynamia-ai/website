import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type SeoPage = "home" | "products" | "pricing" | "company" | "solutions" | "resources" | "whatIsHami";

const DOMAIN = "https://dynamia.ai";

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
  const zhPath = path === "/" ? "/zh" : `/zh${path}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}${path}`,
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
      canonical: `${DOMAIN}${path}`,
      languages: {
        en: `${DOMAIN}${path}`,
        zh: `${DOMAIN}${zhPath}`,
      },
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
