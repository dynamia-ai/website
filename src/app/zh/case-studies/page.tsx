import type { Metadata } from 'next';
import CaseStudiesList from '@/components/case-studies/CaseStudiesList';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.caseStudiesPage?.title || '案例研究';
const description = zhTranslation.caseStudiesPage?.subtitle || '客户案例与实践故事。';

export const metadata: Metadata = {
  title: `${title} | 密瓜智能`,
  description,
  openGraph: {
    title: `${title} | 密瓜智能`,
    description,
    url: '/zh/case-studies',
    siteName: '密瓜智能',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies',
    languages: {
      en: 'https://dynamia.ai/case-studies',
      zh: 'https://dynamia.ai/zh/case-studies',
    },
  },
};

export default function ZhCaseStudiesPage() {
  return (
    <CaseStudyZhWrapper>
      <CaseStudiesList />
    </CaseStudyZhWrapper>
  );
}
