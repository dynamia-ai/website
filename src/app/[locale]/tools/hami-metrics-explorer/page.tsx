import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import HamiMetricsExplorer from "@/components/tools/HamiMetricsExplorer";
import { localizedUrl, pageAlternates } from "@/utils/i18n";

const PATH = "/tools/hami-metrics-explorer";

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
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const title = t("hamiMetricsExplorer.title");
  const description = t("hamiMetricsExplorer.description");
  const url = localizedUrl(PATH, locale);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    alternates: pageAlternates(PATH, locale),
  };
}
