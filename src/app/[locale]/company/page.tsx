import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import CompanyPage from "@/components/pages/CompanyPage";
import { localizedUrl, pageAlternates } from "@/utils/i18n";

const PATH = "/company";

export default function Company({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <CompanyPage />;
}

export async function generateMetadata({
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
