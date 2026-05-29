import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { localizedUrl, localizedAlternates } from "@/utils/i18n";
import CaseStudiesList from "@/components/case-studies/CaseStudiesList";

export default function CaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseStudiesList />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudiesPage" });

  const title = t("title");
  const description = t("subtitle");
  const path = "/case-studies";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Dynamia AI`,
      description,
      url: localizedUrl(path, locale),
      siteName: "Dynamia AI",
      type: "website",
    },
    alternates: {
      canonical: localizedUrl(path, locale),
      languages: localizedAlternates(path),
    },
  };
}
