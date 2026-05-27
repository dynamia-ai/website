"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type SeoPage = "home" | "products" | "pricing" | "company" | "solutions" | "resources" | "whatIsHami";

interface SEOHeadProps {
  page: SeoPage;
  path?: string;
}

export default function SEOHead({ page }: SEOHeadProps) {
  const t = useTranslations("Seo");

  const title = t(`${page}.title`);
  const description = t(`${page}.description`);

  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);
  }, [title, description]);

  return null;
}
