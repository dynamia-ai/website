import editorialData from '@/lib/site/blogEditorialData.json';

export type BlogCategoryId =
  | 'all'
  | 'practice'
  | 'tech'
  | 'product'
  | 'company'
  | 'release'
  | 'community';

export interface BlogPostSource {
  id: number;
  slug: string;
  date: string;
  category: string;
  originalCategory?: string;
  image?: string;
  title: string;
  coverTitle: string;
  desc: string;
  authorId?: string | null;
}

export interface LocalizedBlogPost {
  id: number;
  slug: string;
  date: string;
  category: string;
  categoryId: BlogCategoryId | string;
  title: string;
  coverTitle: string;
  desc: string;
  authorSearch: string;
}

/** Map legacy Chinese category labels in editorial data to stable IDs. */
const SOURCE_CATEGORY_TO_ID: Record<string, Exclude<BlogCategoryId, 'all'>> = {
  实践案例: 'practice',
  技术博客: 'tech',
  产品解读: 'product',
  公司新闻: 'company',
  版本发布: 'release',
  社区与动态: 'community',
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

const AUTHOR_SEARCH: Record<string, string> = {
  song_jingchao: '宋净超 Jimmy Song 云原生布道师 HAMi community manager',
};

type LocaleBundle = {
  title: string;
  coverTitle: string;
  desc: string;
  category: string;
};

const data = editorialData as {
  posts: BlogPostSource[];
  locales: Record<string, {en: LocaleBundle; de: LocaleBundle}>;
};

function toCategoryId(source: string): BlogCategoryId | string {
  return SOURCE_CATEGORY_TO_ID[source] ?? source;
}

export function blogCategoryFilters(): BlogCategoryId[] {
  return CATEGORY_FILTERS;
}

export function localizedBlogPosts(locale: string): LocalizedBlogPost[] {
  const lang = locale === 'en' || locale === 'de' ? locale : 'zh';
  return data.posts.map((post) => {
    const localized =
      lang === 'zh' ? null : data.locales[post.slug]?.[lang] ?? null;
    const categoryId = toCategoryId(post.category);
    return {
      id: post.id,
      slug: post.slug,
      date: post.date,
      categoryId,
      category: localized?.category ?? post.category,
      title: localized?.title ?? post.title,
      coverTitle: localized?.coverTitle ?? post.coverTitle,
      desc: localized?.desc ?? post.desc,
      authorSearch: post.authorId ? AUTHOR_SEARCH[post.authorId] || '' : '',
    };
  });
}

export function formatBlogDate(date: string): string {
  return date.replaceAll('-', '.');
}
