import {setRequestLocale} from 'next-intl/server';
import CookiesPolicyPage from '@/components/pages/CookiesPolicyPage';
import MainLayout from '@/components/layout/MainLayout';
import {siteMetadata} from '@/lib/site/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return siteMetadata('/cookies-policy', locale);
}

export default async function CookiesPolicy({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <CookiesPolicyPage />
    </MainLayout>
  );
}
