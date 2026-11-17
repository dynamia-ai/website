import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/products.css';
import '@/styles/cases.css';
import '@/styles/sales.css';

type Support = [boolean, boolean, boolean];

interface MatrixRow {
  key: string;
  support: Support;
}

interface MatrixGroup {
  id: 'virtualization' | 'vendors' | 'controlPlane' | 'operations';
  rows: MatrixRow[];
}

interface LineupProduct {
  id: 'enterprise' | 'platform';
  href: string;
}

interface FitPath {
  id: 'experiment' | 'enterprise' | 'platformGui' | 'platformTeams';
  href: string;
  external?: boolean;
}

interface CaseCard {
  id: 'sfTechnology' | 'prepEdu' | 'keHoldings';
  company: string;
  src: string;
  href: string;
}

const LINEUP: LineupProduct[] = [
  {id: 'enterprise', href: '/enterprise'},
  {id: 'platform', href: '/platform'},
];

const FIT_PATHS: FitPath[] = [
  {id: 'experiment', href: 'https://github.com/Project-HAMi/HAMi', external: true},
  {id: 'enterprise', href: '/enterprise'},
  {id: 'platformGui', href: '/platform'},
  {id: 'platformTeams', href: '/platform'},
];

const CASE_CARDS: CaseCard[] = [
  {
    id: 'sfTechnology',
    company: 'sf-technology',
    src: '/redesign/assets/e2e5754a2a04fd08a050.svg',
    href: '/cases/sf-technology',
  },
  {
    id: 'prepEdu',
    company: 'prep-edu',
    src: '/redesign/assets/c53a000a30233660d2d0.svg',
    href: '/cases/prep-edu',
  },
  {
    id: 'keHoldings',
    company: 'ke-holdings-inc',
    src: '/redesign/assets/8045f1c8d69940e96b22.png',
    href: '/cases/ke-holdings-inc',
  },
];

const MATRIX_GROUPS: MatrixGroup[] = [
  {
    id: 'virtualization',
    rows: [
      {key: 'gpuMemorySharing', support: [true, true, true]},
      {key: 'gpuComputeSharing', support: [true, true, true]},
      {key: 'memoryHardIsolation', support: [false, true, true]},
      {key: 'computeHardIsolation', support: [false, true, true]},
      {key: 'oversubscription', support: [false, true, true]},
      {key: 'hamiTurboMode', support: [false, true, true]},
      {key: 'autoScaling', support: [false, true, true]},
      {key: 'taskPriority', support: [true, true, true]},
      {key: 'idleAnalytics', support: [false, true, true]},
      {key: 'schedulerEngine', support: [false, true, true]},
      {key: 'binpackSpread', support: [true, true, true]},
      {key: 'nvidiaTopology', support: [true, true, true]},
      {key: 'volcanoIntegration', support: [false, true, true]},
      {key: 'gpuResourcePools', support: [false, false, true]},
    ],
  },
  {
    id: 'vendors',
    rows: [
      {key: 'nvidia', support: [true, true, true]},
      {key: 'amd', support: [true, true, true]},
      {key: 'ascend', support: [true, true, true]},
      {key: 'metax', support: [true, true, true]},
      {key: 'kunlunxin', support: [true, true, false]},
      {key: 'hygon', support: [true, true, true]},
      {key: 'iluvatar', support: [true, true, true]},
      {key: 'cambricon', support: [true, true, true]},
      {key: 'enflame', support: [true, true, true]},
      {key: 'mooreThreads', support: [true, true, true]},
      {key: 'tHead', support: [false, true, true]},
    ],
  },
  {
    id: 'controlPlane',
    rows: [
      {key: 'observability', support: [false, false, true]},
      {key: 'gpuMonitoring', support: [false, false, true]},
      {key: 'alertPolicies', support: [false, true, true]},
      {key: 'turnKeyGui', support: [false, false, true]},
      {key: 'strategyEditor', support: [false, false, true]},
      {key: 'lcm', support: [false, false, true]},
      {key: 'oneClickTrial', support: [false, false, true]},
    ],
  },
  {
    id: 'operations',
    rows: [
      {key: 'multiTenant', support: [false, false, true]},
      {key: 'metering', support: [false, false, true]},
      {key: 'openapi', support: [false, false, true]},
      {key: 'license', support: [false, false, true]},
      {key: 'oem', support: [false, false, true]},
      {key: 'slaSupport', support: [false, true, true]},
      {key: 'airGap', support: [false, true, true]},
    ],
  },
];

interface MatrixCellProps {
  yes: boolean;
  supportedLabel: string;
  notSupportedLabel: string;
  check: string;
  emDash: string;
}

function MatrixCell({yes, supportedLabel, notSupportedLabel, check, emDash}: MatrixCellProps) {
  return (
    <td>
      {yes ? (
        <span className="matrix-yes" aria-label={supportedLabel}>{check}</span>
      ) : (
        <span className="matrix-no" aria-label={notSupportedLabel}>{emDash}</span>
      )}
    </td>
  );
}

export default async function ProductsPage() {
  const t = await getTranslations('sitePages.products');
  const locale = await getLocale();
  const supportedLabel = t('ui.supported');
  const notSupportedLabel = t('ui.notSupported');
  const check = t('ui.check');
  const emDash = t('ui.emDash');
  // Dynamia-only wordmark — not navigation.logo (EN creators lockup).
  const dynamiaLogo = t('relation.dynamiaLogo');

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
            <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>
              {t('hero.startTrial')}
              <SiteArrow variant="button" />
            </a>
            <a className="btn" href={localizedPath(websitePath('/products?section=product-matrix'), locale)}>
              {t('hero.allCapabilities')}
              <SiteArrow variant="down" />
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="overview-origin">
            <div className="origin-marks">
              <img src={dynamiaLogo} alt={t('ui.dynamia')} />
              <SiteArrow variant="text" />
              <img src="/redesign/assets/0f7fb2749db6ecded91c.png" alt={t('ui.hami')} />
            </div>
            <div>
              <h2>{t('relation.title')}</h2>
              <p>{t('relation.body')}</p>
              <a className="textlink" href={localizedPath(websitePath('/community'), locale)}>
                {t('relation.cta')}
                <SiteArrow variant="text" />
              </a>
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
            {LINEUP.map((product) => (
              <article className="overview-product" key={product.id}>
                <div className="eyebrow">{t(`lineup.${product.id}.eyebrow`)}</div>
                <h3>{t(`lineup.${product.id}.name`)}</h3>
                <p>{t(`lineup.${product.id}.description`)}</p>
                <div className="actions">
                  <a className="btn primary small" href={localizedPath(websitePath(product.href), locale)}>
                    {t('lineup.viewProduct')}
                    <SiteArrow variant="button" />
                  </a>
                  <a
                    className="textlink"
                    href={t(`lineup.${product.id}.installDocs`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('lineup.releases')}
                    <SiteArrow variant="link" />
                  </a>
                </div>
              </article>
            ))}
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
            {FIT_PATHS.map((path) => {
              const href = path.external ? path.href : localizedPath(websitePath(path.href), locale);
              return (
                <a
                  key={path.id}
                  href={href}
                  {...(path.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                >
                  <span>{t(`fit.paths.${path.id}.label`)}</span>
                  <strong>
                    {t(`fit.paths.${path.id}.product`)}
                    {path.external ? <SiteArrow variant="link" /> : <SiteArrow variant="text" />}
                  </strong>
                </a>
              );
            })}
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
              {MATRIX_GROUPS.map((group) => (
                <tbody key={group.id}>
                  <tr className="matrix-group">
                    <th colSpan={4} scope="colgroup">
                      {t(`matrix.groups.${group.id}.title`)}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr className="matrix-feature" key={`${group.id}-${row.key}`}>
                      <th scope="row">{t(`matrix.groups.${group.id}.rows.${row.key}`)}</th>
                      {row.support.map((yes, index) => (
                        <MatrixCell
                          key={index}
                          yes={yes}
                          supportedLabel={supportedLabel}
                          notSupportedLabel={notSupportedLabel}
                          check={check}
                          emDash={emDash}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <p className="matrix-note">{t('matrix.note')}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('cases.eyebrow')}</div>
              <h2>{t('cases.title')}</h2>
              <p>{t('cases.description')}</p>
            </div>
            <a className="textlink" href={localizedPath(websitePath('/cases'), locale)}>
              {t('cases.allLink')}
              <SiteArrow variant="text" />
            </a>
          </div>
          <div className="overview-cases">
            {CASE_CARDS.map((item) => (
              <a
                className="overview-case"
                href={localizedPath(websitePath(item.href), locale)}
                key={item.id}
              >
                <span data-company={item.company} className="case-company-logo">
                  <img src={item.src} alt={t(`cases.items.${item.id}.name`)} loading="lazy" />
                </span>
                <h3>{t(`cases.items.${item.id}.title`)}</h3>
                <span className="textlink">
                  {t('cases.readLink')}
                  <SiteArrow variant="text" />
                </span>
              </a>
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
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>
                {t('cta.link')}
                <SiteArrow variant="button" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
