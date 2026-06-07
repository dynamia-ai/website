import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import CookiesPolicyPage from "@/components/pages/CookiesPolicyPage";

export default function CookiesPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <CookiesPolicyPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookiesPolicy" });
  const meta = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("intro").substring(0, 160),
    openGraph: {
      title: t("title"),
      description: t("intro").substring(0, 160),
      url: `/${locale === "zh" ? "zh/" : ""}cookies-policy`,
      siteName: meta("siteName"),
      type: "website",
    },
    alternates: {
      canonical: `/${locale === "zh" ? "zh/" : ""}cookies-policy`,
    },
  };
}
