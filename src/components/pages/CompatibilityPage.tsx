import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function CompatibilityPage() {
  const t = await getTranslations('sitePages.compatibility');
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
              <h1>
                {t('hero.titleLine1')}
                <br />
                {t('hero.titleLine2')}
              </h1>
              <p className="lead">{t('hero.lead')}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="compat">
            <div>
              <div className="eyebrow">{t('stack.eyebrow')}</div>
              <h2>{t('stack.title')}</h2>
              <p>{t('stack.body')}</p>
              <div className="actions">
                <a className="textlink" href={localizedPath(websitePath("/contact-sales"), locale)}>
                  {t('stack.cta')}
                  <span className="arrow">{t('ui.arrow')}</span>
                </a>
              </div>
            </div>
            <div className="ecosystem">
              <div className="eco-label">{t('diagram.apps.title')}</div>
              <div className="eco-layer">
                <span>{t('diagram.apps.ai')}</span>
                <span>{t('diagram.apps.inference')}</span>
                <span>{t('diagram.apps.dev')}</span>
              </div>
              <div className="eco-core">{t('diagram.dynamia')}</div>
              <div className="eco-connector"></div>
              <div className="eco-layer" style={{margin: '0'}}><span>{t('diagram.k8s')}</span></div>
              <div className="eco-connector"></div>
              <div className="eco-hardware">
                <span>{t('diagram.devices.nvidia')}</span>
                <span>{t('diagram.devices.ascend')}</span>
                <span>{t('diagram.devices.hygon')}</span>
                <span>{t('diagram.devices.cambricon')}</span>
                <span>{t('diagram.devices.mooreThreads')}</span>
                <span>{t('diagram.devices.other')}</span>
              </div>
              <div className="eco-note">{t('diagram.note')}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="section tinted">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('capabilities.eyebrow')}</div>
              <h2>{t('capabilities.title')}</h2>
            </div>
          </div>
          <div className="grid4">
            <div className="feature-card">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M9 3h6v6H9z M3 15h6v6H3z M15 15h6v6h-6z M12 9v3 M6 15v-3h12v3"></path></svg></span>
              <h3>{t('capabilities.items.resource.title')}</h3>
              <p>{t('capabilities.items.resource.body')}</p>
            </div>
            <div className="feature-card">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M6 6h12v12H6z M9 9h6v6H9z M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"></path></svg></span>
              <h3>{t('capabilities.items.sharing.title')}</h3>
              <p>{t('capabilities.items.sharing.body')}</p>
            </div>
            <div className="feature-card">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7"></path></svg></span>
              <h3>{t('capabilities.items.observe.title')}</h3>
              <p>{t('capabilities.items.observe.body')}</p>
            </div>
            <div className="feature-card">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5"></path></svg></span>
              <h3>{t('capabilities.items.enterprise.title')}</h3>
              <p>{t('capabilities.items.enterprise.body')}</p>
            </div>
          </div>
          <div className="page-callout">{t('capabilities.note')}</div>
          <div className="final-cta">
            <div>
              <h3>{t('cta.title')}</h3>
              <p>{t('cta.body')}</p>
            </div>
            <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>{t('cta.button')}</a>
          </div>
        </div>
      </section>
    </>
  );
}
