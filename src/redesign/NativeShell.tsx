'use client';
import type {ReactNode} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import {localizedPath} from '@/utils/i18n';
import shell from '@/content/redesign/chrome.json';
import runtimeCopy from '../../dictionary/redesign/zh.json';
import {localizeMarkup} from './links';
import RedesignClient from './RedesignClient';

export default function NativeShell({children}:{children:ReactNode}) {
  const locale=useLocale();
  const t=useTranslations('redesignShell');
  const nav=useTranslations('navigation');
  const source=locale==='zh'?shell.html:shell.html.replace(/<a\b[^>]*href="#\/careers"[^>]*>[\s\S]*?<\/a>/g,'');
  const html=source.replace(/__COPY_(s[a-f0-9]+)__/g,(_all,key:string)=>String(t.raw(key)).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')).replaceAll('/redesign/assets/cf10a2fcc13438169897.svg',nav('logo')).replaceAll('/redesign/assets/931baba8fa5e14fe2655.svg',nav('logoDark'));
  const basePath=localizedPath('/',locale);
  return <>
    <link rel="stylesheet" href="/redesign/site.css" precedence="redesign"/>
    <RedesignClient html={localizeMarkup(html,basePath)} route="native" basePath={basePath} copy={runtimeCopy}>{children}</RedesignClient>
  </>;
}
