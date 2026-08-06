import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import ResourcesPage from "@/components/pages/ResourcesPage";
import { generatePageMetadata } from "@/utils/i18n";

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
  return generatePageMetadata(locale, "resources", "/resources");
}
