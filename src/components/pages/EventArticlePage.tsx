import {notFound} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {getEventArticle} from '@/lib/event-server';
import {markdownToHtml} from '@/lib/blog-server';
import {localizeContentHtml, websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import '@/styles/article.css';
import '@/styles/blog.css';
import '@/styles/events.css';

interface EventArticlePageProps {
  slug: string;
}

export default async function EventArticlePage({slug}: EventArticlePageProps) {
  const locale = await getLocale();
  const t = await getTranslations({locale, namespace: 'sitePages.events'});
  const tUi = await getTranslations({locale, namespace: 'blogUI'});
  const tArticle = await getTranslations({locale, namespace: 'sitePages.blog'});
  const article = getEventArticle(slug, locale);
  if (!article) notFound();

  const rendered = await markdownToHtml(article.content, tUi('figureLabel'));
  const html = localizeContentHtml(rendered.html, locale);

  return (
    <article className="blog-detail event-detail">
      <div className="article-hero">
        <div className="article-shell">
          <nav className="breadcrumb" aria-label={t('hero.title')}>
            <Link href={localizedPath(websitePath('/events'), locale)}>{t('hero.title')}</Link>
            <span aria-hidden="true">/</span>
            <span>{article.title}</span>
          </nav>
          {article.date ? <div className="article-kicker"><time dateTime={article.date}>{article.date.replaceAll('-', '.')}</time></div> : null}
          <h1>{article.title}</h1>
          {article.excerpt ? <p className="article-deck">{article.excerpt}</p> : null}
        </div>
      </div>
      <div className="article-reading">
        <div className="article-shell">
          <div className={`article-reading-grid${rendered.toc.length ? '' : ' event-detail-no-toc'}`}>
            <div>
              {rendered.toc.length ? (
                <details className="article-mobile-toc">
                  <summary>{tArticle('detail.onThisPage')}</summary>
                  <nav>
                    {rendered.toc.map((item) => (
                      <a key={item.id} href={`#${item.id}`} data-level={`h${item.level}`}>{item.text}</a>
                    ))}
                  </nav>
                </details>
              ) : null}
              <div className="article-prose" dangerouslySetInnerHTML={{__html: html}} />
            </div>
            {rendered.toc.length ? (
              <aside className="article-toc" aria-label={tArticle('detail.onThisPage')}>
                <strong>{tArticle('detail.onThisPage')}</strong>
                {rendered.toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} data-level={`h${item.level}`}>{item.text}</a>
                ))}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
