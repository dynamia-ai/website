import RedesignPage, { hasRedesignPage } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import ProductsPage from "@/components/pages/ProductsPage";

function Products({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ProductsPage />;
}

export default async function MigratedPage(props: Parameters<typeof Products>[0]) {
  const resolved = await props.params;
  const route = `/products`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <Products {...props} />;
}
