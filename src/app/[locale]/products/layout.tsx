import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { generatePageMetadata } from "@/utils/i18n";
import { productSchema, JsonLd } from "@/components/StructuredData";
import SEOHead from "@/components/SEOHead";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "products", "/products");
}

export default async function ProductsLayout({
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
      <SEOHead page="products" path="/products" />
      <JsonLd data={productSchema()} />
      {children}
    </>
  );
}
