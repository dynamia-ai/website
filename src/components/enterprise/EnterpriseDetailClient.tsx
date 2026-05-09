'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import ProductHero from '@/components/enterprise/ProductHero';
import VersionSelector from '@/components/enterprise/VersionSelector';
import ArtifactList from '@/components/enterprise/ArtifactList';
import DownloadGateModal, {
  type PendingDownloadContext,
} from '@/components/enterprise/DownloadGateModal';
import {
  getProductById,
  getReleaseByVersion,
  getLatestRelease,
  pickI18n,
} from '@/lib/enterprise';
import { captureAttribution, attributionToPayload } from '@/utils/utm';
import type { Artifact, Locale } from '@/types/enterprise';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface EnterpriseDetailClientProps {
  productId: string;
  locale: Locale;
}

export default function EnterpriseDetailClient({
  productId,
  locale,
}: EnterpriseDetailClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const product = getProductById(productId);
  if (!product) {
    notFound();
  }

  const latest = getLatestRelease(product!);
  const initialVersion = useMemo(() => {
    const fromQuery = searchParams.get('v');
    if (fromQuery && getReleaseByVersion(product!, fromQuery)) return fromQuery;
    return latest?.version ?? product!.releases[0]?.version ?? '';
  }, [searchParams, product, latest]);

  const [selectedVersion, setSelectedVersion] = useState<string>(initialVersion);
  const [unlocked, setUnlocked] = useState(false);
  const [gateContext, setGateContext] = useState<PendingDownloadContext | null>(null);
  const [pendingArtifact, setPendingArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    setUnlocked(document.cookie.includes('download_unlocked=1'));
    captureAttribution();
  }, []);

  useEffect(() => {
    setSelectedVersion(initialVersion);
  }, [initialVersion]);

  const selectedRelease = getReleaseByVersion(product!, selectedVersion) ?? latest;

  const handleVersionChange = (v: string) => {
    setSelectedVersion(v);
    const params = new URLSearchParams(searchParams.toString());
    params.set('v', v);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [pendingResolvedUrl, setPendingResolvedUrl] = useState<string | null>(null);

  const triggerDownload = (artifact: Artifact, resolvedUrl: string) => {
    const isDoc = artifact.type === 'install-doc' || artifact.type === 'release-notes';
    if (isDoc) {
      const docUrl =
        locale === 'zh' && resolvedUrl.startsWith('/enterprise/')
          ? `/zh${resolvedUrl}`
          : resolvedUrl;
      window.open(docUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    void fireDownloadAnalytics(artifact, product!.id, selectedVersion, locale, resolvedUrl);
    window.location.href = resolvedUrl;
  };

  const handleDownload = (artifact: Artifact, resolvedUrl: string) => {
    const isDoc = artifact.type === 'install-doc' || artifact.type === 'release-notes';
    if (isDoc || unlocked) {
      triggerDownload(artifact, resolvedUrl);
      return;
    }
    setPendingArtifact(artifact);
    setPendingResolvedUrl(resolvedUrl);
    setGateContext({
      productId: product!.id,
      productName: pickI18n(product!.name, locale),
      version: selectedVersion,
      artifactType: artifact.type,
      artifactLabel: pickI18n(artifact.label, locale),
    });
  };

  const handleGateSuccess = () => {
    setUnlocked(true);
    setGateContext(null);
    if (pendingArtifact && pendingResolvedUrl) {
      triggerDownload(pendingArtifact, pendingResolvedUrl);
      setPendingArtifact(null);
      setPendingResolvedUrl(null);
    }
  };

  const handleGateClose = () => {
    setGateContext(null);
    setPendingArtifact(null);
    setPendingResolvedUrl(null);
  };

  const handleJumpDownload = () => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('downloads');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MainLayout>
      <ProductHero
        product={product!}
        latest={latest}
        locale={locale}
        onJumpDownload={handleJumpDownload}
      />

      <section className="py-12 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t('enterprise.detail.aboutTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {pickI18n(product!.description, locale)}
              </p>

              {product!.highlights && product!.highlights.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product!.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {pickI18n(h.title, locale)}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {pickI18n(h.desc, locale)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              id="downloads"
              className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 scroll-mt-20"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('enterprise.detail.downloadTitle')}
                </h2>
                <VersionSelector
                  releases={product!.releases}
                  selectedVersion={selectedVersion}
                  onChange={handleVersionChange}
                />
              </div>

              {selectedRelease ? (
                <>
                  <div className="mb-4 flex items-center gap-3 flex-wrap text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('enterprise.detail.releasedAt')}: {selectedRelease.releasedAt}
                    </span>
                    {selectedRelease.releaseNotesUrl && (
                      <a
                        href={selectedRelease.releaseNotesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t('enterprise.detail.releaseNotes')}
                      </a>
                    )}
                    {selectedRelease.upgradeGuideUrl && (
                      <a
                        href={selectedRelease.upgradeGuideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t('enterprise.detail.upgradeGuide')}
                      </a>
                    )}
                  </div>
                  <ArtifactList
                    artifacts={selectedRelease.artifacts}
                    locale={locale}
                    unlocked={unlocked}
                    onDownload={handleDownload}
                  />
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {t('enterprise.detail.noRelease')}
                </p>
              )}
            </div>
          </motion.div>

          <motion.aside
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {product!.compatibility && (
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {t('enterprise.detail.compatTitle')}
                </h3>
                <dl className="space-y-3 text-sm">
                  {Object.entries(product!.compatibility).map(([key, values]) =>
                    values && values.length > 0 ? (
                      <div key={key}>
                        <dt className="text-gray-500 dark:text-gray-400 capitalize">{key}</dt>
                        <dd className="mt-1 flex flex-wrap gap-1">
                          {values.map((v) => (
                            <span
                              key={v}
                              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs"
                            >
                              {v}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </div>
            )}

            <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('enterprise.detail.contactTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('enterprise.detail.contactDesc')}
              </p>
              <a
                href={locale === 'zh' ? '/zh/apply-trial' : '/apply-trial'}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {t('enterprise.detail.contactCta')}
              </a>
            </div>

            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('enterprise.detail.casesTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {t('enterprise.detail.casesDesc')}
              </p>
              <a
                href={locale === 'zh' ? '/zh/case-studies' : '/case-studies'}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {t('enterprise.detail.casesCta')} →
              </a>
            </div>
          </motion.aside>
        </div>
      </section>

      {gateContext && (
        <DownloadGateModal
          context={gateContext}
          onSuccess={handleGateSuccess}
          onClose={handleGateClose}
        />
      )}
    </MainLayout>
  );
}

async function fireDownloadAnalytics(
  artifact: Artifact,
  productId: string,
  version: string,
  locale: Locale,
  resolvedUrl: string,
) {
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '📥 来源': '官网企业版下载行为埋点 (Enterprise Download Telemetry)',
        '产品ID': productId,
        '版本': version,
        '介质类型': artifact.type,
        '架构': artifact.arch ?? 'n/a',
        '文件名': artifact.filename ?? '',
        '镜像URL': resolvedUrl,
        '语言': locale,
        ...attributionToPayload(),
        _subject: `[下载行为] ${productId} ${version} ${artifact.type}`,
      }),
    });
  } catch {
    /* analytics best-effort */
  }
}
