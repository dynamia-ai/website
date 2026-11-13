'use client';

import {useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';

interface Device {
  name: string;
  models: string;
  detail: string;
  url: string;
}

export default function GpuCatalogSearch() {
  const t = useTranslations('gpuCatalog');
  const [query, setQuery] = useState('');
  const devices = t.raw('devices') as Device[];
  const visible = useMemo(
    () =>
      devices.filter((d) =>
        `${d.name} ${d.models} ${d.detail}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [devices, query],
  );

  return (
    <>
      <div className="catalog-heading">
        <h2>{t('domestic')}</h2>
        <label>
          <span className="sr-only">{t('search')}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
          />
        </label>
      </div>
      <div className="catalog-list" aria-live="polite">
        {visible.map((d) => (
          <article className="catalog-device" key={d.name}>
            <div>
              <h3>{d.name}</h3>
            </div>
            <div>
              <span className="catalog-label">{t('capability')}</span>
              <p>{d.detail}</p>
              <a className="textlink" href={d.url} target="_blank" rel="noopener noreferrer">
                {d.url === 'https://docs.dynamia.ai' ? t('docs') : t('source')} ↗
              </a>
            </div>
          </article>
        ))}
        {!visible.length && <p className="catalog-empty">{t('empty')}</p>}
      </div>
    </>
  );
}
