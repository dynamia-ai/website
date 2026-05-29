import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import EnterpriseDetailClient from '@/components/enterprise/EnterpriseDetailClient';
import { getProductById, getProductIds, getLatestRelease } from '@/lib/enterprise';

interface PageProps {
  params: Promise<{ locale: string; productId: string }>;
}

export function generateStaticParams() {
  return getProductIds().map((productId) => ({ productId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, productId } = await params;
  const product = getProductById(productId);
  if (!product) return { title: 'Product Not Found' };
  const t = await getTranslations({ locale, namespace: 'enterprise' });
  const pd = (t.raw as any)('productsData')?.[productId];
  const latest = getLatestRelease(product);
  const name = pd?.name ?? product.name.en;
  const tagline = pd?.tagline ?? product.tagline.en;
  const versionLabel = latest ? ` ${latest.version}` : '';

  return {
    title: `${name}${versionLabel} | Dynamia AI`,
    description: tagline,
    keywords: (product.tags ?? []).concat([name, 'product', 'download']).join(', '),
    openGraph: {
      title: `${name}${versionLabel}`,
      description: tagline,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, productId } = await params;
  setRequestLocale(locale);
  if (!getProductById(productId)) notFound();
  return <EnterpriseDetailClient productId={productId} />;
}
