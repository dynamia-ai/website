import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { localizedUrl, localizedAlternates } from "@/utils/i18n";
import CaseNio from "@/components/case-studies/CaseNio";

export default function CaseNioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseNio />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });

  const title = t("nio.title");
  const description = t("nio.subtitle");
  const path = "/case-studies/nio";

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
