import RedesignPage, { hasRedesignPage, redesignMetadata } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import ToolsPage from "@/components/pages/ToolsPage";
import { generatePageMetadata } from "@/utils/i18n";

function Tools({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ToolsPage />;
}

async function legacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generatePageMetadata(locale, "tools", "/tools");
}

export default async function MigratedPage(props: Parameters<typeof Tools>[0]) {
  const resolved = await props.params;
  const route = `/tools`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <Tools {...props} />;
}

export async function generateMetadata(props: Parameters<typeof legacyMetadata>[0]) {
  const resolved = await props.params;
  const route = `/tools`;
  if (hasRedesignPage(route)) return redesignMetadata(route,resolved.locale);
  return legacyMetadata(props);
}
