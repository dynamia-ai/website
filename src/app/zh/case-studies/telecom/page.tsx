import type { Metadata } from 'next';
import CaseTelecomGpu from '@/components/case-studies/CaseTelecomGpu';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.telecomGpu?.title || '电信运营商 GPU 案例';
const description = zhTranslation.cases?.telecomGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `客户案例｜${title} | 密瓜智能`,
  description,
  openGraph: {
    title: `客户案例｜${title} | 密瓜智能`,
    description,
    url: '/zh/case-studies/telecom',
    siteName: '密瓜智能',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/telecom',
    languages: {
      en: 'https://dynamia.ai/case-studies/telecom',
      zh: 'https://dynamia.ai/zh/case-studies/telecom',
    },
  },
};

export default function ZhCaseTelecomGpuPage() {
  return (
    <CaseStudyZhWrapper>
      <CaseTelecomGpu />
    </CaseStudyZhWrapper>
  );
}
