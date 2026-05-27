import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import HomeIndex from "@/components/pages/HomeIndex";
import SEOHead from "@/components/SEOHead";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <SEOHead page="home" path="/" />
      <HomeIndex />
    </>
  );
}
