import { use } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import HamiRoiCalculator from '@/components/tools/HamiRoiCalculator';

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
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools' });

  return {
    title: t('hamiRoiCalculator.title'),
    description: t('hamiRoiCalculator.description'),
  };
}
