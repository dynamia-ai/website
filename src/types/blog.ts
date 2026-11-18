// 目录项接口
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** Frontmatter block that opts a blog post into `/events`. */
export interface BlogEventsPageMeta {
  itemKey: string;
  placeKey: string;
  ctaKey: string;
  image: string;
  portrait?: boolean;
  /** Field under `sitePages.events.items.<itemKey>` for figcaption. */
  captionKey?: string;
  /** Field under item for title; default `title`. */
  titleField?: string;
  /** Field under item for body; default `body`. */
  bodyField?: string;
  /** Field under item for image alt; default `photoAlt`. */
  imageAltField?: string;
}

// Blog post interface
export interface BlogPost {
  slug: string;
  title: string;
  linktitle?: string; // 用于博客卡片显示的短标题
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  category: string; // legacy display/source label
  categoryId?: string; // stable filter id: practice|tech|product|company|release|community
  coverImage?: string;
  coverDisplay?: 'image' | 'text';
  coverTitle?: string; // 自定义封面标题，如果不设置则使用 title
  language: string;
  eventsPage?: BlogEventsPageMeta;
  content: string;
  toc?: TocItem[]; // 目录数据（服务器端生成）
}

// Blog post metadata (without content)
export interface BlogPostMeta {
  slug: string;
  title: string;
  linktitle?: string; // 用于博客卡片显示的短标题
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  category: string; // legacy display/source label
  categoryId?: string; // stable filter id: practice|tech|product|company|release|community
  coverImage?: string;
  coverDisplay?: 'image' | 'text';
  coverTitle?: string; // 自定义封面标题，如果不设置则使用 title
  language: string;
  eventsPage?: BlogEventsPageMeta;
}

// Blog posts result with tags
export interface BlogPostsResult {
  posts: BlogPostMeta[];
  tags: string[];
  categories: string[]; // 博客分类列表
}
