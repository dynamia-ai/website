import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import ProductsPage from "@/components/pages/ProductsPage";

export default function Products({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ProductsPage />;
}
