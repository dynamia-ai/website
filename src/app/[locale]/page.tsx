import RedesignPage, { hasRedesignPage, redesignMetadata } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import HomeIndex from "@/components/pages/HomeIndex";
import { generatePageMetadata } from "@/utils/i18n";

async function legacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generatePageMetadata(locale, "home", "/");
}

function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <HomeIndex />;
}

export default async function MigratedPage(props: Parameters<typeof HomePage>[0]) {
  const resolved = await props.params;
  const route = `/`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <HomePage {...props} />;
}

export async function generateMetadata(props: Parameters<typeof legacyMetadata>[0]) {
  const resolved = await props.params;
  const route = `/`;
  if (hasRedesignPage(route)) return redesignMetadata(route,resolved.locale);
  return legacyMetadata(props);
}
