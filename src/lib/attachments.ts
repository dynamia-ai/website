import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import { attachmentMarkdownToHtml } from '@/lib/blog-server';
import type { TocItem } from '@/types/blog';

const ATTACHMENTS_PATH = path.join(process.cwd(), 'src/content/attachments');

export interface AttachmentFrontmatter {
  title: string;
  slug: string;
  description: string;
  productId: 'hami-enterprise' | 'hami-ai-platform';
  lastUpdated?: string;
  language?: 'en' | 'zh';
}

export interface AttachmentDoc {
  frontmatter: AttachmentFrontmatter;
  html: string;
  toc: TocItem[];
  raw: string;
}

function resolveAttachmentPath(slug: string, locale: 'en' | 'zh'): string | null {
  const candidates = [
    path.join(ATTACHMENTS_PATH, `${slug}.${locale}.md`),
    path.join(ATTACHMENTS_PATH, `${slug}.md`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

export const getAttachmentDoc = cache(
  async (slug: string, locale: 'en' | 'zh' = 'en'): Promise<AttachmentDoc | null> => {
    const filePath = resolveAttachmentPath(slug, locale);
    if (!filePath) return null;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const fm = data as Partial<AttachmentFrontmatter>;
    const language = fm.language === 'zh' ? 'zh' : 'en';
    const { html, toc } = await attachmentMarkdownToHtml(content);

    return {
      frontmatter: {
        title: fm.title ?? slug,
        slug: fm.slug ?? slug,
        description: fm.description ?? '',
        productId: (fm.productId as AttachmentFrontmatter['productId']) ?? 'hami-enterprise',
        lastUpdated: fm.lastUpdated,
        language,
      },
      html,
      toc,
      raw: content,
    };
  },
);

export function getAttachmentSlugs(): string[] {
  if (!fs.existsSync(ATTACHMENTS_PATH)) return [];

  return fs
    .readdirSync(ATTACHMENTS_PATH)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, '').replace(/\.(en|zh)$/, ''))
    .filter((slug, index, arr) => arr.indexOf(slug) === index)
    .sort();
}
