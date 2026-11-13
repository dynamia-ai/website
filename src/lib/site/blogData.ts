import editorialData from '@/lib/site/blogEditorialData.json';

export type BlogCategoryId =
  | '全部'
  | '实践案例'
  | '技术博客'
  | '产品解读'
  | '公司新闻'
  | '版本发布'
  | '社区与动态';

export interface BlogPostSource {
  id: number;
  slug: string;
  date: string;
  category: BlogCategoryId | string;
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
  categoryId: string;
  title: string;
  coverTitle: string;
  desc: string;
  authorSearch: string;
}

export const CATEGORY_SUBTITLE_KEYS: Record<string, string> = {
  实践案例: 'coverSubtitles.practice',
  技术博客: 'coverSubtitles.tech',
  产品解读: 'coverSubtitles.product',
  公司新闻: 'coverSubtitles.company',
  版本发布: 'coverSubtitles.release',
  社区与动态: 'coverSubtitles.community',
};

const CATEGORY_FILTERS: BlogCategoryId[] = [
  '全部',
  '实践案例',
  '技术博客',
  '产品解读',
  '公司新闻',
  '版本发布',
  '社区与动态',
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

export function blogCategoryFilters(): BlogCategoryId[] {
  return CATEGORY_FILTERS;
}

export function localizedBlogPosts(locale: string): LocalizedBlogPost[] {
  const lang = locale === 'en' || locale === 'de' ? locale : 'zh';
  return data.posts.map((post) => {
    const localized =
      lang === 'zh' ? null : data.locales[post.slug]?.[lang] ?? null;
    const categoryId = post.category;
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
