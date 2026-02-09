import type { Metadata } from 'next';
import CaseTelecomGpu from '@/components/case-studies/CaseTelecomGpu';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.telecomGpu?.title || '电信运营商 GPU 案例';
const description = zhTranslation.cases?.telecomGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/case-telecom-gpu',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/case-telecom-gpu',
    languages: {
      en: 'https://dynamia.ai/case-studies/case-telecom-gpu',
      zh: 'https://dynamia.ai/zh/case-studies/case-telecom-gpu',
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
