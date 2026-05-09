import { Metadata } from 'next';
import EnterpriseListClient from '@/components/enterprise/EnterpriseListClient';

export const metadata: Metadata = {
  title: 'Enterprise Editions & Downloads | Dynamia AI',
  description:
    'Browse Dynamia AI enterprise editions, download offline image bundles, Helm charts and installation guides for HAMi Enterprise and HAMi AI Platform.',
  keywords:
    'Dynamia AI, HAMi Enterprise, HAMi AI Platform, GPU virtualization, Helm chart, offline bundle, download',
};

export default function EnterpriseListPage() {
  return <EnterpriseListClient locale="en" />;
}
