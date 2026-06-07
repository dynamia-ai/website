import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import PricingPage from "@/components/pages/PricingPage";

export default function Pricing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <PricingPage />;
}
