import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountRedesign} from '../../public/redesign/runtime.js';
import {makeLocalizer} from '../../public/redesign/localization.js';

const data=JSON.parse(fs.readFileSync('src/content/redesign/site.json','utf8'));
const {ARTICLE_DETAILS,...siteCatalog}=data;
fs.writeFileSync('public/redesign/site-data.json',JSON.stringify(siteCatalog));
for (const [id,article] of Object.entries(ARTICLE_DETAILS)) fs.writeFileSync(`public/redesign/articles/${id}.json`,JSON.stringify(article));
const copy=JSON.parse(fs.readFileSync('dictionary/redesign/zh.json','utf8'));
const shell=fs.readFileSync('src/redesign/shell.html','utf8');
const routes=['/','/products','/enterprise','/platform','/pricing','/cases','/get-practices','/resources','/videos','/tools','/contact-sales','/compatibility','/community','/about','/careers','/events','/blog',
  ...data.CONTENT_DATA.posts.map(p=>'/blog/'+p.url.split('/').filter(Boolean).pop()),
  ...data.CASE_LIBRARY.map(c=>'/cases/'+c.slug),'/videos/product-overview','/videos/gpu-oversell'];
const manifests={};
const locales=['zh','en','de'];
let activeLocale='zh';
const suffix=()=>activeLocale==='zh'?'':`/${activeLocale}`;
const pageRoot='src/content/redesign/pages';
fs.mkdirSync(pageRoot,{recursive:true});
fs.mkdirSync('dictionary/redesign/pages',{recursive:true});

function saveFragment(html,name) {
  const fragment=JSDOM.fragment(html),texts={};
  const save=value=>{
    const key='s'+crypto.createHash('sha256').update(value).digest('hex').slice(0,14);
    texts[key]=value;return `__COPY_${key}__`;
  };
  function walk(node) {
    if(node.nodeType===3 && node.textContent.trim()) node.textContent=save(node.textContent);
    if(node.nodeType===1) {
      for(const attr of [...node.attributes]) {
        if(attr.name.startsWith('on')) node.removeAttribute(attr.name);
        if(['alt','title','placeholder','aria-label'].includes(attr.name)&&attr.value)node.setAttribute(attr.name,save(attr.value));
      }
    }
    for(const child of [...node.childNodes]) walk(child);
  }
  walk(fragment);
  const holder=fragment.ownerDocument.createElement('div');holder.append(fragment);
  fs.writeFileSync(`${pageRoot}${suffix()}/${name}.html`,holder.innerHTML);
  fs.writeFileSync(`dictionary/redesign/pages${suffix()}/${name}.json`,JSON.stringify(texts));
}

for(const locale of locales) {
activeLocale=locale;
const catalogPath=`dictionary/redesign/locales/${locale}.json`;
if(locale!=='zh'&&!fs.existsSync(catalogPath))continue;
const catalog=locale==='zh'?undefined:JSON.parse(fs.readFileSync(catalogPath,'utf8'));
if(catalog) {
  fs.mkdirSync('public/redesign/locales',{recursive:true});
  fs.copyFileSync(catalogPath,`public/redesign/locales/${locale}.json`);
}
fs.mkdirSync(`${pageRoot}${suffix()}`,{recursive:true});
fs.mkdirSync(`dictionary/redesign/pages${suffix()}`,{recursive:true});
for(const route of routes) {
  const dom=new JSDOM(`<!doctype html><html><body>${shell}</body></html>`,{url:'http://localhost/#'+route,pretendToBeVisual:true});
  const w=dom.window;
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
  const noop=()=>{};
  const matchMedia=()=>({matches:false,addEventListener:noop,removeEventListener:noop});
  w.matchMedia=matchMedia;
  const localizer=makeLocalizer(catalog,w.document);
  mountRedesign(w.document.body,{
    normalizeHTML:localizer.markup,translateText:localizer.translate,overseasAbout:catalog?.about,
    data,text:key=>copy[key],document:w.document,window:w,location:w.location,localStorage:w.localStorage,navigator:w.navigator,
    matchMedia,requestAnimationFrame:()=>0,cancelAnimationFrame:noop,setTimeout:()=>0,clearTimeout:noop,
    Blob:w.Blob,FormData:w.FormData,URL:w.URL,URLSearchParams:w.URLSearchParams,
  });
  const name=route==='/'?'home':route.slice(1).replaceAll('/','--');
  const app=w.document.querySelector('#app');
  saveFragment(app.innerHTML,name);
  if(locale==='zh')manifests[route]={name,title:app.querySelector('h1')?.textContent||'密瓜智能',
    articleId: route.startsWith('/blog/')?data.CONTENT_DATA.posts.find(p=>p.url.endsWith(route))?.id:undefined};
  dom.window.close();
}
const shellDom=new JSDOM('');
const shellLocalizer=makeLocalizer(catalog,shellDom.window.document);
saveFragment(shellLocalizer.markup(shell),'shell');
const shellSource=JSON.parse(fs.readFileSync('dictionary/redesign/pages/shell.json','utf8'));
fs.mkdirSync('dictionary/redesign/native-shell',{recursive:true});
fs.writeFileSync(`dictionary/redesign/native-shell/${locale}.json`,JSON.stringify(Object.fromEntries(Object.entries(shellSource).map(([key,value])=>[key,shellLocalizer.translate(value)]))));
shellDom.window.close();
}
activeLocale='zh';
fs.writeFileSync('src/content/redesign/chrome.json',JSON.stringify({html:fs.readFileSync(`${pageRoot}/shell.html`,'utf8')}));
fs.writeFileSync('src/content/redesign/manifest.json',JSON.stringify(manifests,null,2));
console.log(`Generated ${routes.length} server-rendered pages from the approved demo.`);
