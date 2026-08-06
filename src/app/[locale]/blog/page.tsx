import { setRequestLocale } from "next-intl/server";
import { getAllBlogPosts } from "@/lib/blog-server";
import { generatePageMetadata, localizedAlternates, localizedUrl } from "@/utils/i18n";
import { routing } from "@/i18n/routing";
import { BLOG_LOCALES } from "@/lib/seo-routes";
import BlogListClient from "./BlogListClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const metadata = await generatePageMetadata(locale, "blog", "/blog");
  const hasLocalizedContent = BLOG_LOCALES.includes(
    locale as (typeof BLOG_LOCALES)[number]
  );
  const canonicalLocale = hasLocalizedContent
    ? locale
    : routing.defaultLocale;
  const canonicalUrl = localizedUrl("/blog", canonicalLocale);

  return {
    ...metadata,
    robots: hasLocalizedContent
      ? undefined
      : { index: false, follow: true },
    openGraph: {
      ...metadata.openGraph,
      url: canonicalUrl,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: localizedAlternates("/blog", BLOG_LOCALES),
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { tag } = await searchParams;
  setRequestLocale(locale);

  const enResult = getAllBlogPosts("en");
  const zhResult = getAllBlogPosts("zh");

  return (
    <BlogListClient
      enPosts={enResult.posts}
      zhPosts={zhResult.posts}
      enTags={enResult.tags}
      zhTags={zhResult.tags}
      categories={enResult.categories}
      selectedTag={tag}
    />
  );
}
