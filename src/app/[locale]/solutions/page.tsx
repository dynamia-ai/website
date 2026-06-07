import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import SolutionsPage from "@/components/pages/SolutionsPage";

export default function Solutions({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <SolutionsPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solutions" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}
