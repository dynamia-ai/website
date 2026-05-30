import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import { attachmentMarkdownToHtml } from '@/lib/blog-server';
import type { TocItem } from '@/types/blog';
import { getProductIds } from '@/lib/enterprise';

const ATTACHMENTS_PATH = path.join(process.cwd(), 'src/content/attachments');
const VALID_PRODUCT_IDS = new Set(getProductIds());

export interface AttachmentFrontmatter {
  title: string;
  slug: string;
  description: string;
  productId: string;
  lastUpdated?: string;
  language?: string;
}

export interface AttachmentDoc {
  frontmatter: AttachmentFrontmatter;
  html: string;
  toc: TocItem[];
  raw: string;
}

function resolveAttachmentPath(slug: string, locale: string): string | null {
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
  async (slug: string, locale = 'en'): Promise<AttachmentDoc | null> => {
    const filePath = resolveAttachmentPath(slug, locale);
    if (!filePath) return null;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const fm = data as Partial<AttachmentFrontmatter>;
    const productId = VALID_PRODUCT_IDS.has(fm.productId ?? '') ? fm.productId! : getProductIds()[0];

    const { html, toc } = await attachmentMarkdownToHtml(content);

    return {
      frontmatter: {
        title: fm.title ?? slug,
        slug: fm.slug ?? slug,
        description: fm.description ?? '',
        productId,
        lastUpdated: fm.lastUpdated,
        language: fm.language,
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
    .map((file) => file.replace(/\.md$/, '').replace(/\.[a-z]{2}$/, ''))
    .filter((slug, index, arr) => arr.indexOf(slug) === index)
    .sort();
}
