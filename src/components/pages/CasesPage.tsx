import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import {getCaseDocument, getCaseSlugs, type CaseDocument} from '@/lib/site/caseContent';
import '@/styles/cases.css';

interface CaseCardCopy {
  metric: string;
  metricLabel: string;
}

export default async function CasesPage() {
  const t = await getTranslations('sitePages.cases');
  const locale = await getLocale();
  const cards = getCaseSlugs()
    .map((slug) => getCaseDocument(slug, locale))
    .filter((doc): doc is CaseDocument => doc !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  const cardCopy = t.raw('items') as Record<string, CaseCardCopy>;

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
            <strong>{t('hero.count', {count: cards.length})}</strong>
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
            {cards.map((doc) => {
              const copy = cardCopy[doc.slug];
              const metric = copy?.metric ?? doc.outcomes[0]?.value;
              const metricLabel = copy?.metricLabel ?? doc.outcomes[0]?.label;
              return (
                <a
                  className="case-preview"
                  href={localizedPath(websitePath(`/case-studies/${doc.slug}`), locale)}
                  aria-label={`${t('ui.readCase')}: ${doc.title}`}
                  key={doc.slug}
                >
                  <div className="case-preview-top">
                    <span
                      data-company={doc.company}
                      className={`case-company-logo${doc.logoDark ? ' dark-logo' : ''}`}
                    >
                      <img src={doc.logo} alt={doc.companyName} loading="lazy" />
                    </span>
                    <h3>{doc.title}</h3>
                  </div>
                  <div className="case-preview-bottom">
                    <div className="case-result">
                      {metric ? <strong className="case-result-number">{metric}</strong> : null}
                      {metricLabel ? <span className="case-result-label">{metricLabel}</span> : null}
                      {doc.date ? <time dateTime={doc.date}>{doc.dateLabel}</time> : null}
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

          {/* Temporarily hidden: get-practices CTA
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
          */}
        </div>
      </section>
    </>
  );
}
