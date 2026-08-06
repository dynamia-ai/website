import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import FreeTrialPage from "@/components/pages/FreeTrialPage";
import { localizedUrl, pageAlternates } from "@/utils/i18n";

const PATH = "/apply-trial";

export default function ApplyTrial({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <FreeTrialPage />;
}

export async function generateMetadata({
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
