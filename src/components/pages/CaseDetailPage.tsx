import {notFound} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {caseContentSlug, getCaseDocument} from '@/lib/site/caseContent';
import {markdownToHtml} from '@/lib/blog-server';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';

interface CaseDetailPageProps {
  slug: string;
}

export {caseContentSlug};

export default async function CaseDetailPage({slug}: CaseDetailPageProps) {
  const locale = await getLocale();
  const t = await getTranslations({locale, namespace: 'sitePages.cases'});
  const tUi = await getTranslations({locale, namespace: 'blogUI'});
  const doc = getCaseDocument(slug, locale);
  if (!doc) notFound();

  const {html, toc} = await markdownToHtml(doc.bodyMarkdown, tUi('figureLabel'));
  const sections =
    toc.length > 0
      ? toc.map((item) => ({id: item.id, title: item.text}))
      : doc.sections;

  const outcomeSourceHref =
    doc.outcomeSourceUrl ||
    localizedPath(websitePath(`/case-studies/${slug}`), locale);

  return (
    <>
      <article>
        <section className="case-detail-hero">
          <div className="wrap">
            <nav className="breadcrumb" aria-label={t('detail.breadcrumbAria')}>
              <Link href={localizedPath(websitePath('/'), locale)}>{t('detail.home')}</Link>
              <span>/</span>
              <Link href={localizedPath(websitePath('/case-studies'), locale)}>
                {t('detail.cases')}
              </Link>
              <span>/</span>
              <span>{doc.companyName}</span>
            </nav>

            <div className="case-detail-title">
              {doc.logo ? (
                <span data-company={doc.company} className="case-company-logo">
                  <img src={doc.logo} alt={doc.companyName} loading="lazy" />
                </span>
              ) : (
                <span />
              )}
              <div>
                <h1>{doc.title}</h1>
                <div className="case-source-line">
                  {doc.sourceKind ? <span>{doc.sourceKind}</span> : null}
                  {doc.date ? <time dateTime={doc.date}>{doc.dateLabel || doc.date}</time> : null}
                  {doc.sourceUrl ? (
                    <a href={doc.sourceUrl} target="_blank" rel="noopener">
                      {doc.sourceLinkLabel || doc.sourceUrl}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {doc.outcomes.length ? (
              <div className="case-key-outcomes" aria-label={t('detail.outcomesAria')}>
                {doc.outcomes.map((item) => (
                  <div className="case-key-outcome" key={`${item.value}-${item.label}`}>
                    <b>{item.value}</b>
                    <strong>{item.label}</strong>
                    {item.detail ? <p>{item.detail}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {doc.outcomeSourceLabel ? (
              <div className="case-outcome-source">
                <a href={outcomeSourceHref} target="_blank" rel="noopener">
                  {doc.outcomeSourceLabel}
                </a>
              </div>
            ) : null}
          </div>
        </section>

        <div className="wrap case-reader">
          <div>
            {sections.length ? (
              <details className="case-mobile-toc">
                <summary>{t('detail.onThisPage')}</summary>
                <nav>
                  {sections.map((section, index) => (
                    <a key={section.id} href={`#${section.id}`}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {section.title}
                    </a>
                  ))}
                </nav>
              </details>
            ) : null}

            <div className="article-prose" dangerouslySetInnerHTML={{__html: html}} />

            <div className="actions" style={{marginTop: 30}}>
              <Link className="btn" href={localizedPath(websitePath('/case-studies'), locale)}>
                {t('detail.backToCases')}
              </Link>
              <Link className="btn primary" href={localizedPath(websitePath('/get-practices'), locale)}>
                {t('detail.getPractices')}
              </Link>
            </div>
          </div>

          {sections.length ? (
            <aside className="article-toc" aria-label={t('detail.onThisPage')}>
              <strong>{t('detail.onThisPage')}</strong>
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </a>
              ))}
            </aside>
          ) : null}
        </div>
      </article>
    </>
  );
}
