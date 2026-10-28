import RedesignPage, { hasRedesignPage, redesignMetadata } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import CompanyPage from "@/components/pages/CompanyPage";
import { localizedUrl, pageAlternates } from "@/utils/i18n";

const PATH = "/company";

function Company({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <CompanyPage />;
}

async function legacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  const title = t("about.title");
  const description = t("about.description");
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

export default async function MigratedPage(props: Parameters<typeof Company>[0]) {
  const resolved = await props.params;
  const route = `/about`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <Company {...props} />;
}

export async function generateMetadata(props: Parameters<typeof legacyMetadata>[0]) {
  const resolved = await props.params;
  const route = `/about`;
  if (hasRedesignPage(route)) return redesignMetadata(route,resolved.locale);
  return legacyMetadata(props);
}
