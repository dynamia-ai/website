import type { Metadata } from 'next';
import CaseKeHoldings from '@/components/case-studies/CaseKeHoldings';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.keHoldings?.title || '贝壳 HAMi 案例研究';
const description = zhTranslation.cases?.keHoldings?.subtitle || '';

export const metadata: Metadata = {
  title: `案例研究 | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `案例研究 | ${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/ke-holdings',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/ke-holdings',
    languages: {
      en: 'https://dynamia.ai/case-studies/ke-holdings',
      zh: 'https://dynamia.ai/zh/case-studies/ke-holdings',
    },
  },
};

export default function CaseKeHoldingsZhPage() {
  return <CaseKeHoldings />;
}
