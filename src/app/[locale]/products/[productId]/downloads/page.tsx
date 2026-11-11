import DownloadsPage from '@/components/pages/DownloadsPage';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import MainLayout from '@/components/layout/MainLayout';

interface Props {
  params: Promise<{locale: string; productId: string}>;
}

export async function generateMetadata({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'productDownloads'});
  return {title: t('title')};
}

export default async function Page({params}: Props) {
  const {locale, productId} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <DownloadsPage productId={productId} />
    </MainLayout>
  );
}
