import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function CasesPage() {
  const t = await getTranslations('sitePages.cases');
  const locale = await getLocale();
  return (
    <>
      <section className="case-overview-hero">
        <div className="wrap">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')}
          </h1>
          <p className="lead">{t('hero.lead')}</p>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="case-library-meta">
            <strong>{t('hero.count')}</strong>
            <a href="https://www.cncf.io/case-studies/?_sft_lf-project=hami" target="_blank" rel="noopener">{t('hero.cncfSource')}</a>
          </div>
          <div className="case-library" id="case-list">
            <a className="case-preview" href={localizedPath(websitePath("/cases/seres"), locale)} aria-label={t('items.seres.aria')}>
              <div className="case-preview-top">
                <span data-company="seres" className="case-company-logo "><img src="/redesign/assets/seres-logo.svg" alt={t('items.seres.name')} loading="lazy" /></span>
                <h3>{t('items.seres.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.seres.metric')}</strong>
                  <span className="case-result-label">{t('items.seres.metricLabel')}</span>
                  <time dateTime="2026-11-02">{t('items.seres.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/zhuoyu-technology"), locale)} aria-label={t('items.zhuoyu.aria')}>
              <div className="case-preview-top">
                <span data-company="zhuoyu-technology" className="case-company-logo dark-logo"><img src="/redesign/assets/947e64289732bbc6003c.svg" alt={t('items.zhuoyu.name')} loading="lazy" /></span>
                <h3>{t('items.zhuoyu.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.zhuoyu.metric')}</strong>
                  <span className="case-result-label">{t('items.zhuoyu.metricLabel')}</span>
                  <time dateTime="2026-09-29">{t('items.zhuoyu.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/sangfor"), locale)} aria-label={t('items.sangfor.aria')}>
              <div className="case-preview-top">
                <span data-company="sangfor" className="case-company-logo "><img src="/redesign/assets/8d37763f47722bb132cf.svg" alt={t('items.sangfor.name')} loading="lazy" /></span>
                <h3>{t('items.sangfor.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.sangfor.metric')}</strong>
                  <span className="case-result-label">{t('items.sangfor.metricLabel')}</span>
                  <time dateTime="2026-09-08">{t('items.sangfor.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/cetc-cloud"), locale)} aria-label={t('items.cetc.aria')}>
              <div className="case-preview-top">
                <span data-company="cetc-cloud" className="case-company-logo "><img src="/redesign/assets/dd41408a06cb10c4a43e.png" alt={t('items.cetc.name')} loading="lazy" /></span>
                <h3>{t('items.cetc.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.cetc.metric')}</strong>
                  <span className="case-result-label">{t('items.cetc.metricLabel')}</span>
                  <time dateTime="2026-09-08">{t('items.sangfor.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/china-merchants-bank-2"), locale)} aria-label={t('items.cmbPool.aria')}>
              <div className="case-preview-top">
                <span data-company="china-merchants-bank-2" className="case-company-logo "><img src="/redesign/assets/b597756761457e50d747.svg" alt={t('items.cmbPool.name')} loading="lazy" /></span>
                <h3>{t('items.cmbPool.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.cmbPool.metric')}</strong>
                  <span className="case-result-label">{t('items.cmbPool.metricLabel')}</span>
                  <time dateTime="2026-09-07">{t('items.cetc.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/china-merchants-bank"), locale)} aria-label={t('items.cmbSched.aria')}>
              <div className="case-preview-top">
                <span data-company="china-merchants-bank" className="case-company-logo "><img src="/redesign/assets/b597756761457e50d747.svg" alt={t('items.cmbSched.name')} loading="lazy" /></span>
                <h3>{t('items.cmbSched.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.cmbSched.metric')}</strong>
                  <span className="case-result-label">{t('items.cmbSched.metricLabel')}</span>
                  <time dateTime="2026-07-02">{t('items.cmbPool.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/snow-corp"), locale)} aria-label={t('items.snow.aria')}>
              <div className="case-preview-top">
                <span data-company="snow-corp" className="case-company-logo "><img src="/redesign/assets/83f5bec99abccb7f8843.jpg" alt={t('items.snow.name')} loading="lazy" /></span>
                <h3>{t('items.snow.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.snow.metric')}</strong>
                  <span className="case-result-label">{t('items.snow.metricLabel')}</span>
                  <time dateTime="2026-05-05">{t('items.cmbSched.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/nio"), locale)} aria-label={t('items.nio.aria')}>
              <div className="case-preview-top">
                <span data-company="nio" className="case-company-logo "><img src="/redesign/assets/44b82bb215dc80472ae8.svg" alt={t('items.nio.name')} loading="lazy" /></span>
                <h3>{t('items.nio.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.nio.metric')}</strong>
                  <span className="case-result-label">{t('items.nio.metricLabel')}</span>
                  <time dateTime="2026-03-17">{t('items.snow.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/ke-holdings-inc"), locale)} aria-label={t('items.ke.aria')}>
              <div className="case-preview-top">
                <span data-company="ke-holdings-inc" className="case-company-logo "><img src="/redesign/assets/8045f1c8d69940e96b22.png" alt={t('items.ke.name')} loading="lazy" /></span>
                <h3>{t('items.ke.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.ke.metric')}</strong>
                  <span className="case-result-label">{t('items.ke.metricLabel')}</span>
                  <time dateTime="2026-02-05">{t('items.nio.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/daocloud"), locale)} aria-label={t('items.daocloud.aria')}>
              <div className="case-preview-top">
                <span data-company="daocloud" className="case-company-logo "><img src="/logos/company7.png" alt={t('items.daocloud.name')} loading="lazy" /></span>
                <h3>{t('items.daocloud.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.prep.metric')}</strong>
                  <span className="case-result-label">{t('items.daocloud.metricLabel')}</span>
                  <time dateTime="2025-12-02">{t('items.ke.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/sf-technology"), locale)} aria-label={t('items.sf.aria')}>
              <div className="case-preview-top">
                <span data-company="sf-technology" className="case-company-logo "><img src="/redesign/assets/e2e5754a2a04fd08a050.svg" alt={t('items.sf.name')} loading="lazy" /></span>
                <h3>{t('items.sf.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.daocloud.metric')}</strong>
                  <span className="case-result-label">{t('items.sf.metricLabel')}</span>
                  <time dateTime="2025-09-18">{t('items.daocloud.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
            <a className="case-preview" href={localizedPath(websitePath("/cases/prep-edu"), locale)} aria-label={t('items.prep.aria')}>
              <div className="case-preview-top">
                <span data-company="prep-edu" className="case-company-logo "><img src="/redesign/assets/c53a000a30233660d2d0.svg" alt={t('items.prep.name')} loading="lazy" /></span>
                <h3>{t('items.prep.title')}</h3>
              </div>
              <div className="case-preview-bottom">
                <div className="case-result">
                  <strong className="case-result-number">{t('items.sf.metric')}</strong>
                  <span className="case-result-label">{t('items.prep.metricLabel')}</span>
                  <time dateTime="2025-08-20">{t('items.sf.date')}</time>
                </div>
                <span className="case-view">
                  {t('ui.readCase')}
                  <span aria-hidden={true}>{t('ui.externalArrow')}</span>
                </span>
              </div>
            </a>
          </div>
          <div className="case-more">
            <div>
              <h2>{t('cta.title')}</h2>
              <p>{t('cta.body')}</p>
            </div>
            <a className="btn primary" href={localizedPath(websitePath("/get-practices"), locale)}>
              {t('cta.button')}
              <span aria-hidden={true}>{t('ui.arrow')}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
