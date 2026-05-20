import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EnterpriseDetailClient from '@/components/enterprise/EnterpriseDetailClient';
import { getProductById, getProductIds, getLatestRelease } from '@/lib/enterprise';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export function generateStaticParams() {
  return getProductIds().map((productId) => ({ productId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getProductById(productId);
  if (!product) return { title: '产品未找到' };
  const latest = getLatestRelease(product);
  const name = product.name.zh;
  const tagline = product.tagline.zh;
  const versionLabel = latest ? ` ${latest.version}` : '';

  return {
    title: `${name}${versionLabel} | 密瓜智能`,
    description: tagline,
    keywords: (product.tags ?? []).concat([name, '产品', '下载']).join(', '),
    openGraph: {
      title: `${name}${versionLabel}`,
      description: tagline,
      type: 'website',
    },
  };
}

export default async function ZhProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  if (!getProductById(productId)) notFound();
  return <EnterpriseDetailClient productId={productId} locale="zh" />;
}
