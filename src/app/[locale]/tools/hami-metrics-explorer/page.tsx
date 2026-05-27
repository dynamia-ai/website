import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import HamiMetricsExplorer from "@/components/tools/HamiMetricsExplorer";

export default function HamiMetricsExplorerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <HamiMetricsExplorer />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("hamiMetricsExplorer.title"),
    description: t("hamiMetricsExplorer.description"),
  };
}
