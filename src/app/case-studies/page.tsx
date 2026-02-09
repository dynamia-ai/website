import type { Metadata } from 'next';
import CaseStudiesList from '@/components/case-studies/CaseStudiesList';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.caseStudiesPage?.title || 'Case Studies';
const description = enTranslation.caseStudiesPage?.subtitle || 'Customer stories and case studies.';

export const metadata: Metadata = {
  title: `${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `${title} | Dynamia AI`,
    description,
    url: '/case-studies',
    siteName: 'Dynamia AI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies',
    languages: {
      en: 'https://dynamia.ai/case-studies',
      zh: 'https://dynamia.ai/zh/case-studies',
    },
  },
};

export default function CaseStudiesPage() {
  return <CaseStudiesList />;
}
