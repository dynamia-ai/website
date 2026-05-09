'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Release } from '@/types/enterprise';

interface VersionSelectorProps {
  releases: Release[];
  selectedVersion: string;
  onChange: (version: string) => void;
}

const CHANNEL_BADGE: Record<string, string> = {
  stable: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  beta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rc: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  eol: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

function channelLabel(channel: string, t: (k: string) => string): string {
  switch (channel) {
    case 'stable':
      return t('enterprise.detail.channelStable');
    case 'beta':
      return t('enterprise.detail.channelBeta');
    case 'rc':
      return t('enterprise.detail.channelRc');
    case 'eol':
      return t('enterprise.detail.channelEol');
    default:
      return channel;
  }
}

export default function VersionSelector({
  releases,
  selectedVersion,
  onChange,
}: VersionSelectorProps) {
  const { t } = useTranslation();
  const selected = releases.find((r) => r.version === selectedVersion);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <label
          htmlFor="version-select"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('enterprise.detail.versionLabel')}
        </label>
        <select
          id="version-select"
          value={selectedVersion}
          onChange={(e) => onChange(e.target.value)}
          className="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm focus:ring-primary focus:border-primary"
        >
          {releases.map((r) => (
            <option key={r.version} value={r.version}>
              {r.version}
              {r.isLatest ? ` (${t('enterprise.detail.latest')})` : ''} · {r.releasedAt}
              {r.channel !== 'stable' ? ` [${channelLabel(r.channel, t)}]` : ''}
            </option>
          ))}
        </select>
        {selected && (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
              CHANNEL_BADGE[selected.channel] ?? CHANNEL_BADGE.stable
            }`}
          >
            {channelLabel(selected.channel, t)}
          </span>
        )}
      </div>
      {selected?.channel === 'eol' && (
        <div className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="h-4 w-4" />
          {t('enterprise.detail.eolWarning')}
        </div>
      )}
      {selected?.channel === 'beta' && (
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <ExclamationTriangleIcon className="h-4 w-4" />
          {t('enterprise.detail.betaWarning')}
        </div>
      )}
    </div>
  );
}
