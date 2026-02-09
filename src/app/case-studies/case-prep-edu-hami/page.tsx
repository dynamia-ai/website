import type { Metadata } from 'next';
import CasePrepEduHami from '@/components/case-studies/CasePrepEduHami';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.prepEduHami?.title || 'PREP EDU × HAMi Case Study';
const description = enTranslation.cases?.prepEduHami?.subtitle || '';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/case-studies/case-prep-edu-hami',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/case-prep-edu-hami',
    languages: {
      en: 'https://dynamia.ai/case-studies/case-prep-edu-hami',
      zh: 'https://dynamia.ai/zh/case-studies/case-prep-edu-hami',
    },
  },
};

export default function CasePrepEduHamiPage() {
  return <CasePrepEduHami />;
}
