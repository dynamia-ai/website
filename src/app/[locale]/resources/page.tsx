import { setRequestLocale } from "next-intl/server";
import ResourcesPage from "@/components/pages/ResourcesPage";
import { generatePageMetadata, localizedPath } from "@/utils/i18n";
import { getAllBlogPosts } from "@/lib/blog-server";
import { BLOG_LOCALES } from "@/lib/seo-routes";
import { routing } from "@/i18n/routing";

export default async function Resources({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const contentLocale = BLOG_LOCALES.some((candidate) => candidate === locale) ? locale : routing.defaultLocale;
  const articles = getAllBlogPosts(contentLocale).posts.slice(0, 4).map((post) => ({
    title: post.title,
    category: post.category,
    date: post.date,
    excerpt: post.excerpt,
    link: localizedPath(`/blog/${post.slug}`, contentLocale),
  }));
  return <ResourcesPage articles={articles} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generatePageMetadata(locale, "resources", "/resources");
}
