import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getAllBlogPosts } from "@/lib/blog-server";
import { generatePageMetadata, localizedAlternates, localizedPath, localizedUrl } from "@/utils/i18n";
import { routing } from "@/i18n/routing";
import { BLOG_LOCALES } from "@/lib/seo-routes";
import { blogListingPath, POSTS_PER_PAGE, resolveBlogPage } from "@/lib/blog-pagination";
import BlogListClient from "./BlogListClient";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string | string[]; category?: string | string[] }>;
}

async function getListing({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const hasLocalizedContent = BLOG_LOCALES.some((candidate) => candidate === locale);
  const contentLocale = hasLocalizedContent ? locale : routing.defaultLocale;
  const { posts, categories } = getAllBlogPosts(contentLocale);
  const category = typeof query.category === "string" && categories.includes(query.category)
    ? query.category : "";
  const filteredPosts = category ? posts.filter((post) => post.category === category) : posts;
  const page = resolveBlogPage(query.page, filteredPosts.length);
  return { locale, query, contentLocale, hasLocalizedContent, posts, categories, category, filteredPosts, page };
}

export async function generateMetadata(props: PageProps) {
  const { locale, contentLocale, hasLocalizedContent, category, filteredPosts, page } = await getListing(props);
  const metadata = await generatePageMetadata(locale, "blog", "/blog");
  const path = blogListingPath(page, category);
  const canonicalUrl = localizedUrl(path, contentLocale);
  const availableLocales = BLOG_LOCALES.filter((candidate) => {
    const posts = getAllBlogPosts(candidate).posts;
    return !category && posts.length > (page - 1) * POSTS_PER_PAGE;
  });

  return {
    ...metadata,
    robots: !hasLocalizedContent || category || !filteredPosts.length
      ? { index: false, follow: true } : undefined,
    openGraph: { ...metadata.openGraph, url: canonicalUrl },
    alternates: {
      canonical: canonicalUrl,
      languages: localizedAlternates(path, availableLocales),
    },
  };
}

export default async function BlogPage(props: PageProps) {
  const { locale, query, posts, categories, category, filteredPosts, page } = await getListing(props);
  setRequestLocale(locale);
  const normalizedPage = page > 1 ? String(page) : undefined;
  if ((query.page !== undefined && query.page !== normalizedPage) ||
      (query.category !== undefined && query.category !== category)) {
    redirect(localizedPath(blogListingPath(page, category), locale));
  }

  return (
    <BlogListClient
      posts={filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)}
      currentPage={page}
      totalPages={Math.ceil(filteredPosts.length / POSTS_PER_PAGE)}
      totalPosts={posts.length}
      categories={categories.map((name) => ({ name, count: posts.filter((post) => post.category === name).length }))}
      selectedCategory={category}
    />
  );
}
