import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import SiteChevron from '@/components/layout/SiteChevron';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import {HamiLiveStat, HamiLiveStatsProvider} from '@/components/layout/HamiLiveStats';
import HomeWhySection from '@/components/pages/HomeWhySection';
import HomeCommunityMetrics from '@/components/pages/HomeCommunityMetrics';
import '@/styles/home.css';

interface HomeFaqItem {
  q: string;
  a: string;
}

interface HeroUser {
  key: string;
  src: string;
  href?: string;
}

interface EcosystemVendor {
  brand: string;
  nameKey: string;
  src: string;
}

interface EcosystemScheduler {
  brand: string;
  nameKey: string;
  href: string;
  src: string;
}

const HERO_USERS: HeroUser[] = [
  {key: 'sfTechnology', src: '/logos/company8.svg', href: '/cases/sf-technology'},
  {key: 'paradigm', src: '/logos/company6.png'},
  {key: 'daocloud', src: '/logos/company7.png', href: '/cases/daocloud'},
  {key: 'cloudpilotAi', src: '/logos/company9.svg'},
  {key: 'opencsg', src: '/logos/opencsg.svg'},
  {key: 'intsig', src: '/logos/intsig-zh.png'},
  {key: 'seres', src: '/redesign/assets/seres-logo.svg', href: '/cases/seres'},
  {key: 'snowCorp', src: '/redesign/assets/83f5bec99abccb7f8843.jpg', href: '/cases/snow-corp'},
  {key: 'chinaMerchantsBank', src: '/redesign/assets/b597756761457e50d747.svg', href: '/cases/china-merchants-bank-2'},
  {key: 'keHoldings', src: '/redesign/assets/8045f1c8d69940e96b22.png', href: '/cases/ke-holdings-inc'},
  {key: 'nio', src: '/redesign/assets/nio-user.jpeg', href: '/cases/nio'},
];

const ECOSYSTEM_VENDORS: EcosystemVendor[] = [
  {brand: 'nvidia', nameKey: 'nvidia', src: '/redesign/assets/299f066b5f20703e1f89.png'},
  {brand: 'amd', nameKey: 'amd', src: '/redesign/assets/498422afaaf2753aa9ec.png'},
  {brand: 'aws', nameKey: 'awsNeuron', src: '/redesign/assets/83a80088931f919ecd6e.png'},
  {brand: 'ascend', nameKey: 'huaweiAscend', src: '/redesign/assets/2e4ce52270a59db0d74e.jpg'},
  {brand: 'hygon', nameKey: 'hygon', src: '/redesign/assets/e60523d86501539695c8.jpg'},
  {brand: 'cambricon', nameKey: 'cambricon', src: '/redesign/assets/2b164046f1f50a1270df.png'},
  {brand: 'metax', nameKey: 'metax', src: '/redesign/assets/b620972511a1774f5406.png'},
  {brand: 'iluvatar', nameKey: 'iluvatarCorex', src: '/redesign/assets/iluvatar-official.png'},
  {brand: 'moore', nameKey: 'mooreThreads', src: '/redesign/assets/45614e0e654b2e055368.png'},
  {brand: 'kunlunxin', nameKey: 'kunlunxin', src: '/redesign/assets/d41b05c16799270773fc.jpg'},
  {brand: 'enflame', nameKey: 'enflame', src: '/redesign/assets/0172687d120142161422.png'},
  {brand: 'biren', nameKey: 'birenTechnology', src: '/redesign/assets/a07b922731bc9166c41c.png'},
  {brand: 'vastai', nameKey: 'vastai', src: '/redesign/assets/379727e2c45f83876a87.png'},
  {brand: 't-head', nameKey: 'tHeadPpu', src: '/redesign/assets/de1ec23ff0fe78e98cdd.png'},
];

const ECOSYSTEM_SCHEDULERS: EcosystemScheduler[] = [
  {
    brand: 'kubernetes',
    nameKey: 'kubernetes',
    href: 'https://github.com/Project-HAMi/HAMi#quick-start',
    src: '/redesign/assets/402dd0ce3de067d46771.png',
  },
  {
    brand: 'volcano',
    nameKey: 'volcano',
    href: 'https://github.com/volcano-sh/volcano/blob/master/docs/user-guide/how_to_use_volcano_vgpu.md',
    src: '/redesign/assets/c770463d55a953164ff4.png',
  },
  {
    brand: 'kueue',
    nameKey: 'kueue',
    href: 'https://kueue.sigs.k8s.io/docs/tasks/run/using_hami/',
    src: '/redesign/assets/48d6c0dbf8aa195b05fe.png',
  },
  {
    brand: 'koordinator',
    nameKey: 'koordinator',
    href: 'https://koordinator.sh/docs/user-manuals/device-scheduling-gpu-share-with-hami',
    src: '/images/koordinator.png',
  },
  {
    brand: 'kai',
    nameKey: 'kai',
    href: 'https://github.com/kai-scheduler/KAI-Scheduler/blob/main/docs/gpu-sharing/hami/README.md',
    src: '/redesign/assets/f1c5ef6e0100c77baaaf.png',
  },
];

export default async function HomePage() {
  const t = await getTranslations('sitePages.home');
  const locale = await getLocale();
  const faqItems = t.raw('faq.items') as HomeFaqItem[];
  const userNames = t.raw('hero.users') as Record<string, string>;
  const vendorNames = t.raw('ecosystem.vendors') as Record<string, string>;
  const schedulersCopy = t.raw('ecosystem.schedulers') as Record<string, {name: string; seeDetails: string}>;
  // Dynamia-only wordmark — not navigation.logo (EN creators lockup).
  const dynamiaLogo = t('brand.logo');
  const dynamiaLogoDark = t('brand.logoDark');

  const renderHeroUserSet = (setKey: string, opts?: {decorative?: boolean}) => (
    <div className="hero-users-set" {...(opts?.decorative ? {'aria-hidden': true, inert: true} : {})}>
      {HERO_USERS.map((user) => {
        const title = userNames[user.key] ?? user.key;
        const image = (
          <img
            src={user.src}
            alt={opts?.decorative ? '' : title}
            loading={opts?.decorative ? 'lazy' : 'eager'}
            decoding="async"
          />
        );
        const key = `${setKey}-${user.key}`;
        if (user.href) {
          return (
            <a
              key={key}
              className="hero-user-mark"
              href={localizedPath(websitePath(user.href), locale)}
              title={title}
              tabIndex={opts?.decorative ? -1 : undefined}
            >
              {image}
            </a>
          );
        }
        return (
          <span key={key} className="hero-user-mark" title={title}>
            {image}
          </span>
        );
      })}
    </div>
  );

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
                <SiteArrow variant="link" />
              </a>
            </div>
          </div>
          <figure className="original-animation">
            <img
              data-motion-image="original"
              src="/redesign/assets/e80fe85581e8dcc32e1e.gif"
              alt={t('hero.motionAlt')}
              data-motion-poster="originalPoster"
              data-motion-paused="false"
              decoding="async"
              fetchPriority="high"
            />
          </figure>
        </div>
        <div className="wrap hero-users">
          <div className="hero-users-label">{t('hero.usersLabel')}</div>
          <div className="hero-users-viewport" role="region" aria-label={t('hero.usersLabel')}>
            <div className="hero-users-track">
              {renderHeroUserSet('primary')}
              {renderHeroUserSet('loop-a', {decorative: true})}
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
              <SiteArrow variant="text" />
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
                  <SiteArrow variant="text" />
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
                  <SiteArrow variant="text" />
                </a>
                <span className="label">{t('products.platform.badge')}</span>
              </div>
            </article>
          </div>
          <div className="opensource-strip">
            <img
              src="/redesign/assets/0f7fb2749db6ecded91c.png"
              alt={t('ui.hami')}
              loading="lazy"
              decoding="async"
            />
            <p>
              <strong>{t('products.opensource.title')}</strong>
              {t('products.opensource.description')}
            </p>
            <a className="textlink" href={localizedPath(websitePath("/opensource"), locale)}>
              {t('products.opensource.cta')}
              <SiteArrow variant="text" />
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
                <SiteArrow variant="text" />
              </a>
            </div>
            <div className="ecosystem-logo-grid vendor-logo-grid" id="vendor-marquee" role="group" aria-label={t('ecosystem.vendorsTitle')}>
              {ECOSYSTEM_VENDORS.map((vendor) => {
                const name = vendorNames[vendor.nameKey] ?? vendor.nameKey;
                return (
                  <div className="ecosystem-unlinked" key={vendor.brand}>
                    <div className="brand-tile" data-brand={vendor.brand} title={name}>
                      <img src={vendor.src} alt={name} loading="lazy" decoding="async" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="logo-group">
            <div className="logo-group-title"><h3>{t('ecosystem.schedulersTitle')}</h3></div>
            <div className="ecosystem-logo-grid scheduler-logo-grid" id="scheduler-marquee" role="group" aria-label={t('ecosystem.schedulersTitle')}>
              {ECOSYSTEM_SCHEDULERS.map((scheduler) => {
                const copy = schedulersCopy[scheduler.nameKey];
                const name = copy?.name ?? scheduler.nameKey;
                return (
                  <a
                    key={scheduler.brand}
                    className="ecosystem-link"
                    href={scheduler.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={copy?.seeDetails ?? name}
                  >
                    <div className="brand-tile" data-brand={scheduler.brand} title={name}>
                      <img src={scheduler.src} alt={name} loading="lazy" decoding="async" />
                      <span className="ecosystem-link-caption">
                        {t('ui.viewDetails')}
                        <SiteArrow variant="link" />
                      </span>
                    </div>
                  </a>
                );
              })}
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
              <SiteArrow variant="text" />
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
                    <SiteChevron />
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
                  <img className="cycle-light" src={dynamiaLogo} alt="" loading="lazy" decoding="async" />
                  <img className="cycle-dark" src={dynamiaLogoDark} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="brand-cycle-frame brand-cycle-hami" aria-hidden={true}>
                  <span className="brand-cycle-label">{t('brand.creatorsOf')}</span>
                  <span className="brand-cycle-logo">
                    <img
                      className="cycle-light"
                      src="/redesign/assets/0f7fb2749db6ecded91c.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      className="cycle-dark"
                      src="/redesign/assets/hami-horizontal-color-white.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </span>
              </div>
              <a className="cncf-project-link" href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">
                <b>{t('ui.hami')}</b>
                <span>{t('brand.cncfSuffix')}</span>
                <SiteArrow variant="link" />
              </a>
            </div>
          </div>
        </div>
      </section>
      </>
    </HamiLiveStatsProvider>
  );
}
