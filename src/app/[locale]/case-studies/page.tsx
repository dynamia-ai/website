import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
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
  const url = locale === "zh" ? `/zh${path}` : path;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Dynamia AI`,
      description,
      url,
      siteName: "Dynamia AI",
      type: "website",
    },
    alternates: {
      canonical: `https://dynamia.ai${url}`,
      languages: {
        en: `https://dynamia.ai${path}`,
        zh: `https://dynamia.ai/zh${path}`,
      },
    },
  };
}
