
import type { Metadata } from "next";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  locale?: string;
}

export const defaultSEO: SEOConfig = {
  title: "Dynamia AI（密瓜智能） - Unified Heterogeneous Computing",
  description: "Accelerate AI, HPC, and Edge workloads seamlessly. Enterprise-grade GPU virtualization and resource management platform by Dynamia AI（密瓜智能）.",
  keywords: "dynamia ai, 密瓜智能，heterogeneous computing, GPU virtualization, AI infrastructure, HAMi, GPU sharing, enterprise computing",
  image: "/LOGO-small.svg",
  type: "website",
  locale: "en_US",
};

export function generateMetadata(config: SEOConfig): Metadata {
  const title = config.title || defaultSEO.title;
  const description = config.description || defaultSEO.description;
  const keywords = config.keywords || defaultSEO.keywords;
  const image = config.image || defaultSEO.image;
  const url = config.url || "";
  const type = config.type || "website";
  const locale = config.locale || "en_US";

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://dynamia.ai${url}`,
      siteName: "Dynamia AI",
      type,
      locale,
      images: [
        {
          url: `https://dynamia.ai${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://dynamia.ai${image}`],
    },
    alternates: {
      canonical: `https://dynamia.ai${url}`,
      languages: {
        'en': `https://dynamia.ai${url}`,
        'zh': `https://dynamia.ai/zh${url}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Chinese language metadata
export const pageMetadataZh = {
  home: generateMetadata({
    title: "密瓜智能 - 统一异构计算平台",
    description: "密瓜智能无缝加速 AI、HPC 和边缘计算工作负载。企业级 GPU 虚拟化和资源管理平台，基于 CNCF 开源项目 HAMi 构建。",
    keywords: "密瓜智能，异构计算，GPU 虚拟化，GPU 共享，AI 基础设施，HAMi, 企业计算",
    url: "/zh",
    locale: "zh_CN",
  }),

  products: generateMetadata({
    title: "密瓜智能产品 - 企业级异构计算平台",
    description: "探索密瓜智能 - 基于 HAMi 技术构建的企业级异构计算平台。GPU 共享、自动扩展和 AI 工作负载统一管理。",
    keywords: "密瓜智能，异构计算，GPU 虚拟化，AI 基础设施，企业计算，HAMi",
    url: "/zh/products",
    locale: "zh_CN",
  }),

  pricing: generateMetadata({
    title: "定价 - 密瓜智能 | 灵活的计算解决方案",
    description: "获取密瓜智能异构计算平台的灵活定价。基于集群规模的定制化方案，专业支持和持续更新。",
    keywords: "密瓜智能，异构计算成本，GPU 虚拟化定价，企业 AI 基础设施",
    url: "/zh/pricing",
    locale: "zh_CN",
  }),
};

export const pageMetadata = {
  home: generateMetadata({
    title: "Dynamia AI（密瓜智能） - Unified Heterogeneous Computing",
    description: "Accelerate AI, HPC, and Edge workloads seamlessly. Enterprise-grade GPU virtualization and resource management platform by Dynamia AI.",
    keywords: "dynamia ai, 密瓜智能，heterogeneous computing, GPU virtualization, AI infrastructure, HAMi, GPU sharing, enterprise computing",
    url: "/",
  }),

  products: generateMetadata({
    title: "Dynamia AI Products - Enterprise Heterogeneous Computing Platform",
    description: "Discover Dynamia AI - enterprise-grade heterogeneous computing platform built on HAMi technology. GPU sharing, auto-scaling, and unified management for AI workloads.",
    keywords: "dynamia ai products, 密瓜智能，heterogeneous computing, GPU virtualization, AI infrastructure, enterprise computing, HAMi",
    url: "/products",
  }),

  pricing: generateMetadata({
    title: "Pricing - Dynamia AI | Flexible Computing Solutions",
    description: "Get flexible pricing for Dynamia AI heterogeneous computing platform. Customized plans based on your cluster size with professional support and continuous updates.",
    keywords: "dynamia ai pricing, 密瓜智能定价，heterogeneous computing cost, GPU virtualization pricing, enterprise AI infrastructure",
    url: "/pricing",
  }),

  company: generateMetadata({
    title: "About Dynamia AI（密瓜智能） - Leading Heterogeneous Computing Innovation",
    description: "Learn about Dynamia AI（密瓜智能）, creators of HAMi - the world's fastest-growing open-source heterogeneous AI computing virtualization middleware.",
    keywords: "dynamia ai company, 密瓜智能，about dynamia ai, heterogeneous computing innovation, HAMi creators",
    url: "/company",
  }),

  solutions: generateMetadata({
    title: "Solutions - Dynamia AI | AI, HPC & Edge Computing",
    description: "Powerful computing solutions for AI/ML, HPC, and Edge Computing challenges. Optimize your infrastructure with Dynamia AI's heterogeneous computing platform.",
    keywords: "AI solutions, HPC solutions, edge computing, heterogeneous computing solutions, dynamia ai, 密瓜智能",
    url: "/solutions",
  }),

  resources: generateMetadata({
    title: "Resources - Dynamia AI | Documentation, Blog & Whitepapers",
    description: "Explore technical documentation, blog articles, and whitepapers to learn more about Dynamia AI and heterogeneous computing best practices.",
    keywords: "dynamia ai documentation, 密瓜智能，heterogeneous computing resources, AI infrastructure guides, HAMi tutorials",
    url: "/resources",
  }),

  whatIsHami: generateMetadata({
    title: "What is HAMi? | Heterogeneous AI Computing Virtualization",
    description: "Learn about HAMi - leading open-source heterogeneous AI computing virtualization middleware by Dynamia AI（密瓜智能）. CNCF Sandbox project powering GPU sharing and resource management.",
    keywords: "HAMi, 密瓜智能，heterogeneous AI computing, GPU virtualization, CNCF sandbox, open source AI infrastructure",
    url: "/what-is-hami",
  }),
}; 
