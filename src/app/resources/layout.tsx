import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";

export const metadata: Metadata = pageMetadata.resources;

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
