'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArchiveBoxIcon,
  CircleStackIcon,
  CubeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { Artifact, Locale } from '@/types/enterprise';
import ArtifactRow from './ArtifactRow';

interface ArtifactListProps {
  artifacts: Artifact[];
  locale: Locale;
  unlocked: boolean;
  onDownload: (artifact: Artifact, resolvedUrl: string) => void;
}

type GroupKey = 'bundles' | 'images' | 'charts' | 'docs';

const GROUP_ORDER: GroupKey[] = ['bundles', 'images', 'charts', 'docs'];

const GROUP_META: Record<GroupKey, {
  titleKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
  recommended?: boolean;
}> = {
  bundles: {
    titleKey: 'enterprise.artifact.groupBundles',
    descKey: 'enterprise.artifact.groupBundlesDesc',
    icon: ArchiveBoxIcon,
    recommended: true,
  },
  images: {
    titleKey: 'enterprise.artifact.groupImages',
    descKey: 'enterprise.artifact.groupImagesDesc',
    icon: CircleStackIcon,
  },
  charts: {
    titleKey: 'enterprise.artifact.groupCharts',
    descKey: 'enterprise.artifact.groupChartsDesc',
    icon: CubeIcon,
  },
  docs: {
    titleKey: 'enterprise.artifact.groupDocs',
    descKey: 'enterprise.artifact.groupDocsDesc',
    icon: DocumentTextIcon,
  },
};

function groupOf(artifact: Artifact): GroupKey {
  if (artifact.type === 'airgap-bundle') return 'bundles';
  if (artifact.type === 'helm-chart') return 'charts';
  if (artifact.type === 'install-doc' || artifact.type === 'release-notes') return 'docs';
  return 'images';
}

export default function ArtifactList({
  artifacts,
  locale,
  unlocked,
  onDownload,
}: ArtifactListProps) {
  const { t } = useTranslation();

  const grouped: Record<GroupKey, Artifact[]> = { bundles: [], images: [], charts: [], docs: [] };
  for (const a of artifacts) grouped[groupOf(a)].push(a);

  return (
    <div className="space-y-7">
      {GROUP_ORDER.filter((g) => grouped[g].length > 0).map((g) => {
        const meta = GROUP_META[g];
        const Icon = meta.icon;
        return (
          <div key={g}>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${
                  meta.recommended
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    meta.recommended ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t(meta.titleKey)}
                  </h3>
                  {meta.recommended && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                      {t('enterprise.artifact.recommendedBadge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(meta.descKey)}</p>
              </div>
            </div>
            <div className="space-y-3">
              {grouped[g].map((artifact) => (
                <ArtifactRow
                  key={`${artifact.type}-${artifact.arch ?? 'all'}-${artifact.url}`}
                  artifact={artifact}
                  locale={locale}
                  unlocked={unlocked}
                  onDownload={onDownload}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
