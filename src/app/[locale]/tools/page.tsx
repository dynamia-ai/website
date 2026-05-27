import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ToolsPage from "@/components/pages/ToolsPage";

export default function Tools({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ToolsPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}
