import { use } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import HamiRoiCalculator from '@/components/tools/HamiRoiCalculator';
import { localizedUrl, pageAlternates } from '@/utils/i18n';

const PATH = '/tools/hami-roi-calculator';

export default function HamiRoiCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <HamiRoiCalculator key={locale} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools' });
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
