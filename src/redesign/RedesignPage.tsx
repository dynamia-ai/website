import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import {cache} from 'react';
import {createTranslator} from 'next-intl';
import {notFound} from 'next/navigation';
import {localizedPath} from '@/utils/i18n';
import {localizedUrl} from '@/utils/i18n';
import type {Metadata} from 'next';
import {websitePath} from './links';
import manifestData from '@/content/redesign/manifest.json';
import runtimeCopy from '../../dictionary/redesign/zh.json';
import RedesignClient from './RedesignClient';
import {localizeMarkup} from './links';

interface Entry {name: string; title: string; articleId?: number}
const manifest: Record<string, Entry> = manifestData;
export function hasRedesignPage(route: string) { return Boolean(manifest[route]); }
export function redesignTitle(route: string) { return manifest[route]?.title; }
export function redesignMetadata(route: string, locale: string): Metadata {
  const title=fragment(manifest[route]?.name||'home',locale).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,'')||redesignTitle(route);
  return {title,alternates:{canonical:localizedUrl(websitePath(route),locale)}};
}

const fragment = cache((name: string, locale: string) => {
  const suffix=locale==='zh'?'':locale;
  const template = fs.readFileSync(path.join(process.cwd(), 'src/content/redesign/pages', suffix, name + '.html'),'utf8');
  const messages = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'dictionary/redesign/pages', suffix, name + '.json'),'utf8'));
  const translator = createTranslator({locale, messages:{page:messages}, namespace:'page'});
  const escape = (text: string) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  return template.replace(/__COPY_(s[a-f0-9]+)__/g, (_all, key: string) => escape(translator.raw(key)));
});

export default function RedesignPage({route, locale}: {route: string; locale: string}) {
  const entry = manifest[route];
  if (!entry) notFound();
  const basePath = localizedPath('/',locale);
  const body = fragment('shell',locale).replace('<main id="app"></main>', `<main id="app">${fragment(entry.name,locale)}</main>`);
  const html = localizeMarkup(body,basePath);
  return <>
    <link rel="stylesheet" href="/redesign/site.css" precedence="redesign" />
    <RedesignClient html={html} route={route} articleId={entry.articleId} basePath={basePath} copy={runtimeCopy} />
  </>;
}
