import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ResourcesPage from "@/components/pages/ResourcesPage";

export default function Resources({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ResourcesPage />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}
