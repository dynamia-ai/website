'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  ArchiveBoxIcon,
  CircleStackIcon,
  CubeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { Artifact, DeliveryMode, Locale } from '@/types/enterprise';
import ArtifactRow from './ArtifactRow';

interface ArtifactListProps {
  artifacts: Artifact[];
  locale: Locale;
  unlocked: boolean;
  delivery?: DeliveryMode;
  rowLayout?: 'card' | 'compact';
  onDownload: (artifact: Artifact, resolvedUrl: string) => void;
}

function groupDescKey(group: GroupKey, delivery?: DeliveryMode): string {
  if (delivery === 'online' && group === 'charts') {
    return 'enterprise.artifact.groupChartsDescOnline';
  }
  if (delivery === 'offline' && group === 'charts') {
    return 'enterprise.artifact.groupChartsDescOffline';
  }
  return GROUP_META[group].descKey;
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
  delivery,
  rowLayout = 'card',
  onDownload,
}: ArtifactListProps) {
  const t = useTranslations();

  const grouped: Record<GroupKey, Artifact[]> = { bundles: [], images: [], charts: [], docs: [] };
  for (const a of artifacts) grouped[groupOf(a)].push(a);

  const visibleGroups = GROUP_ORDER.filter((g) => grouped[g].length > 0);
  const showGroupHeaders = !(delivery === 'online' && visibleGroups.length === 1);

  return (
    <div className="space-y-6">
      {visibleGroups.map((g) => {
        const meta = GROUP_META[g];
        const Icon = meta.icon;
        const isOptionalChartGroup = delivery === 'online' && g === 'charts';

        return (
          <div key={g}>
            {showGroupHeaders ? (
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${
                    meta.recommended && delivery !== 'online'
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      meta.recommended && delivery !== 'online'
                        ? 'text-primary'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {isOptionalChartGroup
                        ? t('enterprise.artifact.groupChartsOptional')
                        : t(meta.titleKey)}
                    </h3>
                    {meta.recommended && delivery !== 'online' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                        {t('enterprise.artifact.recommendedBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(groupDescKey(g, delivery))}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="space-y-3">
              {grouped[g].map((artifact) => (
                <ArtifactRow
                  key={`${artifact.type}-${artifact.arch ?? 'all'}-${artifact.url}`}
                  artifact={artifact}
                  locale={locale}
                  unlocked={unlocked}
                  delivery={delivery}
                  layout={rowLayout}
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
