import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import CaseSfTechnologyEffectiveGpu from "@/components/case-studies/CaseSfTechnologyEffectiveGpu";

export default function CaseSfTechnologyEffectiveGpuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseSfTechnologyEffectiveGpu />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });

  const title = t("sfTechnologyEffectiveGpu.title");
  const description = t("sfTechnologyEffectiveGpu.subtitle");
  const path = "/case-studies/sf-technology";
  const url = locale === "zh" ? `/zh${path}` : path;

  return {
    title: `Case Study | ${title}`,
    description,
    openGraph: {
      title: `Case Study | ${title}`,
      description,
      url,
      siteName: "Dynamia AI",
      type: "article",
    },
    alternates: {
      canonical: `https://dynamia.ai${url}`,
      languages: {
        en: `https://dynamia.ai${path}`,
        zh: `https://dynamia.ai/zh${path}`,
      },
    },
  };
}
