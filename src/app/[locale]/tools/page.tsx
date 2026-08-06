import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import ToolsPage from "@/components/pages/ToolsPage";
import { generatePageMetadata } from "@/utils/i18n";

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
  return generatePageMetadata(locale, "tools", "/tools");
}
