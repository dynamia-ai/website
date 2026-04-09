import type { Metadata } from 'next';
import CaseNio from '@/components/case-studies/CaseNio';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.nio?.title || '蔚来汽车案例研究';
const description = zhTranslation.cases?.nio?.subtitle || '';

export const metadata: Metadata = {
  title: `案例研究 | ${title} | 密瓜智能`,
  description,
  openGraph: {
    title: `案例研究 | ${title} | 密瓜智能`,
    description,
    url: '/zh/case-studies/nio',
    siteName: '密瓜智能',
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
