'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import type { Locale } from '@/types/enterprise';

interface HamiOriginBannerProps {
  locale: Locale;
}

const COPY = {
  en: {
    eyebrow: 'Same DNA',
    title: 'HAMi & dynamia.ai',
    subtitle:
      'HAMi is the CNCF Sandbox project for heterogeneous AI computing virtualization. Founded and core-maintained by the dynamia.ai team. Our enterprise editions ship the same upstream code — hardened, supported, SLA-backed.',
    pillars: [
      { title: 'CNCF Sandbox', desc: 'Open governance · vendor-neutral foundation' },
      { title: 'Maintainers = us', desc: 'HAMi maintainers are the dynamia.ai team' },
      { title: '100% upstream', desc: 'No fork drift · no lock-in' },
      { title: 'OEM-grade SLA', desc: '24/7 support · long-term release lines' },
    ],
    statsLabel: {
      stars: 'GitHub Stars',
      contributors: 'Contributors',
      forks: 'Forks',
      pulls: 'Docker Pulls',
    },
    ctaPrimary: 'HAMi project',
    ctaCommunity: 'Community',
    ctaGithub: 'GitHub',
    ctaSlack: 'Slack',
  },
  zh: {
    eyebrow: '同根同源',
    title: 'HAMi 与密瓜智能',
    subtitle:
      'HAMi 是 CNCF Sandbox 异构 AI 计算虚拟化项目，由密瓜智能创始团队发起并担任核心 Maintainer。我们的企业版与开源同源同代码，加固、运维、SLA 一站式由原厂提供。',
    pillars: [
      { title: 'CNCF Sandbox 项目', desc: '开放治理 · 厂商中立基金会背书' },
      { title: 'Maintainer = 我们', desc: 'HAMi 的核心 Maintainer 即密瓜工程团队' },
      { title: '上游 100% 兼容', desc: '同源同 API · 无 fork 漂移、无锁定' },
      { title: '原厂级 SLA', desc: '7×24 支持 · 长期版本来自源头' },
    ],
    statsLabel: {
      stars: 'GitHub Stars',
      contributors: 'Contributors',
      forks: 'Forks',
      pulls: 'Docker Pulls',
    },
    ctaPrimary: 'HAMi 项目',
    ctaCommunity: '社区',
    ctaGithub: 'GitHub',
    ctaSlack: 'Slack',
  },
} as const;

const STATS = [
  { key: 'stars', value: '3.1K' },
  { key: 'contributors', value: '500+' },
  { key: 'forks', value: '400+' },
  { key: 'pulls', value: '100K+' },
] as const;

export default function HamiOriginBanner({ locale }: HamiOriginBannerProps) {
  const c = COPY[locale] ?? COPY.en;

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-6 py-10 md:px-12 md:py-12">
        {/* Top — narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-start">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-3">
              {c.eyebrow}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/hami.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 dark:bg-white/95 dark:p-1 dark:rounded-md"
                aria-hidden="true"
              />
              <h2 className="text-2xl md:text-[28px] font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {c.title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {c.subtitle}
            </p>
            <div className="mt-6 flex items-center gap-5 text-sm">
              <a
                href="https://project-hami.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-900 dark:text-gray-100 hover:text-primary border-b border-gray-300 dark:border-gray-700 hover:border-primary transition-colors pb-0.5"
              >
                {c.ctaPrimary}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://project-hami.io/community"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-900 dark:text-gray-100 hover:text-primary border-b border-gray-300 dark:border-gray-700 hover:border-primary transition-colors pb-0.5"
              >
                {c.ctaCommunity}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://github.com/Project-HAMi/HAMi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-900 dark:text-gray-100 hover:text-primary border-b border-gray-300 dark:border-gray-700 hover:border-primary transition-colors pb-0.5"
              >
                {c.ctaGithub}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://cloud-native.slack.com/archives/C07T10BU4S2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-900 dark:text-gray-100 hover:text-primary border-b border-gray-300 dark:border-gray-700 hover:border-primary transition-colors pb-0.5"
              >
                {c.ctaSlack}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Stats — single mono treatment */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 self-center">
            {STATS.map((s) => {
              const label = c.statsLabel[s.key as keyof typeof c.statsLabel];
              return (
                <div key={s.key}>
                  <div className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 tabular-nums">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom — pillars (text only, restrained) */}
        <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {c.pillars.map((p, i) => (
            <div key={i} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {p.title}
              </div>
              <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
