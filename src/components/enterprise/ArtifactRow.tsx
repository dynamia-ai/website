'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownTrayIcon,
  CubeIcon,
  DocumentTextIcon,
  LockClosedIcon,
  ClipboardIcon,
  CheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { Artifact, Locale, Mirror } from '@/types/enterprise';
import { pickI18n } from '@/lib/enterprise';
import CopyableCommand from './CopyableCommand';

interface ArtifactRowProps {
  artifact: Artifact;
  locale: Locale;
  unlocked: boolean;
  onDownload: (artifact: Artifact, resolvedUrl: string) => void;
}

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  'image-bundle': CubeIcon,
  'helm-chart': CubeIcon,
  'install-doc': DocumentTextIcon,
  'release-notes': DocumentTextIcon,
  'checksum': DocumentTextIcon,
};

const MIRROR_PREF_KEY = 'enterprise.mirror.region';

function detectDefaultRegion(mirrors: Mirror[], locale: Locale): string {
  const cn = mirrors.find((m) => m.region === 'cn');
  const global = mirrors.find((m) => m.region === 'global');
  if (locale === 'zh' && cn) return cn.region;
  return (global ?? mirrors[0]).region;
}

export default function ArtifactRow({ artifact, locale, unlocked, onDownload }: ArtifactRowProps) {
  const { t } = useTranslation();
  const [shaCopied, setShaCopied] = useState(false);
  const mirrors = useMemo(() => artifact.mirrors ?? [], [artifact.mirrors]);
  const hasMirrors = mirrors.length > 1;

  const [selectedRegion, setSelectedRegion] = useState<string>(() =>
    hasMirrors ? detectDefaultRegion(mirrors, locale) : '',
  );

  useEffect(() => {
    if (!hasMirrors) return;
    try {
      const saved = localStorage.getItem(MIRROR_PREF_KEY);
      if (saved && mirrors.some((m) => m.region === saved)) {
        setSelectedRegion(saved);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [hasMirrors, mirrors]);

  const Icon = TYPE_ICON[artifact.type] ?? CubeIcon;
  const label = pickI18n(artifact.label, locale);
  const isDoc = artifact.type === 'install-doc' || artifact.type === 'release-notes';

  const resolvedMirror = hasMirrors
    ? mirrors.find((m) => m.region === selectedRegion) ?? mirrors[0]
    : null;
  const resolvedUrl = resolvedMirror?.url ?? artifact.url;

  const handleMirrorChange = (region: string) => {
    setSelectedRegion(region);
    try {
      localStorage.setItem(MIRROR_PREF_KEY, region);
    } catch {
      /* no-op */
    }
  };

  const handleSha = async () => {
    if (!artifact.sha256) return;
    try {
      await navigator.clipboard.writeText(artifact.sha256);
      setShaCopied(true);
      setTimeout(() => setShaCopied(false), 1500);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{label}</h4>
              {artifact.size && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{artifact.size}</span>
              )}
            </div>
            {artifact.filename && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 break-all font-mono">
                {artifact.filename}
              </p>
            )}
            {artifact.sha256 && artifact.sha256 !== 'TBD' && (
              <button
                type="button"
                onClick={handleSha}
                className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary group"
                title={artifact.sha256}
              >
                {shaCopied ? (
                  <CheckIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-3 w-3" />
                )}
                <span className="font-mono">
                  sha256: {artifact.sha256.slice(0, 12)}…
                </span>
              </button>
            )}
            {artifact.sha256 === 'TBD' && (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-700/40">
                {locale === 'zh' ? '校验和待发布' : 'Checksum pending'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasMirrors && !isDoc && (
            <div className="inline-flex items-center gap-1 text-xs">
              <GlobeAltIcon className="h-4 w-4 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => handleMirrorChange(e.target.value)}
                aria-label={t('enterprise.artifact.mirrorLabel')}
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-1 px-2 text-xs focus:ring-primary focus:border-primary"
              >
                {mirrors.map((m) => (
                  <option key={m.region} value={m.region}>
                    {pickI18n(m.label, locale)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => onDownload(artifact, resolvedUrl)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            {isDoc ? (
              <DocumentTextIcon className="h-4 w-4" />
            ) : !unlocked ? (
              <LockClosedIcon className="h-4 w-4" />
            ) : (
              <ArrowDownTrayIcon className="h-4 w-4" />
            )}
            <span>
              {isDoc
                ? t('enterprise.artifact.view')
                : unlocked
                  ? t('enterprise.artifact.download')
                  : t('enterprise.artifact.unlockToDownload')}
            </span>
          </button>
        </div>
      </div>

      {artifact.installCommand && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('enterprise.artifact.installCommand')}
          </p>
          <CopyableCommand command={artifact.installCommand} />
        </div>
      )}
    </div>
  );
}
