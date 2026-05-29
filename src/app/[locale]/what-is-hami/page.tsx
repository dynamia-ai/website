import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { localizedUrl, localizedAlternates } from "@/utils/i18n";
import HamiPage from "@/components/pages/HamiPage";

export default function WhatIsHami({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <HamiPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hamiPage" });
  const meta = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: `${t("title")} HAMi?`,
    description: t("subtitle"),
    openGraph: {
      title: `${t("title")} HAMi?`,
      description: t("subtitle"),
      url: localizedUrl("/what-is-hami", locale),
      siteName: meta("siteName"),
      type: "website",
    },
    alternates: {
      canonical: localizedUrl("/what-is-hami", locale),
      languages: localizedAlternates("/what-is-hami"),
    },
  };
}
