import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function EnterprisePage() {
  const t = await getTranslations('sitePages.enterprise');
  const locale = await getLocale();
  return (
    <>
      <div className="product-switch">
        <div className="wrap">
          <a href={localizedPath(websitePath("/products"), locale)}>{t('nav.allProducts')}</a>
          <a href={localizedPath(websitePath("/enterprise"), locale)} className="active">{t('nav.enterprise')}</a>
          <a href={localizedPath(websitePath("/platform"), locale)} className="">{t('nav.platform')}</a>
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
            <a className="btn primary" href={localizedPath(websitePath("/contact-sales?product=enterprise"), locale)}>
              {t('hero.contactSales')}
              <span className="arrow">{t('ui.arrow')}</span>
            </a>
            <a className="btn" href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer">{t('hero.docs')}</a>
          </div>
          <div className="product-banner">
            <div className="product-banner-head">
              <b>{t('architecture.bannerTitle')}</b>
              <span>{t('architecture.bannerLabel')}</span>
            </div>
            <div className="product-layers">
              <div className="product-layer">
                <strong>{t('architecture.layerApp.title')}</strong>
                <span>{t('architecture.layerApp.hint')}</span>
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
      <div className="product-integrations">
        <span>{t('architecture.fitLabel')}</span>
        <img data-brand="kubernetes" src="/redesign/assets/402dd0ce3de067d46771.png" alt={t('architecture.logos.kubernetes')} />
        <img data-brand="prometheus" src="/redesign/assets/d9b9cea796c2b1cc4305.png" alt={t('architecture.logos.prometheus')} />
        <span>{t('architecture.cloudLabel')}</span>
      </div>
      <div className="subnav">
        <div className="wrap">
          <a href={localizedPath(websitePath("/enterprise?section=product-value"), locale)}>{t('toc.capabilities')}</a>
          <a href={localizedPath(websitePath("/enterprise?section=product-workflow"), locale)}>{t('toc.howItWorks')}</a>
          <a href={localizedPath(websitePath("/enterprise?section=delivery"), locale)}>{t('toc.deployment')}</a>
          <a href={localizedPath(websitePath("/enterprise?section=product-faq"), locale)}>{t('toc.faq')}</a>
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
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M6 6h12v12H6z M9 9h6v6H9z M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"></path></svg></span>
              <h3>{t('capabilities.items.sharing.title')}</h3>
              <p>{t('capabilities.items.sharing.body')}</p>
              <span className="tag">{t('capabilities.items.sharing.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.sharing.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M9 3h6v6H9z M3 15h6v6H3z M15 15h6v6h-6z M12 9v3 M6 15v-3h12v3"></path></svg></span>
              <h3>{t('capabilities.items.scheduling.title')}</h3>
              <p>{t('capabilities.items.scheduling.body')}</p>
              <span className="tag">{t('capabilities.items.scheduling.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.scheduling.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5"></path></svg></span>
              <h3>{t('capabilities.items.oversubscription.title')}</h3>
              <p>{t('capabilities.items.oversubscription.body')}</p>
              <span className="tag">{t('capabilities.items.oversubscription.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.oversubscription.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7"></path></svg></span>
              <h3>{t('capabilities.items.turbo.title')}</h3>
              <p>{t('capabilities.items.turbo.body')}</p>
              <span className="tag">{t('capabilities.items.turbo.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.turbo.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-5"></path></svg></span>
              <h3>{t('capabilities.items.mig.title')}</h3>
              <p>{t('capabilities.items.mig.body')}</p>
              <span className="tag">{t('capabilities.items.mig.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.mig.videoAria')}>
                  {t('capabilities.viewAll')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </a>
              </div>
            </article>
            <article className="product-feature">
              <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6 M20 21v-2a4 4 0 0 0-2-3.5"></path></svg></span>
              <h3>{t('capabilities.items.priority.title')}</h3>
              <p>{t('capabilities.items.priority.body')}</p>
              <span className="tag">{t('capabilities.items.priority.tag')}</span>
              <div className="product-feature-action">
                <a className="btn" href={localizedPath(websitePath("/videos"), locale)} aria-label={t('capabilities.items.priority.videoAria')}>
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
                {t('workflow.steps.request')}
                <br />
                {t('workflow.steps.schedule')}
                <br />
                {t('workflow.steps.enforce')}
              </h2>
              <p>{t('workflow.description')}</p>
              <ul>
                <li>{t('workflow.bullets.keepEntry')}</li>
                <li>{t('workflow.bullets.chooseMode')}</li>
                <li>{t('workflow.bullets.validate')}</li>
              </ul>
            </div>
            <div className="why-visual">
              <div className="flow-cards">
                <div>
                  {t('workflow.strategies.binpack.name')}
                  <b>{t('workflow.strategies.binpack.verb')}</b>
                  <small>{t('workflow.strategies.binpack.hint')}</small>
                </div>
                <div>
                  {t('workflow.strategies.spread.name')}
                  <b>{t('workflow.strategies.spread.verb')}</b>
                  <small>{t('workflow.strategies.spread.hint')}</small>
                </div>
                <div>
                  {t('workflow.strategies.topology.name')}
                  <b>{t('workflow.strategies.topology.verb')}</b>
                  <small>{t('workflow.strategies.topology.hint')}</small>
                </div>
              </div>
              <p className="tiny center">{t('workflow.note')}</p>
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
          <div className="process-steps">
            <div className="process-step">
              <b>{t('delivery.steps.confirm.num')}</b>
              <h3>{t('delivery.steps.confirm.title')}</h3>
              <p>{t('delivery.steps.confirm.body')}</p>
            </div>
            <div className="process-step">
              <b>{t('delivery.steps.validate.num')}</b>
              <h3>{t('delivery.steps.validate.title')}</h3>
              <p>{t('delivery.steps.validate.body')}</p>
            </div>
            <div className="process-step">
              <b>{t('delivery.steps.deploy.num')}</b>
              <h3>{t('delivery.steps.deploy.title')}</h3>
              <p>{t('delivery.steps.deploy.body')}</p>
            </div>
          </div>
          <div className="actions">
            <a className="textlink" href={localizedPath(websitePath("/compatibility"), locale)}>
              {t('delivery.compatibilityLink')}
              <span className="arrow">{t('ui.arrow')}</span>
            </a>
            <a className="textlink" href={localizedPath(websitePath("/contact-sales"), locale)}>
              {t('delivery.validationLink')}
              <span className="arrow">{t('ui.arrow')}</span>
            </a>
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
              <summary>{t('faq.items.needPlatform.q')}</summary>
              <p>{t('faq.items.needPlatform.a')}</p>
            </details>
            <details>
              <summary>{t('faq.items.chipParity.q')}</summary>
              <p>{t('faq.items.chipParity.a')}</p>
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
              <a className="btn primary" href={localizedPath(websitePath("/contact-sales?product=enterprise"), locale)}>
                {t('hero.contactSales')}
                <span className="arrow">{t('ui.arrow')}</span>
              </a>
              <a className="btn" href={localizedPath(websitePath("/products"), locale)}>{t('cta.back')}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
