'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ComingSoonCard() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-transparent p-7">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
        {t('enterprise.list.comingSoonBadge')}
      </div>
      <h3 className="mt-3 text-base font-semibold text-gray-700 dark:text-gray-300 leading-tight">
        {t('enterprise.list.comingSoonTitle')}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
        {t('enterprise.list.comingSoonDesc')}
      </p>
      <div className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
        {t('enterprise.list.comingSoonHint')}
      </div>
    </div>
  );
}
