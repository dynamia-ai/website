import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import EnterpriseDetailClient from '@/components/enterprise/EnterpriseDetailClient';
import { getProductById, getProductIds, getLatestRelease, pickI18n } from '@/lib/enterprise';
import type { Locale } from '@/types/enterprise';

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
  const latest = getLatestRelease(product);
  const name = pickI18n(product.name, locale as Locale);
  const tagline = pickI18n(product.tagline, locale as Locale);
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
  return <EnterpriseDetailClient productId={productId} locale={locale as Locale} />;
}
