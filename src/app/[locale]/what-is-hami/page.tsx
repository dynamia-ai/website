import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
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
      url: `/${locale === "zh" ? "zh/" : ""}what-is-hami`,
      siteName: meta("siteName"),
      type: "website",
    },
    alternates: {
      canonical: `/${locale === "zh" ? "zh/" : ""}what-is-hami`,
    },
  };
}
