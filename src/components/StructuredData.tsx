import { jsonLdScriptProps } from "react-schemaorg";
import { getSiteConfig, type Locale } from "@/config/site";
import type {
  Organization,
  SoftwareApplication,
  Article,
  FAQPage,
  BreadcrumbList,
  Thing,
  WithContext,
} from "schema-dts";

export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return <script {...jsonLdScriptProps<WithContext<Thing>>(data)} />;
}

export function organizationSchema(locale: Locale = "en"): WithContext<Organization> {
  const cfg = getSiteConfig(locale);
  return {
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
}

export function productSchema(): WithContext<SoftwareApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Dynamia AI - Enterprise Heterogeneous Computing Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Linux, Kubernetes",
    description:
      "Enterprise-grade heterogeneous computing platform built on HAMi technology. Provides GPU sharing, auto-scaling, and unified management for AI, HPC, and Edge workloads.",
    offers: {
      "@type": "Offer",
      name: "Enterprise License",
      price: "Contact for Pricing",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://dynamia.ai/pricing",
    },
    author: {
      "@type": "Organization",
      name: "Dynamia AI",
      url: "https://dynamia.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "Dynamia AI",
      logo: {
        "@type": "ImageObject",
        url: "https://dynamia.ai/LOGO-small.svg",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "GPU Sharing and Virtualization",
      "Multi-cluster Management",
      "GPU Oversubscription",
      "Automatic Scaling",
      "Centralized Observability",
      "Advanced AI Scheduling",
      "NUMA-aware Scheduling",
      "Binpack and Spread Strategies",
    ],
    keywords:
      "GPU virtualization, heterogeneous computing, AI infrastructure, HAMi, Kubernetes, GPU sharing",
    url: "https://dynamia.ai/products",
  };
}

export function articleSchema(props: {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  url: string;
  author?: string;
  image?: string;
  keywords?: string[];
  locale?: Locale;
}): WithContext<Article> {
  const cfg = getSiteConfig(props.locale || "en");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    image: props.image || `${cfg.url}${cfg.ogImage}`,
    datePublished: props.publishDate,
    dateModified: props.modifiedDate || props.publishDate,
    author: {
      "@type": props.author?.includes(" ") ? "Person" : "Organization",
      name: props.author || cfg.name,
    },
    publisher: {
      "@type": "Organization",
      name: cfg.name,
      logo: {
        "@type": "ImageObject",
        url: `${cfg.url}${cfg.ogImage}`,
      },
    },
    keywords: props.keywords?.join(", "),
    url: `${cfg.url}${props.url}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${cfg.url}${props.url}`,
    },
  };
}

export function faqSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://dynamia.ai${item.url}`,
    })),
  };
}
