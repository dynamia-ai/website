import type { Metadata } from 'next';
import CaseTelecomGpu from '@/components/case-studies/CaseTelecomGpu';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.telecomGpu?.title || 'Telecom Provider GPU Case Study';
const description = enTranslation.cases?.telecomGpu?.subtitle || '';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/case-studies/case-telecom-gpu',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/case-telecom-gpu',
    languages: {
      en: 'https://dynamia.ai/case-studies/case-telecom-gpu',
      zh: 'https://dynamia.ai/zh/case-studies/case-telecom-gpu',
    },
  },
};

export default function CaseTelecomGpuPage() {
  return <CaseTelecomGpu />;
}
