import {setRequestLocale} from 'next-intl/server';
import FaqPage from '@/components/pages/FaqPage';
import MainLayout from '@/components/layout/MainLayout';
import {siteMetadata} from '@/lib/site/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return siteMetadata('/faq', locale);
}

export default async function FAQ({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <MainLayout>
      <FaqPage />
    </MainLayout>
  );
}
