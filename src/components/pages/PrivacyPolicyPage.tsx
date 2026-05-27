"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import { ShieldCheckIcon, DocumentTextIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// Helper: split text into paragraphs and line breaks
const TextWithBreaks = ({ text }: { text: string }) => {
  if (!text) return null;

  return (
    <>
      {text.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph.split('\n').map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicy');
  const footer = useTranslations('footer');

  const sections = t.raw('sections');
  const policySections = Array.isArray(sections) ? sections : [];

  return (
    <MainLayout>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-light to-primary-lighter py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-3 bg-white dark:bg-gray-900 rounded-full mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('lastUpdated')}</p>
        </div>
      </div>

      {/* Content Section */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-start mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <DocumentTextIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-1" />
                <div className="text-gray-700 dark:text-gray-300">
                  <TextWithBreaks text={t('intro')} />
                </div>
              </div>
              <div className="flex items-start mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <LockClosedIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-1" />
                <div className="text-gray-700 dark:text-gray-300">
                  <TextWithBreaks text={t('consent')} />
                </div>
              </div>

              <div className="space-y-8">
                {(policySections as Array<{ title: string; content: string }>).map((section, index) => (
                  <div key={index} className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{section.title}</h2>
                    <div className="text-gray-700 dark:text-gray-300">
                      <TextWithBreaks text={section.content} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {footer('copyright')}
            </p>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
