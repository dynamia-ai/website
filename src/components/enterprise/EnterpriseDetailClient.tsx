'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  pickI18n,
} from '@/lib/enterprise';
import { captureAttribution, attributionToPayload } from '@/utils/utm';
import type { Artifact, Locale } from '@/types/enterprise';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PRODUCT_INTRO = {
  'hami-enterprise': {
    en: {
      eyebrow: 'Product introduction',
      title: 'Production-grade GPU virtualization for teams that already run Kubernetes.',
      body: 'HAMi Enterprise packages the open-source HAMi foundation into a hardened commercial distribution for real production clusters. It focuses on high-density GPU sharing, multi-vendor accelerator support, security maintenance, hotfix delivery and enterprise support while fitting into an existing PaaS or internal developer platform.',
      scenarioTitle: 'Best fit',
      scenarios: [
        'You already operate Kubernetes or a PaaS and need a supported HAMi distribution.',
        'You need higher GPU utilization, controlled vGPU sharing and production stability.',
        'You want enterprise support, long-term maintenance and air-gap deployment packages.',
      ],
      capabilitiesTitle: 'Core product capabilities',
      capabilities: [
        {
          title: 'Fine-grained GPU sharing',
          desc: 'Allocate GPU core and memory fractions to improve utilization across training, inference and developer workloads.',
        },
        {
          title: 'Hardened production delivery',
          desc: 'Signed images, CVE response, release packaging, upgrade guides and deployment support for enterprise environments.',
        },
        {
          title: 'Multi-vendor accelerator support',
          desc: 'Run heterogeneous GPU and accelerator fleets through one scheduling and virtualization layer.',
        },
      ],
    },
    zh: {
      eyebrow: '产品介绍',
      title: '面向已有 Kubernetes/PaaS 团队的生产级 GPU 虚拟化产品。',
      body: 'HAMi 企业版将开源 HAMi 的核心能力打包为经过生产加固的商业发行版，重点解决 GPU 细粒度共享、多厂商加速卡适配、安全维护、热修复交付和企业级支持问题，并可集成到客户已有的 PaaS 或内部开发者平台中。',
      scenarioTitle: '适用场景',
      scenarios: [
        '已经有 Kubernetes 或 PaaS，需要可被企业支持的 HAMi 发行版。',
        '需要提升 GPU 利用率，并稳定承载 vGPU 共享、训练、推理和开发机负载。',
        '需要长期版本维护、离线部署包、安装指南和企业级技术支持。',
      ],
      capabilitiesTitle: '核心产品能力',
      capabilities: [
        {
          title: 'GPU 细粒度共享',
          desc: '按 GPU 算力和显存切分资源，提升训练、推理和开发负载的整体利用率。',
        },
        {
          title: '生产级交付加固',
          desc: '提供镜像签名、CVE 响应、版本包、升级指南和企业部署支持。',
        },
        {
          title: '多厂商异构加速卡适配',
          desc: '通过统一调度与虚拟化层管理多种 GPU/NPU/DCU 加速卡资源。',
        },
      ],
    },
  },
  'hami-ai-platform': {
    en: {
      eyebrow: 'Product introduction',
      title: 'A full-stack heterogeneous compute control plane with HAMi Enterprise built in.',
      body: 'HAMi AI Platform is the platform edition for organizations that need more than a virtualization layer. It includes HAMi Enterprise and adds a multi-cluster GUI, unified observability, tenant quota, chargeback, OpenAPI and operational workflows for cluster administrators, platform teams and AI application owners.',
      scenarioTitle: 'Best fit',
      scenarios: [
        'You need a visual platform for heterogeneous compute operations across multiple clusters.',
        'You need tenant quotas, chargeback and resource governance for multiple teams.',
        'You need cluster, application and GPU observability in one control plane.',
      ],
      capabilitiesTitle: 'Platform capabilities',
      capabilities: [
        {
          title: 'Multi-cluster resource control',
          desc: 'Pool and schedule heterogeneous resources across clusters, data centers and cloud environments.',
        },
        {
          title: 'Observability and governance',
          desc: 'Track GPU/NPU utilization, queues, tenants, applications and SLOs with platform-level visibility.',
        },
        {
          title: 'Tenant quota and OpenAPI',
          desc: 'Expose quota, billing, automation and integration workflows to platform teams and internal systems.',
        },
      ],
    },
    zh: {
      eyebrow: '产品介绍',
      title: '内置 HAMi 企业版能力的异构算力全栈控制面。',
      body: 'HAMi 平台版面向不只需要虚拟化组件、还需要完整平台能力的组织。它包含 HAMi 企业版，并叠加多集群 GUI、统一可观测、租户配额、计量计费、OpenAPI 与运维工作流，服务于集群管理员、平台团队和 AI 应用负责人。',
      scenarioTitle: '适用场景',
      scenarios: [
        '需要通过可视化平台统一管理多个异构算力集群。',
        '需要面向多个团队做租户配额、计量计费和资源治理。',
        '需要把集群、应用和 GPU/NPU 可观测统一到一个控制面中。',
      ],
      capabilitiesTitle: '平台能力',
      capabilities: [
        {
          title: '多集群资源管控',
          desc: '跨集群、跨数据中心、跨云统一资源池化与调度异构算力。',
        },
        {
          title: '可观测与治理',
          desc: '统一查看 GPU/NPU 利用率、队列、租户、应用和 SLO 运行状态。',
        },
        {
          title: '租户配额与 OpenAPI',
          desc: '面向平台团队和内部系统开放配额、计费、自动化和集成能力。',
        },
      ],
    },
  },
} as const;

const CAPABILITY_ICONS = [CpuChipIcon, CubeTransparentIcon, ChartBarIcon];

const COMPATIBILITY_LABELS: Record<string, Record<Locale, string>> = {
  kubernetes: {
    en: 'Kubernetes',
    zh: 'Kubernetes',
  },
  os: {
    en: 'Operating systems',
    zh: '操作系统',
  },
  gpu: {
    en: 'GPU drivers',
    zh: 'GPU 驱动',
  },
};

interface EnterpriseDetailClientProps {
  productId: string;
  locale: Locale;
}

export default function EnterpriseDetailClient({
  productId,
  locale,
}: EnterpriseDetailClientProps) {
  const t = useTranslations();
  const router = useRouter();

  const product = getProductById(productId);
  if (!product) {
    notFound();
  }

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
    PRODUCT_INTRO[product!.id as keyof typeof PRODUCT_INTRO]?.[locale] ??
    PRODUCT_INTRO['hami-enterprise'][locale];

  const [pendingResolvedUrl, setPendingResolvedUrl] = useState<string | null>(null);

  const triggerDownload = (artifact: Artifact, resolvedUrl: string) => {
    const isDoc = artifact.type === 'install-doc' || artifact.type === 'release-notes';
    if (isDoc) {
      const docUrl =
        locale === 'zh' && resolvedUrl.startsWith('/products/')
          ? `/zh${resolvedUrl}`
          : resolvedUrl;
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
      productName: pickI18n(product!.name, locale),
      version: downloadVersion,
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
                {intro.scenarios.map((scenario) => (
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
              {intro.capabilities.map((capability, index) => {
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
              className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 lg:p-7"
            >
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl">
                {t('enterprise.detail.downloadTitle')}
              </h2>

              {latest ? (
                <DownloadDeliveryTabs
                  release={latest}
                  locale={locale}
                  unlocked={unlocked}
                  offlineComingSoon={offlineDownloadsComingSoon}
                  onDownload={handleDownload}
                />
              ) : (
                <p className="mt-5 text-gray-500 dark:text-gray-400">
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
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {t('enterprise.detail.compatTitle')}
                </h3>
                <dl className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                  {Object.entries(product!.compatibility).map(([key, values]) =>
                    values && values.length > 0 ? (
                      <div key={key} className="py-3 first:pt-0 last:pb-0">
                        <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {COMPATIBILITY_LABELS[key]?.[locale] ?? key}
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
