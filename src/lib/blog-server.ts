import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { cache } from 'react';
import {
  BlogEventsPageMeta,
  BlogPost,
  BlogPostMeta,
  BlogPostsResult,
  TocItem,
} from '@/types/blog';
import {
  resolveBlogCategoryId,
  type LocalizedBlogPost,
} from '@/lib/site/blogData';
import { contentLocaleCandidates } from '@/lib/site/localeFallback';
import rehypeImageCaptions from './rehype-image-captions';
import publicAssetPaths from '@/generated/public-asset-paths.json';
import { selectPostSocialImage } from './blog-social-image';

const HIDDEN_BLOG_SLUGS = new Set(['hello-world']);

function parseEventsPage(value: unknown): BlogEventsPageMeta | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  const itemKey = typeof raw.itemKey === 'string' ? raw.itemKey.trim() : '';
  const placeKey = typeof raw.placeKey === 'string' ? raw.placeKey.trim() : '';
  const ctaKey = typeof raw.ctaKey === 'string' ? raw.ctaKey.trim() : '';
  const image = typeof raw.image === 'string' ? raw.image.trim() : '';
  if (!itemKey || !placeKey || !ctaKey || !image) return undefined;

  const eventsPage: BlogEventsPageMeta = {itemKey, placeKey, ctaKey, image};
  if (raw.portrait === true) eventsPage.portrait = true;
  if (typeof raw.captionKey === 'string' && raw.captionKey.trim()) {
    eventsPage.captionKey = raw.captionKey.trim();
  }
  if (typeof raw.titleField === 'string' && raw.titleField.trim()) {
    eventsPage.titleField = raw.titleField.trim();
  }
  if (typeof raw.bodyField === 'string' && raw.bodyField.trim()) {
    eventsPage.bodyField = raw.bodyField.trim();
  }
  if (typeof raw.imageAltField === 'string' && raw.imageAltField.trim()) {
    eventsPage.imageAltField = raw.imageAltField.trim();
  }
  return eventsPage;
}

const CONTENT_PATH = path.join(process.cwd(), 'src/content/blog');
const PUBLIC_ASSETS = new Set(publicAssetPaths);

/** Wrap markdown tables so borders are not clipped by `.blog-content { overflow-x: hidden }`. */
function wrapTablesInHtml(html: string): string {
  return html.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
    if (table.includes('class="table-wrapper"')) return table;
    return `<div class="table-wrapper">${table}</div>`;
  });
}

export function getPostSocialImage(post: Pick<BlogPost, 'coverImage' | 'content'>): string | undefined {
  return selectPostSocialImage(post, PUBLIC_ASSETS);
}

// Get all blog post directories
export function getBlogPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_PATH)) {
    return [];
  }

  const slugs = fs.readdirSync(CONTENT_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  return slugs;
}

// Get blog post by slug and language
export function getBlogPost(slug: string, language = 'en'): BlogPost | null {
  try {
    const fullPath = path.join(CONTENT_PATH, slug, `${language}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '',
      linktitle: data.linktitle,
      date: data.date || '',
      excerpt: data.excerpt || '',
      author: data.author || '',
      tags: data.tags || [],
      category: data.category || 'Uncategorized',
      categoryId: data.categoryId,
      coverImage: data.coverImage,
      coverDisplay: data.coverDisplay,
      coverTitle: data.coverTitle,
      language: data.language || language,
      eventsPage: parseEventsPage(data.eventsPage),
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

// 仅获取博客文章元数据（不读取完整内容，优化列表页性能）
function getBlogPostMeta(slug: string, language = 'en'): BlogPostMeta | null {
  try {
    const fullPath = path.join(CONTENT_PATH, slug, `${language}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    // 读取文件内容（matter 需要读取整个文件来解析 frontmatter）
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents, {
      // 不提取 excerpt，只解析 frontmatter
      excerpt: false,
    });

    return {
      slug,
      title: data.title || '',
      linktitle: data.linktitle,
      date: data.date || '',
      excerpt: data.excerpt || '',
      author: data.author || '',
      tags: data.tags || [],
      category: data.category || 'Uncategorized',
      categoryId: data.categoryId,
      coverImage: data.coverImage,
      coverDisplay: data.coverDisplay,
      coverTitle: data.coverTitle,
      language: data.language || language,
      eventsPage: parseEventsPage(data.eventsPage),
    };
  } catch (error) {
    console.error(`Error reading blog post meta ${slug}:`, error);
    return null;
  }
}

export interface EventCatalogEntry {
  slug: string;
  date: string;
  eventsPage: BlogEventsPageMeta;
}

/** Posts opted into `/events` via frontmatter `eventsPage`. */
export const getEventCatalog = cache((locale: string): EventCatalogEntry[] => {
  const entries: EventCatalogEntry[] = [];
  for (const slug of getBlogPostSlugs()) {
    if (HIDDEN_BLOG_SLUGS.has(slug)) continue;
    const post = resolveBlogPostMeta(slug, locale);
    if (!post?.eventsPage) continue;
    entries.push({slug, date: post.date, eventsPage: post.eventsPage});
  }
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

function resolveBlogPostMeta(slug: string, locale: string): BlogPostMeta | null {
  for (const lang of contentLocaleCandidates(locale)) {
    const post = getBlogPostMeta(slug, lang);
    if (post) return post;
  }
  return null;
}

function toLocalizedBlogPost(post: BlogPostMeta): LocalizedBlogPost {
  const categoryId = resolveBlogCategoryId(post.categoryId, post.category);
  return {
    slug: post.slug,
    date: post.date,
    categoryId,
    title: post.title,
    coverTitle: post.coverTitle || post.linktitle || post.title,
    desc: post.excerpt || '',
    authorSearch: post.author || '',
  };
}

/** Blog listing / related-rail catalog derived from markdown (single source of truth). */
export const getBlogCatalog = cache((locale: string): LocalizedBlogPost[] => {
  const posts: LocalizedBlogPost[] = [];
  for (const slug of getBlogPostSlugs()) {
    if (HIDDEN_BLOG_SLUGS.has(slug)) continue;
    const post = resolveBlogPostMeta(slug, locale);
    if (post) posts.push(toLocalizedBlogPost(post));
  }
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 获取所有博客文章元数据和标签（使用缓存优化性能）
export const getAllBlogPosts = cache((language = 'en'): BlogPostsResult => {
  const slugs = getBlogPostSlugs();
  const posts: BlogPostMeta[] = [];
  const tags = new Set<string>();
  const categories = new Set<string>();

  for (const slug of slugs) {
    if (HIDDEN_BLOG_SLUGS.has(slug)) {
      continue;
    }

    const post = getBlogPostMeta(slug, language);
    if (post) {
      posts.push(post);
      // 同时收集标签
      post.tags.forEach(tag => tags.add(tag));
      // 收集分类
      categories.add(post.category);
    }
  }

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return {
    posts: sortedPosts,
    tags: Array.from(tags).sort(),
    categories: Array.from(categories).sort(),
  };
});

// 从 Markdown AST 中提取标题（h2-h6）
function extractTocFromAST(ast: any): TocItem[] {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  // 递归提取节点中的纯文本内容，处理加粗、斜体、链接等包装
  function extractText(node: any): string {
    if (!node) return '';

    if (node.type === 'text' || node.type === 'code') {
      return node.value || '';
    }

    if (
      node.type === 'strong' ||
      node.type === 'emphasis' ||
      node.type === 'link'
    ) {
      return (node.children || [])
        .map((child: any) => extractText(child))
        .join('');
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map((child: any) => extractText(child)).join('');
    }

    return '';
  }

  function traverse(node: any) {
    // 只提取 h2-h4 标题（h1 是文章标题）
    if (node.type === 'heading' && node.depth >= 2 && node.depth <= 3) {
      // 提取标题文本（包括加粗、斜体、链接中的文字）
      const text = extractText(node).trim();

      if (text) {
        // 生成 ID（与客户端逻辑保持一致）
        let id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');

        if (!id) {
          id = `heading-${toc.length}`;
        }

        // 确保 ID 唯一
        let uniqueId = id;
        let counter = 0;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        usedIds.add(uniqueId);

        toc.push({
          id: uniqueId,
          text,
          level: node.depth,
        });
      }
    }

    // 递归遍历子节点
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(ast);
  return toc;
}

// Convert markdown to HTML and extract TOC
export async function markdownToHtml(
  markdown: string,
  figureLabel = 'Figure {n}'
): Promise<{ html: string; toc: TocItem[] }> {
  // 先解析为 AST 以提取目录
  const ast = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .parse(markdown);

  // 提取目录
  const toc = extractTocFromAST(ast);

  // 转换为 HTML
  const htmlResult = await unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown
    .use(remarkBreaks) // Convert line breaks to <br>
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // Parse raw HTML in markdown
    .use(rehypeHighlight) // Syntax highlighting
    .use(rehypeImageCaptions, { figureLabel })
    .use(rehypeStringify)
    .process(markdown);

  let html = htmlResult.toString();

  // 为标题添加 ID（按顺序匹配）
  if (toc.length > 0) {
    // 按顺序处理每个 TOC 项
    toc.forEach((tocItem) => {
      // 匹配标题，支持包含 HTML 标签的内容
      const regex = new RegExp(
        `<h${tocItem.level}([^>]*)>([\\s\\S]*?)</h${tocItem.level}>`,
        'gi'
      );

      let found = false;
      html = html.replace(regex, (match, attrs, content) => {
        // 如果已经有 ID 或已经找到匹配项，跳过
        if (attrs.includes('id=') || found) {
          return match;
        }

        // 清理内容中的 HTML 标签，用于匹配
        const cleanContent = content.replace(/<[^>]*>/g, '').trim();
        const cleanText = tocItem.text.trim();

        // 如果内容匹配（完全匹配或包含主要部分），添加 ID
        if (cleanContent === cleanText ||
          (cleanText.length > 10 && cleanContent.includes(cleanText.substring(0, Math.min(20, cleanText.length))))) {
          found = true;
          return `<h${tocItem.level}${attrs} id="${tocItem.id}">${content}</h${tocItem.level}>`;
        }

        return match;
      });
    });
  }

  return {
    html: wrapTablesInHtml(html),
    toc,
  };
}

// Convert markdown to HTML without image captions (for attachments)
export async function attachmentMarkdownToHtml(
  markdown: string
): Promise<{ html: string; toc: TocItem[] }> {
  // 先解析为 AST 以提取目录
  const ast = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .parse(markdown);

  // 提取目录
  const toc = extractTocFromAST(ast);

  // 转换为 HTML (no image captions)
  const htmlResult = await unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown
    .use(remarkBreaks) // Convert line breaks to <br>
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // Parse raw HTML in markdown
    .use(rehypeHighlight) // Syntax highlighting
    // NOTE: no rehypeImageCaptions for attachments
    .use(rehypeStringify)
    .process(markdown);

  let html = htmlResult.toString();

  // 为标题添加 ID（按顺序匹配）
  if (toc.length > 0) {
    toc.forEach((tocItem) => {
      const regex = new RegExp(
        `<h${tocItem.level}([^>]*)>([\\s\\S]*?)</h${tocItem.level}>`,
        'gi'
      );
      
      let found = false;
      html = html.replace(regex, (match, attrs, content) => {
        if (attrs.includes('id=') || found) {
          return match;
        }

        const cleanContent = content.replace(/<[^>]*>/g, '').trim();
        const cleanText = tocItem.text.trim();
        
        if (cleanContent === cleanText || 
            (cleanText.length > 10 && cleanContent.includes(cleanText.substring(0, Math.min(20, cleanText.length))))) {
          found = true;
          return `<h${tocItem.level}${attrs} id="${tocItem.id}">${content}</h${tocItem.level}>`;
        }

        return match;
      });
    });
  }

  return {
    html: wrapTablesInHtml(html),
    toc,
  };
}

// Get posts by tag
export function getBlogPostsByTag(tag: string, language = 'en'): BlogPostMeta[] {
  const { posts } = getAllBlogPosts(language);
  return posts.filter(post =>
    post.tags.some(postTag =>
      postTag.toLowerCase() === tag.toLowerCase()
    )
  );
}

// Get posts by category
export function getBlogPostsByCategory(category: string, language = 'en'): BlogPostMeta[] {
  const { posts } = getAllBlogPosts(language);
  return posts.filter(post =>
    post.category.toLowerCase() === category.toLowerCase()
  );
}

// Format date for display
export function formatDate(dateString: string, locale = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
