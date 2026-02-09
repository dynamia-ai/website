import type { Metadata } from 'next';
import CaseKeHoldings from '@/components/case-studies/CaseKeHoldings';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.keHoldings?.title || 'Ke Holdings Case Study';
const description = enTranslation.cases?.keHoldings?.subtitle || '';

export const metadata: Metadata = {
  title: `Case Study | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `Case Study | ${title} | Dynamia AI`,
    description,
    url: '/case-studies/ke-holdings',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/ke-holdings',
    languages: {
      en: 'https://dynamia.ai/case-studies/ke-holdings',
      zh: 'https://dynamia.ai/zh/case-studies/ke-holdings',
    },
  },
};

export default function CaseKeHoldingsPage() {
  return <CaseKeHoldings />;
}
