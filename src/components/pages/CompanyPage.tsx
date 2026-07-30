"use client";

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Milestone {
  date: string;
  title: string;
  description: string;
}

interface BusinessItem {
  title: string;
  description: string;
}

interface LeaderBio {
  name: string;
  role: string;
  overview: string;
  experience: string[];
  activities: string[];
  mainWork: string;
}

interface Leadership {
  title: string;
  overviewLabel: string;
  experienceLabel: string;
  activitiesLabel: string;
  mainWorkLabel: string;
  expandLabel: string;
  collapseLabel: string;
  bios: LeaderBio[];
}

// Founder headshots + profile links (constant)
const FOUNDER_META = [
  {
    image: "/images/leadership/zx.png",
    github: "https://github.com/wawa0210",
    linkedin: "https://www.linkedin.com/in/xiao-zhang-a16604111/"
  },
  {
    image: "/images/leadership/lmx.png",
    github: "https://github.com/archlitchi",
    linkedin: "https://www.linkedin.com/in/mengxuan-li-5862a9314/"
  }
];

// 创始人卡片：默认仅显示概述，其余部分折叠，点击按钮展开/收起
function FounderBioCard({ bio, meta, leadership, delay = 0 }: {
  bio: LeaderBio;
  meta: { image?: string; github?: string; linkedin?: string };
  leadership: Leadership;
  delay?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center gap-4 mb-2">
        {meta.image && (
          <Image
            src={meta.image}
            alt={bio.name}
            width={72}
            height={72}
            className="rounded-full object-cover w-[72px] h-[72px] shrink-0"
          />
        )}
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{bio.name}</h4>
          <p className="text-sm text-primary font-medium">{bio.role}</p>
          <div className="flex gap-3 mt-1">
            {meta.github && (
              <a href={meta.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            {meta.linkedin && (
              <a href={meta.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                  <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-2 mb-1">{leadership.overviewLabel}</p>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{bio.overview}</p>

      {expanded && (
        <>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{leadership.experienceLabel}</p>
          <ul className="space-y-2 mb-4">
            {bio.experience.map((e, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="text-primary mt-0.5">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{leadership.activitiesLabel}</p>
          <ul className="space-y-2 mb-4">
            {bio.activities.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="text-primary mt-0.5">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{leadership.mainWorkLabel}</p>
          <p className="text-gray-600 dark:text-gray-300">{bio.mainWork}</p>
        </>
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? leadership.collapseLabel : leadership.expandLabel}
        <svg
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </motion.div>
  );
}

export default function Company() {
  const t = useTranslations();
  const locale = useLocale();
  const isZhPage = locale === 'zh';

  // 根据语言获取不同的团队成员配置
  const getTeamMembers = () => {
    const members = [
      {
        name: t('company.team.members.0.name'),
        position: t('company.team.members.0.position'),
        image: "/images/leadership/zx.png",
        github: "https://github.com/wawa0210",
        linkedin: "https://www.linkedin.com/in/xiao-zhang-a16604111/"
      },
      {
        name: t('company.team.members.1.name'),
        position: t('company.team.members.1.position'),
        image: "/images/leadership/lmx.png",
        github: "https://github.com/archlitchi",
        linkedin: "https://www.linkedin.com/in/mengxuan-li-5862a9314/"
      },
      {
        name: t('company.team.members.2.name'),
        position: t('company.team.members.2.position'),
        image: "/images/leadership/yy.jpg",
        github: "https://github.com/Nimbus318"
      },
      {
        name: t('company.team.members.3.name'),
        position: t('company.team.members.3.position'),
        image: "/images/leadership/cw.png",
        github: "https://github.com/calvin0327"
      },
      {
        name: t('company.team.members.4.name'),
        position: t('company.team.members.4.position'),
        image: "/images/leadership/jimmy.png",
        github: "https://github.com/rootsongjc",
        linkedin: "linkedin.com/in/jimmysongio"
      }
    ];

    // 仅在英文版本添加 Reza
    if (locale === 'en') {
      members.push({
        name: t('company.team.members.5.name'),
        position: t('company.team.members.5.position'),
        image: "/images/leadership/reza.png",
        github: "https://github.com/fishman",
        linkedin: "https://www.linkedin.com/in/rezajelveh/"
      });
    }

    return members;
  };

  const teamMembers = getTeamMembers();

  // 将段落文本内容分割成段落数组
  const formatParagraphs = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n').filter((p: string) => p.trim() !== '');
  };

  const paragraph1 = formatParagraphs(t('company.about.whoWeAre.paragraph1'));
  const paragraph2 = formatParagraphs(t('company.about.whoWeAre.paragraph2'));
  const paragraph3 = formatParagraphs(t('company.about.whoWeAre.paragraph3'));

  // zh-only sections (the full docx-based rebuild; EN/DE keep the original layout)
  const milestones = isZhPage ? (t.raw('company.milestones') as { title: string; subtitle?: string; items: Milestone[] }) : null;
  const business = isZhPage ? (t.raw('company.business') as { title: string; subtitle?: string; items: BusinessItem[] }) : null;
  const culture = isZhPage ? (t.raw('company.culture') as {
    title: string; goalLabel: string; goalValue: string;
    positioningLabel: string; positioningValue: string; valueStatement: string;
  }) : null;
  const scale = isZhPage ? (t.raw('company.scale') as { title: string; body: string }) : null;
  const leadership = isZhPage ? (t.raw('company.leadership') as Leadership) : null;

  const sectionHeading = (text: string) => (
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 text-left">{text}</h2>
  );

  return (
    <MainLayout>
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 公司介绍部分 */}
          <div className="mb-10">
            {isZhPage && (
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                {t('company.about.tagline')}
              </p>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl text-left">
              {t('company.about.title')}
            </h1>
            {isZhPage && (
              <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 text-left">
                {t('company.about.missionLine')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mb-20">
            {/* Who we are 部分 */}
            <div className="flex items-center">
              <div className="prose prose-lg max-w-none space-y-6">
                {paragraph1.map((p: string, index: number) => (
                  <p key={`p1-${index}`} className="text-gray-600 dark:text-gray-300 text-xl">{p}</p>
                ))}

                {paragraph2.map((p: string, index: number) => (
                  <p key={`p2-${index}`} className="text-gray-600 dark:text-gray-300 text-xl">{p}</p>
                ))}

                {paragraph3.length > 0 && paragraph3.map((p: string, index: number) => (
                  <p key={`p3-${index}`} className="text-gray-600 dark:text-gray-300 text-xl">{p}</p>
                ))}
              </div>
            </div>

            {/* 公司图片 */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/company.png"
                alt="Dynamia Company"
                width={600}
                height={400}
                className="rounded-lg shadow-md"
                quality={100}
                priority
              />
            </div>
          </div>

          {/* 发展历程 / Milestones (zh only) */}
          {milestones && (
            <div className="mb-20">
              {sectionHeading(milestones.title)}
              {milestones.subtitle && (
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">{milestones.subtitle}</p>
              )}
              <div className="max-w-3xl">
                {milestones.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="relative pl-8 pb-8 border-l border-gray-200 dark:border-gray-700 last:border-l-transparent last:pb-0"
                  >
                    <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-white dark:ring-gray-900" />
                    <p className="text-sm font-semibold text-primary mb-1">{item.date}</p>
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 公司业务 / Business (zh only) */}
          {business && (
            <div className="mb-20">
              {sectionHeading(business.title)}
              {business.subtitle && (
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-4xl">{business.subtitle}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {business.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-800"
                  >
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 公司规模 / Scale (zh only) */}
          {scale && (
            <div className="mb-20">
              {sectionHeading(scale.title)}
              <p className="text-gray-600 dark:text-gray-300 max-w-4xl">{scale.body}</p>
            </div>
          )}

          {/* 企业文化 / Culture (zh only) */}
          {culture && (
            <div className="mb-20">
              {sectionHeading(culture.title)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-800"
                >
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{culture.goalLabel}</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{culture.goalValue}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-800"
                >
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{culture.positioningLabel}</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{culture.positioningValue}</p>
                </motion.div>
              </div>
              <p className="mt-6 text-gray-600 dark:text-gray-300 max-w-4xl">{culture.valueStatement}</p>
            </div>
          )}

          {/* 创始团队 / Leadership bios (zh only) — 默认仅显示概述，点击展开详情 */}
          {leadership && (
            <div className="mb-20">
              {sectionHeading(leadership.title)}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {leadership.bios.map((bio, index) => (
                  <FounderBioCard
                    key={index}
                    bio={bio}
                    meta={FOUNDER_META[index] || {}}
                    leadership={leadership}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 团队部分 */}
          <div className="mt-16 mb-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-left">{t('company.team.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-6 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-50 h-50 mb-4 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{member.name}</h3>
                  <div className="h-12 flex items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 w-50 break-words">{member.position}</p>
                  </div>
                  <div className="flex gap-3">
                    <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                        <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                          <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 联系部分 */}
          <div className="mt-20">
            <div className="mb-12 text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('company.contact.title')}
              </h2>
            </div>
            {/* 社交联系卡片 */}
            <div className="flex flex-row justify-center items-center gap-6 max-w-6xl mx-auto">
              {/* 邮件卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-shadow w-[200px] flex-grow flex-shrink-0"
              >
                <a href="mailto:info@dynamia.ai" className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary w-8 h-8">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('company.contact.social.email.title')}</h3>
                  <div className="flex items-center text-primary text-xs">
                    <span className="mr-1">info@dynamia.ai</span>
                  </div>
                </a>
              </motion.div>

              {/* LinkedIn 卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-shadow w-[200px] flex-grow flex-shrink-0"
              >
                <a href="https://www.linkedin.com/company/dynamia-ai/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-primary w-8 h-8">
                      <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('company.contact.social.linkedin.title')}</h3>
                  <div className="flex items-center text-primary text-xs">
                    <span className="mr-1">{t('company.contact.social.linkedin.action')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </a>
              </motion.div>

              {/* X (Twitter) 卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-shadow w-[200px] flex-grow flex-shrink-0"
              >
                <a href="https://x.com/dynamia_ai" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="text-primary w-8 h-8">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('company.contact.social.twitter.title')}</h3>
                  <div className="flex items-center text-primary text-xs">
                    <span className="mr-1">{t('company.contact.social.twitter.action')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </a>
              </motion.div>

              {isZhPage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-shadow w-[200px] flex-grow flex-shrink-0 group relative"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary w-8 h-8">
                      <path d="M199.836 135.671C199.836 106.419 171.913 82.7169 137.478 82.7169C103.024 82.7169 75.1018 106.425 75.1018 135.671C75.1018 164.918 103.024 188.626 137.478 188.626C148.299 188.626 158.483 186.266 167.368 182.139L191.95 192.778L189.103 165.355C195.89 156.888 199.842 146.661 199.842 135.671H199.836ZM116.455 121.323C111.547 121.323 107.583 117.352 107.583 112.45C107.583 107.549 111.547 103.578 116.455 103.578C121.357 103.578 125.321 107.555 125.321 112.45C125.321 117.346 121.344 121.323 116.455 121.323ZM158.483 121.323C153.594 121.323 149.616 117.352 149.616 112.45C149.616 107.549 153.594 103.578 158.483 103.578C163.397 103.578 167.368 107.555 167.368 112.45C167.368 117.346 163.397 121.323 158.483 121.323ZM137.478 75.705C147.113 75.705 156.291 77.4221 164.652 80.5128C164.714 79.3951 164.845 78.3212 164.845 77.1973C164.845 38.5475 127.938 7.22186 82.4196 7.22186C36.914 7.22186 0.00634766 38.5413 0.00634766 77.1973C0.00634766 91.7331 5.23874 105.251 14.1925 116.44L10.4337 152.667L42.9082 138.6C50.9503 142.346 59.8417 144.875 69.2262 146.167C68.5207 142.752 68.0899 139.255 68.0899 135.671C68.0961 102.61 99.222 75.7112 137.478 75.7112V75.705ZM110.199 34.8074C116.674 34.8074 121.906 40.0523 121.906 46.5147C121.906 52.9897 116.674 58.2345 110.199 58.2345C103.724 58.2345 98.4852 52.9897 98.4852 46.5147C98.4852 40.0461 103.73 34.8074 110.199 34.8074ZM54.6405 58.2345C48.1656 58.2345 42.9332 52.9897 42.9332 46.5147C42.9332 40.0461 48.1718 34.8074 54.6405 34.8074C61.1154 34.8074 66.354 40.0523 66.354 46.5147C66.354 52.9772 61.1092 58.2345 54.6405 58.2345Z" fill="currentColor"/>
                    </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('company.contact.social.wechat.title')}</h3>
                    <div className="flex items-center text-primary text-xs">
                      <span className="mr-1">{t('company.contact.social.wechat.action')}</span>
                    </div>
                    {/* 悬浮显示二维码 */}
                    <div className="absolute top-[-170px] left-[50%] translate-x-[-50%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg z-10">
                      <div className="w-[150px] h-[150px] flex items-center justify-center">
                        <Image
                          src="/images/wechat-qr-code.png"
                          alt="WeChat QR Code"
                          width={150}
                          height={150}
                          className="rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
