'use client';
import {useState} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import {localizedPath} from '@/utils/i18n';
interface Device {name:string;models:string;detail:string;url:string}
export default function GpuCatalog() {
  const t=useTranslations('gpuCatalog');
  const locale=useLocale();
  const [query,setQuery]=useState('');
  const devices=t.raw('devices') as Device[];
  const visible=devices.filter(d=>`${d.name} ${d.models} ${d.detail}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <MainLayout><div className="gpu-catalog">
    <section className="page-hero"><div className="wrap"><div className="eyebrow">{t('eyebrow')}</div><h1>{t('title')}</h1><p>{t('description')}</p><div className="catalog-source"><a href="https://project-hami.io/docs/userguide/device-supported" target="_blank" rel="noopener noreferrer">{t('matrix')} ↗</a></div></div></section>
    <section className="section"><div className="wrap"><div className="catalog-heading"><h2>{t('domestic')}</h2><label><span className="sr-only">{t('search')}</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('search')}/></label></div>
      <div className="catalog-list" aria-live="polite">{visible.map(d=><article className="catalog-device" key={d.name}><div><h3>{d.name}</h3><span className="catalog-label">{t('model')}</span><p>{d.models}</p></div><div><span className="catalog-label">{t('capability')}</span><p>{d.detail}</p><a className="textlink" href={d.url} target="_blank" rel="noopener noreferrer">{d.url === 'https://docs.dynamia.ai' ? t('docs') : t('source')} ↗</a></div></article>)}{!visible.length&&<p className="catalog-empty">{t('empty')}</p>}</div>
      <div className="catalog-next"><h2>{t('boundary')}</h2><p>{t('boundaryText')}</p><div className="actions"><a className="btn primary" href={localizedPath('/contact-sales',locale)}>{t('contact')}</a><a className="textlink" href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer">{t('docs')} ↗</a></div></div>
    </div></section>
  </div></MainLayout>;
}
