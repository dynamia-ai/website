import RedesignPage, { hasRedesignPage } from '@/redesign/RedesignPage';
import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import PricingPage from "@/components/pages/PricingPage";

function Pricing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <PricingPage />;
}

export default async function MigratedPage(props: Parameters<typeof Pricing>[0]) {
  const resolved = await props.params;
  const route = `/pricing`;
  if (hasRedesignPage(route)) return <RedesignPage route={route} locale={resolved.locale} />;
  return <Pricing {...props} />;
}
