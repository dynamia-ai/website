import type { Metadata } from 'next';
import CaseSfTechnologyEffectiveGpu from '@/components/case-studies/CaseSfTechnologyEffectiveGpu';
import CaseStudyZhWrapper from '@/components/case-studies/CaseStudyZhWrapper';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.sfTechnologyEffectiveGpu?.title || '顺丰科技 EffectiveGPU 案例';
const description = zhTranslation.cases?.sfTechnologyEffectiveGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `客户案例｜${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `客户案例｜${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/sf-technology',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/sf-technology',
    languages: {
      en: 'https://dynamia.ai/case-studies/sf-technology',
      zh: 'https://dynamia.ai/zh/case-studies/sf-technology',
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
