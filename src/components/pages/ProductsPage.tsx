import { Metadata } from 'next';
import EnterpriseListClient from '@/components/enterprise/EnterpriseListClient';

export const metadata: Metadata = {
  title: 'Products | Dynamia AI',
  description:
    'Explore Dynamia AI products — HAMi Enterprise and HAMi AI Platform for GPU virtualization and heterogeneous compute management.',
  keywords:
    'Dynamia AI, HAMi Enterprise, HAMi AI Platform, GPU virtualization, heterogeneous computing',
};

export default function ProductsListPage() {
  return <EnterpriseListClient />;
}
