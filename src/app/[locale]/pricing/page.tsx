import {setRequestLocale} from 'next-intl/server';
import PricingPage from '@/components/pages/PricingPage';
import {siteMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return siteMetadata('/pricing', locale);
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <PricingPage />
    </MainLayout>
  );
}
