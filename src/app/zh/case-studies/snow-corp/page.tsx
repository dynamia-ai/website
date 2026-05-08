import type { Metadata } from 'next';
import CaseSnowCorp from '@/components/case-studies/CaseSnowCorp';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.snowCorp?.title || 'SNOW Corp 案例研究';
const description = zhTranslation.cases?.snowCorp?.subtitle || '';

export const metadata: Metadata = {
  title: `案例研究 | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `案例研究 | ${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/snow-corp',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/snow-corp',
    languages: {
      en: 'https://dynamia.ai/case-studies/snow-corp',
      zh: 'https://dynamia.ai/zh/case-studies/snow-corp',
    },
  },
};

export default function CaseSnowCorpPage() {
  return <CaseSnowCorp />;
}
