'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid';
import type { Release } from '@/types/enterprise';

interface VersionSelectorProps {
  releases: Release[];
  selectedVersion: string;
  onChange: (version: string) => void;
  /** Inline row for download toolbar */
  compact?: boolean;
}

const CHANNEL_BADGE: Record<string, string> = {
  stable: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  beta: 'bg-amber-500/10 text-amber-800 dark:text-amber-200',
  rc: 'bg-blue-500/10 text-blue-800 dark:text-blue-200',
  eol: 'bg-red-500/10 text-red-700 dark:text-red-300',
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

function ChannelBadge({
  channel,
  t,
  size = 'sm',
}: {
  channel: string;
  t: (k: string) => string;
  size?: 'sm' | 'xs';
}) {
  if (channel === 'stable') return null;
  return (
    <span
      className={`shrink-0 rounded-full font-semibold uppercase tracking-wide ${
        CHANNEL_BADGE[channel] ?? CHANNEL_BADGE.stable
      } ${size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]'}`}
    >
      {channelLabel(channel, t)}
    </span>
  );
}

export default function VersionSelector({
  releases,
  selectedVersion,
  onChange,
  compact = false,
}: VersionSelectorProps) {
  const t = useTranslations();
  const selected = releases.find((r) => r.version === selectedVersion) ?? releases[0];

  const listbox = (
    <Listbox value={selectedVersion} onChange={onChange}>
      <div className="relative">
        <ListboxButton
          className={`relative grid w-full cursor-pointer grid-cols-1 items-center rounded-xl border border-gray-200/90 bg-white text-left shadow-sm transition-all hover:border-gray-300 hover:shadow dark:border-gray-600/90 dark:bg-gray-800/90 dark:hover:border-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
            compact ? 'min-w-[12.5rem] py-2 pl-3 pr-9' : 'min-w-[13rem] py-2.5 pl-3.5 pr-10'
          }`}
        >
          <span className="col-start-1 row-start-1 flex items-center gap-2 truncate pr-6">
            <span className="truncate font-semibold tabular-nums text-gray-900 dark:text-gray-100">
              {selected?.version}
            </span>
            {selected?.isLatest && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {t('enterprise.detail.latest')}
              </span>
            )}
            {selected && !compact ? (
              <ChannelBadge channel={selected.channel} t={t} size="xs" />
            ) : null}
          </span>
          <ChevronUpDownIcon
            aria-hidden
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400"
          />
        </ListboxButton>

        <ListboxOptions
          anchor={compact ? 'bottom end' : 'bottom start'}
          transition
          className="z-50 mt-1.5 w-[var(--button-width)] min-w-[12.5rem] origin-top rounded-xl border border-gray-200/90 bg-white p-1 shadow-lg ring-1 ring-black/5 transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0 dark:border-gray-600 dark:bg-gray-800 dark:ring-white/10 [--anchor-gap:6px]"
        >
          {releases.map((r) => (
            <ListboxOption
              key={r.version}
              value={r.version}
              className="group relative cursor-pointer select-none rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none data-focus:bg-primary/[0.08] data-selected:bg-primary/[0.06] dark:text-gray-100 dark:data-focus:bg-primary/15"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="font-semibold tabular-nums truncate">{r.version}</span>
                  {r.isLatest && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {t('enterprise.detail.latest')}
                    </span>
                  )}
                  <ChannelBadge channel={r.channel} t={t} size="xs" />
                </div>
                <CheckIcon
                  className="size-4 shrink-0 text-primary opacity-0 group-data-selected:opacity-100"
                  aria-hidden
                />
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {r.releasedAt}
              </p>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );

  const warnings =
    selected?.channel === 'eol' ? (
      <div
        className="flex items-start gap-2 rounded-lg border border-red-200/80 dark:border-red-800/60 bg-red-50/80 dark:bg-red-950/30 px-3 py-2 text-xs text-red-700 dark:text-red-300"
        role="status"
      >
        <ExclamationTriangleIcon className="size-4 shrink-0 mt-0.5" />
        <span>{t('enterprise.detail.eolWarning')}</span>
      </div>
    ) : selected?.channel === 'beta' ? (
      <div
        className="flex items-start gap-2 rounded-lg border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200"
        role="status"
      >
        <ExclamationTriangleIcon className="size-4 shrink-0 mt-0.5" />
        <span>{t('enterprise.detail.betaWarning')}</span>
      </div>
    ) : null;

  if (compact) {
    return (
      <div className="flex flex-col items-stretch sm:items-end gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
            {t('enterprise.detail.versionLabel')}
          </span>
          {listbox}
          {selected ? <ChannelBadge channel={selected.channel} t={t} /> : null}
        </div>
        {warnings}
      </div>
    );
  }

  return (
    <div className="w-full sm:w-auto flex flex-col gap-2 sm:min-w-[14rem]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
          {t('enterprise.detail.versionLabel')}
        </span>
        {listbox}
      </div>
      {warnings}
    </div>
  );
}
