'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProductHero from '@/components/enterprise/ProductHero';
import DownloadDeliveryTabs from '@/components/enterprise/DownloadDeliveryTabs';
import DownloadGateModal, {
  type PendingDownloadContext,
} from '@/components/enterprise/DownloadGateModal';
import {
  getProductById,
  getLatestRelease,
  isOfflineDownloadsComingSoon,

} from '@/lib/enterprise';
import { captureAttribution, attributionToPayload } from '@/utils/utm';
import { localizedPath } from '@/utils/i18n';
import type { Artifact } from '@/types/enterprise';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};


const CAPABILITY_ICONS = [CpuChipIcon, CubeTransparentIcon, ChartBarIcon];


interface EnterpriseDetailClientProps { productId: string; }

export default function EnterpriseDetailClient({ productId }: EnterpriseDetailClientProps) {
  const t = useTranslations('enterprise');
  const locale = useLocale();
  const router = useRouter();

  const product = getProductById(productId);
  if (!product) {
    notFound();
  }

  const pd = (t.raw('productsData') as any)?.[productId];

  const latest = getLatestRelease(product!);
  const downloadVersion = latest?.version ?? product!.releases[0]?.version ?? '';
  const [unlocked, setUnlocked] = useState(false);
  const [gateContext, setGateContext] = useState<PendingDownloadContext | null>(null);
  const [pendingArtifact, setPendingArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    setUnlocked(document.cookie.includes('download_unlocked=1'));
    captureAttribution();
  }, []);

  const offlineDownloadsComingSoon = isOfflineDownloadsComingSoon(product!);
  const intro =
    (t.raw as any)(`productIntro.${product!.id}`) ??
    (t.raw as any)('productIntro.hami-enterprise');

  const [pendingResolvedUrl, setPendingResolvedUrl] = useState<string | null>(null);

  const triggerDownload = (artifact: Artifact, resolvedUrl: string) => {
    const isDoc = artifact.type === 'install-doc' || artifact.type === 'release-notes';
    if (isDoc) {
      const docUrl = localizedPath(resolvedUrl, locale);
      router.push(docUrl);
      return;
    }
    void fireDownloadAnalytics(artifact, product!.id, downloadVersion, locale, resolvedUrl);
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
      productName: pd?.name ?? product!.name.en,
      version: downloadVersion,
      artifactType: artifact.type,
      artifactLabel: artifact.label[locale] ?? artifact.label.en,
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
        onJumpDownload={handleJumpDownload}
      />

      <section className="bg-white dark:bg-gray-900 py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-8 lg:gap-12 items-start"
          >
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                {intro.eyebrow}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                {intro.title}
              </h2>
              <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {intro.body}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {intro.scenarioTitle}
              </h3>
              <ul className="mt-5 space-y-4">
                {intro.scenarios.map((scenario: string) => (
                  <li key={scenario} className="flex gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{scenario}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {intro.capabilitiesTitle}
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {intro.capabilities.map((capability: { title: string; desc: string }, index: number) => {
                const Icon = CAPABILITY_ICONS[index] ?? Squares2X2Icon;
                return (
                  <motion.div
                    key={capability.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
                  >
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {capability.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {capability.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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
                {t('detail.aboutTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {pd?.description ?? product!.description.en}
              </p>

              {pd?.highlights && pd.highlights.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pd.highlights.map((h: { title: string; desc: string }, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {h.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {h.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              id="downloads"
              className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 lg:p-7"
            >
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl">
                {t('detail.downloadTitle')}
              </h2>

              {latest ? (
                <DownloadDeliveryTabs
                  release={latest}
                  unlocked={unlocked}
                  offlineComingSoon={offlineDownloadsComingSoon}
                  onDownload={handleDownload}
                />
              ) : (
                <p className="mt-5 text-gray-500 dark:text-gray-400">
                  {t('detail.noRelease')}
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
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {t('detail.compatTitle')}
                </h3>
                <dl className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                  {Object.entries(product!.compatibility).map(([key, values]) =>
                    values && values.length > 0 ? (
                      <div key={key} className="py-3 first:pt-0 last:pb-0">
                        <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t(`compatLabels.${key}` as any) || key}
                        </dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {values.map((v) => (
                            <span
                              key={v}
                              className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 px-2.5 py-1 text-xs font-medium leading-none text-gray-700 dark:text-gray-200"
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
                {t('detail.contactTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('detail.contactDesc')}
              </p>
              <a
                href={localizedPath('/apply-trial', locale)}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {t('detail.contactCta')}
              </a>
            </div>

            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('detail.casesTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {t('detail.casesDesc')}
              </p>
              <a
                href={localizedPath('/case-studies', locale)}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {t('detail.casesCta')} →
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
  locale: string,
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
