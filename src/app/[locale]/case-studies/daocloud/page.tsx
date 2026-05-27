import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { localizedUrl, localizedAlternates } from "@/utils/seo";
import CaseDaoCloud from "@/components/case-studies/CaseDaoCloud";

export default function CaseDaoCloudPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseDaoCloud />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });

  const title = t("daoCloud.title");
  const description = t("daoCloud.subtitle");
  const path = "/case-studies/daocloud";

  return {
    title: `Case Study | ${title}`,
    description,
    openGraph: {
      title: `Case Study | ${title}`,
      description,
      url: localizedUrl(path, locale),
      siteName: "Dynamia AI",
      type: "article",
    },
    alternates: {
      canonical: localizedUrl(path, locale),
      languages: localizedAlternates(path),
    },
  };
}
