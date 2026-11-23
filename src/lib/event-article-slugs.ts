/**
 * Canonical slugs for /events/<slug> detail pages.
 * When adding an event article, update this list once.
 */
export const EVENT_ARTICLE_SLUGS = [
  "hami-incubating-community-night",
  "hami-meetup-shanghai-2026",
  "hami-at-kubecon-india-2026",
  "hami-2.9-webinar-recap",
  "hami-meetup-shenzhen-recap",
  "kubecon-eu-2026-hami-recap",
  "dynamia-and-hami-at-kubecon-eu-2026",
  "hami-meetup-beijing-recap",
  "hami-meetup-shanghai",
] as const;

export type EventArticleSlug = (typeof EVENT_ARTICLE_SLUGS)[number];

export const EVENT_ARTICLE_SLUG_SET = new Set<string>(EVENT_ARTICLE_SLUGS);
