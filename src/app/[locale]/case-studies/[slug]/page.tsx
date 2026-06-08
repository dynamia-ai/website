import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localizedUrl, localizedAlternates } from '@/utils/i18n';
import CaseSfTechnologyEffectiveGpu from '@/components/case-studies/CaseSfTechnologyEffectiveGpu';
import CasePrepEduHami from '@/components/case-studies/CasePrepEduHami';
import CaseKeHoldings from '@/components/case-studies/CaseKeHoldings';
import CaseNio from '@/components/case-studies/CaseNio';
import CaseSnowCorp from '@/components/case-studies/CaseSnowCorp';
import CaseDaoCloud from '@/components/case-studies/CaseDaoCloud';
import CaseTelecomGpu from '@/components/case-studies/CaseTelecomGpu';

const CASE_STUDIES = {
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
  'nio': {
    component: CaseNio,
    i18nKey: 'nio',
  },
  'snow-corp': {
    component: CaseSnowCorp,
    i18nKey: 'snowCorp',
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
  const config = CASE_STUDIES[slug as keyof typeof CASE_STUDIES];
  if (!config) return { title: 'Case Study Not Found' };

  const t = await getTranslations({ locale, namespace: 'cases' });
  const title = t(`${config.i18nKey}.title`);
  const description = t(`${config.i18nKey}.subtitle`);
  const path = `/case-studies/${slug}`;

  return {
    title: `Case Study | ${title}`,
    description,
    openGraph: {
      title: `Case Study | ${title}`,
      description,
      url: localizedUrl(path, locale),
      siteName: 'Dynamia AI',
      type: 'article',
    },
    alternates: {
      canonical: localizedUrl(path, locale),
      languages: localizedAlternates(path),
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
