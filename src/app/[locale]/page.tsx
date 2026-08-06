import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import HomeIndex from "@/components/pages/HomeIndex";
import { generatePageMetadata } from "@/utils/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generatePageMetadata(locale, "home", "/");
}

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <HomeIndex />;
}
