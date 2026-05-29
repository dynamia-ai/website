import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { localizedUrl, localizedAlternates } from "@/utils/i18n";
import CasePrepEduHami from "@/components/case-studies/CasePrepEduHami";

export default function CasePrepEduHamiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CasePrepEduHami />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });

  const title = t("prepEduHami.title");
  const description = t("prepEduHami.subtitle");
  const path = "/case-studies/prep-edu";

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
