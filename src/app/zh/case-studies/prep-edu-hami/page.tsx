import type { Metadata } from 'next';
import CasePrepEduHami from '@/components/case-studies/CasePrepEduHami';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.prepEduHami?.title || 'PREP EDU × HAMi 案例';
const description = zhTranslation.cases?.prepEduHami?.subtitle || '';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/prep-edu-hami',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/prep-edu-hami',
    languages: {
      en: 'https://dynamia.ai/case-studies/prep-edu-hami',
      zh: 'https://dynamia.ai/zh/case-studies/prep-edu-hami',
    },
  },
};

export default function ZhCasePrepEduHamiPage() {
  return (
    <CaseStudyZhWrapper>
      <CasePrepEduHami />
    </CaseStudyZhWrapper>
  );
}
