'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckIcon,
  MinusIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';
import type { Locale } from '@/types/enterprise';

interface ProductScopeProps {
  locale: Locale;
}

interface FeatureRow {
  feature: { en: string; zh: string };
  oss: boolean;
  commercial: boolean;
  enterprise: boolean;
}

interface FeatureGroup {
  id: string;
  title: { en: string; zh: string };
  desc: { en: string; zh: string };
  Icon: React.ComponentType<{ className?: string }>;
  rows: FeatureRow[];
}

const GROUPS: FeatureGroup[] = [
  {
    id: 'gpu-core',
    title: { en: 'GPU Virtualization Core', zh: 'GPU 虚拟化核心' },
    desc: {
      en: 'Open-source HAMi base — extended in commercial editions.',
      zh: '开源 HAMi 基础能力 —— 商业版强化',
    },
    Icon: CpuChipIcon,
    rows: [
      {
        feature: { en: 'GPU memory sharing', zh: '显存共享' },
        oss: true,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'GPU compute sharing', zh: '算力共享' },
        oss: true,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Memory hard isolation', zh: '显存共享强隔离' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Compute hard isolation', zh: '算力共享强隔离' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Memory & compute oversubscription', zh: '显存、算力超卖' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'High-perf mode (no virtualization overhead)', zh: '高性能模式（虚拟化无性能损失）' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'HAMi Turbo mode', zh: 'HAMi Turbo 模式' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Auto-scaling without restart', zh: '应用无缝自动扩缩容（不重启）' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Task priority & preemption', zh: '任务优先级抢占' },
        oss: true,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Idle-time analytics & memory profiling', zh: '空闲统计 & 显存占用分析' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Optimized scheduler engine (parallel)', zh: '调度引擎并行优化' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'Binpack / Spread strategies', zh: 'Binpack / Spread 策略' },
        oss: true,
        commercial: true,
        enterprise: true,
      },
      {
        feature: { en: 'NVIDIA topology-aware affinity', zh: 'NVIDIA 网络拓扑亲和调度' },
        oss: false,
        commercial: true,
        enterprise: true,
      },
      {
        feature: {
          en: 'Volcano deep integration (preemption / vGPU joint)',
          zh: 'Volcano 深度集成（抢占 / vGPU 联合调度）',
        },
        oss: false,
        commercial: true,
        enterprise: true,
      },
    ],
  },
  {
    id: 'gpu-vendors',
    title: { en: 'Heterogeneous GPU Vendor Support', zh: '异构 GPU 厂商支持' },
    desc: {
      en: 'Broad vendor coverage from NVIDIA to leading domestic accelerators and AMD.',
      zh: 'NVIDIA + 国产 8 家 + AMD',
    },
    Icon: ServerStackIcon,
    rows: [
      { feature: { en: 'NVIDIA (full lineup)', zh: 'NVIDIA 全系列' }, oss: true, commercial: true, enterprise: true },
      { feature: { en: 'AMD MI series (incl. MI300X)', zh: 'AMD MI 系列（含 MI300X）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Ascend (910B / 910C)', zh: '昇腾（910B / 910C）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'MetaX (MXC500)', zh: '沐曦（MXC500）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Kunlunxin (P800)', zh: '昆仑芯（P800）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Hygon DCU (K100)', zh: '海光 DCU（K100）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Iluvatar (BI)', zh: '天数智芯（BI）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Cambricon (MLU370)', zh: '寒武纪（MLU370）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Enflame (SG2042)', zh: '燧原（SG2042）' }, oss: false, commercial: true, enterprise: true },
      { feature: { en: 'Moore Threads (MTT S3000)', zh: '摩尔线程（MTT S3000）' }, oss: false, commercial: true, enterprise: true },
    ],
  },
  {
    id: 'multi-cluster',
    title: { en: 'Multi-cluster Control Plane', zh: '多集群控制面' },
    desc: {
      en: 'Enterprise-only — turn-key UI, observability, lifecycle management.',
      zh: '仅企业版 —— 一站式 UI、可观测、生命周期管理',
    },
    Icon: ChartBarIcon,
    rows: [
      {
        feature: {
          en: 'Multi-cluster observability (cluster / app / GPU)',
          zh: '多集群一站式可观测（集群 / 应用 / GPU）',
        },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'GPU hardware monitoring', zh: 'GPU 硬件监控' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Rich alert policies', zh: '丰富完备的告警策略' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: {
          en: 'Turn-key GUI (multi-cluster dashboard, quota, workload)',
          zh: '一站式 GUI（多集群 Dashboard / 资源 / 配额 / 工作负载）',
        },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Visual Binpack / Spread strategy editor', zh: '可视化 Binpack / Spread 策略' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Global time-range search & filters', zh: '全局时间检索 / 表格筛选' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Multi-cluster lifecycle management (LCM)', zh: '完备多集群生命周期管理（LCM）' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
    ],
  },
  {
    id: 'enterprise-ops',
    title: { en: 'Enterprise Operations', zh: '企业运营' },
    desc: {
      en: 'Enterprise-only — tenant, security, billing, OpenAPI, SLA.',
      zh: '仅企业版 —— 租户 / 安全 / 计费 / OpenAPI / SLA',
    },
    Icon: BuildingOffice2Icon,
    rows: [
      {
        feature: { en: 'Enterprise-grade tenant quota', zh: '企业级租户配额' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Network security policies', zh: '网络安全策略' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Tenant-level security isolation', zh: '租户级安全隔离策略' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Metering & billing', zh: '计量、计费' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      { feature: { en: 'OpenAPI', zh: 'OpenAPI' }, oss: false, commercial: false, enterprise: true },
      {
        feature: { en: 'Enterprise SLA support', zh: '企业级 SLA 支持' },
        oss: false,
        commercial: false,
        enterprise: true,
      },
      {
        feature: { en: 'Community support', zh: '社区支持' },
        oss: true,
        commercial: false,
        enterprise: false,
      },
    ],
  },
];

const MATRIX_GRID =
  'grid grid-cols-[minmax(11rem,1fr)_minmax(7rem,9rem)_minmax(7.5rem,9.5rem)_minmax(7.5rem,9.5rem)]';

interface ScopeCtaCardProps {
  href: string;
  title: string;
  subtitle: string;
  external?: boolean;
}

function ScopeCtaCard({ href, title, subtitle, external }: ScopeCtaCardProps) {
  const className =
    'group flex h-full items-center justify-between gap-3 rounded-xl border border-[var(--primary)] bg-white dark:bg-gray-900 px-5 py-4 transition-all duration-200 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950';

  const content = (
    <>
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-snug text-[var(--primary)]">{title}</div>
        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{subtitle}</div>
      </div>
      <ArrowRightIcon
        className="h-4 w-4 shrink-0 text-gray-800 dark:text-gray-200 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
        aria-hidden
      />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

const COPY = {
  en: {
    title: 'Which Product Is Right for You?',
    subtitle:
      'Three product lines — open-source HAMi, HAMi Enterprise, and HAMi AI Platform.',
    decisionTitle: 'Choose in 30 Seconds',
    totalsLabel: 'Capabilities covered',
    totalsHint: 'Checkmark = supported in that edition',
    decisionRows: [
      {
        scenario: 'Evaluating, building on top, or running a single-cluster proof-of-concept — community support is sufficient',
        choice: 'Open-source HAMi',
      },
      {
        scenario: 'You already operate a PaaS or scheduler and need hardened GPU virtualization with vendor support',
        choice: 'HAMi Enterprise',
      },
      {
        scenario: 'You want a turn-key, multi-cluster control plane — UI, observability, tenant quota and billing',
        choice: 'HAMi AI Platform',
      },
      {
        scenario: 'Public-cloud marketplace, mid-market or key-account customer',
        choice: 'HAMi AI Platform',
      },
    ],
    columns: {
      feature: 'Capability',
      oss: 'Open-source HAMi',
      ossSub: '',
      commercial: 'HAMi Enterprise',
      commercialSub: '',
      enterprise: 'HAMi AI Platform',
      enterpriseSub: '',
    },
    cta: {
      ossLabel: 'Open-source HAMi',
      ossLink: 'GitHub',
      ossHref: 'https://github.com/Project-HAMi/HAMi',
      commercialLabel: 'HAMi Enterprise',
      commercialLink: 'View Downloads',
      enterpriseLabel: 'HAMi AI Platform',
      enterpriseLink: 'View Downloads',
    },
  },
  zh: {
    title: '如何选择产品',
    subtitle: '三条产品线 —— 开源 HAMi、HAMi 企业版、HAMi 平台版。',
    decisionTitle: '30 秒选型',
    totalsLabel: '能力覆盖',
    totalsHint: '勾选表示该版本支持',
    decisionRows: [
      {
        scenario: '评估、二次开发、单集群验证；可接受社区支持',
        choice: '开源 HAMi',
      },
      {
        scenario: '已运营 PaaS 或调度系统，需要加固版 GPU 虚拟化能力与原厂支持',
        choice: 'HAMi 企业版',
      },
      {
        scenario: '需要开箱即用的多集群控制面 —— UI、可观测、租户配额、计量计费',
        choice: 'HAMi 平台版',
      },
      {
        scenario: '公有云应用市场、中型企业、行业 KA 客户',
        choice: 'HAMi 平台版',
      },
    ],
    columns: {
      feature: '能力',
      oss: '开源 HAMi',
      ossSub: '',
      commercial: 'HAMi 企业版',
      commercialSub: '',
      enterprise: 'HAMi 平台版',
      enterpriseSub: '',
    },
    cta: {
      ossLabel: '开源 HAMi',
      ossLink: 'GitHub',
      ossHref: 'https://github.com/Project-HAMi/HAMi',
      commercialLabel: 'HAMi 企业版',
      commercialLink: '查看下载',
      enterpriseLabel: 'HAMi 平台版',
      enterpriseLink: '查看下载',
    },
  },
} as const;

export default function ProductScope({ locale }: ProductScopeProps) {
  const c = COPY[locale] ?? COPY.en;
  const hamiHref = locale === 'zh' ? '/zh/products/hami-enterprise' : '/products/hami-enterprise';
  const entHref =
    locale === 'zh' ? '/zh/products/hami-ai-platform' : '/products/hami-ai-platform';

  const totals = {
    oss: GROUPS.reduce((s, g) => s + g.rows.filter((r) => r.oss).length, 0),
    commercial: GROUPS.reduce((s, g) => s + g.rows.filter((r) => r.commercial).length, 0),
    enterprise: GROUPS.reduce((s, g) => s + g.rows.filter((r) => r.enterprise).length, 0),
  };

  const renderCell = (
    on: boolean,
    accent: 'mid' | 'primary' = 'mid',
    bgClass = '',
  ) => (
    <div
      className={`px-3 py-3.5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 ${bgClass}`}
    >
      {on ? (
        <CheckIcon
          className={`h-5 w-5 ${
            accent === 'primary' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
          }`}
          strokeWidth={2.5}
        />
      ) : (
        <MinusIcon className="h-5 w-5 text-gray-300 dark:text-gray-700" />
      )}
    </div>
  );

  return (
    <section className="space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {c.title}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{c.subtitle}</p>
      </div>

      {/* Decision banner */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-5 text-center">
          {c.decisionTitle}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {c.decisionRows.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 block h-10 w-1 shrink-0 rounded-full bg-[var(--primary)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {r.scenario}
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {locale === 'zh' ? `推荐：${r.choice}` : `→ ${r.choice}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison matrix · 3 columns */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[44rem]">
        {/* Header row */}
        <div
          className={`${MATRIX_GRID} border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`}
        >
          <div className="px-5 py-5 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {c.columns.feature}
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {c.columns.oss}
            </div>
            {c.columns.ossSub ? (
              <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                {c.columns.ossSub}
              </div>
            ) : null}
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {c.columns.commercial}
            </div>
            {c.columns.commercialSub ? (
              <div className="mt-1 text-[11px] text-primary/80 dark:text-primary/70 leading-snug">
                {c.columns.commercialSub}
              </div>
            ) : null}
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10">
            <div className="text-sm font-bold text-primary leading-tight">{c.columns.enterprise}</div>
            {c.columns.enterpriseSub ? (
              <div className="mt-1 text-[11px] text-primary/80 dark:text-primary/70 leading-snug">
                {c.columns.enterpriseSub}
              </div>
            ) : null}
          </div>
        </div>

        {/* Group rows */}
        {GROUPS.map((g) => {
          const Icon = g.Icon;
          return (
            <div key={g.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div
                className={`${MATRIX_GRID} bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700`}
              >
                <div className="px-5 py-4 flex items-center gap-2.5">
                  <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {g.title[locale]}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                      {g.desc[locale]}
                    </div>
                  </div>
                </div>
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <div className="border-l border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10" />
              </div>

              {g.rows.map((row, idx) => (
                <div
                  key={idx}
                  className={`${MATRIX_GRID} hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors`}
                >
                  <div className="px-5 py-3.5 text-[15px] text-gray-700 dark:text-gray-300 flex items-center leading-snug">
                    {row.feature[locale]}
                  </div>
                  {renderCell(row.oss)}
                  {renderCell(row.commercial)}
                  {renderCell(
                    row.enterprise,
                    'primary',
                    'bg-primary/[0.04] dark:bg-primary/[0.07]',
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Footer summary */}
        <div
          className={`${MATRIX_GRID} bg-gray-50 dark:bg-gray-800/50 border-t-2 border-gray-200 dark:border-gray-700`}
        >
          <div className="px-5 py-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              {c.totalsLabel}
            </div>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 leading-snug max-w-[14rem]">
              {c.totalsHint}
            </p>
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {totals.oss}
            </div>
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {totals.commercial}
            </div>
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10">
            <div className="text-lg font-semibold text-primary tabular-nums">
              {totals.enterprise}
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Bottom CTAs · 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScopeCtaCard
          href={c.cta.ossHref}
          title={c.cta.ossLabel}
          subtitle={c.cta.ossLink}
          external
        />
        <ScopeCtaCard
          href={hamiHref}
          title={c.cta.commercialLabel}
          subtitle={c.cta.commercialLink}
        />
        <ScopeCtaCard
          href={entHref}
          title={c.cta.enterpriseLabel}
          subtitle={c.cta.enterpriseLink}
        />
      </div>

    </section>
  );
}
