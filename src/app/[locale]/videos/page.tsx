import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import VideosPage from "@/components/pages/VideosPage";

export default function Videos({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <VideosPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videos" });
  const meta = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("pageTitle"),
    description: t("pageSubtitle"),
    openGraph: {
      title: t("pageTitle"),
      description: t("pageSubtitle"),
      url: `/${locale === "zh" ? "zh/" : ""}videos`,
      siteName: meta("siteName"),
      type: "website",
    },
    alternates: {
      canonical: `/${locale === "zh" ? "zh/" : ""}videos`,
    },
  };
}
