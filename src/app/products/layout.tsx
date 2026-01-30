import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import { productSchema } from "@/components/StructuredData";

export const metadata: Metadata = pageMetadata.products;

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      {children}
    </>
  );
} 