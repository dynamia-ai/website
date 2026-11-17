import {setRequestLocale} from 'next-intl/server';
import {BlogArticlePage, blogArticleSlugs} from '@/components/pages/BlogArticlePage';
import {siteBlogMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

interface PageProps {
  params: Promise<{locale: string; slug: string}>;
}

export function generateStaticParams() {
  return blogArticleSlugs().map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps) {
  const {locale, slug} = await params;
  return siteBlogMetadata(slug, locale);
}

export default async function Page({params}: PageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <BlogArticlePage slug={slug} />
    </MainLayout>
  );
}
