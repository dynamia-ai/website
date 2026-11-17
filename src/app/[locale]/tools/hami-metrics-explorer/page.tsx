import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import HamiMetricsExplorer from '@/components/tools/HamiMetricsExplorer';
import MainLayout from '@/components/layout/MainLayout';
import {localizedUrl, pageAlternates} from '@/utils/i18n';

const PATH = '/tools/hami-metrics-explorer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'tools'});
  const title = t('hamiMetricsExplorer.title');
  const description = t('hamiMetricsExplorer.description');
  const url = localizedUrl(PATH, locale);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    alternates: pageAlternates(PATH, locale),
  };
}

export default async function HamiMetricsExplorerPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <MainLayout>
      <HamiMetricsExplorer />
    </MainLayout>
  );
}