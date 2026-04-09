import type { Metadata } from 'next';
import CasePrepEduHami from '@/components/case-studies/CasePrepEduHami';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.prepEduHami?.title || 'PREP EDU × HAMi 案例';
const description = zhTranslation.cases?.prepEduHami?.subtitle || '';

export const metadata: Metadata = {
  title: `客户案例｜${title} | 密瓜智能`,
  description,
  openGraph: {
    title: `客户案例｜${title} | 密瓜智能`,
    description,
    url: '/zh/case-studies/prep-edu',
    siteName: '密瓜智能',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/prep-edu',
    languages: {
      en: 'https://dynamia.ai/case-studies/prep-edu',
      zh: 'https://dynamia.ai/zh/case-studies/prep-edu',
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
