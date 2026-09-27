import { Metadata } from 'next';
import EnterpriseListClient from '@/components/enterprise/EnterpriseListClient';

export const metadata: Metadata = {
  title: 'Products | Dynamia AI',
  description:
    'Explore Dynamia AI products — Dynamia Enterprise for HAMi and Dynamia AI Platform for HAMi for GPU virtualization and heterogeneous compute management.',
  keywords:
    'Dynamia AI, Dynamia Enterprise for HAMi, Dynamia AI Platform for HAMi, GPU virtualization, heterogeneous computing',
};

export default function ProductsListPage() {
  return <EnterpriseListClient />;
}
