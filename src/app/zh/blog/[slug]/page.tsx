import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogPost, getBlogPostSlugs, getPostSocialImage, markdownToHtml } from '@/lib/blog-server';
import BlogPostClient from '../../../blog/[slug]/BlogPostClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to get post in Chinese first, then English
  const post = getBlogPost(slug, 'zh') || getBlogPost(slug, 'en');
  
  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  const socialImage = getPostSocialImage(post);

  return {
    title: `${post.title} | Dynamia AI 博客`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: socialImage ? [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function ZhBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Try to get posts in both languages
  const enPost = getBlogPost(slug, 'en');
  const zhPost = getBlogPost(slug, 'zh');
  
  // If no posts found in either language, show 404
  if (!enPost && !zhPost) {
    notFound();
  }

  // Convert markdown to HTML and extract TOC for both languages if they exist
  const enResult = enPost ? await markdownToHtml(enPost.content, 'en') : null;
  const zhResult = zhPost ? await markdownToHtml(zhPost.content, 'zh') : null;

  return (
    <BlogPostClient 
      enPost={enPost && enResult ? { ...enPost, content: enResult.html, toc: enResult.toc } : null}
      zhPost={zhPost && zhResult ? { ...zhPost, content: zhResult.html, toc: zhResult.toc } : null}
    />
  );
} 
