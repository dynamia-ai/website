import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogPost, getBlogPostSlugs, markdownToHtml } from '@/lib/blog-server';
import BlogPostClient from './BlogPostClient';
import { articleSchema } from '@/components/StructuredData';

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

  // Try to get post in English first, then Chinese
  const post = getBlogPost(slug, 'en') || getBlogPost(slug, 'zh');

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Dynamia AI Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.coverImage ? [
        {
          url: post.coverImage,
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
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: {
      canonical: `https://dynamia.ai/blog/${slug}`,
      languages: {
        'en': `https://dynamia.ai/blog/${slug}`,
        'zh': `https://dynamia.ai/zh/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
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

  // Generate Article structured data for SEO (use English post as primary)
  const primaryPost = enPost || zhPost;
  const articleJsonLd = primaryPost ? articleSchema({
    title: primaryPost.title,
    description: primaryPost.excerpt,
    publishDate: primaryPost.date,
    url: `/blog/${slug}`,
    author: primaryPost.author,
    image: primaryPost.coverImage,
    keywords: primaryPost.tags,
  }) : null;

  return (
    <>
      {/* Article Structured Data */}
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd),
          }}
        />
      )}
      <BlogPostClient
        enPost={enPost && enResult ? { ...enPost, content: enResult.html, toc: enResult.toc } : null}
        zhPost={zhPost && zhResult ? { ...zhPost, content: zhResult.html, toc: zhResult.toc } : null}
      />
    </>
  );
} 