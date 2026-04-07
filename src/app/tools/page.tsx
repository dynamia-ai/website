"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';

interface ToolItem {
  id: string;
  href: string;
  iconSrc: string;
  titleKey: string;
  descriptionKey: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'hami-metrics-explorer',
    href: '/tools/hami-metrics-explorer.html',
    iconSrc: '/icons/chart-line.svg',
    titleKey: 'tools.hamiMetricsExplorer.title',
    descriptionKey: 'tools.hamiMetricsExplorer.description',
  },
];

export default function ToolsPage() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl">
              {t('tools.title')}
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              {t('tools.subtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary-light rounded-full flex items-center text-primary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tool.iconSrc}
                      alt=""
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t(tool.titleKey)}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(tool.descriptionKey)}
                </p>
                <div className="group/cta mt-4 inline-flex items-center gap-1.5 relative w-fit text-primary">
                  <span className="text-sm font-medium leading-[1.2]">{t('tools.openTool')}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.6}
                    className="h-3.5 w-3.5 text-current transition-all duration-200 delay-150 group-hover/cta:translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  <span className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-200 group-hover/cta:w-full" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
