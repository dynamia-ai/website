'use client';

import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  ChevronDownIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { Locale } from '@/types/enterprise';

interface HamiOriginBannerProps {
  locale: Locale;
}

const COPY = {
  en: {
    eyebrow: 'Same DNA',
    title: 'HAMi & Dynamia',
    subtitle:
      'HAMi is the CNCF Sandbox project for heterogeneous AI computing virtualization. Founded and core-maintained by the dynamia.ai team. Our enterprise editions ship the same upstream code — hardened, supported, SLA-backed.',
    pillars: [
      { title: 'CNCF Sandbox', desc: 'Open governance · vendor-neutral foundation' },
      { title: 'Created by Dynamia', desc: 'HAMi maintainers are the dynamia.ai team' },
      { title: '100% upstream', desc: 'No fork drift · no lock-in' },
      { title: 'OEM-grade SLA', desc: '24/7 support · long-term release lines' },
    ],
    relation: {
      connector1: 'Founded & maintained',
      connector2: 'OEM delivery · SLA',
      team: {
        title: 'Dynamia AI',
        titleSub: 'dynamia.ai',
        desc: 'Founder and core maintainer of HAMi, delivering enterprise editions as the OEM.',
      },
      opensource: {
        title: 'HAMi',
        desc: 'Heterogeneous AI computing virtualization middleware · open source, community-driven.',
      },
      commercial: {
        title: 'Enterprise Editions',
        desc: 'Commercial distribution based on HAMi, with support and services from Dynamia AI.',
      },
    },
    ctaPrimary: 'HAMi website',
    ctaCommunity: 'Community',
    ctaGithub: 'GitHub',
    ctaDiscord: 'Discord',
  },
  zh: {
    eyebrow: '同根同源',
    title: 'HAMi 与密瓜智能',
    subtitle:
      'HAMi 是 CNCF Sandbox 异构 AI 计算虚拟化项目，由密瓜智能创始团队发起并担任核心 Maintainer。我们的企业版与开源同源同代码，加固、运维、SLA 一站式由原厂提供。',
    pillars: [
      { title: 'CNCF Sandbox 项目', desc: '开放治理 · 厂商中立基金会背书' },
      { title: '由密瓜智能发起', desc: 'HAMi 的核心 Maintainer 即密瓜工程团队' },
      { title: '上游 100% 兼容', desc: '同源同 API · 无 fork 漂移、无锁定' },
      { title: '原厂级 SLA', desc: '7×24 支持 · 长期版本来自源头' },
    ],
    relation: {
      connector1: '发起并维护',
      connector2: '原厂交付 · SLA',
      team: {
        title: '密瓜智能',
        titleSub: 'Dynamia.AI',
        desc: 'HAMi 项目的发起者与持续维护方，并以原厂身份交付企业版',
      },
      opensource: {
        title: 'HAMi',
        desc: '异构 AI 计算虚拟化中间件 · 开源项目，社区驱动',
      },
      commercial: {
        title: '企业版产品',
        desc: '基于 HAMi 的商业发行版，由密瓜智能提供保障与服务',
      },
    },
    ctaPrimary: 'HAMi 官网',
    ctaCommunity: '社区',
    ctaGithub: 'GitHub',
    ctaDiscord: 'Discord',
  },
} as const;

const COMMUNITY_LINKS = [
  {
    key: 'community',
    href: 'https://project-hami.io/community/',
    icon: 'users' as const,
    labelKey: 'ctaCommunity' as const,
  },
  {
    key: 'github',
    href: 'https://github.com/Project-HAMi/HAMi',
    icon: 'github' as const,
    labelKey: 'ctaGithub' as const,
  },
  {
    key: 'discord',
    href: 'https://discord.gg/Amhy7XmbNq',
    icon: 'discord' as const,
    labelKey: 'ctaDiscord' as const,
  },
] as const;

const communityIconClass =
  'h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-primary';

function RelationConnector({ label }: { label: string }) {
  return (
    <div
      className="flex flex-row flex-nowrap items-center justify-center gap-1.5 py-1"
      aria-hidden="true"
    >
      <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
      <span className="text-[11px] leading-tight whitespace-nowrap text-gray-400 dark:text-gray-500">
        {label}
      </span>
    </div>
  );
}

interface FlowStepCardProps {
  highlight?: boolean;
  icon: React.ReactNode;
  title?: string;
  titleSub?: string;
  desc?: string;
}

function FlowStepCard({ highlight = false, icon, title, titleSub, desc }: FlowStepCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
        highlight
          ? 'border-primary/35 bg-primary/[0.05] dark:bg-primary/[0.08]'
          : 'border-gray-200/90 dark:border-gray-700/80 bg-white dark:bg-gray-900'
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">{icon}</div>
      {(title || titleSub || desc) && (
        <div className="min-w-0 flex-1">
          {(title || titleSub) && (
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              {title ? (
                <span className="text-[13px] font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {title}
                </span>
              ) : null}
              {titleSub ? (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">{titleSub}</span>
              ) : null}
            </div>
          )}
          {desc ? (
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              {desc}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CommunityLinkIcon({ type }: { type: (typeof COMMUNITY_LINKS)[number]['icon'] }) {
  if (type === 'github') {
    return <FontAwesomeIcon icon={faGithub} className={communityIconClass} aria-hidden />;
  }
  if (type === 'discord') {
    return <FontAwesomeIcon icon={faDiscord} className={communityIconClass} aria-hidden />;
  }
  return <UserGroupIcon className={communityIconClass} aria-hidden />;
}

export default function HamiOriginBanner({ locale }: HamiOriginBannerProps) {
  const c = COPY[locale] ?? COPY.en;

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-6 py-10 md:px-12 md:py-12">
        {/* Top — narrative + relationship */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 xl:gap-10 xl:items-center">
          <div className="max-w-2xl space-y-6">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-3">
              {c.eyebrow}
            </div>
            <div className="flex items-center gap-3">
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
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {c.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://project-hami.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                <GlobeAltIcon className="h-4 w-4 shrink-0" aria-hidden />
                {c.ctaPrimary}
              </a>
              {COMMUNITY_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 ease-out hover:-translate-y-px hover:border-primary/45 hover:bg-primary/[0.07] hover:text-primary hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:translate-y-0 dark:hover:bg-primary/10 dark:hover:border-primary/40 dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                >
                  <CommunityLinkIcon type={link.icon} />
                  {c[link.labelKey]}
                </a>
              ))}
            </div>
          </div>

          {/* Relationship flow */}
          <div className="w-full max-w-lg xl:max-w-lg xl:ml-auto">
            <div
              className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/30 p-3 space-y-0"
              role="img"
              aria-label={
                locale === 'zh'
                  ? '密瓜智能团队发起维护 HAMi 开源项目，并提供企业版产品与 SLA'
                  : 'Dynamia team maintains HAMi open source and delivers enterprise editions with SLA'
              }
            >
              <FlowStepCard
                icon={
                  <Image
                    src="/LOGO-small.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    aria-hidden
                  />
                }
                title={c.relation.team.title}
                titleSub={c.relation.team.titleSub}
                desc={c.relation.team.desc}
              />

              <RelationConnector label={c.relation.connector1} />

              <FlowStepCard
                icon={
                  <Image
                    src="/hami.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain dark:bg-white/95 dark:rounded-md dark:p-0.5"
                    aria-hidden
                  />
                }
                title={c.relation.opensource.title}
                desc={c.relation.opensource.desc}
              />

              <RelationConnector label={c.relation.connector2} />

              <FlowStepCard
                highlight
                icon={
                  <ShieldCheckIcon
                    className="h-7 w-7 text-primary shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                }
                title={c.relation.commercial.title}
                desc={c.relation.commercial.desc}
              />
            </div>
          </div>
        </div>

        {/* Bottom — key pillars */}
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.pillars.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 p-4"
            >
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
