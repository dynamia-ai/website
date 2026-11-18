export type BlogCategoryId =
  | 'all'
  | 'practice'
  | 'tech'
  | 'product'
  | 'company'
  | 'release'
  | 'community';

export interface LocalizedBlogPost {
  slug: string;
  date: string;
  categoryId: Exclude<BlogCategoryId, 'all'>;
  title: string;
  coverTitle: string;
  desc: string;
  authorSearch: string;
}

/**
 * Map frontmatter `category` → filter/cover IDs.
 * Optional frontmatter `categoryId` can override a specific post.
 */
const SOURCE_CATEGORY_TO_ID: Record<string, Exclude<BlogCategoryId, 'all'>> = {
  'Case Study': 'practice',
  'Customer Success Story': 'practice',
  'Technical Deep Dive': 'tech',
  'Open Source': 'tech',
  'Integration & Ecosystem': 'product',
  'Company News': 'company',
  Partnership: 'company',
  'Product Release': 'release',
  'Community & Events': 'community',
  Events: 'community',
  'Year in Review': 'community',
};

export const CATEGORY_SUBTITLE_KEYS: Record<string, string> = {
  practice: 'coverSubtitles.practice',
  tech: 'coverSubtitles.tech',
  product: 'coverSubtitles.product',
  company: 'coverSubtitles.company',
  release: 'coverSubtitles.release',
  community: 'coverSubtitles.community',
};

export const CATEGORY_LABEL_KEYS: Record<BlogCategoryId, string> = {
  all: 'categories.all',
  practice: 'categories.practice',
  tech: 'categories.tech',
  product: 'categories.product',
  company: 'categories.company',
  release: 'categories.release',
  community: 'categories.community',
};

const CATEGORY_FILTERS: BlogCategoryId[] = [
  'all',
  'practice',
  'tech',
  'product',
  'company',
  'release',
  'community',
];

const CATEGORY_IDS = new Set<string>(CATEGORY_FILTERS.filter((id) => id !== 'all'));

export function blogCategoryFilters(): BlogCategoryId[] {
  return CATEGORY_FILTERS;
}

export function isBlogCategoryId(value: string): value is Exclude<BlogCategoryId, 'all'> {
  return CATEGORY_IDS.has(value);
}

export function resolveBlogCategoryId(
  categoryId: string | undefined,
  category: string | undefined,
): Exclude<BlogCategoryId, 'all'> {
  if (categoryId && isBlogCategoryId(categoryId)) return categoryId;
  if (category && SOURCE_CATEGORY_TO_ID[category]) return SOURCE_CATEGORY_TO_ID[category];
  return 'tech';
}

export function formatBlogDate(date: string): string {
  return date.replaceAll('-', '.');
}
