import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import SiteChevron from '@/components/layout/SiteChevron';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/product-detail.css';
import '@/styles/sales.css';

type CapabilityId =
  | 'multiCluster'
  | 'pools'
  | 'workloads'
  | 'monitoring'
  | 'metering'
  | 'console';

type ArchLayerId = 'layerConsole' | 'layerWorkloads' | 'layerEnterprise' | 'layerInfra';
type DeliveryStepId = 'confirm' | 'validate' | 'deploy';
type FaqId = 'enterpriseIncluded' | 'meteringVsMonitoring';

interface CapabilityItem {
  id: CapabilityId;
  icon: string;
}

interface ArchLayer {
  id: ArchLayerId;
  tone?: 'core' | 'green';
}

interface DeliveryLink {
  kind: 'internal' | 'external';
  labelKey: string;
  href?: string;
  hrefKey?: string;
}

interface DeliveryStep {
  id: DeliveryStepId;
  links: DeliveryLink[];
}

const CAPABILITIES: CapabilityItem[] = [
  {id: 'multiCluster', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z'},
  {id: 'pools', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6 M20 21v-2a4 4 0 0 0-2-3.5'},
  {id: 'workloads', icon: 'm12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5'},
  {id: 'monitoring', icon: 'M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7'},
  {id: 'metering', icon: 'M3 3h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v17h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3z M12 5v16'},
  {id: 'console', icon: 'm8 6-6 6 6 6 m8-12 6 6-6 6 M14 3l-4 18'},
];

const ARCH_LAYERS: ArchLayer[] = [
  {id: 'layerConsole', tone: 'green'},
  {id: 'layerWorkloads'},
  {id: 'layerEnterprise', tone: 'core'},
  {id: 'layerInfra'},
];

const DELIVERY_STEPS: DeliveryStep[] = [
  {
    id: 'confirm',
    links: [{kind: 'internal', labelKey: 'delivery.compatibilityLink', href: '/compatibility'}],
  },
  {
    id: 'validate',
    links: [{kind: 'internal', labelKey: 'delivery.validationLink', href: '/contact-sales'}],
  },
  {
    id: 'deploy',
    links: [
      {kind: 'external', labelKey: 'delivery.steps.deploy.onlineLabel', hrefKey: 'delivery.steps.deploy.onlineHref'},
      {kind: 'external', labelKey: 'delivery.steps.deploy.offlineLabel', hrefKey: 'delivery.steps.deploy.offlineHref'},
    ],
  },
];

const FAQ_ITEMS: FaqId[] = ['enterpriseIncluded', 'meteringVsMonitoring'];

export default async function PlatformPage() {
  const t = await getTranslations('sitePages.platform');
  const locale = await getLocale();
  const videosHref = localizedPath(websitePath('/videos'), locale);

  return (
    <>
      <div className="product-switch">
        <div className="wrap">
          <a href={localizedPath(websitePath('/products'), locale)}>{t('nav.allProducts')}</a>
          <a href={localizedPath(websitePath('/enterprise'), locale)}>{t('nav.enterprise')}</a>
          <a href={localizedPath(websitePath('/platform'), locale)} className="active">{t('nav.platform')}</a>
          <a href={localizedPath(websitePath('/contact-sales'), locale)}>{t('nav.contactSales')}</a>
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
            <a className="btn primary" href={localizedPath(websitePath('/contact-sales?product=platform'), locale)}>
              {t('hero.contactSales')}
              <SiteArrow variant="button" />
            </a>
            <a className="btn" href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer">
              {t('hero.docs')}
              <SiteArrow variant="link" />
            </a>
          </div>
          <div className="product-banner">
            <div className="product-banner-head">
              <b>{t('architecture.bannerTitle')}</b>
              <span>{t('architecture.bannerLabel')}</span>
            </div>
            <div className="product-layers">
              {ARCH_LAYERS.map((layer) => (
                <div className={`product-layer${layer.tone ? ` ${layer.tone}` : ''}`} key={layer.id}>
                  <strong>{t(`architecture.${layer.id}.title`)}</strong>
                  <span>{t(`architecture.${layer.id}.hint`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="subnav">
        <div className="wrap">
          <a href={localizedPath(websitePath('/platform?section=product-value'), locale)}>{t('toc.capabilities')}</a>
          <a href={localizedPath(websitePath('/platform?section=product-workflow'), locale)}>{t('toc.howItWorks')}</a>
          <a href={localizedPath(websitePath('/platform?section=delivery'), locale)}>{t('toc.deployment')}</a>
          <a href={localizedPath(websitePath('/platform?section=product-faq'), locale)}>{t('toc.faq')}</a>
        </div>
      </div>

      <section className="section" id="product-value">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('capabilities.eyebrow')}</div>
              <h2>{t('capabilities.title')}</h2>
              <p>{t('capabilities.description')}</p>
            </div>
          </div>
          <div className="product-benefits">
            {CAPABILITIES.map((item) => (
              <article className="product-feature" key={item.id}>
                <span className="icon">
                  <svg viewBox="0 0 24 24" aria-hidden={true}>
                    <path d={item.icon} />
                  </svg>
                </span>
                <h3>{t(`capabilities.items.${item.id}.title`)}</h3>
                <p>{t(`capabilities.items.${item.id}.body`)}</p>
                <span className="tag">{t(`capabilities.items.${item.id}.tag`)}</span>
                <div className="product-feature-action">
                  <a
                    className="btn"
                    href={videosHref}
                    aria-label={t(`capabilities.items.${item.id}.videoAria`)}
                  >
                    {t('capabilities.viewAll')}
                    <SiteArrow variant="button" />
                  </a>
                </div>
              </article>
            ))}
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

      <section className="section" id="delivery">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('delivery.eyebrow')}</div>
              <h2>{t('delivery.title')}</h2>
              <p>{t('delivery.description')}</p>
            </div>
          </div>
          <div className="process-board">
            {DELIVERY_STEPS.map((step) => (
              <div className="process-step" key={step.id}>
                <b>{t(`delivery.steps.${step.id}.num`)}</b>
                <h3>{t(`delivery.steps.${step.id}.title`)}</h3>
                <p>{t(`delivery.steps.${step.id}.body`)}</p>
                <div className="process-step-links">
                  {step.links.map((link) =>
                    link.kind === 'internal' ? (
                      <a
                        className="textlink"
                        href={localizedPath(websitePath(link.href!), locale)}
                        key={link.labelKey}
                      >
                        {t(link.labelKey)}
                        <SiteArrow variant="text" />
                      </a>
                    ) : (
                      <a
                        className="textlink"
                        href={t(link.hrefKey!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={link.labelKey}
                      >
                        {t(link.labelKey)}
                        <SiteArrow variant="link" />
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
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
          <div className="product-faq">
            {FAQ_ITEMS.map((id) => (
              <details key={id} name="product-faq">
                <summary>
                  {t(`faq.items.${id}.q`)}
                  <SiteChevron />
                </summary>
                <div className="product-faq-answer">
                  <p>{t(`faq.items.${id}.a`)}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sales-closing">
            <div className="eyebrow">{t('cta.eyebrow')}</div>
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.description')}</p>
            <div className="actions">
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales?product=platform'), locale)}>
                {t('hero.contactSales')}
                <SiteArrow variant="button" />
              </a>
              <a className="btn" href={localizedPath(websitePath('/products'), locale)}>
                {t('cta.back')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
