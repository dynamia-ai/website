import type { Metadata } from 'next';
import CaseDaoCloud from '@/components/case-studies/CaseDaoCloud';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.daoCloud?.title || 'DaoCloud Case Study';
const description = enTranslation.cases?.daoCloud?.subtitle || '';

export const metadata: Metadata = {
  title: `Case Study | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `Case Study | ${title} | Dynamia AI`,
    description,
    url: '/case-studies/daocloud',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/daocloud',
    languages: {
      en: 'https://dynamia.ai/case-studies/daocloud',
      zh: 'https://dynamia.ai/zh/case-studies/daocloud',
    },
  },
};

export default function CaseDaoCloudPage() {
  return <CaseDaoCloud />;
}
