import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {EVENT_ARTICLE_SLUGS, EVENT_ARTICLE_SLUG_SET} from '@/lib/event-article-slugs';
import {contentLocaleCandidates} from '@/lib/site/localeFallback';

export interface EventArticle {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

const CONTENT_PATH = path.join(process.cwd(), 'src/content/events');

export function getEventArticleSlugs(): string[] {
  return [...EVENT_ARTICLE_SLUGS];
}

export function getEventArticle(slug: string, locale: string): EventArticle | null {
  if (!EVENT_ARTICLE_SLUG_SET.has(slug)) return null;
  for (const language of contentLocaleCandidates(locale)) {
    const file = path.join(CONTENT_PATH, slug, `${language}.md`);
    if (!fs.existsSync(file)) continue;
    const {data, content} = matter(fs.readFileSync(file, 'utf8'));
    return {
      slug,
      title: String(data.title || ''),
      date: String(data.date || ''),
      excerpt: String(data.excerpt || ''),
      content,
    };
  }
  return null;
}
