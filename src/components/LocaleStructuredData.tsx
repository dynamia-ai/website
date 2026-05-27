"use client";

import { useLocale } from "next-intl";
import { JsonLd } from "@/components/StructuredData";
import { getSiteConfig, type Locale } from "@/config/site";
import type { Organization, WebSite, WithContext } from "schema-dts";

export default function LocaleStructuredData() {
  const locale = useLocale();
  const cfg = getSiteConfig(locale as Locale);

  const orgSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: cfg.name,
    alternateName: cfg.alternateName,
    url: cfg.url,
    logo: `${cfg.url}${cfg.ogImage}`,
    description: cfg.description,
    foundingDate: "2023",
    sameAs: ["https://github.com/Project-HAMi/HAMi"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@dynamia.ai",
      contactType: "customer service",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "Global",
    },
  };

  const webSiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: cfg.name,
    alternateName: cfg.alternateName,
    url: cfg.url,
    description: cfg.description,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: cfg.name,
      alternateName: cfg.alternateName,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${cfg.url}/search?q={search_term_string}`,
    },
  };

  return (
    <>
      <JsonLd data={orgSchema} />
      <JsonLd data={webSiteSchema} />
    </>
  );
}
