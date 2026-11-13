import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function PlatformPage() {
  const t = await getTranslations('sitePages.platform');
  const locale = await getLocale();
  const linkArrow = (
    <span className="link-arrow" aria-hidden={true}>
      <svg viewBox="0 0 16 16"><path d="M4.5 11.5 11.5 4.5M7 4.5h4.5V9" /></svg>
    </span>
  );
  const btnArrow = (
    <span className="btn-arrow" aria-hidden={true}>
      <svg viewBox="0 0 16 16"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" /></svg>
    </span>
  );
  return (
    <>
      <div className="product-switch">
        <div className="wrap">
          <a href={localizedPath(websitePath("/products"), locale)}>{t('nav.allProducts')}</a>
          <a href={localizedPath(websitePath("/enterprise"), locale)} className="">{t('nav.enterprise')}</a>
          <a href={localizedPath(websitePath("/platform"), locale)} className="active">{t('nav.platform')}</a>
          <a href={localizedPath(websitePath("/contact-sales"), locale)}>{t('nav.contactSales')}</a>
        </div>
      </div>
      <section className="product-hero">
        <div className="wrap">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')}
          </h1>
          <p className="lead">{t('hero.lead')}</p>
          <div className="actions">
            <a className="btn primary" href={localizedPath(websitePath("/contact-sales?product=platform"), locale)}>
              {t('hero.contactSales')}
              {btnArrow}
            </a>
            <a className="btn" href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer">{t('hero.docs')}</a>
          </div>
          <div className="product-banner">
            <div className="product-banner-head">
              <b>{t('architecture.bannerTitle')}</b>
              <span>{t('architecture.bannerLabel')}</span>
            </div>
            <div className="product-layers">
              <div className="product-layer green">
                <strong>{t('architecture.layerConsole.title')}</strong>
                <span>{t('architecture.layerConsole.hint')}</span>
              </div>
              <div className="product-layer">
                <strong>{t('architecture.layerWorkloads.title')}</strong>
                <span>{t('architecture.layerWorkloads.hint')}</span>
              </div>
              <div className="product-layer core">
                <strong>{t('architecture.layerEnterprise.title')}</strong>
                <span>{t('architecture.layerEnterprise.hint')}</span>
              </div>
              <div className="product-layer">
                <strong>{t('architecture.layerInfra.title')}</strong>
                <span>{t('architecture.layerInfra.hint')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="subnav">
        <div className="wrap">
          <a href={localizedPath(websitePath("/platform?section=product-value"), locale)}>{t('toc.capabilities')}</a>
          <a href={localizedPath(websitePath("/platform?section=product-workflow"), locale)}>{t('toc.howItWorks')}</a>
          <a href={localizedPath(websitePath("/platform?section=delivery"), locale)}>{t('toc.deployment')}</a>
          <a href={localizedPath(websitePath("/platform?section=product-faq"), locale)}>{t('toc.faq')}</a>
        </div>
      </div>
      <section className="section " id="product-value">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('capabilities.eyebrow')}</div>
              <h2>{t('capabilities.title')}</h2>
              <p>{t('capabilities.description')}</p>
            </div>
          </div>
          <div className="product-benefits">
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z"></path></svg></span>
              <h3>{t('capabilities.items.multiCluster.title')}</h3>
              <p>{t('capabilities.items.multiCluster.body')}</p>
              <span className="tag">{t('capabilities.items.multiCluster.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.multiCluster.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6 M20 21v-2a4 4 0 0 0-2-3.5"></path></svg></span>
              <h3>{t('capabilities.items.pools.title')}</h3>
              <p>{t('capabilities.items.pools.body')}</p>
              <span className="tag">{t('capabilities.items.pools.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.pools.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5"></path></svg></span>
              <h3>{t('capabilities.items.workloads.title')}</h3>
              <p>{t('capabilities.items.workloads.body')}</p>
              <span className="tag">{t('capabilities.items.workloads.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.workloads.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7"></path></svg></span>
              <h3>{t('capabilities.items.monitoring.title')}</h3>
              <p>{t('capabilities.items.monitoring.body')}</p>
              <span className="tag">{t('capabilities.items.monitoring.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.monitoring.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v17h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3z M12 5v16"></path></svg></span>
              <h3>{t('capabilities.items.metering.title')}</h3>
              <p>{t('capabilities.items.metering.body')}</p>
              <span className="tag">{t('capabilities.items.metering.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.metering.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m8 6-6 6 6 6 m8-12 6 6-6 6 M14 3l-4 18"></path></svg></span>
              <h3>{t('capabilities.items.console.title')}</h3>
              <p>{t('capabilities.items.console.body')}</p>
              <span className="tag">{t('capabilities.items.console.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.console.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="section tinted" id="product-workflow">
        <div className="wrap">
          <div className="product-story">
            <div>
              <div className="eyebrow">{t('workflow.eyebrow')}</div>
              <h2>
                {t('workflow.steps.manage')}
                <br />
                {t('workflow.steps.execute')}
                <br />
                {t('workflow.steps.observe')}
              </h2>
              <p>{t('workflow.description')}</p>
              <ul>
                <li>{t('workflow.bullets.organize')}</li>
                <li>{t('workflow.bullets.buildOn')}</li>
                <li>{t('workflow.bullets.metering')}</li>
              </ul>
            </div>
            <div className="why-visual">
              <div className="workflow-arch">
                <div className="workflow-arch-layer">
                  <strong>{t('workflow.layers.manage.title')}</strong>
                  <span>{t('workflow.layers.manage.hint')}</span>
                </div>
                <div className="workflow-arch-arrow" aria-hidden={true} />
                <div className="workflow-arch-layer workflow-arch-core">
                  <strong>{t('workflow.layers.execute.title')}</strong>
                  <span className="workflow-arch-meta">{t('workflow.layers.execute.meta')}</span>
                  <span>{t('workflow.layers.execute.hint')}</span>
                </div>
                <div className="workflow-arch-arrow" aria-hidden={true} />
                <div className="workflow-arch-layer">
                  <strong>{t('workflow.layers.observe.title')}</strong>
                  <span className="workflow-arch-meta">{t('workflow.layers.observe.meta')}</span>
                  <span>{t('workflow.layers.observe.hint')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section " id="delivery">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('delivery.eyebrow')}</div>
              <h2>{t('delivery.title')}</h2>
              <p>{t('delivery.description')}</p>
            </div>
          </div>
          <div className="process-board">
            <div className="process-step">
              <b>{t('delivery.steps.confirm.num')}</b>
              <h3>{t('delivery.steps.confirm.title')}</h3>
              <p>{t('delivery.steps.confirm.body')}</p>
              <div className="process-step-links">
                <a className="textlink" href={localizedPath(websitePath("/compatibility"), locale)}>
                  {t('delivery.compatibilityLink')}
                  {linkArrow}
                </a>
              </div>
            </div>
            <div className="process-step">
              <b>{t('delivery.steps.validate.num')}</b>
              <h3>{t('delivery.steps.validate.title')}</h3>
              <p>{t('delivery.steps.validate.body')}</p>
              <div className="process-step-links">
                <a className="textlink" href={localizedPath(websitePath("/contact-sales"), locale)}>
                  {t('delivery.validationLink')}
                  {linkArrow}
                </a>
              </div>
            </div>
            <div className="process-step">
              <b>{t('delivery.steps.deploy.num')}</b>
              <h3>{t('delivery.steps.deploy.title')}</h3>
              <p>{t('delivery.steps.deploy.body')}</p>
              <div className="process-step-links">
                <a className="textlink" href={t('delivery.steps.deploy.onlineHref')} target="_blank" rel="noopener noreferrer">
                  {t('delivery.steps.deploy.onlineLabel')}
                  {linkArrow}
                </a>
                <a className="textlink" href={t('delivery.steps.deploy.offlineHref')} target="_blank" rel="noopener noreferrer">
                  {t('delivery.steps.deploy.offlineLabel')}
                  {linkArrow}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section tinted" id="product-faq">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('faq.eyebrow')}</div>
              <h2>{t('faq.title')}</h2>
            </div>
          </div>
          <div className="faq">
            <details>
              <summary>{t('faq.items.enterpriseIncluded.q')}</summary>
              <p>{t('faq.items.enterpriseIncluded.a')}</p>
            </details>
            <details>
              <summary>{t('faq.items.meteringVsMonitoring.q')}</summary>
              <p>{t('faq.items.meteringVsMonitoring.a')}</p>
            </details>
          </div>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="sales-closing">
            <div className="eyebrow">{t('cta.eyebrow')}</div>
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.description')}</p>
            <div className="actions">
              <a className="btn primary" href={localizedPath(websitePath("/contact-sales?product=platform"), locale)}>
                {t('hero.contactSales')}
                {btnArrow}
              </a>
              <a className="btn" href={localizedPath(websitePath("/products"), locale)}>{t('cta.back')}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
