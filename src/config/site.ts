import enDict from "../../dictionary/en.json";
import zhDict from "../../dictionary/zh.json";
import deDict from "../../dictionary/de.json";

export type Locale = "en" | "zh" | "de";

export interface SiteLocaleConfig {
  name: string;
  alternateName: string;
  tagline: string;
  description: string;
  keywords: string;
  logo: string;
  logoDark: string;
  ogImage: string;
  url: string;
}

function dictToConfig(dict: { Site: { name: string; alternateName: string; tagline: string; description: string; keywords: string; logo: string; logoDark: string; ogImage: string; url: string } }): SiteLocaleConfig {
  const s = dict.Site;
  return {
    name: s.name,
    alternateName: s.alternateName,
    tagline: s.tagline,
    description: s.description,
    keywords: s.keywords,
    logo: s.logo,
    logoDark: s.logoDark,
    ogImage: s.ogImage,
    url: s.url,
  };
}

const siteConfig: Record<Locale, SiteLocaleConfig> = {
  en: dictToConfig(enDict),
  zh: dictToConfig(zhDict),
  de: dictToConfig(deDict),
};

export function getSiteConfig(locale: Locale): SiteLocaleConfig {
  return siteConfig[locale] || siteConfig.en;
}

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "zh", "de"];
