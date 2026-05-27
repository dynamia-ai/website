import { notFound } from "next/navigation";
import { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getBlogPost,
  getBlogPostSlugs,
  getPostSocialImage,
  markdownToHtml,
} from "@/lib/blog-server";
import BlogPostClient from "./BlogPostClient";
import { articleSchema, JsonLd } from "@/components/StructuredData";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blogUI" });

  const lang = locale as "en" | "zh";
  const post =
    getBlogPost(slug, lang) ||
    getBlogPost(slug, lang === "en" ? "zh" : "en");

  if (!post) {
    return { title: t("notFound") };
  }

  const socialImage = getPostSocialImage(post);
  const title = t("titleTemplate", { title: post.title });

  return {
    title,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: socialImage
        ? [{ url: socialImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: socialImage ? [socialImage] : undefined,
    },
    alternates: {
      canonical: `https://dynamia.ai/${locale === "zh" ? "zh/" : ""}blog/${slug}`,
      languages: {
        en: `https://dynamia.ai/blog/${slug}`,
        zh: `https://dynamia.ai/zh/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const enPost = getBlogPost(slug, "en");
  const zhPost = getBlogPost(slug, "zh");

  if (!enPost && !zhPost) {
    notFound();
  }

  const enResult = enPost ? await markdownToHtml(enPost.content, "en") : null;
  const zhResult = zhPost ? await markdownToHtml(zhPost.content, "zh") : null;

  const primaryPost = enPost || zhPost;
  const articleJsonLd = primaryPost
    ? articleSchema({
        title: primaryPost.title,
        description: primaryPost.excerpt,
        publishDate: primaryPost.date,
        url: `/blog/${slug}`,
        author: primaryPost.author,
        image: primaryPost.coverImage,
        keywords: primaryPost.tags,
      })
    : null;

  return (
    <>
      {articleJsonLd && <JsonLd data={articleJsonLd} />}
      <BlogPostClient
        enPost={
          enPost && enResult
            ? { ...enPost, content: enResult.html, toc: enResult.toc }
            : null
        }
        zhPost={
          zhPost && zhResult
            ? { ...zhPost, content: zhResult.html, toc: zhResult.toc }
            : null
        }
      />
    </>
  );
}
