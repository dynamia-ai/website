import {setRequestLocale} from 'next-intl/server';
import EventArticlePage from '@/components/pages/EventArticlePage';
import {getEventArticleSlugs} from '@/lib/event-server';
import {siteEventMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

interface PageProps {
  params: Promise<{locale: string; slug: string}>;
}

export function generateStaticParams() {
  return getEventArticleSlugs().map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps) {
  const {locale, slug} = await params;
  return siteEventMetadata(slug, locale);
}

export default async function Page({params}: PageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  return <MainLayout><EventArticlePage slug={slug} /></MainLayout>;
}
