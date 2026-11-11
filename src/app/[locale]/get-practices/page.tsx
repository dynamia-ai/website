import {setRequestLocale} from 'next-intl/server';
import GetPracticesPage from '@/components/pages/GetPracticesPage';
import {siteMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return siteMetadata('/get-practices', locale);
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <GetPracticesPage />
    </MainLayout>
  );
}
