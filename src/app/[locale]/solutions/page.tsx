import {setRequestLocale} from 'next-intl/server';
import SolutionsPage from '@/components/pages/SolutionsPage';
import {siteMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return siteMetadata('/solutions', locale);
}

export default async function Solutions({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <SolutionsPage />
    </MainLayout>
  );
}
