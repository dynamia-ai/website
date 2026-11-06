'use client';
import {useEffect,useState} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import {notFound} from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import DownloadDeliveryTabs from '@/components/enterprise/DownloadDeliveryTabs';
import DownloadGateModal from '@/components/enterprise/DownloadGateModal';
import {getProductById,getLatestRelease,isOfflineDownloadsComingSoon} from '@/lib/enterprise';
import {localizedPath} from '@/utils/i18n';
import {submitContact} from '@/utils/contact';
import {attributionToPayload,captureAttribution} from '@/utils/utm';
import type {Artifact} from '@/types/enterprise';

export default function DownloadsPage({productId}:{productId:string}) {
  const locale=useLocale();
  const t=useTranslations('redesignDownloads');
  const [unlocked,setUnlocked]=useState(false);
  const [pending,setPending]=useState<{artifact:Artifact;url:string}|null>(null);
  useEffect(()=>{
    setUnlocked(document.cookie.split('; ').includes('download_unlocked=1'));
    captureAttribution();
  },[]);
  const product=getProductById(productId);
  if(!product)notFound();
  const release=getLatestRelease(product);
  const names=t.raw('products') as Record<string,string>;

  function download(artifact:Artifact,url:string) {
    void submitContact({
      locale,
      product: names[productId],
      version: release?.version ?? '',
      artifact: artifact.label[locale] ?? artifact.label.en,
      architecture: artifact.arch ?? '',
      filename: artifact.filename ?? '',
      ...attributionToPayload(),
      _type: 'Enterprise Download',
      _subject: `[Download] ${productId} ${release?.version ?? ''} ${artifact.type}`,
    },{keepalive:true}).catch(()=>{ /* Download notifications are best effort. */ });
    window.location.assign(url);
  }

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
      {release&&<DownloadDeliveryTabs release={release} unlocked={unlocked}
        offlineComingSoon={isOfflineDownloadsComingSoon(product)}
        onDownload={(artifact,url)=>{
          if(['install-doc','release-notes'].includes(artifact.type)) {
            window.location.assign(url.startsWith('/') ? localizedPath(url,locale) : url);
          } else if (unlocked) {
            download(artifact,url);
          } else {
            setPending({artifact,url});
          }
        }}/>}
    </div></section>
    {pending&&release&&<DownloadGateModal
      context={{
        productId,
        productName:names[productId],
        version:release.version,
        artifactType:pending.artifact.type,
        artifactLabel:pending.artifact.label[locale] ?? pending.artifact.label.en,
      }}
      onClose={()=>setPending(null)}
      onSuccess={()=>{
        setUnlocked(true);
        setPending(null);
        download(pending.artifact,pending.url);
      }}
    />}
  </MainLayout>;
}
