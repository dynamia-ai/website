import { use } from "react";
import { setRequestLocale } from "next-intl/server";

export default function ResourcesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <>{children}</>;
}
