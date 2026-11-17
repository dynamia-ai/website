'use client';
import {useEffect,useRef,useState} from 'react';
import {useTranslations} from 'next-intl';

export default function ArticleImageViewer() {
  const t=useTranslations('imageViewer');
  const dialog=useRef<HTMLDialogElement>(null);
  const previous=useRef<HTMLElement|null>(null);
  const [image,setImage]=useState<{src:string;alt:string}|null>(null);
  const [zoom,setZoom]=useState(1);
  useEffect(()=>{
    const selector='.blog-detail .article-prose img';
    const prepare=()=>document.querySelectorAll<HTMLImageElement>(selector).forEach(img=>{
      img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`${t('title')}${img.alt ? ': '+img.alt : ''}`);
    });
    prepare();
    const observer=new MutationObserver(prepare);
    observer.observe(document.body,{childList:true,subtree:true});
    const open=(event:Event)=>{
      if(!(event.target instanceof HTMLImageElement)||!event.target.matches(selector))return;
      if(event instanceof KeyboardEvent&&!['Enter',' '].includes(event.key))return;
      event.preventDefault();previous.current=event.target;
      setZoom(1);setImage({src:event.target.currentSrc||event.target.src,alt:event.target.alt});
      dialog.current?.showModal();
    };
    document.addEventListener('click',open);document.addEventListener('keydown',open);
    return()=>{observer.disconnect();document.removeEventListener('click',open);document.removeEventListener('keydown',open);};
  },[t]);
  return <dialog className="article-image-dialog" ref={dialog} aria-label={t('title')}
    onClose={()=>previous.current?.focus()} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}
    onKeyDown={e=>{if(e.key==='+')setZoom(v=>Math.min(3,v+.25));if(e.key==='-')setZoom(v=>Math.max(1,v-.25));}}>
    <div className="image-viewer-toolbar"><span>{image?.alt||t('title')}</span><button type="button" onClick={()=>setZoom(v=>Math.max(1,v-.25))} disabled={zoom===1} aria-label={t('zoomOut')}>−</button><button type="button" onClick={()=>setZoom(1)}>{t('reset')}</button><button type="button" onClick={()=>setZoom(v=>Math.min(3,v+.25))} disabled={zoom===3} aria-label={t('zoomIn')}>+</button><button type="button" onClick={()=>dialog.current?.close()} aria-label={t('close')}>×</button></div>
    <div className="image-viewer-scroll">{/* eslint-disable-next-line @next/next/no-img-element */}
      {image&&<img src={image.src} alt={image.alt} style={zoom===1?{}:{width:`${zoom*100}%`,maxWidth:'none',maxHeight:'none'}}/>}
    </div>
  </dialog>;
}
