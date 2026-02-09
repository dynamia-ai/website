import type { Metadata } from 'next';
import CaseSfTechnologyEffectiveGpu from '@/components/case-studies/CaseSfTechnologyEffectiveGpu';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.sfTechnologyEffectiveGpu?.title || 'SF Technology EffectiveGPU Case Study';
const description = enTranslation.cases?.sfTechnologyEffectiveGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `Case Study | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `Case Study | ${title} | Dynamia AI`,
    description,
    url: '/case-studies/sf-technology',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/sf-technology',
    languages: {
      en: 'https://dynamia.ai/case-studies/sf-technology',
      zh: 'https://dynamia.ai/zh/case-studies/sf-technology',
    },
  },
};

export default function CaseSfTechnologyEffectiveGpuPage() {
  return <CaseSfTechnologyEffectiveGpu />;
}
