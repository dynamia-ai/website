import type { Metadata } from 'next';
import CaseSfTechnologyEffectiveGpu from '@/components/case-studies/CaseSfTechnologyEffectiveGpu';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.sfTechnologyEffectiveGpu?.title || 'SF Technology EffectiveGPU Case Study';
const description = enTranslation.cases?.sfTechnologyEffectiveGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/case-studies/case-sf-technology-effective-gpu',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/case-sf-technology-effective-gpu',
    languages: {
      en: 'https://dynamia.ai/case-studies/case-sf-technology-effective-gpu',
      zh: 'https://dynamia.ai/zh/case-studies/case-sf-technology-effective-gpu',
    },
  },
};

export default function CaseSfTechnologyEffectiveGpuPage() {
  return <CaseSfTechnologyEffectiveGpu />;
}
