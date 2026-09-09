export const STATIC_INDEXABLE_PATHS = [
  "/",
  "/apply-trial",
  "/company",
  "/cookies-policy",
  "/faq",
  "/pricing",
  "/privacy-policy",
  "/products",
  "/resources",
  "/solutions",
  "/tools",
  "/tools/hami-metrics-explorer",
  "/tools/hami-roi-calculator",
  "/videos",
  "/what-is-hami",
] as const;

export const CASE_STUDY_SLUGS = [
  "cetc-cloud",
  "sf-technology",
  "prep-edu",
  "ke-holdings",
  "nio",
  "snow-corp",
  "china-merchants-bank",
  "daocloud",
  "telecom",
] as const;

/** Indexable case-study locales (de is served but noindex). */
export const CASE_STUDY_LOCALES = ["en", "zh"] as const;

export const BLOG_LOCALES = ["en", "zh"] as const;
