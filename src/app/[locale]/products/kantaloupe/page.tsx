import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import KantaloupeProductPage from "@/components/pages/KantaloupeProductPage";

export default function KantaloupeProduct({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <KantaloupeProductPage />;
}
