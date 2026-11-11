import {getLocale, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import DownloadsClient from '@/components/pages/DownloadsClient';
import {getProductById, getLatestRelease, isOfflineDownloadsComingSoon} from '@/lib/enterprise';
import {localizedPath} from '@/utils/i18n';

interface DownloadsPageProps {
  productId: string;
}

export default async function DownloadsPage({productId}: DownloadsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations('productDownloads');
  const product = getProductById(productId);
  if (!product) notFound();

  const release = getLatestRelease(product);
  if (!release) notFound();

  const names = t.raw('products') as Record<string, string>;

  return (
    <DownloadsClient
      productId={productId}
      productName={names[productId]}
      release={release}
      offlineComingSoon={isOfflineDownloadsComingSoon(product)}
      backHref={localizedPath(`/products/${productId}`, locale)}
    />
  );
}
