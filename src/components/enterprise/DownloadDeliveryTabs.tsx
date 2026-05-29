'use client';

import React, { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArchiveBoxIcon,
  CloudIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { Artifact, DeliveryMode, Locale, Release } from '@/types/enterprise';
import { filterArtifactsByDelivery, pickI18n } from '@/lib/enterprise';
import ArtifactList from '@/components/enterprise/ArtifactList';

interface DownloadDeliveryTabsProps {
  release: Release;
  locale: Locale;
  unlocked: boolean;
  offlineComingSoon: boolean;
  onDownload: (artifact: Artifact, resolvedUrl: string) => void;
}

function TabButton({
  active,
  id,
  controls,
  onClick,
  children,
}: {
  active: boolean;
  id: string;
  controls: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`relative -mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-3 pt-0.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
        active
          ? 'border-primary text-gray-900 dark:text-gray-100'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function ReleaseMeta({
  release,
  className = '',
}: {
  release: Release;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span>
        {t('enterprise.detail.releasedAt')}{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
          {release.releasedAt}
        </span>
      </span>
    </div>
  );
}

function InstallGuideCta({
  artifact,
  locale,
  description,
  onDownload,
}: {
  artifact: Artifact;
  locale: Locale;
  description: string;
  onDownload: (artifact: Artifact, resolvedUrl: string) => void;
}) {
  const { t } = useTranslation();
  const label = pickI18n(artifact.label, locale);

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 ring-1 ring-inset ring-gray-200/80 dark:ring-gray-700/80">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DocumentTextIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDownload(artifact, artifact.url)}
          className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md sm:w-auto"
        >
          <DocumentTextIcon className="h-4 w-4" aria-hidden />
          {t('enterprise.artifact.view')}
        </button>
      </div>
    </div>
  );
}

function isOnlineInstallGuideOnly(artifacts: Artifact[]): boolean {
  return (
    artifacts.length === 1 &&
    artifacts[0]?.type === 'install-doc'
  );
}

export default function DownloadDeliveryTabs({
  release,
  locale,
  unlocked,
  offlineComingSoon,
  onDownload,
}: DownloadDeliveryTabsProps) {
  const { t } = useTranslation();
  const tablistId = useId();
  const [delivery, setDelivery] = useState<DeliveryMode>('online');

  const onlineArtifacts = useMemo(
    () => filterArtifactsByDelivery(release.artifacts, 'online'),
    [release.artifacts],
  );
  const offlineArtifacts = useMemo(
    () => filterArtifactsByDelivery(release.artifacts, 'offline'),
    [release.artifacts],
  );

  const onlineGuideOnly = isOnlineInstallGuideOnly(onlineArtifacts);

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
      <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 sm:flex-row sm:items-end sm:justify-between">
        <div
          id={tablistId}
          role="tablist"
          aria-label={t('enterprise.detail.deliveryTabsLabel')}
          className="flex gap-5 sm:gap-6"
        >
          <TabButton
            active={delivery === 'online'}
            id={`${tablistId}-online`}
            controls={`${tablistId}-panel`}
            onClick={() => setDelivery('online')}
          >
            <CloudIcon className="h-4 w-4 shrink-0 text-current" aria-hidden />
            {t('enterprise.detail.deliveryTabOnline')}
          </TabButton>
          <TabButton
            active={delivery === 'offline'}
            id={`${tablistId}-offline`}
            controls={`${tablistId}-panel`}
            onClick={() => setDelivery('offline')}
          >
            <ArchiveBoxIcon className="h-4 w-4 shrink-0 text-current" aria-hidden />
            {t('enterprise.detail.deliveryTabOffline')}
            {offlineComingSoon && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                {t('enterprise.detail.deliveryTabSoon')}
              </span>
            )}
          </TabButton>
        </div>
        <ReleaseMeta release={release} className="pb-3 sm:text-right" />
      </div>

      <div
        role="tabpanel"
        id={`${tablistId}-panel`}
        aria-labelledby={`${tablistId}-${delivery}`}
        className="pt-5"
      >
        {delivery === 'online' ? (
          onlineArtifacts.length > 0 ? (
            onlineGuideOnly ? (
              <InstallGuideCta
                artifact={onlineArtifacts[0]}
                locale={locale}
                description={t('enterprise.detail.deliveryOnlineDesc')}
                onDownload={onDownload}
              />
            ) : (
              <>
                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {t('enterprise.detail.deliveryOnlineDesc')}
                </p>
                <ArtifactList
                  artifacts={onlineArtifacts}
                  locale={locale}
                  unlocked={unlocked}
                  delivery="online"
                  rowLayout="compact"
                  onDownload={onDownload}
                />
              </>
            )
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('enterprise.detail.noRelease')}
            </p>
          )
        ) : offlineComingSoon ? (
          <div className="rounded-lg bg-gray-50 px-4 py-8 text-center dark:bg-gray-800/40 sm:px-6">
            <ArchiveBoxIcon
              className="mx-auto h-9 w-9 text-gray-300 dark:text-gray-600"
              aria-hidden
            />
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('enterprise.detail.offlineComingSoonTitle')}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('enterprise.detail.offlineComingSoonDesc')}
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
              {locale === 'zh' ? (
                <>
                  如需提前获取离线包，请{' '}
                  <a
                    href="mailto:info@dynamia.ai"
                    className="font-medium text-primary hover:underline"
                  >
                    联系销售
                  </a>{' '}
                  或致电 400-026-7800
                </>
              ) : (
                <>
                  Need bundles early?{' '}
                  <a
                    href="mailto:info@dynamia.ai"
                    className="font-medium text-primary hover:underline"
                  >
                    Contact sales
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        ) : offlineArtifacts.length > 0 ? (
          <ArtifactList
            artifacts={offlineArtifacts}
            locale={locale}
            unlocked={unlocked}
            delivery="offline"
            onDownload={onDownload}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('enterprise.detail.noRelease')}
          </p>
        )}
      </div>
    </div>
  );
}
