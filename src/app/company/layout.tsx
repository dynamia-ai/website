import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";

export const metadata: Metadata = pageMetadata.company;

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
