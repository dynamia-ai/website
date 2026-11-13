import {getTranslations, setRequestLocale} from 'next-intl/server';
import GpuCatalogPage from '@/components/pages/GpuCatalogPage';
import {localizedAlternates, localizedUrl} from '@/utils/i18n';
import MainLayout from '@/components/layout/MainLayout';

interface Props {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'gpuCatalog'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: localizedUrl('/gpu-compatibility', locale),
      languages: localizedAlternates('/gpu-compatibility'),
    },
  };
}

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <GpuCatalogPage />
    </MainLayout>
  );
}
