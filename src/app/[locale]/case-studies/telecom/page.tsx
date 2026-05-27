import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import CaseTelecomGpu from "@/components/case-studies/CaseTelecomGpu";

export default function CaseTelecomGpuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <CaseTelecomGpu />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });

  const title = t("telecomGpu.title");
  const description = t("telecomGpu.subtitle");
  const path = "/case-studies/telecom";
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
