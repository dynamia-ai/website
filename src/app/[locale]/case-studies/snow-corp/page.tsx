import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { localizedUrl, localizedAlternates } from "@/utils/seo";
import CaseSnowCorp from "@/components/case-studies/CaseSnowCorp";

export default function CaseSnowCorpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseSnowCorp />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });

  const title = t("snowCorp.title");
  const description = t("snowCorp.subtitle");
  const path = "/case-studies/snow-corp";

  return {
    title: `Case Study | ${title}`,
    description,
    openGraph: {
      title: `Case Study | ${title}`,
      description,
      url: localizedUrl(path, locale),
      siteName: "Dynamia AI",
      type: "article",
    },
    alternates: {
      canonical: localizedUrl(path, locale),
      languages: localizedAlternates(path),
    },
  };
}
