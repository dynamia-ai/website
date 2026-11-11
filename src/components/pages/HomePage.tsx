import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import {HamiLiveStat, HamiLiveStatsProvider} from '@/components/layout/HamiLiveStats';
import HomeWhySection from '@/components/pages/HomeWhySection';
import HomeCommunityMetrics from '@/components/pages/HomeCommunityMetrics';

interface HomeFaqItem {
  q: string;
  a: string;
}

export default async function HomePage() {
  const t = await getTranslations('sitePages.home');
  const locale = await getLocale();
  const faqItems = t.raw('faq.items') as HomeFaqItem[];

  return (
    <HamiLiveStatsProvider>
      <>
      <section className="hero home-hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow hero-signature">{t('hero.eyebrow')}</div>
            <h1>
              {t('hero.titleLine1')}
              <br />
              <em>{t('hero.titleLine2')}</em>
            </h1>
            <div className="hero-message-support">
              <p className="hero-positioning">{t('hero.positioning')}</p>
              <p className="lead hero-description">{t('hero.description')}</p>
            </div>
            <div className="actions">
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>{t('hero.bookDemo')}</a>
              <a className="star-proof" href="https://github.com/Project-HAMi/HAMi" target="_blank" rel="noopener" title={t('hero.loadingGithubStars')}>
                <span aria-hidden={true}>{t('ui.star')}</span>
                <b><HamiLiveStat kind="stars" placeholder={t('ui.emDash')} /></b>
                <span>{t('hero.githubStars')}</span>
                <span aria-hidden={true}>{t('ui.externalArrow')}</span>
              </a>
            </div>
          </div>
          <figure className="original-animation"><img className="" data-motion-image="original" src="/redesign/assets/e80fe85581e8dcc32e1e.gif" alt={t('hero.motionAlt')} data-motion-poster="originalPoster" data-motion-paused="false" /></figure>
        </div>
        <div className="wrap hero-users">
          <div className="hero-users-label">{t('hero.usersLabel')}</div>
          <div className="hero-users-viewport" role="region" aria-label={t('hero.usersLabel')}>
            <div className="hero-users-track">
              <div className="hero-users-set">
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/sf-technology"), locale)} title={t('hero.users.sfTechnology')}><img src="/logos/company8.svg" alt={t('hero.users.sfTechnology')} loading="eager" /></a>
                <span className="hero-user-mark" title={t('hero.users.paradigm')}><img src="/logos/company6.png" alt={t('hero.users.paradigm')} loading="eager" /></span>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/daocloud"), locale)} title={t('hero.users.daocloud')}><img src="/logos/company7.png" alt={t('hero.users.daocloud')} loading="eager" /></a>
                <span className="hero-user-mark" title={t('hero.users.cloudpilotAi')}><img src="/logos/company9.svg" alt={t('hero.users.cloudpilotAi')} loading="eager" /></span>
                <span className="hero-user-mark" title={t('hero.users.opencsg')}><img src="/logos/opencsg.svg" alt={t('hero.users.opencsg')} loading="eager" /></span>
                <span className="hero-user-mark" title={t('hero.users.intsig')}><img src="/logos/intsig-zh.png" alt={t('hero.users.intsig')} loading="eager" /></span>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/seres"), locale)} title={t('hero.users.seres')}><img src="/redesign/assets/seres-logo.svg" alt={t('hero.users.seres')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/snow-corp"), locale)} title={t('hero.users.snowCorp')}><img src="/redesign/assets/83f5bec99abccb7f8843.jpg" alt={t('hero.users.snowCorp')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/china-merchants-bank-2"), locale)} title={t('hero.users.chinaMerchantsBank')}><img src="/redesign/assets/b597756761457e50d747.svg" alt={t('hero.users.chinaMerchantsBank')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/ke-holdings-inc"), locale)} title={t('hero.users.keHoldings')}><img src="/redesign/assets/8045f1c8d69940e96b22.png" alt={t('hero.users.keHoldings')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/nio"), locale)} title={t('hero.users.nio')}><img src="/redesign/assets/nio-user.jpeg" alt={t('hero.users.nio')} loading="eager" /></a>
              </div>
              <div className="hero-users-set" aria-hidden={true} inert>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/sf-technology"), locale)} title={t('hero.users.sfTechnology')}><img src="/logos/company8.svg" alt={t('hero.users.sfTechnology')} loading="eager" /></a>
                <span className="hero-user-mark" title={t('hero.users.paradigm')}><img src="/logos/company6.png" alt={t('hero.users.paradigm')} loading="eager" /></span>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/daocloud"), locale)} title={t('hero.users.daocloud')}><img src="/logos/company7.png" alt={t('hero.users.daocloud')} loading="eager" /></a>
                <span className="hero-user-mark" title={t('hero.users.cloudpilotAi')}><img src="/logos/company9.svg" alt={t('hero.users.cloudpilotAi')} loading="eager" /></span>
                <span className="hero-user-mark" title={t('hero.users.opencsg')}><img src="/logos/opencsg.svg" alt={t('hero.users.opencsg')} loading="eager" /></span>
                <span className="hero-user-mark" title={t('hero.users.intsig')}><img src="/logos/intsig-zh.png" alt={t('hero.users.intsig')} loading="eager" /></span>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/seres"), locale)} title={t('hero.users.seres')}><img src="/redesign/assets/seres-logo.svg" alt={t('hero.users.seres')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/snow-corp"), locale)} title={t('hero.users.snowCorp')}><img src="/redesign/assets/83f5bec99abccb7f8843.jpg" alt={t('hero.users.snowCorp')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/china-merchants-bank-2"), locale)} title={t('hero.users.chinaMerchantsBank')}><img src="/redesign/assets/b597756761457e50d747.svg" alt={t('hero.users.chinaMerchantsBank')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/ke-holdings-inc"), locale)} title={t('hero.users.keHoldings')}><img src="/redesign/assets/8045f1c8d69940e96b22.png" alt={t('hero.users.keHoldings')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/nio"), locale)} title={t('hero.users.nio')}><img src="/redesign/assets/nio-user.jpeg" alt={t('hero.users.nio')} loading="eager" /></a>
              </div>
              <div className="hero-users-set" aria-hidden={true} inert>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/sf-technology"), locale)} title={t('hero.users.sfTechnology')}><img src="/logos/company8.svg" alt={t('hero.users.sfTechnology')} loading="eager" /></a>
                <span className="hero-user-mark" title={t('hero.users.paradigm')}><img src="/logos/company6.png" alt={t('hero.users.paradigm')} loading="eager" /></span>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/daocloud"), locale)} title={t('hero.users.daocloud')}><img src="/logos/company7.png" alt={t('hero.users.daocloud')} loading="eager" /></a>
                <span className="hero-user-mark" title={t('hero.users.cloudpilotAi')}><img src="/logos/company9.svg" alt={t('hero.users.cloudpilotAi')} loading="eager" /></span>
                <span className="hero-user-mark" title={t('hero.users.opencsg')}><img src="/logos/opencsg.svg" alt={t('hero.users.opencsg')} loading="eager" /></span>
                <span className="hero-user-mark" title={t('hero.users.intsig')}><img src="/logos/intsig-zh.png" alt={t('hero.users.intsig')} loading="eager" /></span>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/seres"), locale)} title={t('hero.users.seres')}><img src="/redesign/assets/seres-logo.svg" alt={t('hero.users.seres')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/snow-corp"), locale)} title={t('hero.users.snowCorp')}><img src="/redesign/assets/83f5bec99abccb7f8843.jpg" alt={t('hero.users.snowCorp')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/china-merchants-bank-2"), locale)} title={t('hero.users.chinaMerchantsBank')}><img src="/redesign/assets/b597756761457e50d747.svg" alt={t('hero.users.chinaMerchantsBank')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/ke-holdings-inc"), locale)} title={t('hero.users.keHoldings')}><img src="/redesign/assets/8045f1c8d69940e96b22.png" alt={t('hero.users.keHoldings')} loading="eager" /></a>
                <a className="hero-user-mark" href={localizedPath(websitePath("/cases/nio"), locale)} title={t('hero.users.nio')}><img src="/redesign/assets/nio-user.jpeg" alt={t('hero.users.nio')} loading="eager" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HomeWhySection />
      <section className="section " id="products">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('products.eyebrow')}</div>
              <h2>{t('products.title')}</h2>
              <p>{t('products.description')}</p>
            </div>
            <a className="textlink" href={localizedPath(websitePath("/products"), locale)}>
              {t('products.viewOverview')}
              <span className="arrow">{t('ui.arrow')}</span>
            </a>
          </div>
          <div className="grid2">
            <article className="product-card">
              <div className="audience">{t('products.enterprise.audience')}</div>
              <h3>{t('products.enterprise.name')}</h3>
              <p>{t('products.enterprise.description')}</p>
              <div className="product-vis">
                <div className="layer">
                  {t('products.enterprise.layerPlatform')}
                  <span>{t('products.enterprise.layerPlatformHint')}</span>
                </div>
                <div className="layer accent">
                  {t('products.enterprise.name')}
                  <span>{t('products.enterprise.layerAccentHint')}</span>
                </div>
              </div>
              <ul>
                <li>{t('products.enterprise.feature1')}</li>
                <li>{t('products.enterprise.feature2')}</li>
                <li>{t('products.enterprise.feature3')}</li>
              </ul>
              <div className="card-actions">
                <a className="textlink" href={localizedPath(websitePath("/enterprise"), locale)}>
                  {t('products.enterprise.cta')}
                  <span className="arrow">{t('ui.arrow')}</span>
                </a>
                <span className="label">{t('products.enterprise.badge')}</span>
              </div>
            </article>
            <article className="product-card platform">
              <div className="audience">{t('products.platform.audience')}</div>
              <h3>{t('products.platform.name')}</h3>
              <p>{t('products.platform.description')}</p>
              <div className="product-vis">
                <div className="layer navy">
                  {t('products.platform.name')}
                  <span>{t('products.platform.layerHint')}</span>
                </div>
                <div className="layer accent">
                  {t('products.platform.includesEnterprise')}
                  <span>{t('products.platform.includesHint')}</span>
                </div>
              </div>
              <ul>
                <li>{t('products.platform.feature1')}</li>
                <li>{t('products.platform.feature2')}</li>
                <li>{t('products.platform.feature3')}</li>
              </ul>
              <div className="card-actions">
                <a className="textlink" href={localizedPath(websitePath("/platform"), locale)}>
                  {t('products.platform.cta')}
                  <span className="arrow">{t('ui.arrow')}</span>
                </a>
                <span className="label">{t('products.platform.badge')}</span>
              </div>
            </article>
          </div>
          <div className="opensource-strip">
            <img src="/redesign/assets/0f7fb2749db6ecded91c.png" alt={t('ui.hami')} />
            <p>
              <strong>{t('products.opensource.title')}</strong>
              {t('products.opensource.description')}
            </p>
            <a className="textlink" href={localizedPath(websitePath("/opensource"), locale)}>
              {t('products.opensource.cta')}
              <span className="arrow">{t('ui.arrow')}</span>
            </a>
          </div>
        </div>
      </section>
      <section className="section ecosystem-section" id="ecosystem">
        <div className="wrap">
          <div className="logo-wall-heading">
            <div className="eyebrow">{t('ecosystem.eyebrow')}</div>
            <h2>{t('ecosystem.title')}</h2>
            <p>{t('ecosystem.description')}</p>
          </div>
          <div className="logo-group">
            <div className="logo-group-title">
              <h3>{t('ecosystem.vendorsTitle')}</h3>
              <a className="textlink" href={localizedPath(websitePath("/gpu-compatibility"), locale)}>
                {t('ecosystem.viewCatalog')}
                <span aria-hidden={true}>{t('ui.externalArrow')}</span>
              </a>
            </div>
            <div className="ecosystem-logo-grid vendor-logo-grid" id="vendor-marquee" role="group" aria-label={t('ecosystem.vendorsTitle')}>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="nvidia" title={t('ecosystem.vendors.nvidia')}><img src="/redesign/assets/299f066b5f20703e1f89.png" alt={t('ecosystem.vendors.nvidia')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="amd" title={t('ecosystem.vendors.amd')}><img src="/redesign/assets/498422afaaf2753aa9ec.png" alt={t('ecosystem.vendors.amd')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="aws" title={t('ecosystem.vendors.awsNeuron')}><img src="/redesign/assets/83a80088931f919ecd6e.png" alt={t('ecosystem.vendors.awsNeuron')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="ascend" title={t('ecosystem.vendors.huaweiAscend')}><img src="/redesign/assets/2e4ce52270a59db0d74e.jpg" alt={t('ecosystem.vendors.huaweiAscend')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="hygon" title={t('ecosystem.vendors.hygon')}><img src="/redesign/assets/e60523d86501539695c8.jpg" alt={t('ecosystem.vendors.hygon')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="cambricon" title={t('ecosystem.vendors.cambricon')}><img src="/redesign/assets/2b164046f1f50a1270df.png" alt={t('ecosystem.vendors.cambricon')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="metax" title={t('ecosystem.vendors.metax')}><img src="/redesign/assets/b620972511a1774f5406.png" alt={t('ecosystem.vendors.metax')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="iluvatar" title={t('ecosystem.vendors.iluvatarCorex')}><img src="/redesign/assets/iluvatar-official.png" alt={t('ecosystem.vendors.iluvatarCorex')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="moore" title={t('ecosystem.vendors.mooreThreads')}><img src="/redesign/assets/45614e0e654b2e055368.png" alt={t('ecosystem.vendors.mooreThreads')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="kunlunxin" title={t('ecosystem.vendors.kunlunxin')}><img src="/redesign/assets/d41b05c16799270773fc.jpg" alt={t('ecosystem.vendors.kunlunxin')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="enflame" title={t('ecosystem.vendors.enflame')}><img src="/redesign/assets/0172687d120142161422.png" alt={t('ecosystem.vendors.enflame')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="biren" title={t('ecosystem.vendors.birenTechnology')}><img src="/redesign/assets/a07b922731bc9166c41c.png" alt={t('ecosystem.vendors.birenTechnology')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="vastai" title={t('ecosystem.vendors.vastai')}><img src="/redesign/assets/379727e2c45f83876a87.png" alt={t('ecosystem.vendors.vastai')} loading="lazy" /></div></div>
              <div className="ecosystem-unlinked"><div className="brand-tile" data-brand="t-head" title={t('ecosystem.vendors.tHeadPpu')}><img src="/redesign/assets/de1ec23ff0fe78e98cdd.png" alt={t('ecosystem.vendors.tHeadPpu')} loading="lazy" /></div></div>
            </div>
          </div>
          <div className="logo-group">
            <div className="logo-group-title"><h3>{t('ecosystem.schedulersTitle')}</h3></div>
            <div className="ecosystem-logo-grid scheduler-logo-grid" id="scheduler-marquee" role="group" aria-label={t('ecosystem.schedulersTitle')}>
              <a className="ecosystem-link" href="https://github.com/Project-HAMi/HAMi#quick-start" target="_blank" rel="noopener noreferrer" aria-label={t('ecosystem.schedulers.kubernetes.seeDetails')}>
                <div className="brand-tile" data-brand="kubernetes" title={t('ecosystem.schedulers.kubernetes.name')}>
                  <img src="/redesign/assets/402dd0ce3de067d46771.png" alt={t('ecosystem.schedulers.kubernetes.name')} loading="lazy" />
                  <span className="ecosystem-link-caption">
                    {t('ui.viewDetails')}
                    <span aria-hidden={true}>{t('ui.externalArrowSpaced')}</span>
                  </span>
                </div>
              </a>
              <a className="ecosystem-link" href="https://github.com/volcano-sh/volcano/blob/master/docs/user-guide/how_to_use_volcano_vgpu.md" target="_blank" rel="noopener noreferrer" aria-label={t('ecosystem.schedulers.volcano.seeDetails')}>
                <div className="brand-tile" data-brand="volcano" title={t('ecosystem.schedulers.volcano.name')}>
                  <img src="/redesign/assets/c770463d55a953164ff4.png" alt={t('ecosystem.schedulers.volcano.name')} loading="lazy" />
                  <span className="ecosystem-link-caption">
                    {t('ui.viewDetails')}
                    <span aria-hidden={true}>{t('ui.externalArrowSpaced')}</span>
                  </span>
                </div>
              </a>
              <a className="ecosystem-link" href="https://kueue.sigs.k8s.io/docs/tasks/run/using_hami/" target="_blank" rel="noopener noreferrer" aria-label={t('ecosystem.schedulers.kueue.seeDetails')}>
                <div className="brand-tile" data-brand="kueue" title={t('ecosystem.schedulers.kueue.name')}>
                  <img src="/redesign/assets/48d6c0dbf8aa195b05fe.png" alt={t('ecosystem.schedulers.kueue.name')} loading="lazy" />
                  <span className="ecosystem-link-caption">
                    {t('ui.viewDetails')}
                    <span aria-hidden={true}>{t('ui.externalArrowSpaced')}</span>
                  </span>
                </div>
              </a>
              <a className="ecosystem-link" href="https://koordinator.sh/docs/user-manuals/device-scheduling-gpu-share-with-hami" target="_blank" rel="noopener noreferrer" aria-label={t('ecosystem.schedulers.koordinator.seeDetails')}>
                <div className="brand-tile" data-brand="koordinator" title={t('ecosystem.schedulers.koordinator.name')}>
                  <img src="/images/koordinator.png" alt={t('ecosystem.schedulers.koordinator.name')} loading="lazy" />
                  <span className="ecosystem-link-caption">
                    {t('ui.viewDetails')}
                    <span aria-hidden={true}>{t('ui.externalArrowSpaced')}</span>
                  </span>
                </div>
              </a>
              <a className="ecosystem-link" href="https://github.com/kai-scheduler/KAI-Scheduler/blob/main/docs/gpu-sharing/hami/README.md" target="_blank" rel="noopener noreferrer" aria-label={t('ecosystem.schedulers.kai.seeDetails')}>
                <div className="brand-tile" data-brand="kai" title={t('ecosystem.schedulers.kai.name')}>
                  <img src="/redesign/assets/f1c5ef6e0100c77baaaf.png" alt={t('ecosystem.schedulers.kai.name')} loading="lazy" />
                  <span className="ecosystem-link-caption">
                    {t('ui.viewDetails')}
                    <span aria-hidden={true}>{t('ui.externalArrowSpaced')}</span>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="community-commitment" id="community-commitment" aria-labelledby="community-title">
        <div className="wrap">
          <div className="community-heading">
            <div>
              <div className="eyebrow">{t('community.eyebrow')}</div>
              <h2 id="community-title">{t('community.title')}</h2>
            </div>
            <p>
              {t('community.leadBefore')}
              <a href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">{t('community.leadLink')}</a>
              {t('community.leadAfter')}
            </p>
          </div>
          <HomeCommunityMetrics />
          <div className="community-section-link">
            <a href={localizedPath(websitePath("/opensource"), locale)}>
              {t('community.exploreLink')}
              <span aria-hidden={true}>{t('ui.externalArrow')}</span>
            </a>
          </div>
        </div>
      </section>
      <section className="section " id="start">
        <div className="wrap">
          <section className="home-faq" aria-labelledby="home-faq-title" id="faq">
            <div className="home-faq-heading">
              <div className="eyebrow">{t('faq.eyebrow')}</div>
              <h2 id="home-faq-title">{t('faq.title')}</h2>
            </div>
            <div className="home-faq-list">
              {faqItems.map((item) => (
                <details key={item.q} name="home-faq">
                  <summary>
                    <span>{item.q}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden={true}><path d="m6 9 6 6 6-6"></path></svg>
                  </summary>
                  <div className="home-faq-answer"><p>{item.a}</p></div>
                </details>
              ))}
            </div>
          </section>
          <div className="final-cta">
            <div>
              <h3>{t('cta.title')}</h3>
              <p>{t('cta.description')}</p>
            </div>
            <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>{t('hero.bookDemo')}</a>
          </div>
          <div className="home-brand-closing">
            <div className="brand-signature">
              <div className="brand-motion brand-cycle" role="img" aria-label={t('brand.ariaLabel')}>
                <span className="brand-cycle-frame brand-cycle-dynamia" aria-hidden={true}>
                  <img className="cycle-light" src="/redesign/assets/cf10a2fcc13438169897.svg" alt="" />
                  <img className="cycle-dark" src="/redesign/assets/931baba8fa5e14fe2655.svg" alt="" />
                </span>
                <span className="brand-cycle-frame brand-cycle-hami" aria-hidden={true}>
                  <span className="brand-cycle-label">{t('brand.creatorsOf')}</span>
                  <span className="brand-cycle-logo">
                    <img className="cycle-light" src="/redesign/assets/0f7fb2749db6ecded91c.png" alt="" />
                    <img className="cycle-dark" src="/redesign/assets/hami-horizontal-color-white.png" alt="" />
                  </span>
                </span>
              </div>
              <a className="cncf-project-link" href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">
                <b>{t('ui.hami')}</b>
                <span>{t('brand.cncfSuffix')}</span>
                <span aria-hidden={true}>{t('ui.externalArrow')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      </>
    </HamiLiveStatsProvider>
  );
}
