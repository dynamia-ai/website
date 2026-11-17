import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import HamiRoiCalculator from '@/components/tools/HamiRoiCalculator';
import MainLayout from '@/components/layout/MainLayout';
import {localizedUrl, pageAlternates} from '@/utils/i18n';

const PATH = '/tools/hami-roi-calculator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'tools'});
  const title = t('hamiRoiCalculator.title');
  const description = t('hamiRoiCalculator.description');
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

export default async function HamiRoiCalculatorPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <MainLayout>
      <HamiRoiCalculator key={locale} />
    </MainLayout>
  );
}
