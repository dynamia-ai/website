import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import CompanyPage from "@/components/pages/CompanyPage";

export default function Company({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <CompanyPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("about.title"),
    description: t("about.description"),
  };
}
