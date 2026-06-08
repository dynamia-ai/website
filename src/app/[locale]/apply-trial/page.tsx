import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import FreeTrialPage from "@/components/pages/FreeTrialPage";

export default function ApplyTrial({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <FreeTrialPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "freeTrial" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}
