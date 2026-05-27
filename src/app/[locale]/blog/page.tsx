import { setRequestLocale } from "next-intl/server";
import { getAllBlogPosts } from "@/lib/blog-server";
import BlogListClient from "./BlogListClient";

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
