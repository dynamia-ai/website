import { getAllBlogPosts } from '@/lib/blog-server';
import BlogListClient from '../../blog/BlogListClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '博客 - Dynamia AI | 异构计算洞察',
  description: '探索 GPU 虚拟化、异构计算、AI 基础设施和 HAMi 更新的最新见解。通过专家技术文章和案例研究保持信息更新。',
  keywords: 'dynamia ai 博客，GPU 虚拟化博客，异构计算文章，HAMi 更新，AI 基础设施洞察',
  openGraph: {
    title: '博客 - Dynamia AI | 异构计算洞察',
    description: '探索 GPU 虚拟化、异构计算、AI 基础设施和 HAMi 更新的最新见解。',
    url: '/zh/blog',
    siteName: 'Dynamia AI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/blog',
    languages: {
      'en': 'https://dynamia.ai/blog',
      'zh': 'https://dynamia.ai/zh/blog',
    },
  },
};

export default async function ZhBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag } = await searchParams;

  // 获取两种语言的博客文章和标签（一次调用，带缓存）
  const enResult = getAllBlogPosts('en');
  const zhResult = getAllBlogPosts('zh');

  return (
    <BlogListClient
      enPosts={enResult.posts}
      zhPosts={zhResult.posts}
      enTags={enResult.tags}
      zhTags={zhResult.tags}
      categories={enResult.categories} // 传递分类列表（两种语言的分类相同）
      selectedTag={tag}
    />
  );
} 