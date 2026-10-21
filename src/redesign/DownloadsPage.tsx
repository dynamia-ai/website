'use client';
import {useLocale,useTranslations} from 'next-intl';
import {notFound} from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import DownloadDeliveryTabs from '@/components/enterprise/DownloadDeliveryTabs';
import {getProductById,getLatestRelease,isOfflineDownloadsComingSoon} from '@/lib/enterprise';
import {localizedPath} from '@/utils/i18n';

export default function DownloadsPage({productId}:{productId:string}) {
  const locale=useLocale();
  const t=useTranslations('redesignDownloads');
  const product=getProductById(productId);
  if(!product)notFound();
  const release=getLatestRelease(product);
  const names=t.raw('products') as Record<string,string>;
  return <MainLayout>
    <section className="page-hero"><div className="wrap">
      <div className="eyebrow">{t('eyebrow')}</div>
      <h1>{names[productId]}</h1>
      <p>{t('description')}</p>
      <a className="textlink" href={localizedPath(`/products/${productId}`,locale)}>{t('back')}</a>
    </div></section>
    <section className="section"><div className="wrap">
      <h2>{t('title')}</h2>
      <p className="mb-8">{release?.version} · {release?.releasedAt}</p>
      {release&&<DownloadDeliveryTabs release={release} unlocked={false}
        offlineComingSoon={isOfflineDownloadsComingSoon(product)}
        onDownload={(artifact,url)=>{
          if(['install-doc','release-notes'].includes(artifact.type)&&url.startsWith('/')) {
            window.location.assign(localizedPath(url,locale));
          } else window.location.assign(url);
        }}/>}
    </div></section>
  </MainLayout>;
}
