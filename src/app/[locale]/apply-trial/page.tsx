import RedesignPage, { hasRedesignPage, redesignMetadata } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import FreeTrialPage from "@/components/pages/FreeTrialPage";
import { localizedUrl, pageAlternates } from "@/utils/i18n";

const PATH = "/apply-trial";

function ApplyTrial({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <FreeTrialPage />;
}

async function legacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "freeTrial" });
  const title = t("title");
  const description = t("subtitle");
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

export default async function MigratedPage(props: Parameters<typeof ApplyTrial>[0]) {
  const resolved = await props.params;
  const route = `/contact-sales`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <ApplyTrial {...props} />;
}

export async function generateMetadata(props: Parameters<typeof legacyMetadata>[0]) {
  const resolved = await props.params;
  const route = `/contact-sales`;
  if (hasRedesignPage(route)) return redesignMetadata(route,resolved.locale);
  return legacyMetadata(props);
}
