import RedesignPage, { hasRedesignPage, redesignMetadata } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { localizedUrl, localizedAlternates } from "@/utils/i18n";
import VideosPage from "@/components/pages/VideosPage";

function Videos({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <VideosPage />;
}

async function legacyMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videos" });
  const meta = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("pageTitle"),
    description: t("pageSubtitle"),
    openGraph: {
      title: t("pageTitle"),
      description: t("pageSubtitle"),
      url: localizedUrl("/videos", locale),
      siteName: meta("siteName"),
      type: "website",
    },
    alternates: {
      canonical: localizedUrl("/videos", locale),
      languages: localizedAlternates("/videos"),
    },
  };
}

export default async function MigratedPage(props: Parameters<typeof Videos>[0]) {
  const resolved = await props.params;
  const route = `/videos`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <Videos {...props} />;
}

export async function generateMetadata(props: Parameters<typeof legacyMetadata>[0]) {
  const resolved = await props.params;
  const route = `/videos`;
  if (hasRedesignPage(route)) return redesignMetadata(route,resolved.locale);
  return legacyMetadata(props);
}
