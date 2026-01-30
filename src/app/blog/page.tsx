import { getAllBlogPosts } from '@/lib/blog-server';
import BlogListClient from './BlogListClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Dynamia AI | Heterogeneous Computing Insights',
  description: 'Explore the latest insights on GPU virtualization, heterogeneous computing, AI infrastructure, and HAMi updates. Stay informed with expert technical articles and case studies.',
  keywords: 'dynamia ai blog, GPU virtualization blog, heterogeneous computing articles, HAMi updates, AI infrastructure insights',
  openGraph: {
    title: 'Blog - Dynamia AI | Heterogeneous Computing Insights',
    description: 'Explore the latest insights on GPU virtualization, heterogeneous computing, AI infrastructure, and HAMi updates.',
    url: '/blog',
    siteName: 'Dynamia AI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dynamia.ai/blog',
    languages: {
      'en': 'https://dynamia.ai/blog',
      'zh': 'https://dynamia.ai/zh/blog',
    },
  },
};

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
      categories={enResult.categories} // 传递分类列表（两种语言的分类相同）
    />
  );
}
