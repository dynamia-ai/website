import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { generatePageMetadata } from "@/utils/seo";
import SEOHead from "@/components/SEOHead";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "pricing", "/pricing");
}

export default async function PricingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SEOHead page="pricing" path="/pricing" />
      {children}
    </>
  );
}
