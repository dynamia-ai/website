import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import RequestDemoPage from "@/components/pages/RequestDemoPage";

export default function RequestDemo({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <RequestDemoPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "requestDemo" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}
