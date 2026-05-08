import type { Metadata } from 'next';
import CaseSnowCorp from '@/components/case-studies/CaseSnowCorp';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.snowCorp?.title || 'SNOW Corp Case Study';
const description = enTranslation.cases?.snowCorp?.subtitle || '';

export const metadata: Metadata = {
  title: `Case Study | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `Case Study | ${title} | Dynamia AI`,
    description,
    url: '/case-studies/snow-corp',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/snow-corp',
    languages: {
      en: 'https://dynamia.ai/case-studies/snow-corp',
      zh: 'https://dynamia.ai/zh/case-studies/snow-corp',
    },
  },
};

export default function CaseSnowCorpPage() {
  return <CaseSnowCorp />;
}
