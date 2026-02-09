import type { Metadata } from 'next';
import CaseDaoCloud from '@/components/case-studies/CaseDaoCloud';
import zhTranslation from '@/i18n/locales/zh.json';

const title = zhTranslation.cases?.daoCloud?.title || ' DaoCloud HAMi 案例研究';
const description = zhTranslation.cases?.daoCloud?.subtitle || '';

export const metadata: Metadata = {
  title: `案例研究 | ${title} | Dynamia AI`,
  description,
  openGraph: {
    title: `案例研究 | ${title} | Dynamia AI`,
    description,
    url: '/zh/case-studies/daocloud',
    siteName: 'Dynamia AI',
    type: 'article',
  },
  alternates: {
    canonical: 'https://dynamia.ai/zh/case-studies/daocloud',
    languages: {
      en: 'https://dynamia.ai/case-studies/daocloud',
      zh: 'https://dynamia.ai/zh/case-studies/daocloud',
    },
  },
};

export default function CaseDaoCloudZhPage() {
  return <CaseDaoCloud />;
}
