import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function ResourcesPage() {
  const t = await getTranslations('sitePages.resources');
  const locale = await getLocale();
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href={localizedPath(websitePath("/"), locale)}>{t('crumb.home')}</a>
            <span>{t('ui.slash')}</span>
            <span>{t('crumb.current')}</span>
          </div>
          <div className="">
            <div>
              <div className="eyebrow">{t('crumb.current')}</div>
              <h1>{t('hero.title')}</h1>
              <p className="lead">{t('hero.lead')}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="grid3">
            <a className="resource-card" href={localizedPath(websitePath("/blog"), locale)}>
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v17h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3z M12 5v16"></path></svg></span>
              <div>
                <strong>{t('cards.blog.title')}</strong>
                <small>{t('cards.blog.body')}</small>
              </div>
              <span className="arrow">{t('ui.externalArrow')}</span>
            </a>
            <a className="resource-card" href={localizedPath(websitePath("/videos"), locale)}>
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z"></path></svg></span>
              <div>
                <strong>{t('cards.videos.title')}</strong>
                <small>{t('cards.videos.body')}</small>
              </div>
              <span className="arrow">{t('ui.externalArrow')}</span>
            </a>
            <a className="resource-card" href={localizedPath(websitePath("/tools"), locale)}>
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7"></path></svg></span>
              <div>
                <strong>{t('cards.tools.title')}</strong>
                <small>{t('cards.tools.body')}</small>
              </div>
              <span className="arrow">{t('ui.externalArrow')}</span>
            </a>
          </div>
        </div>
      </section>
      <section className="section tinted">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('tools.eyebrow')}</div>
              <h2>{t('tools.title')}</h2>
            </div>
          </div>
          <div className="grid2 tool-cards">
            <a className="feature-card" href={localizedPath(websitePath('/tools/hami-metrics-explorer'), locale)}>
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7"></path></svg></span>
              <h3>{t('tools.metrics.title')}</h3>
              <p>{t('tools.metrics.body')}</p>
              <span className="textlink">{t('tools.open')}</span>
            </a>
            <a className="feature-card" href={localizedPath(websitePath('/tools/hami-roi-calculator'), locale)}>
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M6 6h12v12H6z M9 9h6v6H9z M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"></path></svg></span>
              <h3>{t('tools.roi.title')}</h3>
              <p>{t('tools.roi.body')}</p>
              <span className="textlink">{t('tools.open')}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
