import type { Metadata } from 'next';
import CaseNio from '@/components/case-studies/CaseNio';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.nio?.title || '蔚来汽车案例研究';
const description = zhTranslation.cases?.nio?.subtitle || '';

export const metadata: Metadata = {
  title: `案例研究 | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `案例研究 | ${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/nio',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/nio',
    languages: {
      en: 'https://dynamia.ai/case-studies/nio',
      zh: 'https://dynamia.ai/zh/case-studies/nio',
    },
  },
};

export default function CaseNioZhPage() {
  return <CaseNio />;
}
