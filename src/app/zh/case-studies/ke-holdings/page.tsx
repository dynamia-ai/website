import type { Metadata } from 'next';
import CaseKeHoldings from '@/components/case-studies/CaseKeHoldings';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.keHoldings?.title || '贝壳 HAMi 案例研究';
const description = zhTranslation.cases?.keHoldings?.subtitle || '';

export const metadata: Metadata = {
  title: `案例研究 | ${title} | 密瓜智能`,
  description,
  openGraph: {
    title: `案例研究 | ${title} | 密瓜智能`,
    description,
    url: '/zh/case-studies/ke-holdings',
    siteName: '密瓜智能',
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
