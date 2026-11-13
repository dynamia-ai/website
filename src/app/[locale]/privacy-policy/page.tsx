import {setRequestLocale} from 'next-intl/server';
import PrivacyPolicyPage from '@/components/pages/PrivacyPolicyPage';
import MainLayout from '@/components/layout/MainLayout';
import {siteMetadata} from '@/lib/site/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  return siteMetadata('/privacy-policy', locale);
}

export default async function PrivacyPolicy({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <PrivacyPolicyPage />
    </MainLayout>
  );
}
