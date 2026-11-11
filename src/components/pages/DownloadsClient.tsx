'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import DownloadDeliveryTabs from '@/components/enterprise/DownloadDeliveryTabs';
import DownloadGateModal from '@/components/enterprise/DownloadGateModal';
import {localizedPath} from '@/utils/i18n';
import {submitContact} from '@/lib/site/contact';
import {attributionToPayload, captureAttribution} from '@/utils/utm';
import type {Artifact, Release} from '@/types/enterprise';

interface DownloadsClientProps {
  productId: string;
  productName: string;
  release: Release;
  offlineComingSoon: boolean;
  backHref: string;
}

export default function DownloadsClient({
  productId,
  productName,
  release,
  offlineComingSoon,
  backHref,
}: DownloadsClientProps) {
  const locale = useLocale();
  const t = useTranslations('productDownloads');
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState<{artifact: Artifact; url: string} | null>(null);

  useEffect(() => {
    setUnlocked(document.cookie.split('; ').includes('download_unlocked=1'));
    captureAttribution();
  }, []);

  function download(artifact: Artifact, url: string) {
    void submitContact(
      {
        locale,
        product: productName,
        version: release.version,
        artifact: artifact.label[locale] ?? artifact.label.en,
        architecture: artifact.arch ?? '',
        filename: artifact.filename ?? '',
        ...attributionToPayload(),
        _type: 'Enterprise Download',
        _subject: `[Download] ${productId} ${release.version} ${artifact.type}`,
      },
      {keepalive: true},
    ).catch(() => {
      /* Download notifications are best effort. */
    });
    window.location.assign(url);
  }

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{t('eyebrow')}</div>
          <h1>{productName}</h1>
          <p>{t('description')}</p>
          <a className="textlink" href={backHref}>
            {t('back')}
          </a>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2>{t('title')}</h2>
          <p className="mb-8">
            {release.version} · {release.releasedAt}
          </p>
          <DownloadDeliveryTabs
            release={release}
            unlocked={unlocked}
            offlineComingSoon={offlineComingSoon}
            onDownload={(artifact, url) => {
              if (['install-doc', 'release-notes'].includes(artifact.type)) {
                window.location.assign(url.startsWith('/') ? localizedPath(url, locale) : url);
              } else if (unlocked) {
                download(artifact, url);
              } else {
                setPending({artifact, url});
              }
            }}
          />
        </div>
      </section>
      {pending ? (
        <DownloadGateModal
          context={{
            productId,
            productName,
            version: release.version,
            artifactType: pending.artifact.type,
            artifactLabel: pending.artifact.label[locale] ?? pending.artifact.label.en,
          }}
          onClose={() => setPending(null)}
          onSuccess={() => {
            setUnlocked(true);
            setPending(null);
            download(pending.artifact, pending.url);
          }}
        />
      ) : null}
    </>
  );
}
