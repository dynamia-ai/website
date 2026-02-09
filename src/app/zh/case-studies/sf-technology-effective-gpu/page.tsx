import type { Metadata } from 'next';
import CaseSfTechnologyEffectiveGpu from '@/components/case-studies/CaseSfTechnologyEffectiveGpu';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.sfTechnologyEffectiveGpu?.title || '顺丰科技 EffectiveGPU 案例';
const description = zhTranslation.cases?.sfTechnologyEffectiveGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/sf-technology-effective-gpu',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/sf-technology-effective-gpu',
    languages: {
      en: 'https://dynamia.ai/case-studies/sf-technology-effective-gpu',
      zh: 'https://dynamia.ai/zh/case-studies/sf-technology-effective-gpu',
    },
  },
};

export default function ZhCaseSfTechnologyEffectiveGpuPage() {
  return (
    <CaseStudyZhWrapper>
      <CaseSfTechnologyEffectiveGpu />
    </CaseStudyZhWrapper>
  );
}
