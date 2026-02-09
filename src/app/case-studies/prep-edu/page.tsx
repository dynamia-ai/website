import type { Metadata } from 'next';
import CasePrepEduHami from '@/components/case-studies/CasePrepEduHami';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.prepEduHami?.title || 'PREP EDU × HAMi Case Study';
const description = enTranslation.cases?.prepEduHami?.subtitle || '';

export const metadata: Metadata = {
  title: `Case Study | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `Case Study | ${title} | Dynamia AI`,
    description,
    url: '/case-studies/prep-edu',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/prep-edu',
    languages: {
      en: 'https://dynamia.ai/case-studies/prep-edu',
      zh: 'https://dynamia.ai/zh/case-studies/prep-edu',
    },
  },
};

export default function CasePrepEduHamiPage() {
  return <CasePrepEduHami />;
}
