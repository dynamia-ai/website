import { getAllBlogPosts } from '@/lib/blog-server';
import BlogListClient from './BlogListClient';

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await searchParams;

  // 获取两种语言的博客文章
  const enResult = getAllBlogPosts('en');
  const zhResult = getAllBlogPosts('zh');

  return (
    <BlogListClient
      enPosts={enResult.posts}
      zhPosts={zhResult.posts}
    />
  );
}
