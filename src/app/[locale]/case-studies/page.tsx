import RedesignPage, { hasRedesignPage, redesignMetadata } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import {
  generatePageMetadata,
  localizedAlternates,
  localizedUrl,
} from "@/utils/i18n";
import { routing } from "@/i18n/routing";
import { CASE_STUDY_LOCALES } from "@/lib/seo-routes";
import CaseStudiesList from "@/components/case-studies/CaseStudiesList";

function CaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseStudiesList />;
}

async function legacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await generatePageMetadata(
    locale,
    "caseStudies",
    "/case-studies"
  );
  const hasLocalizedContent = CASE_STUDY_LOCALES.includes(
    locale as (typeof CASE_STUDY_LOCALES)[number]
  );
  const canonicalLocale = hasLocalizedContent
    ? locale
    : routing.defaultLocale;
  const canonicalUrl = localizedUrl("/case-studies", canonicalLocale);

  return {
    ...metadata,
    robots: hasLocalizedContent
      ? undefined
      : { index: false, follow: true },
    openGraph: {
      ...metadata.openGraph,
      url: canonicalUrl,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: localizedAlternates("/case-studies", CASE_STUDY_LOCALES),
    },
  };
}

export default async function MigratedPage(props: Parameters<typeof CaseStudiesPage>[0]) {
  const resolved = await props.params;
  const route = `/cases`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <CaseStudiesPage {...props} />;
}

export async function generateMetadata(props: Parameters<typeof legacyMetadata>[0]) {
  const resolved = await props.params;
  const route = `/cases`;
  if (hasRedesignPage(route)) return redesignMetadata(route,resolved.locale);
  return legacyMetadata(props);
}
