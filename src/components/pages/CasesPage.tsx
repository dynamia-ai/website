import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/cases.css';

type CaseId =
  | 'seres'
  | 'zhuoyu'
  | 'sangfor'
  | 'cetc'
  | 'cmbPool'
  | 'cmbSched'
  | 'snow'
  | 'nio'
  | 'ke'
  | 'daocloud'
  | 'sf'
  | 'prep';

interface CaseCard {
  id: CaseId;
  slug: string;
  company: string;
  logo: string;
  darkLogo?: boolean;
  /** ISO date for <time dateTime>. Omit when dictionary has no date. */
  dateTime?: string;
}

const CASE_CARDS: CaseCard[] = [
  {
    id: 'seres',
    slug: '/cases/seres',
    company: 'seres',
    logo: '/redesign/assets/seres-logo.svg',
    dateTime: '2026-11-02',
  },
  {
    id: 'zhuoyu',
    slug: '/cases/zhuoyu-technology',
    company: 'zhuoyu-technology',
    logo: '/redesign/assets/947e64289732bbc6003c.svg',
    darkLogo: true,
    dateTime: '2026-09-29',
  },
  {
    id: 'sangfor',
    slug: '/cases/sangfor',
    company: 'sangfor',
    logo: '/redesign/assets/8d37763f47722bb132cf.svg',
    dateTime: '2026-09-08',
  },
  {
    id: 'cetc',
    slug: '/cases/cetc-cloud',
    company: 'cetc-cloud',
    logo: '/redesign/assets/dd41408a06cb10c4a43e.png',
    dateTime: '2026-09-07',
  },
  {
    id: 'cmbPool',
    slug: '/cases/china-merchants-bank-2',
    company: 'china-merchants-bank-2',
    logo: '/redesign/assets/b597756761457e50d747.svg',
    dateTime: '2026-07-02',
  },
  {
    id: 'cmbSched',
    slug: '/cases/china-merchants-bank',
    company: 'china-merchants-bank',
    logo: '/redesign/assets/b597756761457e50d747.svg',
    dateTime: '2026-05-05',
  },
  {
    id: 'snow',
    slug: '/cases/snow-corp',
    company: 'snow-corp',
    logo: '/redesign/assets/83f5bec99abccb7f8843.jpg',
    dateTime: '2026-03-17',
  },
  {
    id: 'nio',
    slug: '/cases/nio',
    company: 'nio',
    logo: '/redesign/assets/44b82bb215dc80472ae8.svg',
    dateTime: '2026-02-05',
  },
  {
    id: 'ke',
    slug: '/cases/ke-holdings-inc',
    company: 'ke-holdings-inc',
    logo: '/redesign/assets/8045f1c8d69940e96b22.png',
    dateTime: '2025-12-02',
  },
  {
    id: 'daocloud',
    slug: '/cases/daocloud',
    company: 'daocloud',
    logo: '/logos/company7.png',
    dateTime: '2025-09-18',
  },
  {
    id: 'sf',
    slug: '/cases/sf-technology',
    company: 'sf-technology',
    logo: '/redesign/assets/e2e5754a2a04fd08a050.svg',
    dateTime: '2025-08-20',
  },
  {
    id: 'prep',
    slug: '/cases/prep-edu',
    company: 'prep-edu',
    logo: '/redesign/assets/c53a000a30233660d2d0.svg',
  },
];

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

      <section className="section">
        <div className="wrap">
          <div className="case-library-meta">
            <strong>{t('hero.count')}</strong>
            <a
              href="https://www.cncf.io/case-studies/?_sft_lf-project=hami"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('hero.cncfSource')}
              <SiteArrow variant="link" />
            </a>
          </div>

          <div className="case-library" id="case-list">
            {CASE_CARDS.map((item) => {
              const dateLabel = item.dateTime ? t(`items.${item.id}.date`) : null;
              return (
                <a
                  className="case-preview"
                  href={localizedPath(websitePath(item.slug), locale)}
                  aria-label={t(`items.${item.id}.aria`)}
                  key={item.id}
                >
                  <div className="case-preview-top">
                    <span
                      data-company={item.company}
                      className={`case-company-logo${item.darkLogo ? ' dark-logo' : ''}`}
                    >
                      <img src={item.logo} alt={t(`items.${item.id}.name`)} loading="lazy" />
                    </span>
                    <h3>{t(`items.${item.id}.title`)}</h3>
                  </div>
                  <div className="case-preview-bottom">
                    <div className="case-result">
                      <strong className="case-result-number">{t(`items.${item.id}.metric`)}</strong>
                      <span className="case-result-label">{t(`items.${item.id}.metricLabel`)}</span>
                      {item.dateTime && dateLabel ? (
                        <time dateTime={item.dateTime}>{dateLabel}</time>
                      ) : null}
                    </div>
                    <span className="case-view">
                      {t('ui.readCase')}
                      <SiteArrow variant="text" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="case-more">
            <div>
              <h2>{t('cta.title')}</h2>
              <p>{t('cta.body')}</p>
            </div>
            <a className="btn primary" href={localizedPath(websitePath('/get-practices'), locale)}>
              {t('cta.button')}
              <SiteArrow variant="button" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
