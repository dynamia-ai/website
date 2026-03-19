import type { Metadata } from 'next';
import CaseNio from '@/components/case-studies/CaseNio';
import enTranslation from '@/i18n/locales/en.json';

const title = enTranslation.cases?.nio?.title || 'NIO Case Study';
const description = enTranslation.cases?.nio?.subtitle || '';

export const metadata: Metadata = {
  title: `Case Study | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `Case Study | ${title} | Dynamia AI`,
    description,
    url: '/case-studies/nio',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/case-studies/nio',
    languages: {
      en: 'https://dynamia.ai/case-studies/nio',
      zh: 'https://dynamia.ai/zh/case-studies/nio',
    },
  },
};

export default function CaseNioPage() {
  return <CaseNio />;
}
