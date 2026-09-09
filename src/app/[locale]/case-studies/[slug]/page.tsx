import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localizedUrl, localizedAlternates } from '@/utils/i18n';
import { routing } from '@/i18n/routing';
import CaseSfTechnologyEffectiveGpu from '@/components/case-studies/CaseSfTechnologyEffectiveGpu';
import CasePrepEduHami from '@/components/case-studies/CasePrepEduHami';
import CaseKeHoldings from '@/components/case-studies/CaseKeHoldings';
import CaseNio from '@/components/case-studies/CaseNio';
import CaseSnowCorp from '@/components/case-studies/CaseSnowCorp';
import CaseDaoCloud from '@/components/case-studies/CaseDaoCloud';
import CaseTelecomGpu from '@/components/case-studies/CaseTelecomGpu';
import CaseCetcCloud from '@/components/case-studies/CaseCetcCloud';
import CaseChinaMerchantsBank from '@/components/case-studies/CaseChinaMerchantsBank';
import { CASE_STUDY_LOCALES } from '@/lib/seo-routes';

const CASE_STUDIES = {
  'cetc-cloud': {
    component: CaseCetcCloud,
    i18nKey: 'cetcCloud',
  },
  'sf-technology': {
    component: CaseSfTechnologyEffectiveGpu,
    i18nKey: 'sfTechnologyEffectiveGpu',
  },
  'prep-edu': {
    component: CasePrepEduHami,
    i18nKey: 'prepEduHami',
  },
  'ke-holdings': {
    component: CaseKeHoldings,
    i18nKey: 'keHoldings',
  },
  nio: {
    component: CaseNio,
    i18nKey: 'nio',
  },
  'snow-corp': {
    component: CaseSnowCorp,
    i18nKey: 'snowCorp',
  },
  'china-merchants-bank': {
    component: CaseChinaMerchantsBank,
    i18nKey: 'chinaMerchantsBank',
  },
  daocloud: {
    component: CaseDaoCloud,
    i18nKey: 'daoCloud',
  },
  telecom: {
    component: CaseTelecomGpu,
    i18nKey: 'telecomGpu',
  },
} as const;

const SLUGS = Object.keys(CASE_STUDIES);

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tPage = await getTranslations({ locale, namespace: 'caseStudiesPage' });
  const mt = await getTranslations({ locale, namespace: 'Metadata' });
  const config = CASE_STUDIES[slug as keyof typeof CASE_STUDIES];
  if (!config) return { title: tPage('notFound') };

  const t = await getTranslations({ locale, namespace: 'cases' });
  const title = `${tPage('h1Prefix')}${t(`${config.i18nKey}.title`)}`;
  const description = t(`${config.i18nKey}.subtitle`);
  const path = `/case-studies/${slug}`;
  const hasLocalizedContent = CASE_STUDY_LOCALES.some(
    (availableLocale) => availableLocale === locale
  );
  const canonicalLocale = hasLocalizedContent
    ? locale
    : routing.defaultLocale;
  const canonicalUrl = localizedUrl(path, canonicalLocale);

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: mt('siteName'),
      type: 'article',
    },
    robots: hasLocalizedContent
      ? undefined
      : { index: false, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: localizedAlternates(path, CASE_STUDY_LOCALES),
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const config = CASE_STUDIES[slug as keyof typeof CASE_STUDIES];
  if (!config) notFound();

  const CaseComponent = config.component;
  return <CaseComponent />;
}
