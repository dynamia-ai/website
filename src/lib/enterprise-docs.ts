import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import { markdownToHtml } from '@/lib/blog-server';
import type { TocItem } from '@/types/blog';

const DOCS_PATH = path.join(process.cwd(), 'src/content/enterprise-install');

export interface InstallDocFrontmatter {
  title: string;
  productId: string;
  version?: string;
  lastUpdated?: string;
  description?: string;
}

export interface InstallDoc {
  frontmatter: InstallDocFrontmatter;
  html: string;
  toc: TocItem[];
  raw: string;
}

/**
 * Resolve the markdown source for a given product + locale.
 * Lookup order:
 *   1. `<productId>.<locale>.md`  — locale-specific (preferred)
 *   2. `<productId>.zh.md`        — zh fallback (docs were authored in zh first)
 *   3. `<productId>.md`           — legacy single-language file
 */
function resolveDocPath(productId: string, locale: string): string | null {
  const candidates = [
    path.join(DOCS_PATH, `${productId}.${locale}.md`),
    path.join(DOCS_PATH, `${productId}.zh.md`),
    path.join(DOCS_PATH, `${productId}.md`),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export const getInstallDoc = cache(
  async (productId: string, locale = 'en'): Promise<InstallDoc | null> => {
    const filePath = resolveDocPath(productId, locale);
    if (!filePath) return null;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const fm = data as Partial<InstallDocFrontmatter>;
    const { html, toc } = await markdownToHtml(content, locale);

    return {
      frontmatter: {
        title: fm.title ?? productId,
        productId: fm.productId ?? productId,
        version: fm.version,
        lastUpdated: fm.lastUpdated,
        description: fm.description,
      },
      html,
      toc,
      raw: content,
    };
  },
);

/**
 * Returns unique product slugs that have at least one install doc (any locale).
 */
export function getInstallDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_PATH)) return [];
  const set = new Set<string>();
  for (const f of fs.readdirSync(DOCS_PATH)) {
    if (!f.endsWith('.md')) continue;
    const base = f.replace(/\.md$/, '');
    const slug = base.replace(/\.[a-z]{2}$/, '');
    set.add(slug);
  }
  return Array.from(set);
}

/** True iff a doc (any locale) exists for the slug. Used by ProductHero gating. */
export function installDocExists(productId: string): boolean {
  return getInstallDocSlugs().includes(productId);
}
