export const STATIC_INDEXABLE_PATHS = [
  "/gpu-compatibility",
  "/",
  "/apply-trial",
  "/company",
  "/events",
  "/cookies-policy",
  "/faq",
  "/pricing",
  "/privacy-policy",
  "/products",
  "/solutions",
  "/tools",
  "/tools/hami-metrics-explorer",
  "/tools/hami-roi-calculator",
  "/videos",
  "/what-is-hami",
] as const;

/** Indexable case-study locales (all three have dedicated content). */
export const CASE_STUDY_LOCALES = ["en", "zh", "de"] as const;

/** Indexable blog/event article locales (all three have dedicated content). */
export const BLOG_LOCALES = ["en", "zh", "de"] as const;
