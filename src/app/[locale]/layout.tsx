import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { jsonLdScriptProps } from "react-schemaorg";
import type { Organization, WebSite, WithContext } from "schema-dts";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const DOMAIN = "https://dynamia.ai";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />
        <link
          rel="preload"
          href="/LOGO-small.svg"
          as="image"
          type="image/svg+xml"
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0070f3" />
        <meta name="msapplication-TileColor" content="#0070f3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dynamia AI" />
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <script
          {...jsonLdScriptProps<WithContext<Organization>>({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: t("orgName"),
            alternateName: t("orgAlternateName"),
            url: t("orgUrl"),
            logo: `${DOMAIN}/LOGO-small.svg`,
            description: t("orgDescription"),
            foundingDate: "2023",
            sameAs: ["https://github.com/Project-HAMi/HAMi"],
            contactPoint: {
              "@type": "ContactPoint",
              email: "info@dynamia.ai",
              contactType: "customer service",
            },
            address: {
              "@type": "PostalAddress",
              addressCountry: "Global",
            },
          })}
        />
        <script
          {...jsonLdScriptProps<WithContext<WebSite>>({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: t("orgName"),
            alternateName: t("orgAlternateName"),
            url: t("orgUrl"),
            description: t("orgDescription"),
            inLanguage: locale,
            publisher: {
              "@type": "Organization",
              name: t("orgName"),
              alternateName: t("orgAlternateName"),
            },
            potentialAction: {
              "@type": "SearchAction",
              target: `${DOMAIN}/search?q={search_term_string}`,
            },
          })}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

const locales = ["en", "zh"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://dynamia.ai"),
    title: {
      default: t("title"),
      template: t("template"),
    },
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: "Dynamia AI Team" }],
    creator: t("creator"),
    publisher: t("creator"),
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: [{ url: "/favicon/favicon.svg", type: "image/svg+xml" }],
      apple: "/favicon/apple-touch-icon.svg",
      shortcut: "/favicon/favicon.svg",
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      locale: t("ogLocale"),
      url: "https://dynamia.ai",
      title: t("title"),
      description: t("ogDescription"),
      siteName: t("siteName"),
      images: [{ url: "/LOGO-small.svg", width: 1200, height: 630, alt: "Dynamia AI Logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
      images: ["/LOGO-small.svg"],
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: DOMAIN,
      languages: {
        en: `${DOMAIN}`,
        zh: `${DOMAIN}/zh`,
      },
    },
  };
}
