'use client';

import {useEffect, useRef, useState, memo, forwardRef} from 'react';
import {createPortal} from 'react-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {makeLocalizer} from '../../public/redesign/localization.js';
import type {LocaleCatalog} from '../../public/redesign/localization.js';
import type {ReactNode} from 'react';
import {useLocale} from 'next-intl';
import {localLink, demoPath,localizeMarkup} from './links';

interface Props {
  html: string;
  route: string;
  basePath: string;
  articleId?: number;
  copy: Record<string,string>;
  children?: ReactNode;
}
interface Runtime {
  mountRedesign: (root: HTMLElement, context: Record<string,unknown>) => void;
}

const StaticMarkup=memo(forwardRef<HTMLDivElement,{html:string;locale:string}>(function StaticMarkup({html,locale},ref){
  return <div ref={ref} className="redesign-site" data-locale={locale} dangerouslySetInnerHTML={{__html:html}}/>;
}));

const ShellMarkup=memo(function ShellMarkup({html}:{html:string}){
  return <div dangerouslySetInnerHTML={{__html:html}}/>;
});

export default function RedesignClient({html, route, basePath, articleId, copy, children}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [languageSlot,setLanguageSlot] = useState<Element|null>(null);
  const nativeShell = children !== undefined;
  useEffect(() => {
    const controller = new AbortController();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const frames = new Set<number>();
    const mediaCleanups: Array<() => void> = [];
    let observer: MutationObserver | undefined;
    const node = root.current;
    if (!node) return;
    const signal = controller.signal;
    setLanguageSlot(node.querySelector('#redesign-language-switcher'));
    const listen = (target: EventTarget, type: string, callback: EventListener, options: AddEventListenerOptions | boolean = {}) =>
      target.addEventListener(type, callback, {...(typeof options === 'boolean' ? {capture:options} : options), signal});
    const scopedDocument = new Proxy(document, {
      set(target, property, value) { return Reflect.set(target,property,value,target); },
      get(target, property) {
        if (property === 'addEventListener') return (type: string, callback: EventListener, options?: AddEventListenerOptions) => listen(target,type,callback,options);
        if (property === 'querySelector') return (selector: string) => node.querySelector(selector);
        if (property === 'querySelectorAll') return (selector: string) => node.querySelectorAll(selector);
        if (property === 'getElementById') return (id: string) => node.querySelector('#' + CSS.escape(id));
        const value = Reflect.get(target,property,target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    const scopedWindow = new Proxy(window, {
      get(target, property) {
        if (property === 'addEventListener') return (type: string, callback: EventListener, options?: AddEventListenerOptions) => listen(target,type,callback,options);
        const value = Reflect.get(target,property,target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    const media = (query: string) => {
      const result = window.matchMedia(query);
      return new Proxy(result,{get(target,property) {
        if(property==='addEventListener')return (type:string,callback:EventListener)=>{
          target.addEventListener(type,callback);mediaCleanups.push(()=>target.removeEventListener(type,callback));
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }});
    };
    const locationBridge = {
      get hash() { return '#' + demoPath(window.location.pathname,basePath) + window.location.search; },
      set hash(value: string) { window.location.assign(localLink('#' + value.replace(/^#/,''),basePath)); },
    };
    const normalizeLinks = () => node.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => {
      const original = anchor.getAttribute('href') || '';
      const href = localLink(original,basePath);
      if (original !== href) {
        anchor.setAttribute('href',href);
        if (href.startsWith('/')) anchor.removeAttribute('target');
      }
    });
    const applyInitialTheme = () => {
      let saved: string | null = null;
      try { saved=localStorage.getItem('dynamia-demo-theme'); } catch {}
      const dark=saved==='dark'||(saved!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme=dark?'dark':'light';
      document.documentElement.classList.toggle('dark',dark);
    };
    applyInitialTheme();
    listen(node,'click',((event: MouseEvent) => {
      if ((event.target as Element).closest('.top-btn')) window.scrollTo({top:0,behavior:'smooth'});
      const anchor=(event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (anchor) normalizeLinks();
      if ((event.target as Element).closest('.theme-toggle')) queueMicrotask(()=>
        document.documentElement.classList.toggle('dark',document.documentElement.dataset.theme==='dark'));
    }) as EventListener);
    async function initialize() {
      const runtimeUrl = '/redesign/runtime.js';
      const [module, dataResponse, article, catalog] = await Promise.all([
        import(/* webpackIgnore: true */ runtimeUrl) as Promise<Runtime>,
        fetch('/redesign/site-data.json',{signal}).then(r=>{if(!r.ok)throw new Error('Content unavailable');return r.json();}),
        articleId === undefined ? Promise.resolve({}) : fetch(`/redesign/articles/${articleId}.json`,{signal}).then(r=>r.json()).then(data=>({[articleId!]:data})),
        locale === 'zh' ? Promise.resolve(undefined) : fetch(`/redesign/locales/${locale}.json`,{signal}).then(r=>{if(!r.ok)throw new Error('Locale unavailable');return r.json() as Promise<LocaleCatalog>}),
      ]);
      if (signal.aborted) return;
      const localizer=makeLocalizer(catalog,document);
      module.mountRedesign(node!, {
        overseasAbout:catalog?.about,translateText:localizer.translate,
        document:scopedDocument,window:scopedWindow,location:locationBridge,localStorage,navigator,
        nativeShell,
        normalizeHTML:(value:string)=>localizeMarkup(localizer.markup(value),basePath),
        prepareDownload:async (value:string)=>{
          const file=new DOMParser().parseFromString(localizer.markup(value),'text/html');
          file.documentElement.lang=locale;
          const images=Array.from(file.querySelectorAll<HTMLImageElement>('img[src]'));
          const encoded=new Map<string,Promise<string>>();
          for(const image of images) {
            const src=image.getAttribute('src')!;
            if(src.startsWith('data:'))continue;
            if(!encoded.has(src))encoded.set(src,fetch(src,{signal}).then(async response=>{
              if(!response.ok)throw new Error('Download image unavailable');
              const blob=await response.blob();
              return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob)});
            }));
          }
          await Promise.all(images.map(async image=>{
            const src=image.getAttribute('src')!;
            if(encoded.has(src))image.src=await encoded.get(src)!;
          }));
          return '<!doctype html>'+file.documentElement.outerHTML;
        },
        matchMedia:media,data:{...dataResponse,ARTICLE_DETAILS:article},text:(key: string)=>copy[key],
        requestAnimationFrame:(callback:FrameRequestCallback)=>{const id=window.requestAnimationFrame(time=>{frames.delete(id);callback(time)});frames.add(id);return id;},
        cancelAnimationFrame:window.cancelAnimationFrame.bind(window),
        setTimeout:(callback:TimerHandler,delay?:number)=>{const id=window.setTimeout(callback,delay);timers.add(id as unknown as ReturnType<typeof setTimeout>);return id;},
        clearTimeout:window.clearTimeout.bind(window),Blob,FormData,URL,URLSearchParams,
      });
      normalizeLinks();
      observer=new MutationObserver(normalizeLinks);observer.observe(node!,{childList:true,subtree:true});
      node!.dataset.ready='true';
      if (node!.querySelector('[data-github-stars]')) {
        let busy = false;
        let hasCount = false;
        const updateStars = async () => {
          if (busy || signal.aborted || document.hidden) return;
          busy = true;
          try {
            const response = await fetch('/api/github/hami', {signal, cache:'no-store'});
            if (!response.ok) throw new Error('Star count unavailable');
            const stats = await response.json();
            if (!Number.isSafeInteger(stats.stars) || stats.stars < 0) throw new Error('Invalid star count');
            if (signal.aborted) return;
            const value = new Intl.NumberFormat('en-US').format(stats.stars);
            node!.querySelectorAll<HTMLElement>('[data-github-stars]').forEach(el => {
              if (el.textContent !== value) el.textContent = value;
              el.title = localizer.translate(copy[stats.stale ? 'githubStars.cached' : 'githubStars.live']);
            });
            hasCount = true;
            node!.querySelector('.star-proof')?.setAttribute('title',localizer.translate(copy[stats.stale ? 'githubStars.cached' : 'githubStars.live']));
          } catch {
            if (!signal.aborted) node!.querySelector('.star-proof')?.setAttribute('title',localizer.translate(copy[hasCount ? 'githubStars.cached' : 'githubStars.unavailable']));
          } finally { busy = false; }
        };
        void updateStars();
        const interval = window.setInterval(() => { void updateStars(); }, 5 * 60 * 1000);
        mediaCleanups.push(() => window.clearInterval(interval));
        listen(document,'visibilitychange',() => { if (!document.hidden) void updateStars(); });
      }

      if (node!.querySelector('[data-container-pulls]')) {
        let busy = false;
        let lastUpdated = '';
        const statusText = (cached: boolean) => locale === 'zh' ? (cached ? '最近成功同步的数据' : '已与 Docker Hub 同步') : locale === 'de' ? (cached ? 'Zuletzt erfolgreich synchronisierter Stand' : 'Mit Docker Hub synchronisiert') : (cached ? 'Last successfully synced count' : 'Synced with Docker Hub');
        const updatePulls = async () => {
          if (busy || signal.aborted || document.hidden) return;
          busy = true;
          try {
            const response = await fetch('/api/community/hami', {signal, cache:'no-store'});
            if (!response.ok) throw new Error('Pull count unavailable');
            const stats = await response.json();
            if (!Number.isSafeInteger(stats.pulls) || stats.pulls < 0) throw new Error('Invalid pull count');
            if (signal.aborted) return;
            lastUpdated = new Date(stats.fetchedAt).toLocaleString(locale);
            const value = `${new Intl.NumberFormat('en-US').format(Math.floor(stats.pulls / 1000))}K`;
            node!.querySelectorAll<HTMLElement>('[data-container-pulls]').forEach(el => {
              el.textContent = value;
              el.title = `${new Intl.NumberFormat(locale).format(stats.pulls)} · ${statusText(stats.stale)} · ${lastUpdated}`;
            });
          } catch {
            if (!signal.aborted) node!.querySelectorAll<HTMLElement>('[data-container-pulls]').forEach(el => {
              el.title = lastUpdated ? `${statusText(true)} · ${lastUpdated}` : (locale === 'zh' ? '暂时无法获取，稍后自动重试' : locale === 'de' ? 'Vorübergehend nicht verfügbar. Automatischer Wiederholungsversuch.' : 'Temporarily unavailable. Retrying automatically.');
            });
          } finally { busy = false; }
        };
        void updatePulls();
        const interval = window.setInterval(() => { void updatePulls(); }, 60_000);
        mediaCleanups.push(() => window.clearInterval(interval));
        listen(document,'visibilitychange',() => { if (!document.hidden) void updatePulls(); });
      }

      // Preserve legacy demo deep links when opened on the native site.
      if (window.location.hash.startsWith('#/')) window.location.replace(localLink(window.location.hash,basePath));
    }
    initialize().catch(error=>{
      if (!signal.aborted) {
        console.error('Website interaction initialization failed',error);
        node.dataset.ready='error';
      }
    });
    return () => {
      controller.abort();observer?.disconnect();mediaCleanups.forEach(cleanup=>cleanup());
      timers.forEach(clearTimeout);frames.forEach(cancelAnimationFrame);
    };
  }, [route, articleId, basePath, copy, locale, nativeShell]);
  if (nativeShell) {
    const [before,after] = html.split('<main id="app"></main>');
    return <><div ref={root} className="redesign-site" data-locale={locale}>
      <ShellMarkup html={before} />
      <main id="app" className="native-content">{children}</main>
      <ShellMarkup html={after} />
    </div>{languageSlot && createPortal(<LanguageSwitcher/>,languageSlot)}</>;
  }
  return <><StaticMarkup ref={root} html={html} locale={locale} />{languageSlot && createPortal(<LanguageSwitcher/>,languageSlot)}</>;
}
