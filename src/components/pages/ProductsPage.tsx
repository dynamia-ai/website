import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function ProductsPage() {
  const t = await getTranslations('sitePages.products');
  const locale = await getLocale();
  return (
    <>
      <section className="product-overview-hero">
        <div className="wrap">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>
            {t('ui.dynamia')}
            <br />
            <em>{t('hero.titleEm')}</em>
          </h1>
          <p className="lead">
            {t('hero.lead')}
            <br />
            {t('hero.description')}
          </p>
          <div className="actions">
            <a className="btn primary" href={localizedPath(websitePath("/contact-sales"), locale)}>{t('hero.startTrial')}</a>
            <a className="btn" href={localizedPath(websitePath("/products?section=product-matrix"), locale)}>{t('hero.allCapabilities')}</a>
          </div>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="overview-origin">
            <div className="origin-marks">
              <img src="/redesign/assets/cf10a2fcc13438169897.svg" alt={t('ui.dynamia')} />
              <span aria-hidden={true}>{t('ui.arrow')}</span>
              <img src="/redesign/assets/0f7fb2749db6ecded91c.png" alt={t('ui.hami')} />
            </div>
            <div>
              <h2>{t('relation.title')}</h2>
              <p>{t('relation.body')}</p>
              <a className="textlink" href={localizedPath(websitePath("/community"), locale)} style={{marginTop: '18px'}}>{t('relation.cta')}</a>
            </div>
          </div>
          <div className="intro">
            <div>
              <div className="eyebrow">{t('lineup.eyebrow')}</div>
              <h2>{t('lineup.title')}</h2>
              <p>{t('lineup.description')}</p>
            </div>
          </div>
          <div className="overview-lineup">
            <article className="overview-product">
              <div className="eyebrow">{t('lineup.enterprise.eyebrow')}</div>
              <h3>{t('lineup.enterprise.name')}</h3>
              <p>{t('lineup.enterprise.description')}</p>
              <div className="release-meta">
                <span>{t('lineup.meta.version')}</span>
                <span>{t('lineup.meta.published')}</span>
                <span>{t('lineup.meta.downloads')}</span>
              </div>
              <div className="actions">
                <a className="btn primary small" href={localizedPath(websitePath("/enterprise"), locale)}>{t('lineup.viewProduct')}</a>
                <a className="textlink" href={localizedPath(websitePath('/products/hami-enterprise/downloads'), locale)}>{t('lineup.releases')}</a>
              </div>
            </article>
            <article className="overview-product">
              <div className="eyebrow">{t('lineup.platform.eyebrow')}</div>
              <h3>{t('lineup.platform.name')}</h3>
              <p>{t('lineup.platform.description')}</p>
              <div className="release-meta">
                <span>{t('lineup.meta.version')}</span>
                <span>{t('lineup.meta.published')}</span>
                <span>{t('lineup.meta.downloads')}</span>
              </div>
              <div className="actions">
                <a className="btn primary small" href={localizedPath(websitePath("/platform"), locale)}>{t('lineup.viewProduct')}</a>
                <a className="textlink" href={localizedPath(websitePath('/products/hami-ai-platform/downloads'), locale)}>{t('lineup.releases')}</a>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="section tinted" id="product-matrix">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('fit.eyebrow')}</div>
              <h2>{t('fit.title')}</h2>
              <p>{t('fit.description')}</p>
            </div>
          </div>
          <div className="selection-guide">
            <a href="https://github.com/Project-HAMi/HAMi" target="_blank" rel="noopener">
              <span>{t('fit.paths.experiment.label')}</span>
              <strong>{t('fit.paths.experiment.product')}</strong>
            </a>
            <a href={localizedPath(websitePath("/enterprise"), locale)}>
              <span>{t('fit.paths.enterprise.label')}</span>
              <strong>{t('fit.paths.enterprise.product')}</strong>
            </a>
            <a href={localizedPath(websitePath("/platform"), locale)}>
              <span>{t('fit.paths.platformGui.label')}</span>
              <strong>{t('fit.paths.platformGui.product')}</strong>
            </a>
            <a href={localizedPath(websitePath("/platform"), locale)}>
              <span>{t('fit.paths.platformTeams.label')}</span>
              <strong>{t('fit.paths.platformTeams.product')}</strong>
            </a>
          </div>
          <div className="matrix-scroll" tabIndex={0} role="region" aria-label={t('matrix.ariaLabel')}>
            <table className="full-product-matrix">
              <thead>
                <tr>
                  <th scope="col">{t('matrix.capabilityCol')}</th>
                  <th scope="col">{t('matrix.colOpen')}</th>
                  <th scope="col">{t('lineup.enterprise.name')}</th>
                  <th scope="col">{t('lineup.platform.name')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="matrix-group">
                  <th colSpan={4} scope="colgroup">
                    {t('matrix.groups.virtualization.title')}
                    <small>{t('matrix.groups.virtualization.subtitle')}</small>
                  </th>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.gpuMemorySharing')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.gpuComputeSharing')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.memoryHardIsolation')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.computeHardIsolation')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.oversubscription')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.hamiTurboMode')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.autoScaling')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.taskPriority')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.idleAnalytics')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.schedulerEngine')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.binpackSpread')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.nvidiaTopology')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.volcanoIntegration')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.virtualization.rows.gpuResourcePools')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
              </tbody>
              <tbody>
                <tr className="matrix-group">
                  <th colSpan={4} scope="colgroup">
                    {t('matrix.groups.vendors.title')}
                    <small>{t('matrix.groups.vendors.subtitle')}</small>
                  </th>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.nvidia')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.amd')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.ascend')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.metax')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.kunlunxin')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.hygon')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.iluvatar')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.cambricon')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.enflame')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.mooreThreads')}</th>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.vendors.rows.tHead')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
              </tbody>
              <tbody>
                <tr className="matrix-group">
                  <th colSpan={4} scope="colgroup">
                    {t('matrix.groups.controlPlane.title')}
                    <small>{t('matrix.groups.controlPlane.subtitle')}</small>
                  </th>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.observability')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.gpuMonitoring')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.alertPolicies')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.turnKeyGui')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.strategyEditor')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.lcm')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.controlPlane.rows.oneClickTrial')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
              </tbody>
              <tbody>
                <tr className="matrix-group">
                  <th colSpan={4} scope="colgroup">
                    {t('matrix.groups.operations.title')}
                    <small>{t('matrix.groups.operations.subtitle')}</small>
                  </th>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.multiTenant')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.metering')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.openapi')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.license')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.oem')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.slaSupport')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
                <tr className="matrix-feature">
                  <th scope="row">{t('matrix.groups.operations.rows.airGap')}</th>
                  <td><span className="matrix-no" aria-label={t('ui.notSupported')}>{t('ui.emDash')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                  <td><span className="matrix-yes" aria-label={t('ui.supported')}>{t('ui.check')}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="matrix-note">{t('matrix.note')}</p>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('cases.eyebrow')}</div>
              <h2>{t('cases.title')}</h2>
              <p>{t('cases.description')}</p>
            </div>
            <a className="textlink" href={localizedPath(websitePath("/cases"), locale)}>
              {t('cases.allLink')}
              <span className="arrow">{t('ui.arrow')}</span>
            </a>
          </div>
          <div className="overview-cases">
            <a className="overview-case" href={localizedPath(websitePath("/cases/sf-technology"), locale)}>
              <span data-company="sf-technology" className="case-company-logo "><img src="/redesign/assets/e2e5754a2a04fd08a050.svg" alt={t('cases.items.sfTechnology.name')} loading="lazy" /></span>
              <h3>{t('cases.items.sfTechnology.title')}</h3>
              <span className="textlink">{t('cases.readLink')}</span>
            </a>
            <a className="overview-case" href={localizedPath(websitePath("/cases/prep-edu"), locale)}>
              <span data-company="prep-edu" className="case-company-logo "><img src="/redesign/assets/c53a000a30233660d2d0.svg" alt={t('cases.items.prepEdu.name')} loading="lazy" /></span>
              <h3>{t('cases.items.prepEdu.title')}</h3>
              <span className="textlink">{t('cases.readLink')}</span>
            </a>
            <a className="overview-case" href={localizedPath(websitePath("/cases/ke-holdings-inc"), locale)}>
              <span data-company="ke-holdings-inc" className="case-company-logo "><img src="/redesign/assets/8045f1c8d69940e96b22.png" alt={t('cases.items.keHoldings.name')} loading="lazy" /></span>
              <h3>{t('cases.items.keHoldings.title')}</h3>
              <span className="textlink">{t('cases.readLink')}</span>
            </a>
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
              <a className="btn primary" href={localizedPath(websitePath("/contact-sales"), locale)}>
                {t('cta.link')}
                <span className="arrow">{t('ui.arrow')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
