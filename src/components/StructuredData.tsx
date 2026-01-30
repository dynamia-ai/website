import React from 'react';

interface StructuredDataProps {
  data: object;
}

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
};

// Predefined structured data templates
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dynamia AI",
  "url": "https://dynamia.ai",
  "logo": "https://dynamia.ai/LOGO-small.svg",
  "description": "Enterprise-grade heterogeneous computing platform for AI, HPC, and Edge workloads",
  "foundingDate": "2023",
  "industry": "Software Technology",
  "numberOfEmployees": "10-50",
  "sameAs": [
    "https://github.com/Project-HAMi/HAMi"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@dynamia.ai",
    "contactType": "customer service"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "Global"
  }
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Dynamia AI Platform",
  "applicationCategory": "BusinessApplication",
  "description": "Enterprise-grade heterogeneous computing platform that enables GPU sharing, auto-scaling, and unified management for AI workloads",
  "operatingSystem": "Linux",
  "offers": {
    "@type": "Offer",
    "price": "Contact for pricing",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Dynamia AI"
  },
  "softwareVersion": "2.0",
  "releaseNotes": "Enhanced GPU virtualization and improved resource management"
};

export const blogPostingSchema = (title: string, description: string, publishDate: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "image": "https://dynamia.ai/LOGO-small.svg",
  "datePublished": publishDate,
  "dateModified": publishDate,
  "author": {
    "@type": "Organization",
    "name": "Dynamia AI"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Dynamia AI",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dynamia.ai/LOGO-small.svg"
    }
  },
  "url": `https://dynamia.ai${url}`,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://dynamia.ai${url}`
  }
});

export const faqSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Article schema for blog posts
export const articleSchema = (props: {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  url: string;
  author?: string;
  image?: string;
  keywords?: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": props.title,
  "description": props.description,
  "image": props.image || "https://dynamia.ai/LOGO-small.svg",
  "datePublished": props.publishDate,
  "dateModified": props.modifiedDate || props.publishDate,
  "author": {
    "@type": props.author?.includes(' ') ? 'Person' : 'Organization',
    "name": props.author || "Dynamia AI"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Dynamia AI",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dynamia.ai/LOGO-small.svg"
    }
  },
  "keywords": props.keywords?.join(', '),
  "url": `https://dynamia.ai${props.url}`,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://dynamia.ai${props.url}`
  }
});

// Breadcrumb schema
export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://dynamia.ai${item.url}`
  }))
});

// Product schema for Kantaloupe platform
export const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kantaloupe - Enterprise Heterogeneous Computing Platform",
  "applicationCategory": "BusinessApplication, DeveloperApplication",
  "operatingSystem": "Linux, Kubernetes",
  "description": "Enterprise-grade heterogeneous computing platform built on HAMi technology. Provides GPU sharing, auto-scaling, and unified management for AI, HPC, and Edge workloads.",
  "offers": {
    "@type": "Offer",
    "name": "Enterprise License",
    "price": "Contact for Pricing",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://dynamia.ai/pricing"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "50",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "Dynamia AI",
    "url": "https://dynamia.ai"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Dynamia AI",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dynamia.ai/LOGO-small.svg"
    }
  },
  "featureList": [
    "GPU Sharing and Virtualization",
    "Multi-cluster Management",
    "GPU Oversubscription",
    "Automatic Scaling",
    "Centralized Observability",
    "Advanced AI Scheduling",
    "NUMA-aware Scheduling",
    "Binpack and Spread Strategies"
  ],
  "keywords": "GPU virtualization, heterogeneous computing, AI infrastructure, HAMi, Kubernetes, GPU sharing, enterprise computing, auto-scaling",
  "url": "https://dynamia.ai/products"
};

export default StructuredData;
