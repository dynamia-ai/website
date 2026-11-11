import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import EnterprisePage from '@/components/pages/EnterprisePage';
import PlatformPage from '@/components/pages/PlatformPage';
import {siteMetadata} from '@/lib/site/metadata';
import {getProductIds} from '@/lib/enterprise';
import MainLayout from '@/components/layout/MainLayout';

interface PageProps {
  params: Promise<{locale: string; productId: string}>;
}

export function generateStaticParams() {
  return getProductIds().map((productId) => ({productId}));
}

export async function generateMetadata({params}: PageProps) {
  const {locale, productId} = await params;
  if (productId === 'hami-enterprise') return siteMetadata('/enterprise', locale);
  if (productId === 'hami-ai-platform') return siteMetadata('/platform', locale);
  notFound();
}

export default async function Page({params}: PageProps) {
  const {locale, productId} = await params;
  setRequestLocale(locale);
  if (productId === 'hami-enterprise') {
    return (
      <MainLayout>
        <EnterprisePage />
      </MainLayout>
    );
  }
  if (productId === 'hami-ai-platform') {
    return (
      <MainLayout>
        <PlatformPage />
      </MainLayout>
    );
  }
  notFound();
}
