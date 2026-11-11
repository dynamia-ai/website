import {setRequestLocale} from 'next-intl/server';
import CaseDetailPage, {caseContentSlug} from '@/components/pages/CaseDetailPage';
import {getCaseSlugs} from '@/lib/site/caseContent';
import {siteCaseMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

interface PageProps {
  params: Promise<{locale: string; slug: string}>;
}

export function generateStaticParams() {
  const slugs = new Set(getCaseSlugs());
  if (slugs.has('ke-holdings-inc')) slugs.add('ke-holdings');
  return [...slugs].map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps) {
  const {locale, slug} = await params;
  return siteCaseMetadata(caseContentSlug(slug), locale);
}

export default async function Page({params}: PageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <CaseDetailPage slug={slug} />
    </MainLayout>
  );
}
